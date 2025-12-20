import { NextRequest, NextResponse } from 'next/server';
import { AbilityType, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { requireSession } from '../lib/session';
import { enforceRateLimit } from '../lib/rate-limit';
import { canEditProducts, isRoleAtLeast } from '@/app/lib/rbac';
import { abilityCreateSchema, abilityUpdateSchema, abilityValueSchema, buildValuePayload } from './utils';

function isUnauthorized(error: unknown): boolean {
  return (error as Error | undefined)?.message === 'UNAUTHORIZED';
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canEditProducts(session.user?.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rateLimit = enforceRateLimit(`admin:abilities:create:${session.user?.id ?? 'unknown'}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: rateLimit.retryAfterSeconds ? { 'Retry-After': rateLimit.retryAfterSeconds.toString() } : undefined },
      );
    }

    const parsed = abilityCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const body = parsed.data;

    if (body.type !== AbilityType.ENUM && body.options?.length) {
      return NextResponse.json({ error: 'Options are only allowed for ENUM abilities.' }, { status: 400 });
    }

    const existing = await prisma.ability.findUnique({ where: { key: body.key } });
    if (existing) {
      return NextResponse.json({ error: 'Ability key already exists.' }, { status: 409 });
    }

    const group = body.groupSlug ? await prisma.abilityGroup.findUnique({ where: { slug: body.groupSlug } }) : null;
    const minViewRole = body.isPrivate ? body.minViewRole ?? Role.ADMIN : null;

    const ability = await prisma.ability.create({
      data: {
        key: body.key,
        titleFa: body.titleFa,
        titleEn: body.titleEn ?? null,
        descriptionFa: body.descriptionFa ?? null,
        descriptionEn: body.descriptionEn ?? null,
        unit: body.unit ?? null,
        type: body.type,
        isFilterable: body.isFilterable ?? true,
        isPrivate: body.isPrivate ?? false,
        minViewRole,
        displayOrder: body.displayOrder ?? 0,
        groupId: group?.id,
        options:
          body.type === AbilityType.ENUM && Array.isArray(body.options)
            ? {
                create: body.options.map((option, index) => ({
                  value: option.value,
                  labelFa: option.labelFa,
                  labelEn: option.labelEn ?? null,
                  sortOrder: index + 1,
                })),
              }
            : undefined,
      },
      include: { options: true, group: true },
    });

    return NextResponse.json({ data: ability }, { status: 201 });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as Error).message === 'INVALID_VALUE') {
      return NextResponse.json({ error: 'Invalid value for ability type.' }, { status: 400 });
    }
    console.error('ability.create.failed', error);
    return NextResponse.json({ error: 'Unable to create ability.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canEditProducts(session.user?.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rateLimit = enforceRateLimit(`admin:abilities:value:${session.user?.id ?? 'unknown'}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: rateLimit.retryAfterSeconds ? { 'Retry-After': rateLimit.retryAfterSeconds.toString() } : undefined },
      );
    }

    const parsed = abilityValueSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const body = parsed.data;

    const [product, ability] = await Promise.all([
      prisma.product.findUnique({ where: { id: body.productId, deletedAt: null } }),
      prisma.ability.findUnique({ where: { id: body.abilityId }, include: { options: true } }),
    ]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    if (!ability || ability.deletedAt) {
      return NextResponse.json({ error: 'Ability not found.' }, { status: 404 });
    }

    if (!ability.isFilterable) {
      return NextResponse.json({ error: 'Ability is not assignable.' }, { status: 400 });
    }

    if (ability.isPrivate && !isRoleAtLeast(session.user?.role as Role | null | undefined, ability.minViewRole ?? Role.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const valuePayload = buildValuePayload(ability.type, body, ability.options ?? []);

    const saved = await prisma.productAbilityValue.upsert({
      where: { productId_abilityId: { productId: body.productId, abilityId: body.abilityId } },
      update: { ...valuePayload, notes: body.notes ?? null },
      create: { ...valuePayload, productId: body.productId, abilityId: body.abilityId, notes: body.notes ?? null },
      include: { ability: true, abilityOption: true },
    });

    await prisma.productAbilityValueHistory.create({
      data: {
        productAbilityValueId: saved.id,
        productId: body.productId,
        abilityId: body.abilityId,
        abilityOptionId: saved.abilityOptionId,
        valueNumber: saved.valueNumber,
        valueText: saved.valueText,
        valueBoolean: saved.valueBoolean,
        rangeStart: saved.rangeStart,
        rangeEnd: saved.rangeEnd,
        scoreNormalized: saved.scoreNormalized,
        reason: 'admin_update',
      },
    });

    return NextResponse.json({ data: saved }, { status: 200 });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as Error).message === 'INVALID_VALUE') {
      return NextResponse.json({ error: 'Invalid value for ability type.' }, { status: 400 });
    }
    console.error('ability.assign.failed', error);
    return NextResponse.json({ error: 'Unable to assign value.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canEditProducts(session.user?.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rateLimit = enforceRateLimit(`admin:abilities:delete:${session.user?.id ?? 'unknown'}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: rateLimit.retryAfterSeconds ? { 'Retry-After': rateLimit.retryAfterSeconds.toString() } : undefined },
      );
    }

    const parsed = abilityValueSchema.pick({ abilityId: true }).safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const ability = await prisma.ability.findUnique({ where: { id: parsed.data.abilityId } });
    if (!ability || ability.deletedAt) {
      return NextResponse.json({ error: 'Ability not found.' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.ability.update({
        where: { id: parsed.data.abilityId },
        data: { deletedAt: new Date(), isFilterable: false },
      }),
      prisma.productAbilityValue.updateMany({
        where: { abilityId: parsed.data.abilityId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ data: { id: parsed.data.abilityId, deletedAt: new Date().toISOString() } });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('ability.delete.failed', error);
    return NextResponse.json({ error: 'Unable to delete ability.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canEditProducts(session.user?.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rateLimit = enforceRateLimit(`admin:abilities:update:${session.user?.id ?? 'unknown'}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: rateLimit.retryAfterSeconds ? { 'Retry-After': rateLimit.retryAfterSeconds.toString() } : undefined },
      );
    }

    const parsed = abilityUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const ability = await prisma.ability.findUnique({ where: { id: parsed.data.abilityId } });
    if (!ability || ability.deletedAt) {
      return NextResponse.json({ error: 'Ability not found.' }, { status: 404 });
    }

    if (
      parsed.data.type &&
      parsed.data.type !== ability.type &&
      (await prisma.productAbilityValue.count({ where: { abilityId: ability.id } })) > 0
    ) {
      return NextResponse.json({ error: 'Cannot change type while values exist.' }, { status: 409 });
    }

    const minViewRole = parsed.data.isPrivate ?? ability.isPrivate ? parsed.data.minViewRole ?? Role.ADMIN : null;

    const updated = await prisma.ability.update({
      where: { id: ability.id },
      data: {
        ...('titleFa' in parsed.data ? { titleFa: parsed.data.titleFa ?? ability.titleFa } : {}),
        ...('titleEn' in parsed.data ? { titleEn: parsed.data.titleEn ?? null } : {}),
        ...('descriptionFa' in parsed.data ? { descriptionFa: parsed.data.descriptionFa ?? null } : {}),
        ...('descriptionEn' in parsed.data ? { descriptionEn: parsed.data.descriptionEn ?? null } : {}),
        ...('unit' in parsed.data ? { unit: parsed.data.unit ?? null } : {}),
        ...('isFilterable' in parsed.data ? { isFilterable: parsed.data.isFilterable } : {}),
        ...('isPrivate' in parsed.data ? { isPrivate: parsed.data.isPrivate } : {}),
        ...('displayOrder' in parsed.data ? { displayOrder: parsed.data.displayOrder } : {}),
        ...('type' in parsed.data ? { type: parsed.data.type } : {}),
        minViewRole,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('ability.update.failed', error);
    return NextResponse.json({ error: 'Unable to update ability.' }, { status: 500 });
  }
}
