import {
  createClient,
  type RedisClientType,
  type RedisDefaultModules,
  type RedisFunctions,
  type RedisScripts,
} from 'redis';

export type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds?: number;
};

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; expiresAt: number }>;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS = 5;

let rateLimitStore: RateLimitStore | null = null;

class MemoryRateLimitStore implements RateLimitStore {
  private hits: Map<string, { count: number; expiresAt: number }> = new Map();

  async increment(key: string, windowMs: number): Promise<{ count: number; expiresAt: number }> {
    const existing = this.hits.get(key);
    const now = Date.now();
    const expiresAt = existing?.expiresAt && existing.expiresAt > now ? existing.expiresAt : now + windowMs;
    const count = existing && existing.expiresAt > now ? existing.count + 1 : 1;

    this.hits.set(key, { count, expiresAt });
    return { count, expiresAt };
  }
}

class RedisRateLimitStore implements RateLimitStore {
  private clientPromise: Promise<RedisClientType<RedisDefaultModules, RedisFunctions, RedisScripts>>;

  constructor() {
    const url = process.env.RATE_LIMIT_REDIS_URL ?? process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.clientPromise = createClient({ url })
      .on('error', (error) => console.error('Redis client error', error))
      .connect();
  }

  private async getClient(): Promise<RedisClientType<RedisDefaultModules, RedisFunctions, RedisScripts>> {
    return this.clientPromise;
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; expiresAt: number }> {
    const client = await this.getClient();
    const namespacedKey = `comments:rate-limit:${key}`;
    const count = await client.incr(namespacedKey);
    let ttlMs = await client.pTTL(namespacedKey);

    if (ttlMs < 0) {
      await client.pExpire(namespacedKey, windowMs);
      ttlMs = windowMs;
    }

    return { count, expiresAt: Date.now() + ttlMs };
  }
}

function getStore(): RateLimitStore {
  if (rateLimitStore) {
    return rateLimitStore;
  }

  const shouldUseRedis = Boolean(process.env.RATE_LIMIT_REDIS_URL || process.env.REDIS_URL);

  if (shouldUseRedis) {
    try {
      rateLimitStore = new RedisRateLimitStore();
      return rateLimitStore;
    } catch (error) {
      console.warn('Falling back to in-memory rate limiter because Redis is unavailable.', error);
    }
  }

  rateLimitStore = new MemoryRateLimitStore();
  return rateLimitStore;
}

export function configureRateLimitStore(store: RateLimitStore | null) {
  rateLimitStore = store;
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const store = getStore();
  const { count, expiresAt } = await store.increment(identifier, WINDOW_MS);
  const limited = count > MAX_SUBMISSIONS;

  if (!limited) {
    return { limited: false };
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
  return { limited: true, retryAfterSeconds };
}
