import bcrypt from 'bcryptjs';
import { AbilityType, Prisma, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required to run the seed.');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Seed admin already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name: 'Seed Superadmin',
      role: Role.SUPERADMIN,
      passwordHash,
    },
  });

  console.log('Superadmin seeded successfully.');
}

async function seedAbilitiesAndProducts() {
  const mechanical = await prisma.abilityGroup.upsert({
    where: { slug: 'mechanical' },
    update: {},
    create: { slug: 'mechanical', titleFa: 'مکانیکی', titleEn: 'Mechanical' },
  });

  const electrical = await prisma.abilityGroup.upsert({
    where: { slug: 'electrical' },
    update: {},
    create: { slug: 'electrical', titleFa: 'الکتریکی', titleEn: 'Electrical' },
  });

  const environmental = await prisma.abilityGroup.upsert({
    where: { slug: 'environmental' },
    update: {},
    create: { slug: 'environmental', titleFa: 'محیطی', titleEn: 'Environmental' },
  });

  const pressure = await prisma.ability.upsert({
    where: { key: 'pressure' },
    update: { groupId: mechanical.id, unit: 'bar', type: AbilityType.NUMBER },
    create: {
      key: 'pressure',
      titleFa: 'فشار کاری',
      titleEn: 'Pressure',
      unit: 'bar',
      type: AbilityType.NUMBER,
      groupId: mechanical.id,
    },
  });

  const capacity = await prisma.ability.upsert({
    where: { key: 'capacity' },
    update: { groupId: mechanical.id, unit: 'L', type: AbilityType.NUMBER },
    create: {
      key: 'capacity',
      titleFa: 'ظرفیت',
      titleEn: 'Capacity',
      unit: 'L',
      type: AbilityType.NUMBER,
      groupId: mechanical.id,
    },
  });

  const temperature = await prisma.ability.upsert({
    where: { key: 'temperature' },
    update: { groupId: environmental.id, unit: '°C', type: AbilityType.RANGE },
    create: {
      key: 'temperature',
      titleFa: 'دمای کاری',
      titleEn: 'Temperature',
      unit: '°C',
      type: AbilityType.RANGE,
      groupId: environmental.id,
    },
  });

  const power = await prisma.ability.upsert({
    where: { key: 'power' },
    update: { groupId: electrical.id, unit: 'W', type: AbilityType.NUMBER },
    create: {
      key: 'power',
      titleFa: 'توان',
      titleEn: 'Power',
      unit: 'W',
      type: AbilityType.NUMBER,
      groupId: electrical.id,
    },
  });

  const dimensions = await prisma.ability.upsert({
    where: { key: 'dimensions' },
    update: { groupId: mechanical.id, unit: 'mm', type: AbilityType.TEXT },
    create: {
      key: 'dimensions',
      titleFa: 'ابعاد',
      titleEn: 'Dimensions',
      unit: 'mm',
      type: AbilityType.TEXT,
      groupId: mechanical.id,
    },
  });

  const powerPhase = await prisma.ability.upsert({
    where: { key: 'power_phase' },
    update: { groupId: electrical.id, type: AbilityType.ENUM },
    create: {
      key: 'power_phase',
      titleFa: 'برق ورودی',
      titleEn: 'Power Phase',
      type: AbilityType.ENUM,
      groupId: electrical.id,
    },
  });

  await prisma.abilityOption.deleteMany({ where: { abilityId: powerPhase.id } });
  const powerPhaseOptions = await prisma.$transaction([
    prisma.abilityOption.create({
      data: { abilityId: powerPhase.id, value: 'single', labelFa: 'تک فاز', labelEn: 'Single Phase', sortOrder: 1 },
    }),
    prisma.abilityOption.create({
      data: { abilityId: powerPhase.id, value: 'three', labelFa: 'سه فاز', labelEn: 'Three Phase', sortOrder: 2 },
    }),
  ]);

  const productA = await prisma.product.upsert({
    where: { slug: 'compressor-a' },
    update: { titleFa: 'کمپرسور A', titleEn: 'Compressor A', status: 'PUBLISHED' },
    create: {
      slug: 'compressor-a',
      status: 'PUBLISHED',
      titleFa: 'کمپرسور A',
      titleEn: 'Compressor A',
      shortFa: 'مدل پایه صنعتی',
      shortEn: 'Base industrial model',
      descFa: 'کمپرسور فشار متوسط مناسب کارگاه های کوچک',
      descEn: 'Mid-pressure compressor for small workshops',
      priceMode: 'FIXED',
      priceAmount: new Prisma.Decimal(2500),
    },
  });

  const productB = await prisma.product.upsert({
    where: { slug: 'compressor-b' },
    update: { titleFa: 'کمپرسور B', titleEn: 'Compressor B', status: 'PUBLISHED' },
    create: {
      slug: 'compressor-b',
      status: 'PUBLISHED',
      titleFa: 'کمپرسور B',
      titleEn: 'Compressor B',
      shortFa: 'مدل قدرتمند با ظرفیت بالا',
      shortEn: 'High capacity performance model',
      descFa: 'فشار و ظرفیت بالاتر برای خطوط تولید',
      descEn: 'Higher pressure and capacity for production lines',
      priceMode: 'FIXED',
      priceAmount: new Prisma.Decimal(4200),
    },
  });

  const powerPhaseOptionMap = powerPhaseOptions.reduce<Record<string, string>>((map, option) => {
    map[option.value] = option.id;
    return map;
  }, {});

  const upsertValue = async (
    productId: string,
    abilityId: string,
    values: Partial<Prisma.ProductAbilityValueUncheckedCreateInput>,
  ) => {
    await prisma.productAbilityValue.upsert({
      where: { productId_abilityId: { productId, abilityId } },
      update: values,
      create: { productId, abilityId, ...values },
    });
  };

  await upsertValue(productA.id, pressure.id, { valueNumber: new Prisma.Decimal(12) });
  await upsertValue(productA.id, capacity.id, { valueNumber: new Prisma.Decimal(500) });
  await upsertValue(productA.id, temperature.id, {
    rangeStart: new Prisma.Decimal(-10),
    rangeEnd: new Prisma.Decimal(40),
  });
  await upsertValue(productA.id, power.id, { valueNumber: new Prisma.Decimal(2200) });
  await upsertValue(productA.id, dimensions.id, { valueText: '1200 x 500 x 700' });
  await upsertValue(productA.id, powerPhase.id, { abilityOptionId: powerPhaseOptionMap.single });

  await upsertValue(productB.id, pressure.id, { valueNumber: new Prisma.Decimal(25) });
  await upsertValue(productB.id, capacity.id, { valueNumber: new Prisma.Decimal(800) });
  await upsertValue(productB.id, temperature.id, {
    rangeStart: new Prisma.Decimal(-20),
    rangeEnd: new Prisma.Decimal(60),
  });
  await upsertValue(productB.id, power.id, { valueNumber: new Prisma.Decimal(3500) });
  await upsertValue(productB.id, dimensions.id, { valueText: '1500 x 650 x 850' });
  await upsertValue(productB.id, powerPhase.id, { abilityOptionId: powerPhaseOptionMap.three });

  console.log('Abilities, options, products, and values seeded.');
}

async function main() {
  await seedAdmin();
  await seedAbilitiesAndProducts();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
