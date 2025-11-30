import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { applyPostgresMigrations } from './migrations';
import type { CommentStorage, StorageHealth } from './types';
import type { CommentStatus, PublicComment, PublicCommentReply, StoredComment, StoredCommentReply } from '../types';
import { emitMetric } from '../../lib/logging';

export class PostgresCommentStorage implements CommentStorage {
  backend: CommentStorage['backend'] = 'postgres';
  private pool: Pool;
  private initialized = false;
  private lastError: Error | null = null;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.pool.on('error', (error) => {
      this.lastError = error;
      emitMetric('comments.db.postgres.error');
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await applyPostgresMigrations(this.pool);
      this.initialized = true;
      this.lastError = null;
      emitMetric('comments.db.postgres.ready');
    } catch (error) {
      this.lastError = error as Error;
      emitMetric('comments.db.postgres.failure');
      throw error;
    }
  }

  isReady(): boolean {
    return this.initialized;
  }

  getHealth(): StorageHealth {
    return {
      backend: 'postgres',
      ready: this.isReady(),
      errorCode: this.lastError ? 'POSTGRES_ERROR' : null,
      connection: {
        active: this.pool.totalCount,
        idle: this.pool.idleCount,
        waiting: this.pool.waitingCount,
      },
    };
  }

  async getApprovedComments(productId: string): Promise<PublicComment[]> {
    const commentsResult = await this.pool.query<StoredComment>(
      `SELECT id, productId, rating, author, email, text, status, to_char(createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt", moderatedAt, moderatedById, moderatedByDisplayName
       FROM comments
       WHERE productId = $1 AND status = 'approved'
       ORDER BY createdAt DESC`,
      [productId],
    );

    if (commentsResult.rowCount === 0) return [];

    const commentIds = commentsResult.rows.map((row) => row.id);
    const repliesResult = await this.pool.query<StoredCommentReply>(
      `SELECT id, commentId, author, text, to_char(createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt", isAdmin, adminId, adminDisplayName, respondedAt, status
       FROM comment_replies
       WHERE commentId = ANY($1) AND status = 'approved'
       ORDER BY createdAt ASC`,
      [commentIds],
    );

    const repliesByComment = new Map<string, StoredCommentReply[]>();
    for (const reply of repliesResult.rows) {
      const list = repliesByComment.get(reply.commentId) ?? [];
      list.push(reply);
      repliesByComment.set(reply.commentId, list);
    }

    return commentsResult.rows.map((row) => this.mapToPublicComment(row, repliesByComment.get(row.id) ?? []));
  }

  async hasDuplicateComment(productId: string, email: string, text: string): Promise<boolean> {
    const result = await this.pool.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM comments WHERE productId = $1 AND lower(email) = lower($2) AND text = $3) as exists`,
      [productId, email, text],
    );
    return Boolean(result.rows[0]?.exists);
  }

  async createComment(data: Omit<StoredComment, 'id' | 'createdAt' | 'replies'>): Promise<StoredComment> {
    const createdAt = new Date().toISOString();
    const newComment: StoredComment = {
      ...data,
      id: randomUUID(),
      createdAt,
      replies: [],
    };

    try {
      await this.pool.query(
        `INSERT INTO comments (id, productId, rating, author, email, text, status, createdAt, moderatedAt, moderatedById, moderatedByDisplayName)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newComment.id,
          newComment.productId,
          newComment.rating,
          newComment.author,
          newComment.email,
          newComment.text,
          newComment.status,
          newComment.createdAt,
          newComment.moderatedAt ?? null,
          newComment.moderatedById ?? null,
          newComment.moderatedByDisplayName ?? null,
        ],
      );
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new Error('DUPLICATE_COMMENT');
      }

      throw error;
    }

    return newComment;
  }

  async createReply(
    data: Omit<StoredCommentReply, 'id' | 'createdAt' | 'respondedAt'> & { respondedAt?: string },
  ): Promise<StoredCommentReply> {
    const createdAt = new Date().toISOString();
    const reply: StoredCommentReply = {
      ...data,
      id: randomUUID(),
      createdAt,
      respondedAt: data.respondedAt ?? createdAt,
    };

    const existsResult = await this.pool.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM comments WHERE id = $1) as exists`,
      [reply.commentId],
    );
    if (!existsResult.rows[0]?.exists) {
      throw new Error('Comment not found');
    }

    await this.pool.query(
      `INSERT INTO comment_replies (id, commentId, author, text, isAdmin, adminId, adminDisplayName, respondedAt, status, createdAt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        reply.id,
        reply.commentId,
        reply.author,
        reply.text,
        reply.isAdmin ?? false,
        reply.adminId ?? null,
        reply.adminDisplayName ?? null,
        reply.respondedAt ?? null,
        reply.status,
        reply.createdAt,
      ],
    );

    return reply;
  }

  async updateCommentStatus(
    id: string,
    status: CommentStatus,
    options?: { adminId?: string; adminDisplayName?: string; moderatedAt?: string },
  ): Promise<PublicComment | null> {
    const moderatedAt = options?.moderatedAt ?? new Date().toISOString();
    const updateResult = await this.pool.query<{ id: string }>(
      `UPDATE comments
       SET status = $1,
           moderatedAt = $2,
           moderatedById = $3,
           moderatedByDisplayName = $4
       WHERE id = $5
       RETURNING id`,
      [status, moderatedAt, options?.adminId ?? null, options?.adminDisplayName ?? null, id],
    );

    if (updateResult.rowCount === 0) {
      return null;
    }

    return this.findAndMapComment(id);
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM comments WHERE id = $1`, [id]);
    return result.rowCount > 0;
  }

  async deleteReply(commentId: string, replyId: string): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM comment_replies WHERE id = $1 AND commentId = $2`, [replyId, commentId]);
    return result.rowCount > 0;
  }

  async toPublicComment(comment: StoredComment): Promise<PublicComment> {
    const repliesResult = await this.pool.query<StoredCommentReply>(
      `SELECT id, commentId, author, text, to_char(createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt", isAdmin, adminId, adminDisplayName, respondedAt, status
       FROM comment_replies
       WHERE commentId = $1 AND status = 'approved'
       ORDER BY createdAt ASC`,
      [comment.id],
    );

    return this.mapToPublicComment(comment, repliesResult.rows);
  }

  private mapToPublicComment(comment: StoredComment, replies: StoredCommentReply[]): PublicComment {
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
      replies: replies.map<PublicCommentReply>(({ id, author, text, createdAt, isAdmin, status, adminId, adminDisplayName, respondedAt }) => ({
        id,
        author,
        text,
        createdAt,
        respondedAt: respondedAt ?? createdAt,
        adminId: adminId ?? undefined,
        adminDisplayName: adminDisplayName ?? undefined,
        isAdmin: Boolean(isAdmin),
        status,
      })),
    };
  }

  private async findAndMapComment(id: string): Promise<PublicComment | null> {
    const commentResult = await this.pool.query<StoredComment>(
      `SELECT id, productId, rating, author, email, text, status, to_char(createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt", moderatedAt, moderatedById, moderatedByDisplayName
       FROM comments
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    const comment = commentResult.rows[0];
    if (!comment) return null;
    return this.toPublicComment(comment);
  }
}
