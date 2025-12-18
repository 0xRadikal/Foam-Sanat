import { prisma } from '@/app/lib/prisma';
import { requireSession } from '@/app/api/admin/lib/session';

export default async function AdminDashboardPage() {
  await requireSession();
  const [products, published, drafts, inboxUnread, unresolved] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    prisma.product.count({ where: { status: 'DRAFT', deletedAt: null } }),
    prisma.inboxItem.count({ where: { isRead: false } }),
    prisma.inboxItem.count({ where: { isResolved: false, isSpam: false } }),
  ]);

  const cards = [
    { label: 'Products', value: products },
    { label: 'Published', value: published },
    { label: 'Drafts', value: drafts },
    { label: 'Unread Inbox', value: inboxUnread },
    { label: 'Unresolved', value: unresolved },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">Key indicators for your content and inbox.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="text-3xl font-bold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
