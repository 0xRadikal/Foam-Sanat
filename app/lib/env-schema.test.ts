import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { validateEnvSchema } from './env-schema';

function setNodeEnv(value: string): void {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe('validateEnvSchema', () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it('accepts a valid set of environment values', () => {
    setNodeEnv('production');
    const env = {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'https://foamsanat.com',
      CONTACT_EMAIL: 'info@foamsanat.com',
      COMMENTS_STORAGE_BACKEND: 'sqlite',
      COMMENTS_ADMIN_TOKEN_SECRET: 'a-strong-random-secret-value-1234',
      COMMENTS_ADMIN_TOKEN_TTL_MINUTES: '120',
      RESEND_API_KEY: 're_realkey_abcdefgh',
      DATABASE_URL: 'file:./data/comments.db',
    } as unknown as NodeJS.ProcessEnv;

    assert.doesNotThrow(() => validateEnvSchema(env));
  });

  it('throws in production on an invalid site URL', () => {
    const env = {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'not-a-url',
    } as unknown as NodeJS.ProcessEnv;

    assert.throws(() => validateEnvSchema(env), /NEXT_PUBLIC_SITE_URL/);
  });

  it('throws in production on an invalid storage backend enum', () => {
    const env = {
      NODE_ENV: 'production',
      COMMENTS_STORAGE_BACKEND: 'mysql',
    } as unknown as NodeJS.ProcessEnv;

    assert.throws(() => validateEnvSchema(env), /COMMENTS_STORAGE_BACKEND/);
  });

  it('throws in production on a placeholder admin secret', () => {
    const env = {
      NODE_ENV: 'production',
      COMMENTS_ADMIN_TOKEN_SECRET: 'replace-with-strong-random-secret',
    } as unknown as NodeJS.ProcessEnv;

    assert.throws(() => validateEnvSchema(env), /COMMENTS_ADMIN_TOKEN_SECRET/);
  });

  it('does not throw in development on invalid values (warns instead)', () => {
    const env = {
      NODE_ENV: 'development',
      NEXT_PUBLIC_SITE_URL: 'not-a-url',
    } as unknown as NodeJS.ProcessEnv;

    assert.doesNotThrow(() => validateEnvSchema(env));
  });

  it('ignores unset optional variables', () => {
    const env = {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'https://foamsanat.com',
    } as unknown as NodeJS.ProcessEnv;

    assert.doesNotThrow(() => validateEnvSchema(env));
  });
});
