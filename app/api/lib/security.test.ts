import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { getAllowedOrigins, validateRequestOrigin, verifyTurnstileToken } from './security';

const ORIGINAL_ENV = { ...process.env };

// process.env.NODE_ENV is typed as a read-only literal union; set it through
// a plain record view so tests can exercise environment-specific branches.
function setNodeEnv(value: string): void {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

function makeRequest(
  headers: Record<string, string>,
  { method = 'POST', url = 'https://foamsanat.com/api/contact' } = {},
): Request {
  return new Request(url, { method, headers });
}

describe('security allowlist', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('includes preview URLs provided via environment variables', () => {
    process.env.PREVIEW_URL = 'https://preview.example.com';
    process.env.NEXT_PUBLIC_PREVIEW_URL = 'https://public-preview.example.com';

    const allowed = getAllowedOrigins();

    assert(allowed.has('https://preview.example.com'));
    assert(allowed.has('https://public-preview.example.com'));
    assert(allowed.has('http://preview.example.com'));
    assert(allowed.has('http://public-preview.example.com'));
  });

  it('always includes the canonical default site origin', () => {
    const allowed = getAllowedOrigins();
    assert(allowed.has('https://foamsanat.com'));
  });

  it('does not include localhost origins in production', () => {
    setNodeEnv('production');
    const allowed = getAllowedOrigins();
    assert(!allowed.has('http://localhost:3000'));
  });
});

describe('validateRequestOrigin', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.NEXT_PUBLIC_SITE_URL = 'https://foamsanat.com';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('allows a request whose Origin is in the allowlist', () => {
    const req = makeRequest({ origin: 'https://foamsanat.com' });
    assert.equal(validateRequestOrigin(req), null);
  });

  it('rejects a request whose Origin is not in the allowlist', () => {
    const req = makeRequest({ origin: 'https://evil.example.com' });
    const error = validateRequestOrigin(req);
    assert.equal(typeof error, 'string');
  });

  it('rejects a request whose Referer is not in the allowlist', () => {
    const req = makeRequest({ referer: 'https://evil.example.com/path' });
    const error = validateRequestOrigin(req);
    assert.equal(typeof error, 'string');
  });

  it('allows a request with a valid Referer and no Origin', () => {
    const req = makeRequest({ referer: 'https://foamsanat.com/contact' });
    assert.equal(validateRequestOrigin(req), null);
  });

  it('rejects a state-changing request that has neither Origin nor Referer in production (CSRF defense)', () => {
    setNodeEnv('production');
    const req = makeRequest({}, { method: 'POST' });
    const error = validateRequestOrigin(req);
    assert.equal(typeof error, 'string', 'POST without Origin/Referer must be rejected in production');
  });

  it('allows a request without Origin/Referer outside production (developer tooling / tests)', () => {
    setNodeEnv('development');
    const req = makeRequest({}, { method: 'POST' });
    assert.equal(validateRequestOrigin(req), null);
  });

  it('allows safe (non-mutating) methods without Origin/Referer even in production', () => {
    setNodeEnv('production');
    const req = makeRequest({}, { method: 'GET' });
    assert.equal(validateRequestOrigin(req), null);
  });
});

describe('verifyTurnstileToken', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('short-circuits (returns null) in the test environment', async () => {
    setNodeEnv('test');
    const result = await verifyTurnstileToken('anything');
    assert.equal(result, null);
  });

  it('fails closed with a 500 when the secret key is missing in production', async () => {
    setNodeEnv('production');
    delete process.env.TURNSTILE_SECRET_KEY;
    const result = await verifyTurnstileToken('token');
    assert(result);
    assert.equal(result?.status, 500);
  });

  it('requires a token in production when the secret is configured', async () => {
    setNodeEnv('production');
    process.env.TURNSTILE_SECRET_KEY = '1x0000000000000000000000000000000AA';
    const result = await verifyTurnstileToken('');
    assert(result);
    assert.equal(result?.status, 403);
  });
});
