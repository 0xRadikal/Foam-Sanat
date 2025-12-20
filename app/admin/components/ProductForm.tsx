"use client";

import type { Ability, AbilityOption, Category, PriceMode, Product, ProductAbilityValue, ProductMedia } from "@prisma/client";
import { AbilityType, ProductMediaType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type ProductStatus = (typeof statuses)[number];

type FormProduct = Omit<Product, "createdAt" | "updatedAt" | "status" | "priceAmount"> & {
  media: ProductMedia[];
  status: ProductStatus;
  priceAmount: number | null;
};

type AbilityWithOptions = Ability & { options: AbilityOption[] };
type AbilityValueWithAbility = ProductAbilityValue & { ability: AbilityWithOptions; abilityOption?: AbilityOption | null };

type AbilityDraftState = {
  valueNumber?: string;
  valueText?: string;
  valueBoolean?: boolean;
  rangeStart?: string;
  rangeEnd?: string;
  abilityOptionId?: string;
};

type Props = {
  mode: "create" | "edit";
  product?: FormProduct;
  categories: Category[];
  abilities: AbilityWithOptions[];
  abilityValues?: AbilityValueWithAbility[];
};

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function ProductForm({ mode, product, categories, abilities, abilityValues }: Props) {
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

  const initialAbilityDrafts: Record<string, AbilityDraftState> = useMemo(() => {
    const mapped: Record<string, AbilityDraftState> = {};
    abilityValues?.forEach((item) => {
      const ability = abilities.find((a) => a.id === item.abilityId);
      if (!ability) return;
      switch (ability.type) {
        case "NUMBER":
          mapped[ability.id] = { valueNumber: item.valueNumber ? String(item.valueNumber) : undefined };
          break;
        case "TEXT":
          mapped[ability.id] = { valueText: item.valueText ?? "" };
          break;
        case "BOOLEAN":
          mapped[ability.id] = { valueBoolean: item.valueBoolean ?? false };
          break;
        case "RANGE":
          mapped[ability.id] = {
            rangeStart: item.rangeStart ? String(item.rangeStart) : undefined,
            rangeEnd: item.rangeEnd ? String(item.rangeEnd) : undefined,
          };
          break;
        case "ENUM":
          mapped[ability.id] = { abilityOptionId: item.abilityOptionId ?? undefined };
          break;
        default:
          break;
      }
    });
    return mapped;
  }, [abilities, abilityValues]);

  const [abilityDrafts, setAbilityDrafts] = useState<Record<string, AbilityDraftState>>(initialAbilityDrafts);

  const endpoint = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product?.id}`;

  const sortedMedia = useMemo(
    () => [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [media],
  );

  const updateAbilityDraft = (abilityId: string, patch: AbilityDraftState) => {
    setAbilityDrafts((prev) => ({ ...prev, [abilityId]: { ...prev[abilityId], ...patch } }));
  };

  const buildAbilityPayloads = (productId: string) => {
    const payloads: Record<string, unknown>[] = [];
    for (const ability of abilities) {
      if (ability.deletedAt || ability.isPrivate) continue;
      const draft = abilityDrafts[ability.id];
      if (!draft) continue;

      switch (ability.type) {
        case AbilityType.NUMBER: {
          if (draft.valueNumber === undefined || draft.valueNumber === "") break;
          const numberValue = Number(draft.valueNumber);
          if (Number.isNaN(numberValue)) throw new Error("Invalid numeric ability value");
          payloads.push({ productId, abilityId: ability.id, valueNumber: numberValue });
          break;
        }
        case AbilityType.TEXT: {
          if (!draft.valueText) break;
          payloads.push({ productId, abilityId: ability.id, valueText: draft.valueText });
          break;
        }
        case AbilityType.BOOLEAN: {
          if (draft.valueBoolean === undefined) break;
          payloads.push({ productId, abilityId: ability.id, valueBoolean: draft.valueBoolean });
          break;
        }
        case AbilityType.RANGE: {
          if (draft.rangeStart === undefined || draft.rangeEnd === undefined || draft.rangeStart === "" || draft.rangeEnd === "") break;
          const start = Number(draft.rangeStart);
          const end = Number(draft.rangeEnd);
          if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
            throw new Error("Invalid range value");
          }
          payloads.push({ productId, abilityId: ability.id, rangeStart: start, rangeEnd: end });
          break;
        }
        case AbilityType.ENUM: {
          if (!draft.abilityOptionId) break;
          const optionExists = ability.options.some((opt) => opt.id === draft.abilityOptionId);
          if (!optionExists) throw new Error("Invalid enum option");
          payloads.push({ productId, abilityId: ability.id, abilityOptionId: draft.abilityOptionId });
          break;
        }
        default:
          break;
      }
    }
    return payloads;
  };

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
    const abilityPayloads = buildAbilityPayloads(data.data.id);

    for (const payload of abilityPayloads) {
      const abilityRes = await fetch("/api/admin/abilities", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf ?? "",
        },
        body: JSON.stringify(payload),
      });

      if (!abilityRes.ok) {
        const message = await abilityRes.text();
        setError(message || "Failed to assign ability value.");
        setSaving(false);
        return;
      }
    }

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

      <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Attributes</h2>
            <p className="text-sm text-slate-600">Values are validated per type before saving.</p>
          </div>
        </div>
        <div className="space-y-4">
          {abilities.map((ability) => {
            const draft = abilityDrafts[ability.id] ?? {};
            return (
              <div key={ability.id} className="grid gap-3 rounded border p-3 text-sm md:grid-cols-2">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{ability.titleFa}</p>
                  <p className="text-xs text-slate-600">{ability.titleEn}</p>
                  {ability.unit ? <p className="text-xs text-slate-500">Unit: {ability.unit}</p> : null}
                </div>
                {ability.type === AbilityType.NUMBER && (
                  <label className="flex flex-col gap-2 text-slate-700">
                    Value
                    <input
                      type="number"
                      value={draft.valueNumber ?? ""}
                      onChange={(e) => updateAbilityDraft(ability.id, { valueNumber: e.target.value })}
                      className="rounded border px-3 py-2 text-sm"
                    />
                  </label>
                )}
                {ability.type === AbilityType.TEXT && (
                  <label className="flex flex-col gap-2 text-slate-700 md:col-span-1">
                    Text
                    <textarea
                      value={draft.valueText ?? ""}
                      onChange={(e) => updateAbilityDraft(ability.id, { valueText: e.target.value })}
                      className="rounded border px-3 py-2 text-sm"
                    />
                  </label>
                )}
                {ability.type === AbilityType.BOOLEAN && (
                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={draft.valueBoolean ?? false}
                      onChange={(e) => updateAbilityDraft(ability.id, { valueBoolean: e.target.checked })}
                      className="h-4 w-4 rounded border"
                    />
                    Enabled
                  </label>
                )}
                {ability.type === AbilityType.RANGE && (
                  <div className="grid grid-cols-2 gap-3 md:col-span-1">
                    <label className="flex flex-col gap-2 text-slate-700">
                      Min
                      <input
                        type="number"
                        value={draft.rangeStart ?? ""}
                        onChange={(e) => updateAbilityDraft(ability.id, { rangeStart: e.target.value })}
                        className="rounded border px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-slate-700">
                      Max
                      <input
                        type="number"
                        value={draft.rangeEnd ?? ""}
                        onChange={(e) => updateAbilityDraft(ability.id, { rangeEnd: e.target.value })}
                        className="rounded border px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                )}
                {ability.type === AbilityType.ENUM && (
                  <label className="flex flex-col gap-2 text-slate-700">
                    Option
                    <select
                      value={draft.abilityOptionId ?? ""}
                      onChange={(e) => updateAbilityDraft(ability.id, { abilityOptionId: e.target.value || undefined })}
                      className="rounded border px-3 py-2 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {ability.options
                        .filter((opt) => !opt.sortOrder || opt.sortOrder >= 0)
                        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                        .map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.labelFa} / {option.labelEn ?? option.value}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </div>
            );
          })}
          {!abilities.length && <p className="text-sm text-slate-600">No attributes configured.</p>}
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
