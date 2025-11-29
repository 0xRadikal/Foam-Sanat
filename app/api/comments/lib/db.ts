import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { emitMetric } from '../../lib/logging';
import { PostgresCommentStorage } from './storage/postgres';
import { SqliteCommentStorage } from './storage/sqlite';
import type { CommentStorage } from './storage/types';
import type { StorageBackend } from './storage/types';

type Logger = Pick<typeof console, 'error' | 'info' | 'warn'>;

const dataDir = path.join(process.cwd(), 'app/api/comments/data');

let storage: CommentStorage | null = null;
let initializationPromise: Promise<CommentStorage | null> | null = null;
let initializationAttempted = false;
let initializationError: Error | null = null;
let initializationErrorCode: string | null = null;
let backendUsed: StorageBackend = 'sqlite';
let lastConnectionString: string | null = null;
let sqliteProdWarningLogged = false;

const defaultLogger: Logger = console;

const initializationMetrics = {
  attempts: 0,
  successes: 0,
  failures: 0,
  lastAttemptAt: null as Date | null,
  lastSuccessAt: null as Date | null,
};

function resolveBackend(): StorageBackend {
  const backend = (process.env.COMMENTS_STORAGE_BACKEND || '').toLowerCase();
  return backend === 'postgres' ? 'postgres' : 'sqlite';
}

function resolveConnectionString(backend: StorageBackend, explicit?: string): string {
  if (explicit) return explicit;

  const envUrl = process.env.COMMENTS_DATABASE_URL || process.env.DATABASE_URL;
  if (envUrl) return envUrl;

  if (backend === 'postgres') {
    throw new Error('COMMENTS_DATABASE_URL or DATABASE_URL is required for postgres storage.');
  }

  return path.join(dataDir, 'comments.db');
}

async function initializeStorage(logger: Logger = defaultLogger, options: { connectionString?: string } = {}) {
  if (storage) return storage;
  if (initializationPromise) return initializationPromise;

  initializationAttempted = true;
  initializationMetrics.attempts += 1;
  initializationMetrics.lastAttemptAt = new Date();

  backendUsed = resolveBackend();
  const connectionString = resolveConnectionString(backendUsed, options.connectionString);
  const allowDirCreation = backendUsed === 'sqlite' && connectionString === path.join(dataDir, 'comments.db');
  lastConnectionString = connectionString;
  const adapter =
    backendUsed === 'postgres'
      ? new PostgresCommentStorage(connectionString)
      : new SqliteCommentStorage(connectionString, { allowDirCreation });

  initializationPromise = adapter
    .initialize()
    .then(() => {
      storage = adapter;
      initializationError = null;
      initializationErrorCode = null;
      initializationMetrics.successes += 1;
      initializationMetrics.lastSuccessAt = new Date();
      if (
        backendUsed === 'sqlite' &&
        process.env.NODE_ENV === 'production' &&
        !sqliteProdWarningLogged
      ) {
        logger.warn('comments.db.sqlite.production_environment', {
          message: 'SQLite is not recommended for high-concurrency production workloads.',
        });
        sqliteProdWarningLogged = true;
      }
      logger.info('Comment storage initialized.', { backend: backendUsed });
      return storage;
    })
    .catch((error: NodeJS.ErrnoException) => {
      initializationError = error;
      initializationErrorCode = error.code ?? 'COMMENTS_DB_INIT_FAILED';
      initializationMetrics.failures += 1;
      emitMetric('comments.db.init.failure', {
        tags: { code: initializationErrorCode, backend: backendUsed },
      });
      logger.error('Failed to initialize the comments storage.', {
        backend: backendUsed,
        code: initializationErrorCode,
        attempts: initializationMetrics.attempts,
        failures: initializationMetrics.failures,
        error,
      });
      return null;
    })
    .finally(() => {
      initializationPromise = null;
    });

  return initializationPromise;
}

function initializeStorageSync(logger: Logger = defaultLogger, options: { connectionString?: string } = {}): CommentStorage | null {
  if (storage) return storage;
  if (initializationPromise) return null;

  initializationAttempted = true;
  initializationMetrics.attempts += 1;
  initializationMetrics.lastAttemptAt = new Date();

  backendUsed = resolveBackend();
  const connectionString = resolveConnectionString(backendUsed, options.connectionString);
  const allowDirCreation = backendUsed === 'sqlite' && connectionString === path.join(dataDir, 'comments.db');
  lastConnectionString = connectionString;

  if (backendUsed !== 'sqlite') {
    void initializeStorage(logger, options);
    return null;
  }

  const adapter = new SqliteCommentStorage(connectionString, { allowDirCreation });

  try {
    adapter.initializeSync();
    storage = adapter;
    initializationError = null;
    initializationErrorCode = null;
    initializationMetrics.successes += 1;
    initializationMetrics.lastSuccessAt = new Date();
    if (
      backendUsed === 'sqlite' &&
      process.env.NODE_ENV === 'production' &&
      !sqliteProdWarningLogged
    ) {
      logger.warn('comments.db.sqlite.production_environment', {
        message: 'SQLite is not recommended for high-concurrency production workloads.',
      });
      sqliteProdWarningLogged = true;
    }
    logger.info('Comment storage initialized.', { backend: backendUsed });
    return storage;
  } catch (error) {
    initializationError = error as Error;
    initializationErrorCode = (error as NodeJS.ErrnoException).code ?? 'COMMENTS_DB_INIT_FAILED';
    initializationMetrics.failures += 1;
    emitMetric('comments.db.init.failure', {
      tags: { code: initializationErrorCode, backend: backendUsed },
    });
    logger.error('Failed to initialize the comments storage.', {
      backend: backendUsed,
      code: initializationErrorCode,
      attempts: initializationMetrics.attempts,
      failures: initializationMetrics.failures,
      error,
    });
    return null;
  }
}

export async function getCommentStorage(logger: Logger = defaultLogger): Promise<CommentStorage> {
  const instance = storage ?? (await initializeStorage(logger));
  if (!instance) {
    throw initializationError ?? new Error('Comment storage is unavailable.');
  }
  return instance;
}

export async function resetDbForTesting(): Promise<void> {
  if (lastConnectionString && !lastConnectionString.startsWith(dataDir)) {
    try {
      fs.rmSync(path.dirname(lastConnectionString), { recursive: true, force: true });
    } catch (error) {
      defaultLogger.warn('comments.db.test_cleanup_failed', { error });
    }
  }
  lastConnectionString = null;
  storage = null;
  initializationAttempted = false;
  initializationError = null;
  initializationErrorCode = null;
  initializationMetrics.attempts = 0;
  initializationMetrics.failures = 0;
  initializationMetrics.successes = 0;
  initializationMetrics.lastAttemptAt = null;
  initializationMetrics.lastSuccessAt = null;
}

export async function isCommentsStorageReady(): Promise<boolean> {
  if (storage?.isReady()) return true;
  const instance = await initializeStorage();
  return Boolean(instance?.isReady());
}

export async function getCommentsStorageError(): Promise<Error | null> {
  if (await isCommentsStorageReady()) return null;
  return initializationError;
}

export async function getCommentsStorageStatus(): Promise<{
  ready: boolean;
  attempted: boolean;
  error: Error | null;
  errorCode: string | null;
  backend: StorageBackend;
  metrics: typeof initializationMetrics;
  health: ReturnType<CommentStorage['getHealth']> | null;
}> {
  const ready = await isCommentsStorageReady();
  const health = storage?.getHealth() ?? null;

  return {
    ready,
    attempted: initializationAttempted,
    error: initializationError,
    errorCode: initializationErrorCode,
    backend: backendUsed,
    metrics: { ...initializationMetrics },
    health,
  };
}

export function initializeDatabase(
  logger: Logger = defaultLogger,
  options: { connectionString?: string } = {},
): CommentStorage | null {
  const hasExplicit = Boolean(options.connectionString || process.env.COMMENTS_DATABASE_URL || process.env.DATABASE_URL);

  if (process.env.VERCEL === '1' && !hasExplicit) {
    const error = new Error(
      'Comments storage disabled: read-only environment without persistent database configuration.',
    );
    initializationError = error;
    initializationErrorCode = 'COMMENTS_DB_READ_ONLY_ENVIRONMENT';
    logger.warn('comments.db.read_only_environment');
    return null;
  }

  const syncInstance = initializeStorageSync(logger, options);
  if (syncInstance) {
    return syncInstance;
  }

  void initializeStorage(logger, options);
  return null;
}

export function getDb(logger: Logger = defaultLogger): Database.Database {
  if (!storage) {
    throw initializationError ?? new Error('Database not initialized');
  }

  if (storage.backend === 'sqlite' && 'getRawDb' in storage) {
    const rawDb = (storage as unknown as { getRawDb: () => Database.Database | null }).getRawDb();
    if (rawDb) {
      return rawDb;
    }
  }

  logger.error('comments.db.raw_unavailable', { backend: storage.backend });
  throw initializationError ?? new Error('Underlying sqlite Database is not available.');
}
