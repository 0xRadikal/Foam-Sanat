import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { ProductForm } from '@/app/admin/components/ProductForm';
import { ProductDangerZone } from '@/app/admin/components/ProductDangerZone';
import { requireSession } from '@/app/api/admin/lib/session';
import { isHardDeleteAllowed } from '@/app/api/admin/products/lib';
import { Role } from '@prisma/client';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const hardDeleteAllowed = isHardDeleteAllowed(session.user?.role as Role);
  const [product, categories, abilityValues, abilities] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { media: true },
    }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { nameFa: 'asc' } }),
    prisma.productAbilityValue.findMany({
      where: { productId: params.id },
      include: { ability: { include: { options: true } }, abilityOption: true },
    }),
    prisma.ability.findMany({
      where: { deletedAt: null, isFilterable: true, isPrivate: false },
      include: { options: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit product</h1>
        <p className="text-sm text-slate-600">Update status, content, media, and SEO.</p>
      </div>
      <ProductForm
        mode="edit"
        product={{
          ...product,
          priceAmount: product.priceAmount ? Number(product.priceAmount) : null,
        }}
        categories={categories}
        abilities={abilities}
        abilityValues={abilityValues}
      />
      <ProductDangerZone productId={product.id} hardDeleteAllowed={hardDeleteAllowed} />
    </div>
  );
}
