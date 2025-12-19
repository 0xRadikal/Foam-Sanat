import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import React from 'react';
import { authOptions } from '@/app/lib/auth/options';
import { AdminProviders } from '../providers';
import type { AdminSession } from '@/app/api/admin/lib/session';

export const metadata: Metadata = {
  title: 'Admin Panel | Foam Sanat',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/products/new', label: 'New Product' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/inbox', label: 'Inbox' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/admins', label: 'Admins', roles: ['SUPERADMIN'] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = (await getServerSession(authOptions)) as AdminSession | null;
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminProviders session={session}>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded bg-orange-500 px-3 py-1 text-white font-semibold">Admin</div>
              <span className="text-sm text-slate-500">Foam Sanat Control Panel</span>
            </div>
            <div className="text-sm text-slate-700">
              {session.user?.email} · <span className="uppercase">{session.user?.role}</span>
            </div>
          </div>
          <nav className="mx-auto flex max-w-6xl gap-4 px-6 pb-3 text-sm font-medium text-slate-700">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(session.user?.role ?? 'ADMIN'))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded px-3 py-2 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </div>
    </AdminProviders>
  );
}
