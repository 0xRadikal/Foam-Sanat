export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs?: number;
  retryAfterHeader?: HeadersInit;
}

/**
 * Minimal in-memory rate limiter keyed by IP address.
 * Replace with a distributed store (Redis, Upstash, etc.) before deploying to multi-instance production.
 */
const buckets = new Map<string, { count: number; expiresAt: number }>();

export function rateLimitByIp(ip: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.expiresAt <= now) {
    buckets.set(ip, { count: 1, expiresAt: now + options.windowMs });
    return { ok: true };
  }

  if (bucket.count < options.limit) {
    bucket.count += 1;
    return { ok: true };
  }

  const retryAfterMs = bucket.expiresAt - now;
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

  return {
    ok: false,
    retryAfterMs,
    retryAfterHeader: { 'Retry-After': String(retryAfterSeconds) },
  };
}
