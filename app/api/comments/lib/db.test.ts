import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import path from 'path';

import { getDb, initializeDatabase, resetDbForTesting } from './db.js';

type LogLevel = 'info' | 'warn' | 'error';

function createLogger() {
  const messages: { level: LogLevel; args: unknown[] }[] = [];
  const logger = {
    info: (...args: unknown[]) => {
      messages.push({ level: 'info', args });
    },
    warn: (...args: unknown[]) => {
      messages.push({ level: 'warn', args });
    },
    error: (...args: unknown[]) => {
      messages.push({ level: 'error', args });
    },
  };

  return { logger, messages } as const;
}

describe('comment database initialization', () => {
  const originalEnv = {
    VERCEL: process.env.VERCEL,
    COMMENTS_DATABASE_URL: process.env.COMMENTS_DATABASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  afterEach(() => {
    resetDbForTesting();
    process.env.VERCEL = originalEnv.VERCEL;
    process.env.COMMENTS_DATABASE_URL = originalEnv.COMMENTS_DATABASE_URL;
    process.env.DATABASE_URL = originalEnv.DATABASE_URL;
  });

  it('short-circuits initialization in read-only environments', () => {
    const { logger, messages } = createLogger();
    process.env.VERCEL = '1';
    delete process.env.COMMENTS_DATABASE_URL;
    delete process.env.DATABASE_URL;

    const instance = initializeDatabase(logger);

    assert.equal(instance, null);
    assert.ok(messages.some((entry) => entry.level === 'warn'));
  });

  it('logs and throws when initialization fails', () => {
    const { logger, messages } = createLogger();
    const badConnectionString = path.join('/this/path/does/not/exist', 'comments.db');

    initializeDatabase(logger, { connectionString: badConnectionString });

    assert.ok(messages.some((entry) => entry.level === 'error'));
    assert.throws(() => getDb(logger));
  });
});
