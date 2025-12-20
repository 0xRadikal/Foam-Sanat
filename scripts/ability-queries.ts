import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function filterPressureRange() {
  return prisma.product.findMany({
    where: {
      abilityValues: {
        some: {
          ability: { key: 'pressure' },
          valueNumber: {
            gte: new Prisma.Decimal(10),
            lte: new Prisma.Decimal(30),
          },
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

async function main() {
  console.log('Pressure 10-30 bar:', await filterPressureRange());
  console.log('Pressure >=15 AND capacity >=700:', await filterMultipleAbilities());
  console.log('Three-phase with matching dimensions:', await filterEnumAndText());
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
