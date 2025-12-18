import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { ReplyBox } from '@/app/admin/components/ReplyBox';

export default async function InboxDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.inboxItem.findUnique({
    where: { id: params.id },
    include: {
      adminReplies: {
        include: {
          admin: { select: { id: true, email: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      product: true,
    },
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inbox item</h1>
        <p className="text-sm text-slate-600">Read and respond to messages and comments.</p>
      </div>
      <div className="rounded border bg-white p-4 shadow-sm">
        <div className="flex justify-between">
          <div>
            <div className="text-xs uppercase text-slate-500">{item.type}</div>
            <div className="text-lg font-semibold text-slate-900">{item.name ?? 'Anonymous'}</div>
            <div className="text-sm text-slate-600">{item.email}</div>
          </div>
          <div className="text-sm text-slate-600 text-right">
            <div>{new Date(item.createdAt).toLocaleString()}</div>
            <div>{item.ip}</div>
          </div>
        </div>
        <div className="mt-4 whitespace-pre-wrap text-slate-800">{item.body}</div>
        {item.product ? (
          <div className="mt-2 text-sm text-slate-600">
            Product: {item.product.titleFa} / {item.product.titleEn}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Replies</h2>
        {item.adminReplies.map((reply) => (
          <div key={reply.id} className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="flex justify-between text-sm text-slate-700">
              <div>
                {reply.admin.name ?? reply.admin.email} ({reply.admin.role})
              </div>
              <div>{new Date(reply.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-2 whitespace-pre-wrap text-slate-900">{reply.body}</div>
          </div>
        ))}
        {!item.adminReplies.length ? <p className="text-sm text-slate-600">No replies yet.</p> : null}
      </div>

      <ReplyBox inboxId={item.id} />
    </div>
  );
}
