import { InboxType } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { InboxTable } from '@/app/admin/components/InboxTable';

type Props = {
  searchParams?: {
    type?: InboxType;
    spam?: string;
    unread?: string;
    unresolved?: string;
  };
};

export default async function InboxPage({ searchParams }: Props) {
  const type = searchParams?.type;
  const spam = searchParams?.spam === 'true';
  const unread = searchParams?.unread === 'true';
  const unresolved = searchParams?.unresolved === 'true';

  const items = await prisma.inboxItem.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(searchParams?.spam ? { isSpam: spam } : {}),
      ...(searchParams?.unread ? { isRead: !unread } : {}),
      ...(searchParams?.unresolved ? { isResolved: !unresolved } : {}),
    },
    include: { product: { select: { id: true, titleFa: true, titleEn: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inbox</h1>
        <p className="text-sm text-slate-600">Moderate comments and contact messages.</p>
      </div>
      <form className="flex flex-wrap gap-3 rounded-lg border bg-white p-4 shadow-sm">
        <select name="type" defaultValue={type ?? ''} className="rounded border px-3 py-2 text-sm">
          <option value="">All types</option>
          <option value={InboxType.COMMENT}>Comments</option>
          <option value={InboxType.MESSAGE}>Messages</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="spam" value="true" defaultChecked={spam} />
          Spam only
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="unread" value="true" defaultChecked={unread} />
          Unread only
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="unresolved" value="true" defaultChecked={unresolved} />
          Unresolved only
        </label>
        <button className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">Apply</button>
      </form>
      <InboxTable items={items} />
    </div>
  );
}
