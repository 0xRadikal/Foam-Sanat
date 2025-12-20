import { NextRequest, NextResponse } from 'next/server';
import { AbilityType, Prisma, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { requireSession } from '../lib/session';
import { enforceRateLimit } from '../lib/rate-limit';
import { canEditProducts } from '@/app/lib/rbac';
import { z } from 'zod';

function isUnauthorized(error: unknown): boolean {
  return (error as Error | undefined)?.message === 'UNAUTHORIZED';
}

type ValuePayload = Omit<Prisma.ProductAbilityValueUncheckedCreateInput, 'productId' | 'abilityId' | 'notes'>;

const toDecimalOrNull = (value: unknown) => (typeof value === 'number' ? new Prisma.Decimal(value) : null);

const abilityCreateSchema = z
  .object({
    key: z
      .string()
      .min(2)
      .max(64)
      .regex(/^[a-z0-9_-]+$/i, { message: 'Key must be URL-safe.' }),
    titleFa: z.string().min(1),
    titleEn: z.string().optional().nullable(),
    descriptionFa: z.string().optional().nullable(),
    descriptionEn: z.string().optional().nullable(),
    unit: z.string().optional().nullable(),
    type: z.nativeEnum(AbilityType),
    isFilterable: z.boolean().optional(),
    isPrivate: z.boolean().optional(),
    displayOrder: z.number().int().nonnegative().optional(),
    groupSlug: z.string().optional().nullable(),
    options: z
      .array(
        z.object({
          value: z.string().min(1),
          labelFa: z.string().min(1),
          labelEn: z.string().optional().nullable(),
        }),
      )
      .optional(),
  })
  .strict();

const abilityValueSchema = z
  .object({
    productId: z.string().uuid(),
    abilityId: z.string().uuid(),
    valueNumber: z.number().optional(),
    valueText: z.string().optional(),
    valueBoolean: z.boolean().optional(),
    rangeStart: z.number().optional(),
    rangeEnd: z.number().optional(),
    abilityOptionId: z.string().uuid().optional(),
    abilityOptionValue: z.string().optional(),
    notes: z.string().max(1024).optional().nullable(),
    scoreNormalized: z.number().optional(),
    presetItemId: z.string().uuid().optional(),
  })
  .strict();

function buildValuePayload(
  abilityType: AbilityType,
  body: Record<string, unknown>,
  options: { id: string; value: string }[],
): ValuePayload {
  const base: ValuePayload = {
    valueNumber: null,
    valueText: null,
    valueBoolean: null,
    rangeStart: null,
    rangeEnd: null,
    abilityOptionId: null,
    scoreNormalized: toDecimalOrNull(body.scoreNormalized),
    presetItemId: typeof body.presetItemId === 'string' ? (body.presetItemId as string) : null,
  };

  switch (abilityType) {
    case AbilityType.NUMBER:
      if (typeof body.valueNumber !== 'number') throw new Error('INVALID_VALUE');
      return { ...base, valueNumber: new Prisma.Decimal(body.valueNumber as number) };
    case AbilityType.TEXT:
      if (typeof body.valueText !== 'string') throw new Error('INVALID_VALUE');
      return { ...base, valueText: body.valueText as string };
    case AbilityType.BOOLEAN:
      if (typeof body.valueBoolean !== 'boolean') throw new Error('INVALID_VALUE');
      return { ...base, valueBoolean: body.valueBoolean as boolean };
    case AbilityType.RANGE: {
      const start = body.rangeStart as number | undefined;
      const end = body.rangeEnd as number | undefined;
      if (typeof start !== 'number' || typeof end !== 'number') throw new Error('INVALID_VALUE');
      if (start > end) throw new Error('INVALID_VALUE');
      return { ...base, rangeStart: new Prisma.Decimal(start), rangeEnd: new Prisma.Decimal(end) };
    }
    case AbilityType.ENUM: {
      const optionValue = (body.abilityOptionValue as string | undefined) ?? undefined;
      const optionId = (body.abilityOptionId as string | undefined) ?? undefined;
      const match = options.find((opt) => opt.id === optionId || opt.value === optionValue);
      if (!match) throw new Error('INVALID_VALUE');
      return { ...base, abilityOptionId: match.id };
    }
    default:
      throw new Error('INVALID_VALUE');
  }
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

    const parsed = z.object({ abilityId: z.string().uuid() }).safeParse(await request.json());
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
