import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import {
  createSignedAdminSession,
  timingSafeEqual,
} from './auth.js';

type MutableEnv = Record<string, string | undefined>;

const TEST_SECRET = 'unit-test-admin-secret-value-1234567890';

function setEnv(key: string, value: string | undefined): void {
  const env = process.env as MutableEnv;
  if (value === undefined) {
    delete env[key];
  } else {
    env[key] = value;
  }
}

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    assert.equal(timingSafeEqual('abc123', 'abc123'), true);
  });

  it('returns false for different equal-length strings', () => {
    assert.equal(timingSafeEqual('abc123', 'abc124'), false);
  });

  it('returns false for different-length strings without throwing', () => {
    assert.equal(timingSafeEqual('short', 'a-much-longer-value'), false);
  });

  it('returns false when one side is empty', () => {
    assert.equal(timingSafeEqual('', 'non-empty'), false);
  });
});

describe('createSignedAdminSession', () => {
  const original = process.env.COMMENTS_ADMIN_TOKEN_SECRET;

  beforeEach(() => {
    setEnv('COMMENTS_ADMIN_TOKEN_SECRET', TEST_SECRET);
  });

  afterEach(() => {
    setEnv('COMMENTS_ADMIN_TOKEN_SECRET', original);
  });

  it('issues a three-segment signed token with matching claims', () => {
    const result = createSignedAdminSession(
      { id: 'admin-1', displayName: 'Admin One' },
      { ttlMinutes: 30 },
    );

    assert.ok(result, 'expected a session to be created');
    assert.equal(result!.token.split('.').length, 3);
    assert.ok(result!.tokenId.length > 0);
    assert.ok(new Date(result!.expiresAt) > new Date(result!.issuedAt));
  });

  it('returns null when no secret is configured', () => {
    setEnv('COMMENTS_ADMIN_TOKEN_SECRET', undefined);
    setEnv('COMMENTS_ADMIN_TOKEN_SECRETS', undefined);

    const result = createSignedAdminSession({ id: 'admin-1', displayName: 'Admin' });
    assert.equal(result, null);
  });
});
