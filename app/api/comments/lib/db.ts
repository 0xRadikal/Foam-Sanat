import Database, { type Database as DatabaseInstance } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

type Logger = Pick<typeof console, 'error' | 'info' | 'warn'>;

const dataDir = path.join(process.cwd(), 'app/api/comments/data');
const schemaPath = path.join(process.cwd(), 'app/api/comments/schema.sql');

let db: DatabaseInstance | null = null;
let initializationAttempted = false;
let initializationError: Error | null = null;
let initializationErrorCode: string | null = null;

type InitializationMetrics = {
  attempts: number;
  successes: number;
  failures: number;
  lastAttemptAt: Date | null;
  lastSuccessAt: Date | null;
};

const initializationMetrics: InitializationMetrics = {
  attempts: 0,
  successes: 0,
  failures: 0,
  lastAttemptAt: null,
  lastSuccessAt: null,
};

const defaultLogger: Logger = console;

function resolveConnectionString(explicit?: string): string {
  return (
    explicit ||
    process.env.COMMENTS_DATABASE_URL ||
    process.env.DATABASE_URL ||
    path.join(dataDir, 'comments.db')
  );
}

function ensureReplyColumns(db: DatabaseInstance): void {
  const columns = db.prepare("PRAGMA table_info(comment_replies);").all() as { name: string }[];
  const columnNames = new Set(columns.map((column) => column.name));

  const migrations: { name: string; sql: string }[] = [
    { name: 'adminId', sql: "ALTER TABLE comment_replies ADD COLUMN adminId TEXT" },
    { name: 'adminDisplayName', sql: "ALTER TABLE comment_replies ADD COLUMN adminDisplayName TEXT" },
    { name: 'respondedAt', sql: "ALTER TABLE comment_replies ADD COLUMN respondedAt TEXT" },
  ];

  for (const migration of migrations) {
    if (!columnNames.has(migration.name)) {
      db.exec(migration.sql);
    }
  }
}

function isReadOnlyEnvironment(): boolean {
  return Boolean(process.env.VERCEL) && !process.env.COMMENTS_DATABASE_URL && !process.env.DATABASE_URL;
}

function ensureDataDir(connectionString: string): void {
  const isFileSystemPath = !connectionString.includes('://');
  if (isFileSystemPath && !fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function initializeDatabase(
  logger: Logger = defaultLogger,
  options: { connectionString?: string } = {},
): DatabaseInstance | null {
  if (db || initializationAttempted) {
    return db;
  }

  initializationMetrics.attempts += 1;
  initializationMetrics.lastAttemptAt = new Date();
  initializationAttempted = true;

  if (isReadOnlyEnvironment()) {
    initializationError = new Error(
      'Comment database is disabled because the environment is read-only. Provide COMMENTS_DATABASE_URL or DATABASE_URL to enable it.',
    );
    initializationErrorCode = 'COMMENTS_DB_READ_ONLY_ENVIRONMENT';
    logger.warn(initializationError.message);
    logger.warn('Comment database initialization skipped', {
      status: 'skipped',
      code: initializationErrorCode,
      attempts: initializationMetrics.attempts,
    });
    initializationMetrics.failures += 1;
    return null;
  }

  const connectionString = resolveConnectionString(options.connectionString);

  try {
    ensureDataDir(connectionString);

    const instance = new Database(connectionString);
    instance.pragma('journal_mode = WAL');
    instance.pragma('foreign_keys = ON');

    const schema = fs.readFileSync(schemaPath, 'utf8');
    instance.exec(schema);
    ensureReplyColumns(instance);

    db = instance;
    initializationError = null;
    initializationErrorCode = null;
    initializationMetrics.successes += 1;
    initializationMetrics.lastSuccessAt = new Date();
    logger.info('Comment database initialized.', {
      status: 'succeeded',
      attempts: initializationMetrics.attempts,
      successes: initializationMetrics.successes,
    });
  } catch (error) {
    initializationError = error as Error;
    initializationErrorCode = (error as NodeJS.ErrnoException)?.code ?? 'COMMENTS_DB_INIT_FAILED';
    initializationMetrics.failures += 1;
    logger.error('Failed to initialize the comments database.', {
      status: 'failed',
      code: initializationErrorCode,
      attempts: initializationMetrics.attempts,
      failures: initializationMetrics.failures,
      error,
    });
  }

  return db;
}

export function getDb(logger: Logger = defaultLogger): DatabaseInstance {
  const instance = db ?? initializeDatabase(logger);

  if (!instance) {
    throw initializationError ?? new Error('Comment database is unavailable.');
  }

  return instance;
}

export function resetDbForTesting(): void {
  db = null;
  initializationAttempted = false;
  initializationError = null;
  initializationErrorCode = null;
  initializationMetrics.attempts = 0;
  initializationMetrics.failures = 0;
  initializationMetrics.successes = 0;
  initializationMetrics.lastAttemptAt = null;
  initializationMetrics.lastSuccessAt = null;
}

export { db };

export function isCommentsStorageReady(): boolean {
  return Boolean(db ?? initializeDatabase());
}

export function getCommentsStorageError(): Error | null {
  if (db) return null;
  if (!initializationAttempted) {
    initializeDatabase();
  }
  return initializationError;
}

export function getCommentsStorageStatus(): {
  ready: boolean;
  attempted: boolean;
  error: Error | null;
  errorCode: string | null;
  metrics: InitializationMetrics;
} {
  const ready = isCommentsStorageReady();

  return {
    ready,
    attempted: initializationAttempted,
    error: initializationError,
    errorCode: initializationErrorCode,
    metrics: { ...initializationMetrics },
  };
}
