type Entry = {
  attempts: number;
  expiresAt: number;
};

const store = new Map<string, Entry>();

export function consumeRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.expiresAt < now) {
    store.set(key, { attempts: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.attempts >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.attempts += 1;
  return { allowed: true, remaining: limit - existing.attempts };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}
