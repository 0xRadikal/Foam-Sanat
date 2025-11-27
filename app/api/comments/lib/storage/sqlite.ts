import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { applySqliteMigrations } from './migrations';
import type { CommentStorage, StorageHealth } from './types';
import type { CommentStatus, PublicComment, PublicCommentReply, StoredComment, StoredCommentReply } from '../types';
import { emitMetric } from '../../lib/logging';

export class SqliteCommentStorage implements CommentStorage {
  backend: CommentStorage['backend'] = 'sqlite';
  private db: Database.Database | null = null;
  private prepared: {
    selectApprovedComments?: Database.Statement;
    selectCommentById?: Database.Statement;
    selectApprovedReplies?: Database.Statement;
    duplicateCommentCheck?: Database.Statement;
    commentExistsStmt?: Database.Statement;
    updateCommentStatusStmt?: Database.Statement;
    deleteCommentStmt?: Database.Statement;
    deleteReplyStmt?: Database.Statement;
    insertCommentStmt?: Database.Statement;
    insertReplyStmt?: Database.Statement;
  } = {};
  private initialized = false;
  private lastError: Error | null = null;

  constructor(private readonly connectionString: string) {}

  async initialize(): Promise<void> {
    if (this.initialized && this.db) return;

    const dataDir = path.dirname(this.connectionString);
    const isFileSystemPath = !this.connectionString.includes('://');
    if (isFileSystemPath && !fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    try {
      const instance = new Database(this.connectionString);
      instance.pragma('journal_mode = WAL');
      instance.pragma('foreign_keys = ON');

      applySqliteMigrations(instance);
      this.db = instance;
      this.prepareStatements();
      this.initialized = true;
      this.lastError = null;
      emitMetric('comments.db.sqlite.ready');
    } catch (error) {
      this.lastError = error as Error;
      emitMetric('comments.db.sqlite.failure');
      throw error;
    }
  }

  private prepareStatements(): void {
    if (!this.db) return;
    this.prepared = {
      selectApprovedComments: this.db.prepare(
        `SELECT id, productId, rating, author, email, text, status, createdAt, moderatedAt, moderatedById, moderatedByDisplayName
         FROM comments
         WHERE productId = ? AND status = 'approved'
         ORDER BY datetime(createdAt) DESC`,
      ),
      selectCommentById: this.db.prepare(
        `SELECT id, productId, rating, author, email, text, status, createdAt, moderatedAt, moderatedById, moderatedByDisplayName
         FROM comments
         WHERE id = ?
         LIMIT 1`,
      ),
      selectApprovedReplies: this.db.prepare(
        `SELECT id, commentId, author, text, createdAt, isAdmin, adminId, adminDisplayName, respondedAt, status
         FROM comment_replies
         WHERE commentId = ? AND status = 'approved'
         ORDER BY datetime(createdAt) ASC`,
      ),
      duplicateCommentCheck: this.db.prepare(
        `SELECT 1 FROM comments
         WHERE productId = ? AND lower(email) = lower(?) AND text = ?
         LIMIT 1`,
      ),
      commentExistsStmt: this.db.prepare(`SELECT 1 FROM comments WHERE id = ? LIMIT 1`),
      updateCommentStatusStmt: this.db.prepare(
        `UPDATE comments
         SET status = @status,
             moderatedAt = @moderatedAt,
             moderatedById = @moderatedById,
             moderatedByDisplayName = @moderatedByDisplayName
         WHERE id = @id`,
      ),
      deleteCommentStmt: this.db.prepare(`DELETE FROM comments WHERE id = ?`),
      deleteReplyStmt: this.db.prepare(`DELETE FROM comment_replies WHERE id = @replyId AND commentId = @commentId`),
      insertCommentStmt: this.db.prepare(
        `INSERT INTO comments (id, productId, rating, author, email, text, status, createdAt, moderatedAt, moderatedById, moderatedByDisplayName)
         VALUES (@id, @productId, @rating, @author, @email, @text, @status, @createdAt, @moderatedAt, @moderatedById, @moderatedByDisplayName)`,
      ),
      insertReplyStmt: this.db.prepare(
        `INSERT INTO comment_replies (id, commentId, author, text, isAdmin, adminId, adminDisplayName, respondedAt, status, createdAt)
         VALUES (@id, @commentId, @author, @text, @isAdmin, @adminId, @adminDisplayName, @respondedAt, @status, @createdAt)`,
      ),
    };
  }

  isReady(): boolean {
    return this.initialized && Boolean(this.db);
  }

  public getRawDb(): Database.Database | null {
    return this.db;
  }

  getHealth(): StorageHealth {
    return {
      backend: 'sqlite',
      ready: this.isReady(),
      errorCode: this.lastError ? (this.lastError as NodeJS.ErrnoException).code ?? 'SQLITE_ERROR' : null,
    };
  }

  async getApprovedComments(productId: string): Promise<PublicComment[]> {
    const { selectApprovedComments } = this.prepared;
    if (!selectApprovedComments) throw new Error('Database not initialized');
    const rows = selectApprovedComments.all(productId) as StoredComment[];
    return Promise.all(rows.map((comment) => this.toPublicComment(comment)));
  }

  async hasDuplicateComment(productId: string, email: string, text: string): Promise<boolean> {
    if (!this.prepared.duplicateCommentCheck) throw new Error('Database not initialized');
    return Boolean(this.prepared.duplicateCommentCheck.get(productId, email, text));
  }

  async createComment(data: Omit<StoredComment, 'id' | 'createdAt' | 'replies'>): Promise<StoredComment> {
    const createdAt = new Date().toISOString();
    const newComment: StoredComment = {
      ...data,
      id: randomUUID(),
      createdAt,
      replies: [],
    };

    this.prepared.insertCommentStmt?.run({
      id: newComment.id,
      productId: newComment.productId,
      rating: newComment.rating,
      author: newComment.author,
      email: newComment.email,
      text: newComment.text,
      status: newComment.status,
      createdAt: newComment.createdAt,
      moderatedAt: newComment.moderatedAt ?? null,
      moderatedById: newComment.moderatedById ?? null,
      moderatedByDisplayName: newComment.moderatedByDisplayName ?? null,
    });

    return newComment;
  }

  async createReply(
    data: Omit<StoredCommentReply, 'id' | 'createdAt' | 'respondedAt'> & { respondedAt?: string },
  ): Promise<StoredCommentReply> {
    if (!this.db || !this.prepared.insertReplyStmt || !this.prepared.commentExistsStmt) {
      throw new Error('Database not initialized');
    }

    const createdAt = new Date().toISOString();
    const reply: StoredCommentReply = {
      ...data,
      id: randomUUID(),
      createdAt,
      respondedAt: data.respondedAt ?? createdAt,
    };

    const insert = this.db.transaction((row: StoredCommentReply) => {
      if (!this.prepared.commentExistsStmt?.get(row.commentId)) {
        throw new Error('Comment not found');
      }
      this.prepared.insertReplyStmt?.run({
        id: row.id,
        commentId: row.commentId,
        author: row.author,
        text: row.text,
        isAdmin: row.isAdmin ? 1 : 0,
        adminId: row.adminId,
        adminDisplayName: row.adminDisplayName,
        respondedAt: row.respondedAt,
        status: row.status,
        createdAt: row.createdAt,
      });
    });

    insert(reply);
    return reply;
  }

  async updateCommentStatus(
    id: string,
    status: CommentStatus,
    options?: { adminId?: string | undefined; adminDisplayName?: string | undefined; moderatedAt?: string | undefined },
  ): Promise<PublicComment | null> {
    if (!this.prepared.updateCommentStatusStmt || !this.prepared.selectCommentById) {
      throw new Error('Database not initialized');
    }

    const moderatedAt = options?.moderatedAt ?? new Date().toISOString();

    const result = this.prepared.updateCommentStatusStmt.run({
      id,
      status,
      moderatedAt,
      moderatedById: options?.adminId ?? null,
      moderatedByDisplayName: options?.adminDisplayName ?? null,
    });

    if (result.changes === 0) {
      return null;
    }

    const updated = this.prepared.selectCommentById.get(id) as StoredComment | undefined;
    return updated ? this.toPublicComment(updated) : null;
  }

  async deleteComment(id: string): Promise<boolean> {
    if (!this.prepared.deleteCommentStmt) throw new Error('Database not initialized');
    const result = this.prepared.deleteCommentStmt.run(id);
    return result.changes > 0;
  }

  async deleteReply(commentId: string, replyId: string): Promise<boolean> {
    if (!this.prepared.deleteReplyStmt) throw new Error('Database not initialized');
    const result = this.prepared.deleteReplyStmt.run({ commentId, replyId });
    return result.changes > 0;
  }

  async toPublicComment(comment: StoredComment): Promise<PublicComment> {
    const replies = (this.prepared.selectApprovedReplies?.all(comment.id) as StoredCommentReply[] | undefined) ?? [];

    return {
      id: comment.id,
      productId: comment.productId,
      rating: comment.rating,
      author: comment.author,
      text: comment.text,
      createdAt: comment.createdAt,
      status: comment.status,
      moderatedAt: comment.moderatedAt ?? undefined,
      moderatedById: comment.moderatedById ?? undefined,
      moderatedByDisplayName: comment.moderatedByDisplayName ?? undefined,
      replies: replies.map<PublicCommentReply>(
        ({ id, author, text, createdAt, isAdmin, status, adminId, adminDisplayName, respondedAt }) => ({
          id,
          author,
          text,
          createdAt,
          respondedAt: respondedAt ?? createdAt,
          adminId: adminId ?? undefined,
          adminDisplayName: adminDisplayName ?? undefined,
          isAdmin: Boolean(isAdmin),
          status,
        }),
      ),
    };
  }
}
