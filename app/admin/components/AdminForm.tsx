"use client";

import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getCsrf(): string | null {
  const match = document.cookie.match(/(?:^|; )admin-csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function AdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.ADMIN);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const csrf = getCsrf();
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf ?? "",
      },
      body: JSON.stringify({ email, name, password, role }),
    });

    if (!res.ok) {
      const message = await res.text();
      setError(message || "Unable to create admin.");
      setSaving(false);
      return;
    }

    setEmail("");
    setName("");
    setPassword("");
    setRole(Role.ADMIN);
    router.refresh();
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" className="rounded border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Role
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded border px-3 py-2 text-sm">
            {Object.values(Role).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Invite admin"}
      </button>
    </form>
  );
}
