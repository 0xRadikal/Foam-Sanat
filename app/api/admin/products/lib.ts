import { Prisma, ProductMediaType, ProductStatus, Role } from '@prisma/client';

export const DEFAULT_PAGE_SIZE = 10;

export function parsePagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? DEFAULT_PAGE_SIZE);
  return {
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: Number.isNaN(pageSize) || pageSize < 1 ? DEFAULT_PAGE_SIZE : Math.min(pageSize, 50),
  };
}

const parseBooleanParam = (value: string | null) => {
  if (value === null) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

export function buildProductWhere(searchParams: URLSearchParams): Prisma.ProductWhereInput {
  const search = searchParams.get('q') ?? '';
  const status = searchParams.get('status') as ProductStatus | null;
  const categoryId = searchParams.get('categoryId');
  const priceMode = searchParams.get('priceMode');
  const hasMedia = parseBooleanParam(searchParams.get('hasMedia'));
  const hasImages = parseBooleanParam(searchParams.get('hasImages'));
  const hasEmoji = parseBooleanParam(searchParams.get('hasEmoji'));

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(priceMode ? { priceMode: priceMode as Prisma.ProductWhereInput['priceMode'] } : {}),
    ...(search
      ? {
          OR: [
            { titleFa: { contains: search, mode: 'insensitive' } },
            { titleEn: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const andFilters: Prisma.ProductWhereInput[] = [];

  if (hasMedia !== null) {
    andFilters.push({ media: hasMedia ? { some: {} } : { none: {} } });
  }

  if (hasImages !== null) {
    andFilters.push({
      media: hasImages ? { some: { type: ProductMediaType.IMAGE } } : { none: { type: ProductMediaType.IMAGE } },
    });
  }

  if (hasEmoji !== null) {
    andFilters.push({
      media: hasEmoji ? { some: { type: ProductMediaType.EMOJI } } : { none: { type: ProductMediaType.EMOJI } },
    });
  }

  return andFilters.length ? { AND: [where, ...andFilters] } : where;
}

export function resolvePublishedAt(
  previousStatus: ProductStatus,
  nextStatus: ProductStatus,
  existingPublishedAt: Date | null,
): Date | null {
  if (nextStatus !== ProductStatus.PUBLISHED) {
    return null;
  }

  if (previousStatus === ProductStatus.PUBLISHED && existingPublishedAt) {
    return existingPublishedAt;
  }

  return new Date();
}

export function isHardDeleteAllowed(role: Role): boolean {
  if (role !== Role.SUPERADMIN) return false;
  if (process.env.HARD_DELETE_ENABLED === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

export async function hardDeleteProduct(prisma: Prisma.TransactionClient, productId: string) {
  await prisma.productMedia.deleteMany({ where: { productId } });
  await prisma.inboxItem.deleteMany({ where: { productId } });
  await prisma.product.delete({ where: { id: productId } });
}
