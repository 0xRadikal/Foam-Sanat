import Database from 'better-sqlite3';
import type { Pool } from 'pg';
import type { StorageBackend } from './types';

export type Migration = {
  id: string;
  sql: string;
};

const sqliteMigrations: Migration[] = [
  {
    id: '001_baseline',
    sql: `
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        productId TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        author TEXT NOT NULL,
        email TEXT NOT NULL,
        text TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
        createdAt TEXT NOT NULL,
        moderatedAt TEXT,
        moderatedById TEXT,
        moderatedByDisplayName TEXT
      );

      CREATE TABLE IF NOT EXISTS comment_replies (
        id TEXT PRIMARY KEY,
        commentId TEXT NOT NULL,
        author TEXT NOT NULL,
        text TEXT NOT NULL,
        isAdmin INTEGER DEFAULT 0,
        adminId TEXT,
        adminDisplayName TEXT,
        respondedAt TEXT,
        status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
        createdAt TEXT NOT NULL,
        FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS comment_audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        commentId TEXT,
        replyId TEXT,
        adminId TEXT,
        adminDisplayName TEXT,
        tokenId TEXT,
        tokenSource TEXT,
        metadata TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_product_status ON comments (productId, status);
      CREATE INDEX IF NOT EXISTS idx_replies_comment ON comment_replies (commentId);
      CREATE INDEX IF NOT EXISTS idx_comments_moderated_at ON comments (moderatedAt);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON comment_audit_logs (createdAt);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_comment ON comment_audit_logs (commentId);
    `,
  },
  {
    id: '002_unique_comment_dedupe',
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_comment
      ON comments (productId, lower(email), text);
    `,
  },
];

const postgresMigrations: Migration[] = [
  {
    id: '001_baseline',
    sql: `
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        productId TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        author TEXT NOT NULL,
        email TEXT NOT NULL,
        text TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
        createdAt TIMESTAMPTZ NOT NULL,
        moderatedAt TIMESTAMPTZ,
        moderatedById TEXT,
        moderatedByDisplayName TEXT
      );

      CREATE TABLE IF NOT EXISTS comment_replies (
        id TEXT PRIMARY KEY,
        commentId TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        author TEXT NOT NULL,
        text TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT FALSE,
        adminId TEXT,
        adminDisplayName TEXT,
        respondedAt TIMESTAMPTZ,
        status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
        createdAt TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comment_audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        commentId TEXT,
        replyId TEXT,
        adminId TEXT,
        adminDisplayName TEXT,
        tokenId TEXT,
        tokenSource TEXT,
        metadata TEXT,
        createdAt TIMESTAMPTZ NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_product_status ON comments (productId, status);
      CREATE INDEX IF NOT EXISTS idx_replies_comment ON comment_replies (commentId);
      CREATE INDEX IF NOT EXISTS idx_comments_moderated_at ON comments (moderatedAt);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON comment_audit_logs (createdAt);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_comment ON comment_audit_logs (commentId);
    `,
  },
  {
    id: '002_unique_comment_dedupe',
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_comment
      ON comments (productId, lower(email), text);
    `,
  },
];

function getMigrations(backend: StorageBackend): Migration[] {
  return backend === 'postgres' ? postgresMigrations : sqliteMigrations;
}

export function applySqliteMigrations(db: Database.Database): void {
  db.exec(
    `CREATE TABLE IF NOT EXISTS comment_migrations (id TEXT PRIMARY KEY, appliedAt TEXT NOT NULL)`,
  );
  const appliedRows = db.prepare(`SELECT id FROM comment_migrations`).all() as { id: string }[];
  const applied = new Set(appliedRows.map((row) => row.id));

  for (const migration of getMigrations('sqlite')) {
    if (applied.has(migration.id)) continue;
    db.exec(migration.sql);
    db.prepare(`INSERT INTO comment_migrations (id, appliedAt) VALUES (?, ?)`)
      .run(migration.id, new Date().toISOString());
  }
}

export async function applyPostgresMigrations(pool: Pool): Promise<void> {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS comment_migrations (id TEXT PRIMARY KEY, appliedAt TIMESTAMPTZ NOT NULL)`,
  );
  const appliedResult = await pool.query<{ id: string }>(`SELECT id FROM comment_migrations`);
  const applied = new Set(appliedResult.rows.map((row) => row.id));

  for (const migration of getMigrations('postgres')) {
    if (applied.has(migration.id)) continue;
    await pool.query(migration.sql);
    await pool.query(`INSERT INTO comment_migrations (id, appliedAt) VALUES ($1, NOW())`, [
      migration.id,
    ]);
  }
}
