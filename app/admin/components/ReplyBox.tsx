"use client";

import { useState } from "react";

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function ReplyBox({ inboxId }: { inboxId: string }) {
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const csrf = getCsrf();
    const res = await fetch(`/api/admin/inbox/${inboxId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf ?? "",
      },
      body: JSON.stringify({ body: message, sendEmail }),
    });
    if (!res.ok) {
      const msg = await res.text();
      setError(msg || "Failed to reply.");
      setSaving(false);
      return;
    }
    setMessage("");
    setSendEmail(false);
    setSaving(false);
    window.location.reload();
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded border bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        Reply
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="rounded border px-3 py-2 text-sm"
          rows={4}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
        Send email (if SMTP configured)
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {saving ? "Sending..." : "Send reply"}
      </button>
    </form>
  );
}
