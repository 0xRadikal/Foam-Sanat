"use client";

import type { ProductStatus, PriceMode } from "@prisma/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductRow = {
  id: string;
  titleFa: string;
  titleEn: string;
  slug: string;
  status: ProductStatus;
  categoryLabel: string;
  priceMode: PriceMode;
  mediaCount: number;
  hasImage: boolean;
  hasEmoji: boolean;
};

type Props = {
  products: ProductRow[];
  exportUrl: string;
  hardDeleteAllowed: boolean;
};

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function ProductsTable({ products, exportUrl, hardDeleteAllowed }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const allSelected = selectedIds.length > 0 && selectedIds.length === products.length;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((product) => product.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    if (bulkAction === "hard_delete" && confirmation !== "DELETE") {
      alert("Type DELETE to confirm hard deletion.");
      return;
    }

    setLoading(true);
    try {
      const csrf = getCsrf();
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf ?? "",
        },
        body: JSON.stringify({
          action: bulkAction,
          ids: selectedIds,
          confirmation: bulkAction === "hard_delete" ? confirmation : undefined,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Bulk action failed.");
      }

      setSelectedIds([]);
      setBulkAction("");
      setConfirmation("");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Bulk action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
        <select
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="">Bulk actions</option>
          <option value="publish">Publish</option>
          <option value="unpublish">Unpublish</option>
          <option value="delete">Soft delete</option>
          {hardDeleteAllowed ? <option value="hard_delete">Hard delete</option> : null}
        </select>
        {bulkAction === "hard_delete" ? (
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Type DELETE"
            className="rounded border px-3 py-2 text-sm"
          />
        ) : null}
        <button
          type="button"
          onClick={handleBulkAction}
          disabled={!bulkAction || selectedIds.length === 0 || loading}
          className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Applying..." : "Apply"}
        </button>
        <a
          href={exportUrl}
          className="ml-auto rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500"
        >
          Export CSV
        </a>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3">Title (FA/EN)</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price Mode</th>
              <th className="px-4 py-3">Media</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(product.id)}
                    onChange={() => toggleRow(product.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{product.titleFa}</div>
                  <div className="text-slate-500">{product.titleEn}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{product.slug}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{product.categoryLabel}</td>
                <td className="px-4 py-3 text-slate-700">{product.priceMode}</td>
                <td className="px-4 py-3 text-slate-700">
                  <span className="text-xs font-semibold">{product.mediaCount}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {product.hasImage ? "IMG" : ""} {product.hasEmoji ? "EMOJI" : ""}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a href={`/admin/products/${product.id}`} className="text-orange-700 hover:underline">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length ? (
          <div className="p-4 text-sm text-slate-600">No products found for these filters.</div>
        ) : null}
      </div>
    </div>
  );
}
