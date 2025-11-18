import { NextRequest, NextResponse } from 'next/server';
import { validateRequestOrigin, verifyTurnstileToken } from '../lib/security';
import { createStoredComment, readComments, sanitizeComment, writeComments } from './lib/store';
import { checkRateLimitOrSpam, validateCommentPayload } from './lib/validation';
import type { CommentPayload } from './lib/validation';

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'productId query parameter is required.' }, { status: 400 });
  }

  const comments = await readComments();
  const filtered = comments
    .filter((comment) => comment.productId === productId && comment.status === 'approved')
    .map(sanitizeComment);

  return NextResponse.json({ comments: filtered });
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: captchaError }, { status: 403 });
  }

  const spamError = checkRateLimitOrSpam(request, sanitized.text);
  if (spamError) {
    return NextResponse.json({ error: spamError }, { status: 429 });
  }

  const comments = await readComments();
  const duplicate = comments.find(
    (comment) =>
      comment.productId === sanitized.productId &&
      comment.email.toLowerCase() === sanitized.email &&
      comment.text.trim() === sanitized.text
  );

  if (duplicate) {
    return NextResponse.json(
      { error: 'This comment has already been submitted and is awaiting moderation.' },
      { status: 409 }
    );
  }

  const newComment = createStoredComment({
    productId: sanitized.productId,
    rating: sanitized.rating,
    author: sanitized.author,
    email: sanitized.email,
    text: sanitized.text,
    status: 'pending'
  });

  comments.push(newComment);
  await writeComments(comments);

  return NextResponse.json({ comment: sanitizeComment(newComment) }, { status: 201 });
}
