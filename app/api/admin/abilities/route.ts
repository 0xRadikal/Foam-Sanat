import { NextRequest, NextResponse } from 'next/server';
import { AbilityType, Prisma, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { requireSession } from '../lib/session';
import { enforceRateLimit } from '../lib/rate-limit';
import { canEditProducts } from '@/app/lib/rbac';

function isUnauthorized(error: unknown): boolean {
  return (error as Error | undefined)?.message === 'UNAUTHORIZED';
}

function buildValuePayload(
  abilityType: AbilityType,
  body: Record<string, unknown>,
  options: { id: string; value: string }[],
): Prisma.ProductAbilityValueUncheckedCreateInput {
  const base = {
    valueNumber: null,
    valueText: null,
    valueBoolean: null,
    rangeStart: null,
    rangeEnd: null,
    abilityOptionId: null,
  } satisfies Partial<Prisma.ProductAbilityValueUncheckedCreateInput>;

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

    const body = await request.json();
    if (!body.key || !body.titleFa || !body.type) {
      return NextResponse.json({ error: 'key, titleFa, and type are required.' }, { status: 400 });
    }

    const existing = await prisma.ability.findUnique({ where: { key: body.key } });
    if (existing) {
      return NextResponse.json({ error: 'Ability key already exists.' }, { status: 409 });
    }

    const group = body.groupSlug
      ? await prisma.abilityGroup.findUnique({ where: { slug: body.groupSlug as string } })
      : null;

    const ability = await prisma.ability.create({
      data: {
        key: body.key,
        titleFa: body.titleFa,
        titleEn: (body.titleEn as string | undefined) ?? null,
        descriptionFa: (body.descriptionFa as string | undefined) ?? null,
        descriptionEn: (body.descriptionEn as string | undefined) ?? null,
        unit: (body.unit as string | undefined) ?? null,
        type: body.type as AbilityType,
        groupId: group?.id,
        options:
          body.type === AbilityType.ENUM && Array.isArray(body.options)
            ? {
                create: (body.options as Array<{ value: string; labelFa: string; labelEn?: string }>).map((option, index) => ({
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

    const body = await request.json();
    const productId = body.productId as string;
    const abilityId = body.abilityId as string;

    if (!productId || !abilityId) {
      return NextResponse.json({ error: 'productId and abilityId are required.' }, { status: 400 });
    }

    const [product, ability] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId, deletedAt: null } }),
      prisma.ability.findUnique({ where: { id: abilityId }, include: { options: true } }),
    ]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    if (!ability) {
      return NextResponse.json({ error: 'Ability not found.' }, { status: 404 });
    }

    const valuePayload = buildValuePayload(ability.type, body, ability.options ?? []);

    const saved = await prisma.productAbilityValue.upsert({
      where: { productId_abilityId: { productId, abilityId } },
      update: { ...valuePayload, notes: (body.notes as string | undefined) ?? null },
      create: { ...valuePayload, productId, abilityId, notes: (body.notes as string | undefined) ?? null },
      include: { ability: true, abilityOption: true },
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
