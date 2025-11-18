import type { NextRequest } from 'next/server';
import { sanitizeStringField } from '../../lib/payload';
import { isRateLimited } from './rateLimit';
import { getClientIdentifier } from './auth';
import { validateEmail, VALIDATION_RULES } from '@/app/lib/validation';

const linkPattern = /(https?:\/\/\S+)/gi;
const MAX_COMMENT_LENGTH = VALIDATION_RULES.comment.maxLength;
const MAX_SPAM_SCAN_LENGTH = 3000;

export type CommentPayload = {
  productId?: unknown;
  rating?: unknown;
  author?: unknown;
  email?: unknown;
  text?: unknown;
  turnstileToken?: unknown;
};

export type SanitizedCommentPayload = {
  productId: string;
  rating: number;
  author: string;
  email: string;
  text: string;
  turnstileToken?: string;
};

export function validateCommentPayload(
  payload: CommentPayload,
): { error: string | null; sanitized?: SanitizedCommentPayload } {
  const productId = sanitizeStringField(payload.productId, {
    fieldName: 'productId',
    maxLength: 100,
  });

  if (!productId.ok) {
    return { error: 'Invalid product identifier.' };
  }

  if (
    typeof payload.rating !== 'number' ||
    !Number.isInteger(payload.rating) ||
    payload.rating < 1 ||
    payload.rating > 5
  ) {
    return { error: 'Rating must be an integer between 1 and 5.' };
  }

  const author = sanitizeStringField(payload.author, {
    fieldName: 'author name',
    minLength: VALIDATION_RULES.name.minLength,
    maxLength: VALIDATION_RULES.name.maxLength,
  });

  if (!author.ok) {
    return { error: 'Author name must be at least 2 characters.' };
  }

  const email = sanitizeStringField(payload.email, {
    fieldName: 'email',
    maxLength: VALIDATION_RULES.email.maxLength,
    minLength: VALIDATION_RULES.email.minLength,
  });

  if (!email.ok || !validateEmail(email.value)) {
    return { error: 'A valid email address is required.' };
  }

  const text = sanitizeStringField(payload.text, {
    fieldName: 'comment text',
    maxLength: MAX_COMMENT_LENGTH,
    minLength: VALIDATION_RULES.comment.minLength,
  });

  if (!text.ok) {
    const errorMessage = text.error.includes('exceeds')
      ? 'Comment text exceeds maximum length.'
      : 'Comment text must be at least 20 characters.';
    return { error: errorMessage };
  }

  const links = text.value.match(linkPattern);
  if (links && links.length > 2) {
    return { error: 'Please remove excessive links from your comment.' };
  }

  return {
    error: null,
    sanitized: {
      productId: productId.value,
      rating: payload.rating,
      author: author.value,
      email: email.value.toLowerCase(),
      text: text.value,
      turnstileToken:
        typeof payload.turnstileToken === 'string'
          ? payload.turnstileToken.trim() || undefined
          : undefined,
    },
  };
}

export function checkRateLimitOrSpam(request: NextRequest, text: string) {
  const identifier = getClientIdentifier(request);
  if (isRateLimited(identifier)) {
    return 'Too many comments submitted. Please try again later.';
  }

  if (text.length > MAX_SPAM_SCAN_LENGTH) {
    return 'Comment text exceeds maximum length.';
  }

  const repeatedWordMatch = text.match(/(\b\w+\b)(?:.*\1){4,}/gi);
  if (repeatedWordMatch) {
    return 'Comment appears to be spam. Please revise and try again.';
  }

  return null;
}
