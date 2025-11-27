import type { CommentStatus, PublicComment, StoredComment, StoredCommentReply } from '../types';

export type StorageBackend = 'sqlite' | 'postgres';

export type StorageInitializationOptions = {
  connectionString?: string;
};

export type ConnectionMetrics = {
  active?: number;
  idle?: number;
  waiting?: number;
  queueSize?: number;
  lastErrorAt?: Date | null;
};

export type StorageHealth = {
  backend: StorageBackend;
  ready: boolean;
  errorCode?: string | null;
  connection?: ConnectionMetrics;
};

export interface CommentStorage {
  backend: StorageBackend;
  initialize(): Promise<void>;
  initializeSync?(): void;
  isReady(): boolean;
  getHealth(): StorageHealth;
  getApprovedComments(productId: string): Promise<PublicComment[]>;
  hasDuplicateComment(productId: string, email: string, text: string): Promise<boolean>;
  createComment(data: Omit<StoredComment, 'id' | 'createdAt' | 'replies'>): Promise<StoredComment>;
  createReply(
    data: Omit<StoredCommentReply, 'id' | 'createdAt' | 'respondedAt'> & { respondedAt?: string },
  ): Promise<StoredCommentReply>;
  updateCommentStatus(
    id: string,
    status: CommentStatus,
    options?: { adminId?: string; adminDisplayName?: string; moderatedAt?: string },
  ): Promise<PublicComment | null>;
  deleteComment(id: string): Promise<boolean>;
  deleteReply(commentId: string, replyId: string): Promise<boolean>;
  toPublicComment(comment: StoredComment): Promise<PublicComment>;
}
