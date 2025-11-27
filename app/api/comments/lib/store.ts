import { getCommentStorage } from './db';
import type { CommentStatus, PublicComment, StoredComment, StoredCommentReply } from './types';

export async function getApprovedComments(productId: string): Promise<PublicComment[]> {
  const storage = await getCommentStorage();
  return storage.getApprovedComments(productId);
}

export async function hasDuplicateComment(productId: string, email: string, text: string): Promise<boolean> {
  const storage = await getCommentStorage();
  return storage.hasDuplicateComment(productId, email, text);
}

export async function createStoredComment(
  data: Omit<StoredComment, 'id' | 'createdAt' | 'replies'>,
): Promise<StoredComment> {
  const storage = await getCommentStorage();
  return storage.createComment(data);
}

export async function createStoredReply(
  data: Omit<StoredCommentReply, 'id' | 'createdAt' | 'respondedAt'> & { respondedAt?: string },
): Promise<StoredCommentReply> {
  const storage = await getCommentStorage();
  return storage.createReply(data);
}

export async function updateCommentStatus(
  id: string,
  status: CommentStatus,
  options?: { adminId?: string; adminDisplayName?: string; moderatedAt?: string },
): Promise<PublicComment | null> {
  const storage = await getCommentStorage();
  return storage.updateCommentStatus(id, status, options);
}

export async function deleteStoredComment(id: string): Promise<boolean> {
  const storage = await getCommentStorage();
  return storage.deleteComment(id);
}

export async function deleteStoredReply(commentId: string, replyId: string): Promise<boolean> {
  const storage = await getCommentStorage();
  return storage.deleteReply(commentId, replyId);
}

export async function toPublicComment(comment: StoredComment): Promise<PublicComment> {
  const storage = await getCommentStorage();
  return storage.toPublicComment(comment);
}
