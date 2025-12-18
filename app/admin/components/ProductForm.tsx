"use client";

import type { Category, Product, ProductImage } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type ProductStatus = (typeof statuses)[number];

type FormProduct = Omit<Product, "createdAt" | "updatedAt" | "status"> & { images: ProductImage[]; status: ProductStatus };

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
  const [price, setPrice] = useState<number | undefined>(product?.price ? Number(product.price) : undefined);
  const [seoTitleFa, setSeoTitleFa] = useState(product?.seoTitleFa ?? "");
  const [seoTitleEn, setSeoTitleEn] = useState(product?.seoTitleEn ?? "");
  const [seoDescFa, setSeoDescFa] = useState(product?.seoDescFa ?? "");
  const [seoDescEn, setSeoDescEn] = useState(product?.seoDescEn ?? "");
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const endpoint = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product?.id}`;

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [images],
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
        price,
        images: sortedImages,
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

  const updateImage = (index: number, key: keyof ProductImage, value: string | number) => {
    setImages((prev) => {
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
          Price
          <input
            type="number"
            step="0.01"
            value={price ?? ""}
            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded border px-3 py-2 text-sm"
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
      </div>

      <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Images</h2>
            <p className="text-sm text-slate-600">Manage URLs, alt text, and ordering.</p>
          </div>
          <button
            type="button"
            className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            onClick={() =>
              setImages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  productId: product?.id ?? "",
                  url: "",
                  altFa: "",
                  altEn: "",
                  sortOrder: prev.length,
                  createdAt: new Date(),
                },
              ])
            }
          >
            Add image
          </button>
        </div>
        <div className="space-y-3">
          {sortedImages.map((image, index) => (
            <div key={image.id} className="grid gap-3 rounded border p-3 text-sm md:grid-cols-2">
              <label className="flex flex-col gap-2 text-slate-700">
                URL
                <input
                  required
                  value={image.url}
                  onChange={(e) => updateImage(index, "url", e.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-slate-700">
                Sort Order
                <input
                  type="number"
                  value={image.sortOrder ?? 0}
                  onChange={(e) => updateImage(index, "sortOrder", Number(e.target.value))}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-slate-700">
                Alt (FA)
                <input
                  value={image.altFa ?? ""}
                  onChange={(e) => updateImage(index, "altFa", e.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-slate-700">
                Alt (EN)
                <input
                  value={image.altEn ?? ""}
                  onChange={(e) => updateImage(index, "altEn", e.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  className="text-xs font-semibold text-red-600 hover:underline"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {!images.length && <p className="text-sm text-slate-600">No images yet. Add at least one URL.</p>}
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
