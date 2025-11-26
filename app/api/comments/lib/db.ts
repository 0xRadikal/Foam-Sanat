import Database, { type Database as DatabaseInstance } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

type Logger = Pick<typeof console, 'error' | 'info' | 'warn'>;

const dataDir = path.join(process.cwd(), 'app/api/comments/data');
const schemaPath = path.join(process.cwd(), 'app/api/comments/schema.sql');

let db: DatabaseInstance | null = null;
let initializationAttempted = false;
let initializationError: Error | null = null;

const defaultLogger: Logger = console;

function resolveConnectionString(explicit?: string): string {
  return (
    explicit ||
    process.env.COMMENTS_DATABASE_URL ||
    process.env.DATABASE_URL ||
    path.join(dataDir, 'comments.db')
  );
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

  initializationAttempted = true;

  if (isReadOnlyEnvironment()) {
    initializationError = new Error(
      'Comment database is disabled because the environment is read-only. Provide COMMENTS_DATABASE_URL or DATABASE_URL to enable it.',
    );
    logger.warn(initializationError.message);
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

    db = instance;
    logger.info('Comment database initialized.');
  } catch (error) {
    initializationError = error as Error;
    logger.error('Failed to initialize the comments database.', error);
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
