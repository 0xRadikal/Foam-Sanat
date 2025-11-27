import { randomUUID } from 'crypto';

import { getDb } from './db';
import type { AuthenticatedAdmin } from './auth';

export type ModerationAction = 'update-status' | 'delete-comment' | 'reply-comment';

export type ModerationAuditLog = {
  id: string;
  action: ModerationAction;
  commentId?: string;
  replyId?: string;
  adminId?: string;
  adminDisplayName?: string;
  tokenId?: string;
  tokenSource?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type PreparedStatements = {
  insertAuditLog: ReturnType<ReturnType<typeof getDb>['prepare']>;
  selectAuditLogs: ReturnType<ReturnType<typeof getDb>['prepare']>;
};

let preparedStatements: PreparedStatements | null = null;

function getPreparedStatements(): PreparedStatements {
  if (preparedStatements) {
    return preparedStatements;
  }

  const db = getDb();

  preparedStatements = {
    insertAuditLog: db.prepare(`
      INSERT INTO comment_audit_logs (
        id, action, commentId, replyId, adminId, adminDisplayName, tokenId, tokenSource, metadata, createdAt
      ) VALUES (
        @id, @action, @commentId, @replyId, @adminId, @adminDisplayName, @tokenId, @tokenSource, @metadata, @createdAt
      )
    `),
    selectAuditLogs: db.prepare(`
      SELECT id, action, commentId, replyId, adminId, adminDisplayName, tokenId, tokenSource, metadata, createdAt
      FROM comment_audit_logs
      ORDER BY datetime(createdAt) DESC
      LIMIT @limit
    `),
  };

  return preparedStatements;
}

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (typeof raw !== 'string') return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fallback to empty metadata when parsing fails
  }

  return {};
}

export function recordModerationAudit(
  action: ModerationAction,
  admin: AuthenticatedAdmin,
  metadata: Record<string, unknown>,
): ModerationAuditLog {
  const createdAt = new Date().toISOString();
  const entry: ModerationAuditLog = {
    id: randomUUID(),
    action,
    commentId: (metadata.commentId as string | undefined) ?? undefined,
    replyId: (metadata.replyId as string | undefined) ?? undefined,
    adminId: admin.id,
    adminDisplayName: admin.displayName,
    tokenId: admin.tokenId,
    tokenSource: admin.source,
    metadata,
    createdAt,
  };

  const { insertAuditLog } = getPreparedStatements();
  insertAuditLog.run({
    ...entry,
    metadata: JSON.stringify(entry.metadata),
  });

  return entry;
}

export function listModerationAudits(limit = 100): ModerationAuditLog[] {
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.floor(limit), 1), 500) : 100;
  const { selectAuditLogs } = getPreparedStatements();

  const rows = selectAuditLogs.all({ limit: safeLimit }) as unknown[];
  return rows.map((row) => {
    const record = row as Record<string, unknown>;
    return {
      id: String(record.id),
      action: record.action as ModerationAction,
      commentId: record.commentId ? String(record.commentId) : undefined,
      replyId: record.replyId ? String(record.replyId) : undefined,
      adminId: record.adminId ? String(record.adminId) : undefined,
      adminDisplayName: record.adminDisplayName ? String(record.adminDisplayName) : undefined,
      tokenId: record.tokenId ? String(record.tokenId) : undefined,
      tokenSource: record.tokenSource ? String(record.tokenSource) : undefined,
      metadata: parseMetadata(record.metadata),
      createdAt: String(record.createdAt),
    } satisfies ModerationAuditLog;
  });
}
