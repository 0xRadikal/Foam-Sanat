import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { AdminForm } from '@/app/admin/components/AdminForm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth/options';
import type { AdminSession } from '@/app/api/admin/lib/session';

export default async function AdminsPage() {
  const session = (await getServerSession(authOptions as any)) as AdminSession | null;
  if (!session || session.user?.role !== Role.SUPERADMIN) {
    redirect('/admin');
  }
  const admins = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admins</h1>
        <p className="text-sm text-slate-600">Create and manage admin accounts and roles.</p>
      </div>
      <AdminForm />
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t">
                <td className="px-4 py-3 font-semibold text-slate-900">{admin.name}</td>
                <td className="px-4 py-3 text-slate-700">{admin.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
                    {admin.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{new Date(admin.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!admins.length ? <div className="p-4 text-sm text-slate-600">No admins yet.</div> : null}
      </div>
    </div>
  );
}
