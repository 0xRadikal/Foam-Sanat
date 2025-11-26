import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';

import { getClientIdentifier } from './auth.js';
import { checkRateLimitOrSpam } from './validation.js';
import type { RateLimitStore } from './rateLimit.js';
import { configureRateLimitStore } from './rateLimit.js';

class InMemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; expiresAt: number }>();

  async increment(key: string, windowMs: number): Promise<{ count: number; expiresAt: number }> {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.expiresAt <= now) {
      const entry = { count: 1, expiresAt: now + windowMs };
      this.buckets.set(key, entry);
      return entry;
    }

    existing.count += 1;
    this.buckets.set(key, existing);
    return existing;
  }
}

function createRequest(
  ip: string,
  headers: Record<string, string | undefined> = {},
): Request & { ip: string } {
  const filteredHeaders = Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = value;
    }
    return acc;
  }, {});

  return {
    headers: new Headers(filteredHeaders),
    ip,
  } as unknown as Request & { ip: string };
}

describe('comment rate limiting', () => {
  const originalEnv = process.env.TRUSTED_PROXY_IPS;

  before(() => {
    process.env.TRUSTED_PROXY_IPS = '10.0.0.1';
  });

  after(() => {
    if (originalEnv !== undefined) {
      process.env.TRUSTED_PROXY_IPS = originalEnv;
    } else {
      delete process.env.TRUSTED_PROXY_IPS;
    }
  });

  beforeEach(() => {
    configureRateLimitStore(new InMemoryRateLimitStore());
  });

  afterEach(() => {
    configureRateLimitStore(null);
  });

  it('enforces submission limits and surfaces retry information', async () => {
    const request = createRequest('203.0.113.10');
    const comment = 'This is a sufficiently long comment to pass validation checks.';

    for (let i = 0; i < 5; i += 1) {
      const result = await checkRateLimitOrSpam(request as never, comment);
      assert.equal(result, null);
    }

    const limited = await checkRateLimitOrSpam(request as never, comment);
    assert.ok(limited);
    assert.equal(limited?.error.includes('Too many comments'), true);
    assert.equal(typeof limited?.retryAfterSeconds, 'number');
  });

  it('falls back to in-memory rate limiting when primary store fails', async () => {
    class FailingStore implements RateLimitStore {
      async increment(): Promise<{ count: number; expiresAt: number }> {
        throw new Error('Simulated store failure');
      }
    }

    configureRateLimitStore(new FailingStore());

    const request = createRequest('203.0.113.11');
    const comment = 'This is another sufficiently long comment to pass validation rules.';

    const result = await checkRateLimitOrSpam(request as never, comment);
    assert.equal(result, null);
  });

  it('sticks to the in-memory fallback after a Redis failure', async () => {
    class FlakyStore implements RateLimitStore {
      async increment(): Promise<{ count: number; expiresAt: number }> {
        throw new Error('Redis connection failed');
      }
    }

    configureRateLimitStore(new FlakyStore());

    const request = createRequest('203.0.113.12');
    const comment = 'This is yet another sufficiently long comment to pass validation rules.';

    // First call triggers the fallback to the in-memory limiter.
    const firstResult = await checkRateLimitOrSpam(request as never, comment);
    assert.equal(firstResult, null);

    // Additional calls should keep using the in-memory limiter and eventually hit the limit.
    for (let i = 0; i < 5; i += 1) {
      await checkRateLimitOrSpam(request as never, comment);
    }

    const limited = await checkRateLimitOrSpam(request as never, comment);
    assert.ok(limited);
    assert.equal(limited?.error.includes('Too many comments'), true);
    assert.equal(typeof limited?.retryAfterSeconds, 'number');
  });

  it('ignores spoofed forwarded-for headers from untrusted sources', () => {
    const request = createRequest('198.51.100.25', {
      'x-forwarded-for': '203.0.113.9',
      'x-real-ip': '198.51.100.25',
    });

    assert.equal(getClientIdentifier(request as never), '198.51.100.25');
  });

  it('honors forwarded-for headers from trusted proxies', () => {
    const request = createRequest('10.0.0.1', {
      'x-forwarded-for': '203.0.113.5, 10.0.0.1',
      'x-real-ip': '10.0.0.1',
    });

    assert.equal(getClientIdentifier(request as never), '203.0.113.5');
  });
});
