import type Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

import { getDb } from './db';
import type {
  CommentStatus,
  PublicComment,
  PublicCommentReply,
  StoredComment,
  StoredCommentReply,
} from './types';

type CommentRow = Omit<StoredComment, 'replies'>;
type ReplyRow = StoredCommentReply;

type PreparedStatements = {
  db: ReturnType<typeof getDb>;
  selectApprovedComments: Database.Statement;
  selectCommentById: Database.Statement;
  selectApprovedReplies: Database.Statement;
  duplicateCommentCheck: Database.Statement;
  commentExistsStmt: Database.Statement;
  updateCommentStatusStmt: Database.Statement;
  deleteCommentStmt: Database.Statement;
  deleteReplyStmt: Database.Statement;
  insertCommentStmt: Database.Statement;
  insertReplyStmt: Database.Statement;
};

let preparedStatements: PreparedStatements | null = null;

function getPreparedStatements(): PreparedStatements {
  if (preparedStatements) {
    return preparedStatements;
  }

  const db = getDb();

  preparedStatements = {
    db,
    selectApprovedComments: db.prepare<CommentRow>(
      `SELECT id, productId, rating, author, email, text, status, createdAt
       FROM comments
       WHERE productId = ? AND status = 'approved'
       ORDER BY datetime(createdAt) DESC`,
    ),
    selectCommentById: db.prepare<CommentRow>(
      `SELECT id, productId, rating, author, email, text, status, createdAt
       FROM comments
       WHERE id = ?
       LIMIT 1`,
    ),
    selectApprovedReplies: db.prepare<ReplyRow>(
      `SELECT id, commentId, author, text, createdAt, isAdmin, status
       FROM comment_replies
       WHERE commentId = ? AND status = 'approved'
       ORDER BY datetime(createdAt) ASC`,
    ),
    duplicateCommentCheck: db.prepare(
      `SELECT 1 FROM comments
       WHERE productId = ? AND lower(email) = lower(?) AND text = ?
       LIMIT 1`,
    ),
    commentExistsStmt: db.prepare(`SELECT 1 FROM comments WHERE id = ? LIMIT 1`),
    updateCommentStatusStmt: db.prepare(`UPDATE comments SET status = @status WHERE id = @id`),
    deleteCommentStmt: db.prepare(`DELETE FROM comments WHERE id = ?`),
    deleteReplyStmt: db.prepare(
      `DELETE FROM comment_replies WHERE id = @replyId AND commentId = @commentId`,
    ),
    insertCommentStmt: db.prepare(
      `INSERT INTO comments (id, productId, rating, author, email, text, status, createdAt)
       VALUES (@id, @productId, @rating, @author, @email, @text, @status, @createdAt)`,
    ),
    insertReplyStmt: db.prepare(
      `INSERT INTO comment_replies (id, commentId, author, text, isAdmin, status, createdAt)
       VALUES (@id, @commentId, @author, @text, @isAdmin, @status, @createdAt)`,
    ),
  };

  return preparedStatements;
}

export function getApprovedComments(productId: string): PublicComment[] {
  const { selectApprovedComments } = getPreparedStatements();

  const rows = selectApprovedComments.all(productId) as CommentRow[];
  return rows.map((comment) => toPublicComment(comment));
}

export function hasDuplicateComment(productId: string, email: string, text: string): boolean {
  const { duplicateCommentCheck } = getPreparedStatements();

  return Boolean(duplicateCommentCheck.get(productId, email, text));
}

export function createStoredComment(
  data: Omit<StoredComment, 'id' | 'createdAt' | 'replies'>,
): StoredComment {
  const createdAt = new Date().toISOString();
  const newComment: StoredComment = {
    ...data,
    id: randomUUID(),
    createdAt,
    replies: [],
  };

  const { insertCommentStmt } = getPreparedStatements();

  insertCommentStmt.run({
    id: newComment.id,
    productId: newComment.productId,
    rating: newComment.rating,
    author: newComment.author,
    email: newComment.email,
    text: newComment.text,
    status: newComment.status,
    createdAt: newComment.createdAt,
  });

  return newComment;
}

export function createStoredReply(data: Omit<StoredCommentReply, 'id' | 'createdAt'>): StoredCommentReply {
  const { commentExistsStmt, insertReplyStmt, db } = getPreparedStatements();

  const createdAt = new Date().toISOString();
  const reply: StoredCommentReply = {
    ...data,
    id: randomUUID(),
    createdAt,
  };

  const insert = db.transaction((row: StoredCommentReply) => {
    if (!commentExistsStmt.get(row.commentId)) {
      throw new Error('Comment not found');
    }
    insertReplyStmt.run({
      id: row.id,
      commentId: row.commentId,
      author: row.author,
      text: row.text,
      isAdmin: row.isAdmin ? 1 : 0,
      status: row.status,
      createdAt: row.createdAt,
    });
  });

  insert(reply);
  return reply;
}

export function updateCommentStatus(id: string, status: CommentStatus): PublicComment | null {
  const { updateCommentStatusStmt, selectCommentById } = getPreparedStatements();

  const result = updateCommentStatusStmt.run({ id, status });
  if (result.changes === 0) {
    return null;
  }

  const updated = selectCommentById.get(id) as CommentRow | undefined;
  return updated ? toPublicComment(updated) : null;
}

export function deleteStoredComment(id: string): boolean {
  const { deleteCommentStmt } = getPreparedStatements();

  const result = deleteCommentStmt.run(id);
  return result.changes > 0;
}

export function deleteStoredReply(commentId: string, replyId: string): boolean {
  const { deleteReplyStmt } = getPreparedStatements();

  const result = deleteReplyStmt.run({ commentId, replyId });
  return result.changes > 0;
}

export function toPublicComment(comment: CommentRow): PublicComment {
  const { selectApprovedReplies } = getPreparedStatements();

  const replies = selectApprovedReplies.all(comment.id) as ReplyRow[];

  return {
    id: comment.id,
    productId: comment.productId,
    rating: comment.rating,
    author: comment.author,
    text: comment.text,
    createdAt: comment.createdAt,
    status: comment.status,
    replies: replies.map<PublicCommentReply>(({ id, author, text, createdAt, isAdmin, status }) => ({
      id,
      author,
      text,
      createdAt,
      isAdmin: Boolean(isAdmin),
      status,
    })),
  };
}
