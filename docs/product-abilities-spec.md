# Dynamic Product Abilities / Specifications

This document outlines a production-ready, extensible ability/specification system for products using Next.js (App Router), Prisma, and PostgreSQL.

## Goals and Constraints
- Abilities are fully dynamic: admin-created, editable, removable without schema changes.
- Each product can have any subset of abilities with localized metadata, units, and value types.
- Supports numeric, range, text, boolean, and enum values with filtering at scale.
- Optimized for PostgreSQL indexing and query performance across thousands of products.
- Ready for internationalization, grouping, presets, comparison, conditional visibility, versioning, and scoring.

## High-Level Architecture
- **Normalized metadata tables** for ability definitions, groups, categories, and versions.
- **EAV with typed value tables** (numeric/range/text/boolean/enum) to avoid JSON anti-patterns and keep values indexable.
- **Join tables** for category presets and conditional visibility rules.
- **Materialized helper views** (optional) for smart filters and comparison grids.

## Prisma Schema
```prisma
// prisma/schema.prisma
model AbilityGroup {
  id           String    @id @default(cuid())
  slug         String    @unique
  title_en     String
  title_fa     String
  description  String?
  abilities    Ability[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Ability {
  id           String           @id @default(cuid())
  code         String           @unique // stable identifier for references/versioning
  title_en     String
  title_fa     String
  description  String?
  unit         String?
  type         AbilityType
  groupId      String?
  group        AbilityGroup?    @relation(fields: [groupId], references: [id])
  enumOptions  AbilityEnum[]
  categories   CategoryAbilityPreset[]
  versions     AbilityVersion[]
  conditions   AbilityCondition[] @relation("ConditionAbility")
  applicableTo AbilityCondition[] @relation("ApplicableAbility")
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}

enum AbilityType {
  NUMBER
  TEXT
  BOOLEAN
  ENUM
  RANGE // uses numeric values but stores min/max per product
}

model AbilityEnum {
  id         String   @id @default(cuid())
  abilityId  String
  ability    Ability  @relation(fields: [abilityId], references: [id])
  value      String
  label_en   String
  label_fa   String
  order      Int      @default(0)
  createdAt  DateTime @default(now())
}

model Product {
  id            String          @id @default(cuid())
  sku           String          @unique
  name_en       String
  name_fa       String
  categoryId    String?
  category      Category?       @relation(fields: [categoryId], references: [id])
  abilities     ProductAbility[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model Category {
  id           String                     @id @default(cuid())
  slug         String                     @unique
  title_en     String
  title_fa     String
  abilities    CategoryAbilityPreset[]
  products     Product[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// Presets that are suggested when creating/editing a product in a category
model CategoryAbilityPreset {
  id         String   @id @default(cuid())
  categoryId String
  abilityId  String
  required   Boolean  @default(false)
  order      Int      @default(0)

  category   Category @relation(fields: [categoryId], references: [id])
  ability    Ability  @relation(fields: [abilityId], references: [id])

  @@unique([categoryId, abilityId])
}

// Tracks changes to ability metadata (not per product values)
model AbilityVersion {
  id          String   @id @default(cuid())
  abilityId   String
  version     Int
  title_en    String
  title_fa    String
  description String?
  unit        String?
  type        AbilityType
  createdAt   DateTime @default(now())

  ability     Ability  @relation(fields: [abilityId], references: [id])
  @@unique([abilityId, version])
}

// Conditional visibility: ability is shown only when conditions are satisfied
model AbilityCondition {
  id                String  @id @default(cuid())
  abilityId         String  // ability that has the condition
  dependsOnAbilityId String // ability whose value is evaluated
  operator          ConditionOperator
  value             String // interpreted based on dependsOn ability type

  ability           Ability @relation("ConditionAbility", fields: [abilityId], references: [id])
  dependsOnAbility  Ability @relation("ApplicableAbility", fields: [dependsOnAbilityId], references: [id])
}

enum ConditionOperator {
  EQUALS
  NOT_EQUALS
  GREATER_THAN
  LESS_THAN
  INCLUDES // for enum multi-select or text contains
}

// Pivot table referencing typed value tables
model ProductAbility {
  id          String            @id @default(cuid())
  productId   String
  abilityId   String
  versionId   String?           // optional: ties to AbilityVersion used at the time

  product     Product           @relation(fields: [productId], references: [id])
  ability     Ability           @relation(fields: [abilityId], references: [id])
  version     AbilityVersion?   @relation(fields: [versionId], references: [id])

  numberValue ProductAbilityNumber?
  textValue   ProductAbilityText?
  booleanValue ProductAbilityBoolean?
  enumValue   ProductAbilityEnum?
  rangeValue  ProductAbilityRange?

  score       Float?            // optional scoring weight for ranking

  @@unique([productId, abilityId])
  @@index([abilityId])
  @@index([productId])
}

model ProductAbilityNumber {
  productAbilityId String  @id
  value            Float
  min              Float?
  max              Float?
  productAbility   ProductAbility @relation(fields: [productAbilityId], references: [id])

  @@index([value])
  @@index([min, max])
}

model ProductAbilityRange {
  productAbilityId String @id
  min              Float
  max              Float
  productAbility   ProductAbility @relation(fields: [productAbilityId], references: [id])

  @@index([min, max])
}

model ProductAbilityText {
  productAbilityId String @id
  value            String
  productAbility   ProductAbility @relation(fields: [productAbilityId], references: [id])
}

model ProductAbilityBoolean {
  productAbilityId String @id
  value            Boolean
  productAbility   ProductAbility @relation(fields: [productAbilityId], references: [id])

  @@index([value])
}

model ProductAbilityEnum {
  productAbilityId String @id
  optionId         String
  option           AbilityEnum      @relation(fields: [optionId], references: [id])
  productAbility   ProductAbility   @relation(fields: [productAbilityId], references: [id])

  @@index([optionId])
}

// Materialized view definition (managed via migration script, not Prisma model):
// CREATE MATERIALIZED VIEW product_ability_numeric_idx AS
// SELECT pa.productId, pa.abilityId, coalesce(pan.value, par.min) AS value_min, pan.max AS value_max
// FROM ProductAbility pa
// LEFT JOIN ProductAbilityNumber pan ON pan.productAbilityId = pa.id
// LEFT JOIN ProductAbilityRange par ON par.productAbilityId = pa.id;
```

## Why This Scales
- **No schema changes for new abilities**: abilities are stored as rows, not columns; typed value tables keep data atomic and indexable.
- **Query performance**: indexes on pivot and typed tables enable efficient range and equality filters; materialized view can precompute numeric ranges for smart filtering.
- **Versioning**: `AbilityVersion` captures history without touching product records; `ProductAbility.versionId` ties a product value to the specific definition used.
- **Grouping & presets**: `AbilityGroup` and `CategoryAbilityPreset` drive admin UX and default selections per category.
- **Conditional logic**: `AbilityCondition` supports dynamic UI visibility and validation based on other abilities.

## Sample Seed Data
```ts
// prisma/seed.ts (excerpt)
const mechanical = await prisma.abilityGroup.create({
  data: { slug: 'mechanical', title_en: 'Mechanical', title_fa: 'مکانیکی' },
});

const pressure = await prisma.ability.create({
  data: {
    code: 'pressure',
    title_en: 'Pressure',
    title_fa: 'فشار',
    unit: 'bar',
    type: 'NUMBER',
    groupId: mechanical.id,
    enumOptions: {},
  },
});

const temperature = await prisma.ability.create({
  data: {
    code: 'temperature_range',
    title_en: 'Operating Temperature',
    title_fa: 'دمای کاری',
    unit: '°C',
    type: 'RANGE',
  },
});

const voltage = await prisma.ability.create({
  data: {
    code: 'voltage',
    title_en: 'Voltage',
    title_fa: 'ولتاژ',
    unit: 'V',
    type: 'ENUM',
    enumOptions: {
      create: [
        { value: '110', label_en: '110V', label_fa: '۱۱۰ ولت' },
        { value: '220', label_en: '220V', label_fa: '۲۲۰ ولت' },
      ],
    },
  },
});

const pumps = await prisma.category.create({
  data: {
    slug: 'pumps',
    title_en: 'Pumps',
    title_fa: 'پمپ ها',
    abilities: {
      create: [
        { abilityId: pressure.id, required: true, order: 1 },
        { abilityId: temperature.id, required: false, order: 2 },
      ],
    },
  },
});

const product = await prisma.product.create({
  data: {
    sku: 'P-1000',
    name_en: 'Industrial Pump 1000',
    name_fa: 'پمپ صنعتی ۱۰۰۰',
    categoryId: pumps.id,
    abilities: {
      create: [
        {
          abilityId: pressure.id,
          numberValue: { create: { value: 25, min: 10, max: 30 } },
        },
        {
          abilityId: temperature.id,
          rangeValue: { create: { min: -10, max: 80 } },
        },
        {
          abilityId: voltage.id,
          enumValue: {
            create: { option: { connect: { value_abilityId: { value: '220', abilityId: voltage.id } } } },
          },
        },
      ],
    },
  },
});
```

## Filtering Query Examples
```ts
// Range filter: pressure between 10 and 30 bar AND temperature max >= 60
const products = await prisma.product.findMany({
  where: {
    abilities: {
      every: {
        OR: [
          {
            ability: { code: 'pressure' },
            numberValue: { min: { lte: 10 }, max: { gte: 30 } },
          },
          {
            ability: { code: 'pressure' },
            numberValue: { value: { gte: 10, lte: 30 } },
          },
        ],
      },
      some: {
        ability: { code: 'temperature_range' },
        rangeValue: { max: { gte: 60 } },
      },
    },
  },
});

// Exact enum match: voltage = 220V
const products220 = await prisma.product.findMany({
  where: {
    abilities: {
      some: {
        ability: { code: 'voltage' },
        enumValue: { option: { value: '220' } },
      },
    },
  },
});

// Multi-ability AND filter using raw SQL for performance (simplified):
const filtered = await prisma.$queryRaw`\
  SELECT p.* FROM "Product" p
  JOIN "ProductAbility" pa_pressure ON pa_pressure."productId" = p.id
    AND pa_pressure."abilityId" = ${pressureId}
  JOIN "ProductAbilityNumber" pan ON pan."productAbilityId" = pa_pressure.id
    AND pan.value BETWEEN 10 AND 30
  JOIN "ProductAbility" pa_voltage ON pa_voltage."productId" = p.id
    AND pa_voltage."abilityId" = ${voltageId}
  JOIN "ProductAbilityEnum" pae ON pae."productAbilityId" = pa_voltage.id
    AND pae."optionId" = ${option220Id};`;
```

## Indexing & Performance Notes
- Index `ProductAbility(abilityId, productId)` for quick existence checks and joins.
- Index typed tables on their numeric columns (`value`, `min`, `max`) for range scans.
- For heavy filters, create partial indexes per popular ability codes (e.g., `CREATE INDEX CONCURRENTLY ON ProductAbilityNumber (value) WHERE abilityId = 'pressure';`).
- Optional materialized view `product_ability_numeric_idx` precomputes numeric ranges for smart min/max detection and reduces JOINs during faceted search.
- Use query planner hints via raw SQL for complex AND filters; Prisma can delegate to views if needed.
- Cache preset metadata (groups, abilities, enums) in Redis/edge cache for fast admin UI.

## Advanced Features
- **Ability grouping**: `AbilityGroup` organizes abilities (Mechanical, Electrical, Environmental) for UI and reports.
- **Category presets**: `CategoryAbilityPreset` seeds default abilities per category and marks required ones.
- **Product comparison**: fetch pivot data and render a normalized comparison grid keyed by `ability.code`; ranges and enums remain comparable.
- **Conditional abilities**: evaluate `AbilityCondition` in UI/API before accepting values; store `dependsOnAbilityId` to keep logic data-driven.
- **Versioning**: `AbilityVersion` archives changes; `ProductAbility.versionId` captures which definition applied when the value was set.
- **Ability-based scoring**: use `ProductAbility.score` or computed weights per ability for ranking; can be extended with a `ScoreProfile` table.
- **i18n-ready**: all labels have `en`/`fa` fields; extend with JSON translations if needed without changing shape.
- **Smart filters**: detect min/max per ability using `MIN/MAX` over typed tables or the materialized view to auto-size sliders.

## Warnings and Anti-Patterns
- Avoid storing ability values in a single JSON column—breaks indexing and range queries.
- Do not add new columns per ability; use rows in typed tables to prevent migrations and table bloat.
- Keep `code` immutable; changing it breaks filters and external references—use versions instead.
- Enforce uniqueness on `(productId, abilityId)` to prevent conflicting values.
- Prefer enum options via `AbilityEnum` over free-form strings for filterable select fields.
```
