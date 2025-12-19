"use client";

import type { Category, PriceMode, Product, ProductMedia } from "@prisma/client";
import { ProductMediaType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type ProductStatus = (typeof statuses)[number];

type FormProduct = Omit<Product, "createdAt" | "updatedAt" | "status" | "priceAmount"> & {
  media: ProductMedia[];
  status: ProductStatus;
  priceAmount: number | null;
};

type Props = {
  mode: "create" | "edit";
  product?: FormProduct;
  categories: Category[];
};

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function ProductForm({ mode, product, categories }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "DRAFT");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState<string | undefined | null>(product?.categoryId);
  const [titleFa, setTitleFa] = useState(product?.titleFa ?? "");
  const [titleEn, setTitleEn] = useState(product?.titleEn ?? "");
  const [shortFa, setShortFa] = useState(product?.shortFa ?? "");
  const [shortEn, setShortEn] = useState(product?.shortEn ?? "");
  const [descFa, setDescFa] = useState(product?.descFa ?? "");
  const [descEn, setDescEn] = useState(product?.descEn ?? "");
  const [priceMode, setPriceMode] = useState<PriceMode>(product?.priceMode ?? "UNAVAILABLE");
  const [priceAmount, setPriceAmount] = useState<number | undefined>(
    product?.priceAmount ? Number(product.priceAmount) : undefined,
  );
  const [priceNoteFa, setPriceNoteFa] = useState(product?.priceNoteFa ?? "");
  const [priceNoteEn, setPriceNoteEn] = useState(product?.priceNoteEn ?? "");
  const [commentsEnabled, setCommentsEnabled] = useState(product?.commentsEnabled ?? true);
  const [seoTitleFa, setSeoTitleFa] = useState(product?.seoTitleFa ?? "");
  const [seoTitleEn, setSeoTitleEn] = useState(product?.seoTitleEn ?? "");
  const [seoDescFa, setSeoDescFa] = useState(product?.seoDescFa ?? "");
  const [seoDescEn, setSeoDescEn] = useState(product?.seoDescEn ?? "");
  const [media, setMedia] = useState<ProductMedia[]>(product?.media ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const endpoint = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product?.id}`;

  const sortedMedia = useMemo(
    () => [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [media],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const csrf = getCsrf();
    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf ?? "",
      },
      body: JSON.stringify({
        slug,
        status,
        categoryId,
        titleFa,
        titleEn,
        shortFa,
        shortEn,
        descFa,
        descEn,
        priceMode,
        priceAmount,
        priceNoteFa,
        priceNoteEn,
        commentsEnabled,
        media: sortedMedia,
        seoTitleFa,
        seoTitleEn,
        seoDescFa,
        seoDescEn,
      }),
    });

    if (!res.ok) {
      const message = await res.text();
      setError(message || "Failed to save product.");
      setSaving(false);
      return;
    }

    const data = await res.json();
    router.push(`/admin/products/${data.data.id}`);
    router.refresh();
  };

  const updateMedia = (
    index: number,
    key: keyof ProductMedia,
    value: string | number | null,
  ) => {
    setMedia((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Slug
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from title if empty"
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="rounded border px-3 py-2 text-sm">
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Category
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameFa} / {cat.nameEn}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Price Mode
          <select
            value={priceMode}
            onChange={(e) => {
              const nextMode = e.target.value as PriceMode;
              setPriceMode(nextMode);
              if (nextMode !== "FIXED") {
                setPriceAmount(undefined);
              }
            }}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="FIXED">Fixed</option>
            <option value="CONTACT">Contact</option>
            <option value="NEGOTIABLE">Negotiable</option>
            <option value="FREE">Free</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Price Amount
          <input
            type="number"
            step="0.01"
            disabled={priceMode !== "FIXED"}
            required={priceMode === "FIXED"}
            value={priceAmount ?? ""}
            onChange={(e) => setPriceAmount(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded border px-3 py-2 text-sm disabled:bg-slate-100"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Title (FA)
          <input
            required
            value={titleFa}
            onChange={(e) => setTitleFa(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Title (EN)
          <input
            required
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Short Description (FA)
          <textarea
            required
            value={shortFa}
            onChange={(e) => setShortFa(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Short Description (EN)
          <textarea
            required
            value={shortEn}
            onChange={(e) => setShortEn(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
          Description (FA)
          <textarea
            required
            value={descFa}
            onChange={(e) => setDescFa(e.target.value)}
            rows={4}
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
          Description (EN)
          <textarea
            required
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            rows={4}
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Price Note (FA)
          <input
            value={priceNoteFa}
            onChange={(e) => setPriceNoteFa(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Price Note (EN)
          <input
            value={priceNoteEn}
            onChange={(e) => setPriceNoteEn(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          SEO Title (FA)
          <input value={seoTitleFa} onChange={(e) => setSeoTitleFa(e.target.value)} className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          SEO Title (EN)
          <input value={seoTitleEn} onChange={(e) => setSeoTitleEn(e.target.value)} className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          SEO Description (FA)
          <textarea value={seoDescFa} onChange={(e) => setSeoDescFa(e.target.value)} className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          SEO Description (EN)
          <textarea value={seoDescEn} onChange={(e) => setSeoDescEn(e.target.value)} className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
          <input
            type="checkbox"
            checked={commentsEnabled}
            onChange={(e) => setCommentsEnabled(e.target.checked)}
            className="h-4 w-4 rounded border"
          />
          Enable comments for this product
        </label>
      </div>

      <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Media</h2>
            <p className="text-sm text-slate-600">Mix image URLs and emojis in order.</p>
          </div>
          <button
            type="button"
            className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            onClick={() =>
              setMedia((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  productId: product?.id ?? "",
                  type: ProductMediaType.IMAGE,
                  url: "",
                  emoji: null,
                  altFa: "",
                  altEn: "",
                  sortOrder: prev.length,
                  createdAt: new Date(),
                },
              ])
            }
          >
            Add media
          </button>
        </div>
        <div className="space-y-3">
          {sortedMedia.map((item, index) => (
            <div key={item.id} className="grid gap-3 rounded border p-3 text-sm md:grid-cols-2">
              <label className="flex flex-col gap-2 text-slate-700">
                Type
                <select
                  value={item.type}
                  onChange={(e) => {
                    const nextType = e.target.value as ProductMediaType;
                    setMedia((prev) => {
                      const next = [...prev];
                      const current = next[index];
                      next[index] = {
                        ...current,
                        type: nextType,
                        url: nextType === ProductMediaType.IMAGE ? current.url ?? "" : null,
                        emoji: nextType === ProductMediaType.EMOJI ? current.emoji ?? "" : null,
                      };
                      return next;
                    });
                  }}
                  className="rounded border px-3 py-2 text-sm"
                >
                  <option value={ProductMediaType.IMAGE}>Image</option>
                  <option value={ProductMediaType.EMOJI}>Emoji</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-slate-700">
                URL
                <input
                  required={item.type === ProductMediaType.IMAGE}
                  value={item.url ?? ""}
                  onChange={(e) => updateMedia(index, "url", e.target.value)}
                  disabled={item.type !== ProductMediaType.IMAGE}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-slate-700">
                Emoji
                <input
                  value={item.emoji ?? ""}
                  onChange={(e) => updateMedia(index, "emoji", e.target.value)}
                  disabled={item.type !== ProductMediaType.EMOJI}
                  placeholder="🔥"
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-slate-700">
                Sort Order
                <input
                  type="number"
                  value={item.sortOrder ?? 0}
                  onChange={(e) => updateMedia(index, "sortOrder", Number(e.target.value))}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-slate-700">
                Alt (FA)
                <input
                  value={item.altFa ?? ""}
                  onChange={(e) => updateMedia(index, "altFa", e.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-slate-700">
                Alt (EN)
                <input
                  value={item.altEn ?? ""}
                  onChange={(e) => updateMedia(index, "altEn", e.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-red-600 hover:underline"
                  onClick={() => setMedia((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {!media.length && <p className="text-sm text-slate-600">No media yet. Add at least one item.</p>}
        </div>
      </div>

      {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
      </button>
    </form>
  );
}
