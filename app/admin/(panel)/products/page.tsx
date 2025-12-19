import Link from 'next/link';
import { PriceMode, ProductMediaType, ProductStatus, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { ProductsTable } from '@/app/admin/components/ProductsTable';
import { buildProductWhere } from '@/app/api/admin/products/lib';
import { requireSession } from '@/app/api/admin/lib/session';
import { isHardDeleteAllowed } from '@/app/api/admin/products/lib';

type Props = {
  searchParams?: {
    q?: string;
    status?: ProductStatus;
    categoryId?: string;
    priceMode?: PriceMode;
    hasMedia?: string;
    hasImages?: string;
    hasEmoji?: string;
  };
};

export default async function ProductsPage({ searchParams }: Props) {
  const session = await requireSession();
  const hardDeleteAllowed = isHardDeleteAllowed(session.user?.role as Role);
  const search = searchParams?.q ?? '';
  const status = searchParams?.status;
  const categoryId = searchParams?.categoryId;
  const priceMode = searchParams?.priceMode;
  const hasMedia = searchParams?.hasMedia ?? '';
  const hasImages = searchParams?.hasImages ?? '';
  const hasEmoji = searchParams?.hasEmoji ?? '';

  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (status) params.set('status', status);
  if (categoryId) params.set('categoryId', categoryId);
  if (priceMode) params.set('priceMode', priceMode);
  if (hasMedia) params.set('hasMedia', hasMedia);
  if (hasImages) params.set('hasImages', hasImages);
  if (hasEmoji) params.set('hasEmoji', hasEmoji);

  const where = buildProductWhere(params);

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, media: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { nameFa: 'asc' } }),
  ]);

  const productRows = products.map((product) => ({
    id: product.id,
    titleFa: product.titleFa,
    titleEn: product.titleEn,
    slug: product.slug,
    status: product.status,
    categoryLabel: product.category ? `${product.category.nameFa} / ${product.category.nameEn}` : '—',
    priceMode: product.priceMode,
    mediaCount: product.media.length,
    hasImage: product.media.some((item) => item.type === ProductMediaType.IMAGE),
    hasEmoji: product.media.some((item) => item.type === ProductMediaType.EMOJI),
  }));

  const exportUrl = `/api/admin/products/export?${params.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-600">Search, filter, and edit products.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          New Product
        </Link>
      </div>

      <form className="grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-4 xl:grid-cols-7">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by title or slug"
          className="rounded border px-3 py-2 text-sm"
        />
        <select name="status" defaultValue={status ?? ''} className="rounded border px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {Object.values(ProductStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="categoryId" defaultValue={categoryId ?? ''} className="rounded border px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nameFa} / {cat.nameEn}
            </option>
          ))}
        </select>
        <select name="priceMode" defaultValue={priceMode ?? ''} className="rounded border px-3 py-2 text-sm">
          <option value="">All price modes</option>
          {Object.values(PriceMode).map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
        <select name="hasMedia" defaultValue={hasMedia} className="rounded border px-3 py-2 text-sm">
          <option value="">All media</option>
          <option value="true">Has media</option>
          <option value="false">No media</option>
        </select>
        <select name="hasImages" defaultValue={hasImages} className="rounded border px-3 py-2 text-sm">
          <option value="">Images (any)</option>
          <option value="true">Has images</option>
          <option value="false">No images</option>
        </select>
        <select name="hasEmoji" defaultValue={hasEmoji} className="rounded border px-3 py-2 text-sm">
          <option value="">Emoji (any)</option>
          <option value="true">Has emoji</option>
          <option value="false">No emoji</option>
        </select>
        <button className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Apply
        </button>
      </form>

      <ProductsTable products={productRows} exportUrl={exportUrl} hardDeleteAllowed={hardDeleteAllowed} />
    </div>
  );
}
