import { prisma } from '@/app/lib/prisma';
import { ProductForm } from '@/app/admin/components/ProductForm';

export default async function NewProductPage() {
  const [categories, abilities] = await Promise.all([
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { nameFa: 'asc' } }),
    prisma.ability.findMany({
      where: { deletedAt: null, isFilterable: true, isPrivate: false },
      include: { options: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create product</h1>
        <p className="text-sm text-slate-600">Bilingual content, SEO, pricing, and gallery.</p>
      </div>
      <ProductForm mode="create" categories={categories} abilities={abilities} />
    </div>
  );
}
