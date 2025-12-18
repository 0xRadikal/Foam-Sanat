import Link from 'next/link';
import { ProductStatus } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';

type Props = {
  searchParams?: {
    q?: string;
    status?: ProductStatus;
    categoryId?: string;
  };
};

export default async function ProductsPage({ searchParams }: Props) {
  const search = searchParams?.q ?? '';
  const status = searchParams?.status;
  const categoryId = searchParams?.categoryId;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { titleFa: { contains: search, mode: 'insensitive' } },
                { titleEn: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { nameFa: 'asc' } }),
  ]);

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

      <form className="grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-4">
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
        <button className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Apply
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Title (FA/EN)</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{product.titleFa}</div>
                  <div className="text-slate-500">{product.titleEn}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{product.slug}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {product.category ? `${product.category.nameFa} / ${product.category.nameEn}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="text-orange-700 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length ? (
          <div className="p-4 text-sm text-slate-600">No products found for these filters.</div>
        ) : null}
      </div>
    </div>
  );
}
