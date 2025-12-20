import { NextRequest, NextResponse } from 'next/server';
import { AbilityType, Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const filterSchema = z
  .object({
    filters: z
      .array(
        z.object({
          abilityId: z.string().uuid(),
          min: z.number().optional(),
          max: z.number().optional(),
          equals: z.union([z.string(), z.boolean()]).optional(),
          options: z.array(z.string()).optional(),
        }),
      )
      .default([]),
    status: z.nativeEnum(ProductStatus).optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(50).default(12),
  })
  .strict();

function buildAbilityWhere(
  abilityType: AbilityType,
  filter: z.infer<typeof filterSchema>['filters'][number],
  optionIds: string[] | null,
): Prisma.ProductAbilityValueWhereInput {
  switch (abilityType) {
    case AbilityType.NUMBER:
      return {
        valueNumber: {
          gte: filter.min !== undefined ? new Prisma.Decimal(filter.min) : undefined,
          lte: filter.max !== undefined ? new Prisma.Decimal(filter.max) : undefined,
        },
      };
    case AbilityType.RANGE:
      return {
        rangeStart: filter.min !== undefined ? { lte: new Prisma.Decimal(filter.min) } : undefined,
        rangeEnd: filter.max !== undefined ? { gte: new Prisma.Decimal(filter.max) } : undefined,
      };
    case AbilityType.BOOLEAN:
      if (typeof filter.equals !== 'boolean') throw new Error('INVALID_FILTER');
      return { valueBoolean: filter.equals };
    case AbilityType.TEXT:
      if (typeof filter.equals !== 'string') throw new Error('INVALID_FILTER');
      return { valueText: { equals: filter.equals, mode: 'insensitive' } };
    case AbilityType.ENUM:
      if (!optionIds?.length) throw new Error('INVALID_FILTER');
      return { abilityOptionId: { in: optionIds } };
    default:
      throw new Error('INVALID_FILTER');
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = filterSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { filters, page, pageSize, status } = parsed.data;

    if (!filters.length) {
      return NextResponse.json({ data: [], pagination: { page, pageSize, total: 0, totalPages: 0 } });
    }

    const abilityIds = filters.map((f) => f.abilityId);
  const abilities = await prisma.ability.findMany({
      where: { id: { in: abilityIds }, isFilterable: true, isPrivate: false, deletedAt: null },
      include: { options: true },
    });

    if (abilities.length !== filters.length) {
      return NextResponse.json({ error: 'Unknown or non-filterable ability requested.' }, { status: 400 });
    }

    const abilityMap = new Map(abilities.map((ability) => [ability.id, ability]));

    const abilityFilters: Prisma.ProductWhereInput[] = filters.map((filter) => {
      const ability = abilityMap.get(filter.abilityId);
      if (!ability) throw new Error('INVALID_FILTER');

      const optionIds =
        ability.type === AbilityType.ENUM && filter.options?.length
          ? ability.options.filter((opt) => filter.options?.includes(opt.value) || filter.options?.includes(opt.id)).map((o) => o.id)
          : null;

      const abilityWhere = buildAbilityWhere(ability.type, filter, optionIds);

      return {
        abilityValues: {
          some: {
            abilityId: filter.abilityId,
            ...abilityWhere,
          },
        },
      };
    });

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: status ?? ProductStatus.PUBLISHED,
      AND: abilityFilters,
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          media: { orderBy: { sortOrder: 'asc' } },
          abilityValues: {
            where: { abilityId: { in: abilityIds } },
            include: { ability: true, abilityOption: true },
          },
        },
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    if ((error as Error).message === 'INVALID_FILTER') {
      return NextResponse.json({ error: 'Invalid filter payload.' }, { status: 400 });
    }
    console.error('product.filter.failed', error);
    return NextResponse.json({ error: 'Unable to filter products.' }, { status: 500 });
  }
}
