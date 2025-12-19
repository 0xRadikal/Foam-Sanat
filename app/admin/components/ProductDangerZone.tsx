"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  productId: string;
  hardDeleteAllowed: boolean;
};

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function ProductDangerZone({ productId, hardDeleteAllowed }: Props) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleHardDelete = async () => {
    setError(null);
    if (!hardDeleteAllowed) {
      setError("Hard delete is not enabled for your account.");
      return;
    }
    if (confirmation !== "DELETE") {
      setError("Type DELETE to confirm.");
      return;
    }

    setLoading(true);
    try {
      const csrf = getCsrf();
      const response = await fetch(`/api/admin/products/${productId}?hard=true`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf ?? "",
        },
        body: JSON.stringify({ confirmation }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
      <p className="text-sm text-red-600">
        Hard delete permanently removes this product, media, and related comments. This cannot be undone.
      </p>
      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
        <input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Type DELETE"
          className="rounded border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleHardDelete}
          disabled={loading}
          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Deleting..." : "Hard delete"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
