import { NextRequest, NextResponse } from 'next/server';
import { validateRequestOrigin, verifyTurnstileToken } from '../lib/security';
import {
  createStoredComment,
  getApprovedComments,
  hasDuplicateComment,
  toPublicComment,
} from './lib/store';
import { getCommentsStorageError, getCommentsStorageStatus } from './lib/db';
import { checkRateLimitOrSpam, validateCommentPayload } from './lib/validation';
import type { CommentPayload } from './lib/validation';

type StorageStatus = ReturnType<typeof getCommentsStorageStatus>;

function buildAvailabilityHeaders(
  status: 'ready' | 'offline',
  errorCode?: string | null,
  retryAfterSeconds?: number,
): HeadersInit {
  const headers: Record<string, string> = {
    'X-Comments-Status': status,
  };

  if (errorCode) {
    headers['X-Comments-Error-Code'] = errorCode;
  }

  if (retryAfterSeconds) {
    headers['Retry-After'] = retryAfterSeconds.toString();
  }

  return headers;
}

function getStorageRetryAfterSeconds(status: StorageStatus): number {
  if (status.errorCode === 'COMMENTS_DB_READ_ONLY_ENVIRONMENT') {
    return 3600; // 1 hour; requires deployment changes before becoming available
  }

  return 300; // Default 5-minute backoff for transient initialization errors
}

function ensureCommentsAvailable(): NextResponse | null {
  const status = getCommentsStorageStatus();

  if (status.ready) {
    return null;
  }

  const reason = status.error?.message ?? getCommentsStorageError()?.message;
  console.warn('Comments API is disabled because storage is unavailable.', {
    error: reason,
    code: status.errorCode,
  });

  const retryAfterSeconds = getStorageRetryAfterSeconds(status);

  return NextResponse.json(
    {
      error: 'Comments are currently unavailable. Please try again later.',
      code: status.errorCode ?? 'COMMENTS_STORAGE_UNAVAILABLE',
    },
    {
      status: 503,
      headers: buildAvailabilityHeaders('offline', status.errorCode, retryAfterSeconds),
    },
  );
}

export async function GET(request: NextRequest) {
  const availabilityResponse = ensureCommentsAvailable();
  if (availabilityResponse) {
    return availabilityResponse;
  }

  const productId = request.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'productId query parameter is required.' }, { status: 400 });
  }

  const comments = getApprovedComments(productId);

  return NextResponse.json({ comments }, { headers: buildAvailabilityHeaders('ready') });
}

export async function POST(request: NextRequest) {
  const availabilityResponse = ensureCommentsAvailable();
  if (availabilityResponse) {
    return availabilityResponse;
  }

  const originError = validateRequestOrigin(request);
  if (originError) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  let payload: CommentPayload;
  try {
    payload = (await request.json()) as CommentPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { sanitized, error: validationError } = validateCommentPayload(payload);
  if (validationError || !sanitized) {
    return NextResponse.json({ error: validationError ?? 'Invalid payload.' }, { status: 400 });
  }

  const captchaError = await verifyTurnstileToken(
    sanitized.turnstileToken ?? request.headers.get('cf-turnstile-response'),
  );

  if (captchaError) {
    const headers = captchaError.retryAfterSeconds
      ? { 'Retry-After': captchaError.retryAfterSeconds.toString() }
      : undefined;
    return NextResponse.json({ error: captchaError.message }, { status: captchaError.status, headers });
  }

  const guardResult = await checkRateLimitOrSpam(request, sanitized.text);
  if (guardResult) {
    const headers: HeadersInit | undefined = guardResult.retryAfterSeconds
      ? { 'Retry-After': guardResult.retryAfterSeconds.toString() }
      : undefined;
    return NextResponse.json({ error: guardResult.error }, { status: 429, headers });
  }

  if (hasDuplicateComment(sanitized.productId, sanitized.email, sanitized.text.trim())) {
    return NextResponse.json(
      { error: 'This comment has already been submitted and is awaiting moderation.' },
      { status: 409 },
    );
  }

  const newComment = createStoredComment({
    productId: sanitized.productId,
    rating: sanitized.rating,
    author: sanitized.author,
    email: sanitized.email,
    text: sanitized.text,
    status: 'pending',
  });

  const { replies: _unusedReplies, ...commentRow } = newComment;
  void _unusedReplies;
  const publicComment = toPublicComment(commentRow);

  return NextResponse.json({ comment: publicComment }, {
    status: 201,
    headers: buildAvailabilityHeaders('ready'),
  });
}
