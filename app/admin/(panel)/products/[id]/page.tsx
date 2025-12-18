import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { ProductForm } from '@/app/admin/components/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { nameFa: 'asc' } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit product</h1>
        <p className="text-sm text-slate-600">Update status, content, images, and SEO.</p>
      </div>
      <ProductForm mode="edit" product={product} categories={categories} />
    </div>
  );
}
