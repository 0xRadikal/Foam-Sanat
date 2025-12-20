import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function filterPressureRange() {
  return prisma.product.findMany({
    where: {
      abilityValues: {
        some: {
          ability: { key: 'pressure' },
          valueNumber: { gte: new Prisma.Decimal(20) },
        },
      },
    },
    select: { id: true, titleEn: true, titleFa: true },
  });
}

async function filterMultipleAbilities() {
  return prisma.product.findMany({
    where: {
      AND: [
        {
          abilityValues: {
            some: {
              ability: { key: 'pressure' },
              valueNumber: { gte: new Prisma.Decimal(15) },
            },
          },
        },
        {
          abilityValues: {
            some: {
              ability: { key: 'capacity' },
              valueNumber: { gte: new Prisma.Decimal(700) },
            },
          },
        },
      ],
    },
    select: { id: true, titleEn: true },
  });
}

async function filterEnumAndText() {
  return prisma.product.findMany({
    where: {
      AND: [
        {
          abilityValues: {
            some: {
              ability: { key: 'power_phase' },
              abilityOption: { value: 'three' },
            },
          },
        },
        {
          abilityValues: {
            some: {
              ability: { key: 'dimensions' },
              valueText: { contains: '1500', mode: 'insensitive' },
            },
          },
        },
      ],
    },
    select: { id: true, titleEn: true },
  });
}

async function filterRangeAndEnumWithPagination(page: number, pageSize: number) {
  const where: Prisma.ProductWhereInput = {
    AND: [
      {
        abilityValues: {
          some: {
            ability: { key: 'pressure' },
            valueNumber: { gte: new Prisma.Decimal(15), lte: new Prisma.Decimal(35) },
          },
        },
      },
      {
        abilityValues: {
          some: {
            ability: { key: 'power_phase' },
            abilityOption: { value: 'three' },
          },
        },
      },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: { id: true, titleEn: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { page, pageSize, total, items };
}

async function main() {
  console.log('Pressure >=20 bar:', await filterPressureRange());
  console.log('Pressure >=15 AND capacity >=700:', await filterMultipleAbilities());
  console.log('Three-phase with matching dimensions:', await filterEnumAndText());
  console.log('Paginated range+enum:', await filterRangeAndEnumWithPagination(1, 10));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
