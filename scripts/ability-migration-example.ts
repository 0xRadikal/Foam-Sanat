import { AbilityType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  // Example migration to add a new ability without schema changes
  const ability = await prisma.ability.upsert({
    where: { key: 'certification' },
    update: {},
    create: {
      key: 'certification',
      titleFa: 'گواهی‌نامه',
      titleEn: 'Certification',
      type: AbilityType.ENUM,
      descriptionEn: 'Product certifications',
      descriptionFa: 'گواهی‌نامه‌های محصول',
      options: {
        create: [
          { value: 'ce', labelFa: 'CE', labelEn: 'CE' },
          { value: 'iso9001', labelFa: 'ISO 9001', labelEn: 'ISO 9001' },
        ],
      },
    },
    include: { options: true },
  });

  const preset = await prisma.abilityPreset.upsert({
    where: { slug: 'compliance' },
    update: { description: 'Compliance defaults' },
    create: { slug: 'compliance', titleFa: 'انطباق', titleEn: 'Compliance', description: 'Compliance defaults' },
  });

  await prisma.abilityPresetItem.upsert({
    where: { presetId_abilityId: { presetId: preset.id, abilityId: ability.id } },
    update: { abilityOptionId: ability.options[0]?.id },
    create: { presetId: preset.id, abilityId: ability.id, abilityOptionId: ability.options[0]?.id },
  });

  console.log('Added ability:', ability.key, 'options:', ability.options.map((o) => o.value));
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
