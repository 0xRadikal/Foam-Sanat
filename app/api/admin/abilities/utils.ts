import { AbilityType, Prisma, Role } from '@prisma/client';
import { z } from 'zod';

export type ValuePayload = Omit<Prisma.ProductAbilityValueUncheckedCreateInput, 'productId' | 'abilityId' | 'notes'>;

export const abilityCreateSchema = z
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
    minViewRole: z.nativeEnum(Role).optional(),
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

export const abilityValueSchema = z
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

export const abilityUpdateSchema = z
  .object({
    abilityId: z.string().uuid(),
    titleFa: z.string().optional(),
    titleEn: z.string().optional().nullable(),
    descriptionFa: z.string().optional().nullable(),
    descriptionEn: z.string().optional().nullable(),
    unit: z.string().optional().nullable(),
    isFilterable: z.boolean().optional(),
    isPrivate: z.boolean().optional(),
    minViewRole: z.nativeEnum(Role).optional().nullable(),
    displayOrder: z.number().int().nonnegative().optional(),
    type: z.nativeEnum(AbilityType).optional(),
  })
  .strict();

const toDecimalOrNull = (value: unknown) => (typeof value === 'number' ? new Prisma.Decimal(value) : null);

export function buildValuePayload(
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
