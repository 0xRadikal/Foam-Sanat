import { randomUUID } from 'crypto';
import { db } from './db';
import type {
  CommentStatus,
  PublicComment,
  PublicCommentReply,
  StoredComment,
  StoredCommentReply,
} from './types';

type CommentRow = Omit<StoredComment, 'replies'>;
type ReplyRow = StoredCommentReply;

const selectApprovedComments = db.prepare<CommentRow>(
  `SELECT id, productId, rating, author, email, text, status, createdAt
   FROM comments
   WHERE productId = ? AND status = 'approved'
   ORDER BY datetime(createdAt) DESC`,
);

const selectCommentById = db.prepare<CommentRow>(
  `SELECT id, productId, rating, author, email, text, status, createdAt
   FROM comments
   WHERE id = ?
   LIMIT 1`,
);

const selectApprovedReplies = db.prepare<ReplyRow>(
  `SELECT id, commentId, author, text, createdAt, isAdmin, status
   FROM comment_replies
   WHERE commentId = ? AND status = 'approved'
   ORDER BY datetime(createdAt) ASC`,
);

const duplicateCommentCheck = db.prepare(
  `SELECT 1 FROM comments
   WHERE productId = ? AND lower(email) = lower(?) AND text = ?
   LIMIT 1`,
);

const commentExistsStmt = db.prepare(`SELECT 1 FROM comments WHERE id = ? LIMIT 1`);
const updateCommentStatusStmt = db.prepare(
  `UPDATE comments SET status = @status WHERE id = @id`,
);
const deleteCommentStmt = db.prepare(`DELETE FROM comments WHERE id = ?`);
const deleteReplyStmt = db.prepare(
  `DELETE FROM comment_replies WHERE id = @replyId AND commentId = @commentId`,
);

const insertCommentStmt = db.prepare(
  `INSERT INTO comments (id, productId, rating, author, email, text, status, createdAt)
   VALUES (@id, @productId, @rating, @author, @email, @text, @status, @createdAt)`,
);

const insertReplyStmt = db.prepare(
  `INSERT INTO comment_replies (id, commentId, author, text, isAdmin, status, createdAt)
   VALUES (@id, @commentId, @author, @text, @isAdmin, @status, @createdAt)`,
);

export function getApprovedComments(productId: string): PublicComment[] {
  return selectApprovedComments.all(productId).map((comment) => toPublicComment(comment));
}

export function hasDuplicateComment(productId: string, email: string, text: string): boolean {
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
  const result = updateCommentStatusStmt.run({ id, status });
  if (result.changes === 0) {
    return null;
  }

  const updated = selectCommentById.get(id);
  return updated ? toPublicComment(updated) : null;
}

export function deleteStoredComment(id: string): boolean {
  const result = deleteCommentStmt.run(id);
  return result.changes > 0;
}

export function deleteStoredReply(commentId: string, replyId: string): boolean {
  const result = deleteReplyStmt.run({ commentId, replyId });
  return result.changes > 0;
}

export function toPublicComment(comment: CommentRow): PublicComment {
  return {
    id: comment.id,
    productId: comment.productId,
    rating: comment.rating,
    author: comment.author,
    text: comment.text,
    createdAt: comment.createdAt,
    status: comment.status,
    replies: selectApprovedReplies
      .all(comment.id)
      .map<PublicCommentReply>(({ id, author, text, createdAt, isAdmin, status }) => ({
        id,
        author,
        text,
        createdAt,
        isAdmin: Boolean(isAdmin),
        status,
      })),
  };
}
