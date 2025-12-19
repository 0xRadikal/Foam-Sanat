import { describe, expect, it, vi } from 'vitest';
import { Prisma, ProductMediaType, Role } from '@prisma/client';
import { buildProductWhere, hardDeleteProduct, isHardDeleteAllowed } from './lib';

describe('buildProductWhere', () => {
  it('builds filters for media and search params', () => {
    const params = new URLSearchParams({
      q: 'foam',
      status: 'PUBLISHED',
      hasMedia: 'true',
      hasEmoji: 'false',
    });

    expect(buildProductWhere(params)).toEqual({
      AND: [
        {
          deletedAt: null,
          status: 'PUBLISHED',
          OR: [
            { titleFa: { contains: 'foam', mode: 'insensitive' } },
            { titleEn: { contains: 'foam', mode: 'insensitive' } },
            { slug: { contains: 'foam', mode: 'insensitive' } },
          ],
        },
        { media: { some: {} } },
        { media: { none: { type: ProductMediaType.EMOJI } } },
      ],
    });
  });
});

describe('hardDeleteProduct', () => {
  it('removes dependent records before deleting product', async () => {
    const prisma = {
      productMedia: { deleteMany: vi.fn().mockResolvedValue({}) },
      inboxItem: { deleteMany: vi.fn().mockResolvedValue({}) },
      product: { delete: vi.fn().mockResolvedValue({}) },
    } as unknown as Prisma.TransactionClient;

    await hardDeleteProduct(prisma, 'product-123');

    expect(prisma.productMedia.deleteMany).toHaveBeenCalledWith({ where: { productId: 'product-123' } });
    expect(prisma.inboxItem.deleteMany).toHaveBeenCalledWith({ where: { productId: 'product-123' } });
    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'product-123' } });
  });
});

describe('isHardDeleteAllowed', () => {
  it('allows hard delete for superadmin in non-production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('HARD_DELETE_ENABLED', '');
    expect(isHardDeleteAllowed(Role.SUPERADMIN)).toBe(true);
    vi.unstubAllEnvs();
  });

  it('rejects hard delete for non-superadmin roles', () => {
    expect(isHardDeleteAllowed(Role.ADMIN)).toBe(false);
  });
});
