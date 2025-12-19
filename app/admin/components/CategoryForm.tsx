"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function CategoryForm() {
  const router = useRouter();
  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const csrf = getCsrf();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf ?? "",
      },
      body: JSON.stringify({ nameFa, nameEn, slug }),
    });

    if (!res.ok) {
      const message = await res.text();
      setError(message || "Failed to save category.");
      setSaving(false);
      return;
    }

    setNameFa("");
    setNameEn("");
    setSlug("");
    router.refresh();
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Name (FA)
          <input value={nameFa} onChange={(e) => setNameFa(e.target.value)} required className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Name (EN)
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Slug
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded border px-3 py-2 text-sm" />
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Add category"}
      </button>
    </form>
  );
}
