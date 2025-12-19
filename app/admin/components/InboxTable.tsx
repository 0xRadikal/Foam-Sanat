"use client";

import type { InboxItem, Product } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

type InboxWithRelations = InboxItem & { product?: Pick<Product, "id" | "titleEn" | "titleFa"> | null };

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function InboxTable({ items }: { items: InboxWithRelations[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [working, setWorking] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const performAction = async (updates: Record<string, boolean>) => {
    if (!selected.length) return;
    setWorking(true);
    const csrf = getCsrf();
    await fetch("/api/admin/inbox", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf ?? "",
      },
      body: JSON.stringify({ ids: selected, update: updates }),
    });
    setSelected([]);
    setWorking(false);
    window.location.reload();
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3 text-sm">
        <button
          type="button"
          disabled={!selected.length || working}
          onClick={() => performAction({ isRead: true })}
          className="rounded bg-slate-900 px-3 py-1 text-white disabled:opacity-50"
        >
          Mark read
        </button>
        <button
          type="button"
          disabled={!selected.length || working}
          onClick={() => performAction({ isResolved: true })}
          className="rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-50"
        >
          Mark resolved
        </button>
        <button
          type="button"
          disabled={!selected.length || working}
          onClick={() => performAction({ isSpam: true })}
          className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
        >
          Mark spam
        </button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-3">
              <input
                type="checkbox"
                aria-label="Select all"
                checked={selected.length === items.length && items.length > 0}
                onChange={(e) => setSelected(e.target.checked ? items.map((item) => item.id) : [])}
              />
            </th>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Subject</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Product</th>
            <th className="px-3 py-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-3 py-3">
                <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
              </td>
              <td className="px-3 py-3 font-semibold uppercase">{item.type}</td>
              <td className="px-3 py-3">
                <Link href={`/admin/inbox/${item.id}`} className="font-semibold text-orange-700 hover:underline">
                  {item.name ?? 'Anonymous'}
                </Link>
                <div className="line-clamp-2 text-slate-600">{item.body}</div>
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1">
                  {!item.isRead && <span className="rounded bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">Unread</span>}
                  {!item.isResolved && <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Unresolved</span>}
                  {item.isSpam && <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Spam</span>}
                </div>
              </td>
              <td className="px-3 py-3 text-slate-700">
                {item.product ? `${item.product.titleFa} / ${item.product.titleEn}` : '—'}
              </td>
              <td className="px-3 py-3 text-slate-600">{new Date(item.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length ? <div className="p-4 text-sm text-slate-600">No inbox entries found.</div> : null}
    </div>
  );
}
