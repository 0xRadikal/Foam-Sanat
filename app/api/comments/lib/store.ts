import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { PublicComment, StoredComment, StoredCommentReply } from './types';

const dataDir = path.join(process.cwd(), 'app/api/comments/data');
const dataPath = path.join(dataDir, 'comments.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, '[]', 'utf8');
  }
}

export async function readComments(): Promise<StoredComment[]> {
  await ensureDataFile();
  const data = await fs.readFile(dataPath, 'utf8');
  try {
    const parsed = JSON.parse(data) as StoredComment[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export async function writeComments(comments: StoredComment[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(dataPath, JSON.stringify(comments, null, 2), 'utf8');
}

export function sanitizeComment(comment: StoredComment): PublicComment {
  return {
    id: comment.id,
    productId: comment.productId,
    rating: comment.rating,
    author: comment.author,
    text: comment.text,
    createdAt: comment.createdAt,
    status: comment.status,
    replies: comment.replies
      .filter((reply) => reply.status === 'approved')
      .map((reply) => ({
        id: reply.id,
        author: reply.author,
        text: reply.text,
        createdAt: reply.createdAt,
        isAdmin: reply.isAdmin,
        status: reply.status
      }))
  };
}

export function createStoredComment(data: Omit<StoredComment, 'id' | 'createdAt' | 'replies'>): StoredComment {
  return {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    replies: []
  };
}

export function createStoredReply(data: Omit<StoredCommentReply, 'id' | 'createdAt'>): StoredCommentReply {
  return {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  };
}
