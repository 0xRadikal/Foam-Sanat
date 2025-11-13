import type { NextRequest } from 'next/server';
import { isRateLimited } from './rateLimit';
import { getClientIdentifier } from './auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const linkPattern = /(https?:\/\/\S+)/gi;

export type CommentPayload = {
  productId?: unknown;
  rating?: unknown;
  author?: unknown;
  email?: unknown;
  text?: unknown;
};

export function validateCommentPayload(payload: CommentPayload) {
  if (!payload.productId || typeof payload.productId !== 'string') {
    return 'Invalid product identifier.';
  }

  if (typeof payload.rating !== 'number' || !Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }

  if (!payload.author || typeof payload.author !== 'string' || payload.author.trim().length < 2) {
    return 'Author name must be at least 2 characters.';
  }

  if (!payload.email || typeof payload.email !== 'string' || !emailPattern.test(payload.email)) {
    return 'A valid email address is required.';
  }

  if (!payload.text || typeof payload.text !== 'string' || payload.text.trim().length < 20) {
    return 'Comment text must be at least 20 characters.';
  }

  const links = payload.text.match(linkPattern);
  if (links && links.length > 2) {
    return 'Please remove excessive links from your comment.';
  }

  return null;
}

export function checkRateLimitOrSpam(request: NextRequest, text: string) {
  const identifier = getClientIdentifier(request);
  if (isRateLimited(identifier)) {
    return 'Too many comments submitted. Please try again later.';
  }

  const repeatedWordMatch = text.match(/(\b\w+\b)(?:.*\1){4,}/gi);
  if (repeatedWordMatch) {
    return 'Comment appears to be spam. Please revise and try again.';
  }

  return null;
}
