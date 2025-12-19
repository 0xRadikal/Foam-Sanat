import { describe, expect, it } from 'vitest';
import { ProductStatus, Role } from '@prisma/client';
import { adminSchema, productSchema } from './validation';

describe('productSchema', () => {
  it('validates required bilingual fields and defaults', () => {
    const result = productSchema.parse({
      slug: 'test-product',
      status: ProductStatus.DRAFT,
      titleFa: 'عنوان',
      titleEn: 'Title',
      shortFa: 'کوتاه',
      shortEn: 'Short',
      descFa: 'توضیح',
      descEn: 'Description',
      images: [{ url: 'https://example.com/img.jpg', sortOrder: 0 }],
    });

    expect(result.status).toBe(ProductStatus.DRAFT);
    expect(result.images).toHaveLength(1);
  });

  it('rejects empty titles', () => {
    expect(() =>
      productSchema.parse({
        slug: 'invalid',
        status: ProductStatus.DRAFT,
        titleFa: '',
        titleEn: '',
        shortFa: 'a',
        shortEn: 'b',
        descFa: 'c',
        descEn: 'd',
        images: [],
      }),
    ).toThrow();
  });

  it('rejects attempts to set deletedAt or other unknown fields', () => {
    expect(() =>
      productSchema.parse({
        slug: 'deleted-attempt',
        status: ProductStatus.DRAFT,
        titleFa: 'fa',
        titleEn: 'en',
        shortFa: 'a',
        shortEn: 'b',
        descFa: 'c',
        descEn: 'd',
        images: [],
        deletedAt: new Date().toISOString(),
      }),
    ).toThrow();
  });
});

describe('adminSchema', () => {
  it('requires secure password length', () => {
    expect(() =>
      adminSchema.parse({
        email: 'admin@example.com',
        name: 'Admin',
        role: Role.ADMIN,
        password: 'short',
      }),
    ).toThrow();
  });
});
