"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  commentsEnabled: boolean;
};

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function SettingsForm({ commentsEnabled }: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(commentsEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const csrf = getCsrf();
      const response = await fetch("/api/admin/settings/comments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf ?? "",
        },
        body: JSON.stringify({ commentsEnabled: enabled }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update settings.");
      }

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Comments</h2>
          <p className="text-sm text-slate-600">Enable or disable comments across the storefront.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border"
          />
          Enabled
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}
