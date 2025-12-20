import type { Product } from '@prisma/client';
import { AbilityType, PriceMode, ProductStatus } from '@prisma/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildAbilityWhere, filterProducts } from './helpers';

type MockClient = {
  ability: { findMany: ReturnType<typeof vi.fn> };
  product: { findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
};

const fakeAbilityBase = {
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  isFilterable: true,
  isPrivate: false,
  minViewRole: null,
  groupId: null,
  descriptionFa: null,
  descriptionEn: null,
  unit: null,
  displayOrder: 0,
  group: null,
  options: [],
  productValues: [],
  presetItems: [],
  conditions: [],
  requiredBy: [],
  ProductAbilityValueHistory: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildAbilityWhere', () => {
  it('builds numeric range queries', () => {
    const where = buildAbilityWhere(AbilityType.NUMBER, { abilityId: 'a1', min: 10, max: 30 }, null);
    expect(where).toEqual({ valueNumber: { gte: expect.anything(), lte: expect.anything() } });
  });

  it('builds enum option queries', () => {
    const where = buildAbilityWhere(AbilityType.ENUM, { abilityId: 'a1', options: ['opt'] }, ['opt']);
    expect(where).toEqual({ abilityOptionId: { in: ['opt'] } });
  });

  it('rejects invalid boolean filters', () => {
    expect(() => buildAbilityWhere(AbilityType.BOOLEAN, { abilityId: 'a1', equals: 'true' }, null)).toThrow('INVALID_FILTER');
  });
});

describe('filterProducts', () => {
  const abilityPressure = {
    ...fakeAbilityBase,
    id: 'press',
    key: 'pressure',
    titleFa: 'Pressure',
    titleEn: 'Pressure',
    type: AbilityType.NUMBER,
  } as const;

  const abilityPhase = {
    ...fakeAbilityBase,
    id: 'phase',
    key: 'phase',
    titleFa: 'Phase',
    titleEn: 'Phase',
    type: AbilityType.ENUM,
    options: [
      { id: 'o1', abilityId: 'phase', value: 'single', labelFa: 'Single', labelEn: 'Single', sortOrder: 1 },
      { id: 'o2', abilityId: 'phase', value: 'triple', labelFa: 'Triple', labelEn: 'Triple', sortOrder: 2 },
    ],
  } as const;

  const abilityOnline = {
    ...fakeAbilityBase,
    id: 'remote',
    key: 'remote-monitoring',
    titleFa: 'Remote',
    titleEn: 'Remote',
    type: AbilityType.BOOLEAN,
  } as const;

  const abilityNote = {
    ...fakeAbilityBase,
    id: 'note',
    key: 'note',
    titleFa: 'Note',
    titleEn: 'Note',
    type: AbilityType.TEXT,
  } as const;

  const mockProduct: Product = {
    id: 'p1',
    slug: 'p1',
    status: ProductStatus.PUBLISHED,
    categoryId: null,
    titleFa: 'fa',
    titleEn: 'en',
    shortFa: 's',
    shortEn: 's',
    descFa: 'd',
    descEn: 'd',
    priceMode: PriceMode.UNAVAILABLE,
    priceAmount: null,
    priceNoteFa: null,
    priceNoteEn: null,
    commentsEnabled: true,
    specs: null,
    seoTitleFa: null,
    seoTitleEn: null,
    seoDescFa: null,
    seoDescEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    publishedAt: null,
  };

  it('handles numeric range + enum filters with pagination and status', async () => {
    const client: MockClient = {
      ability: { findMany: vi.fn().mockResolvedValue([abilityPressure, abilityPhase]) },
      product: {
        findMany: vi.fn().mockResolvedValue([mockProduct]),
        count: vi.fn().mockResolvedValue(1),
      },
    };

    const result = await filterProducts({
      filters: [
        { abilityId: 'press', min: 10, max: 30 },
        { abilityId: 'phase', options: ['triple'] },
      ],
      status: ProductStatus.PUBLISHED,
      page: 1,
      pageSize: 5,
    }, client);

    expect(result.pagination.total).toBe(1);
    expect(client.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ abilityValues: expect.anything() }),
            expect.objectContaining({ abilityValues: expect.anything() }),
          ]),
        }),
      }),
    );
    expect(client.product.count).toHaveBeenCalled();
  });

  it('handles boolean + text filter composition', async () => {
    const client: MockClient = {
      ability: { findMany: vi.fn().mockResolvedValue([abilityOnline, abilityNote]) },
      product: {
        findMany: vi.fn().mockResolvedValue([mockProduct]),
        count: vi.fn().mockResolvedValue(1),
      },
    };

    const result = await filterProducts({
      filters: [
        { abilityId: 'remote', equals: true },
        { abilityId: 'note', equals: 'indoor' },
      ],
      page: 1,
      pageSize: 10,
    }, client);

    expect(result.pagination.totalPages).toBe(1);
    expect(client.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ abilityValues: expect.objectContaining({ some: expect.objectContaining({ valueBoolean: true }) }) }),
            expect.objectContaining({ abilityValues: expect.objectContaining({ some: expect.objectContaining({ valueText: { equals: 'indoor', mode: 'insensitive' } }) }) }),
          ]),
        }),
      }),
    );
  });

  it('rejects unknown abilities', async () => {
    const client: MockClient = {
      ability: { findMany: vi.fn().mockResolvedValue([abilityPressure]) },
      product: { findMany: vi.fn(), count: vi.fn() },
    };

    await expect(
      filterProducts({
        filters: [
          { abilityId: 'press', min: 10 },
          { abilityId: 'missing', equals: true },
        ],
        page: 1,
        pageSize: 10,
      }, client),
    ).rejects.toThrow('UNKNOWN_ABILITY');
  });
});
