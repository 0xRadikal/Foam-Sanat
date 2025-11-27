export type CommentStatus = 'pending' | 'approved' | 'rejected';

export type StoredCommentReply = {
  id: string;
  commentId: string;
  author: string;
  text: string;
  createdAt: string;
  isAdmin?: boolean;
  adminId?: string;
  adminDisplayName?: string;
  respondedAt?: string;
  status: CommentStatus;
};

export type StoredComment = {
  id: string;
  productId: string;
  rating: number;
  author: string;
  email: string;
  text: string;
  createdAt: string;
  status: CommentStatus;
  moderatedAt?: string;
  moderatedById?: string;
  moderatedByDisplayName?: string;
  replies: StoredCommentReply[];
};

export type PublicCommentReply = Omit<StoredCommentReply, 'commentId' | 'status'> & {
  status: CommentStatus;
};

export type PublicComment = Omit<StoredComment, 'email' | 'replies'> & {
  replies: PublicCommentReply[];
};
