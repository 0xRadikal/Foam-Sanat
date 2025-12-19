type RateLimitEntry = { hits: number[] };

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60_000;
const MAX_HITS = 30;

export function enforceRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = store.get(key) ?? { hits: [] };
  entry.hits = entry.hits.filter((timestamp) => now - timestamp < WINDOW_MS);
  if (entry.hits.length >= MAX_HITS) {
    store.set(key, entry);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((WINDOW_MS - (now - entry.hits[0])) / 1000),
    };
  }
  entry.hits.push(now);
  store.set(key, entry);
  return { allowed: true };
}
