import { prisma } from '@/app/lib/prisma';
import { CategoryForm } from '@/app/admin/components/CategoryForm';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-600">Create and manage product categories.</p>
      </div>
      <CategoryForm />
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Name (FA/EN)</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{cat.nameFa}</div>
                  <div className="text-slate-500">{cat.nameEn}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{cat.slug}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(cat.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!categories.length ? <div className="p-4 text-sm text-slate-600">No categories yet.</div> : null}
      </div>
    </div>
  );
}
