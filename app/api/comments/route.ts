import { NextRequest, NextResponse } from 'next/server';
import { withRequestLogging } from '../lib/logging';
import { validateRequestOrigin, verifyTurnstileToken } from '../lib/security';
import {
  createStoredComment,
  getApprovedComments,
  hasDuplicateComment,
  toPublicComment,
} from './lib/store';
import { buildAvailabilityHeaders, ensureCommentsAvailable } from './lib/status';
import { checkRateLimitOrSpam, validateCommentPayload } from './lib/validation';
import type { CommentPayload } from './lib/validation';
import { prisma } from '@/app/lib/prisma';
import { recordAuditLog } from '@/app/lib/audit';
import { getSiteSettings } from '@/app/lib/settings';

async function buildDisabledResponse(code: string, message: string) {
  return NextResponse.json(
    { error: message, code, status: 'disabled' },
    { status: 403, headers: buildAvailabilityHeaders('disabled', code) },
  );
}

async function ensureCommentsEnabled(productId: string | null) {
  const settings = await getSiteSettings();
  if (!settings.commentsEnabled) {
    return buildDisabledResponse('COMMENTS_DISABLED_BY_ADMIN', 'Comments are currently disabled.');
  }

  if (!productId) return null;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { commentsEnabled: true, deletedAt: true, status: true },
  });

  if (!product || product.deletedAt) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  if (!product.commentsEnabled) {
    return buildDisabledResponse('COMMENTS_DISABLED_FOR_PRODUCT', 'Comments are disabled for this product.');
  }

  return null;
}

export const GET = withRequestLogging(async (request: NextRequest, _context, { logger, requestId }) => {
  const productId = request.nextUrl.searchParams.get('productId');
  if (!productId) {
    logger.warn('comments.fetch.missing-product-id');
    return NextResponse.json({ error: 'productId query parameter is required.' }, { status: 400 });
  }

  const disabledResponse = await ensureCommentsEnabled(productId);
  if (disabledResponse) {
    return disabledResponse;
  }

  const availabilityResponse = await ensureCommentsAvailable(requestId, logger);
  if (availabilityResponse) {
    return availabilityResponse;
  }

  const comments = await getApprovedComments(productId);
  logger.info('comments.fetch.success', { productId, count: comments.length });

  return NextResponse.json({ comments }, { headers: buildAvailabilityHeaders('ready') });
});

export const POST = withRequestLogging(async (request: NextRequest, _context, { logger, requestId }) => {
  const originError = validateRequestOrigin(request);
  if (originError) {
    logger.warn('comments.post.invalid-origin');
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  let payload: CommentPayload;
  try {
    payload = (await request.json()) as CommentPayload;
  } catch {
    logger.warn('comments.post.invalid-json');
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { sanitized, error: validationError } = validateCommentPayload(payload);
  if (validationError || !sanitized) {
    logger.warn('comments.post.validation-error', { validationError });
    return NextResponse.json({ error: validationError ?? 'Invalid payload.' }, { status: 400 });
  }

  const disabledResponse = await ensureCommentsEnabled(sanitized.productId);
  if (disabledResponse) {
    return disabledResponse;
  }

  const availabilityResponse = await ensureCommentsAvailable(requestId, logger);
  if (availabilityResponse) {
    return availabilityResponse;
  }

  const captchaError = await verifyTurnstileToken(
    sanitized.turnstileToken ?? request.headers.get('cf-turnstile-response'),
  );

  if (captchaError) {
    const headers = captchaError.retryAfterSeconds
      ? { 'Retry-After': captchaError.retryAfterSeconds.toString() }
      : undefined;
    logger.warn('comments.post.captcha-error', { status: captchaError.status });
    return NextResponse.json({ error: captchaError.message }, { status: captchaError.status, headers });
  }

  const guardResult = await checkRateLimitOrSpam(request, sanitized.text, { requestId });
  if (guardResult) {
    const headers: HeadersInit | undefined = guardResult.retryAfterSeconds
      ? { 'Retry-After': guardResult.retryAfterSeconds.toString() }
      : undefined;
    logger.warn('comments.post.blocked', { reason: guardResult.error });
    return NextResponse.json({ error: guardResult.error }, { status: 429, headers });
  }

  if (await hasDuplicateComment(sanitized.productId, sanitized.email, sanitized.text.trim())) {
    logger.warn('comments.post.duplicate', { productId: sanitized.productId });
    return NextResponse.json(
      { error: 'This comment has already been submitted and is awaiting moderation.' },
      { status: 409 },
    );
  }

  let newComment;
  try {
    newComment = await createStoredComment({
      productId: sanitized.productId,
      rating: sanitized.rating,
      author: sanitized.author,
      email: sanitized.email,
      text: sanitized.text,
      status: 'pending',
    });
  } catch (error) {
    if ((error as Error).message === 'DUPLICATE_COMMENT') {
      logger.warn('comments.post.duplicate', { productId: sanitized.productId });
      return NextResponse.json(
        { error: 'This comment has already been submitted and is awaiting moderation.' },
        { status: 409 },
      );
    }

    logger.error('comments.post.unexpected-error', { error });
    return NextResponse.json({ error: 'Failed to save comment.' }, { status: 500 });
  }

  const publicComment = await toPublicComment(newComment);
  await persistInboxComment(newComment, request);

  logger.info('comments.post.created', { productId: sanitized.productId });

  return NextResponse.json(
    { comment: publicComment },
    {
      status: 201,
      headers: buildAvailabilityHeaders('ready'),
    },
  );
});

async function persistInboxComment(
  comment: { id: string; productId: string; author: string; email: string; text: string },
  request: NextRequest,
): Promise<void> {
  try {
    const ip =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;

    const inboxItem = await prisma.inboxItem.create({
      data: {
        type: 'COMMENT',
        productId: comment.productId,
        name: comment.author,
        email: comment.email,
        body: comment.text,
        isRead: false,
        isResolved: false,
        ip,
        userAgent,
      },
    });

    await recordAuditLog({
      actorId: null,
      action: 'inbox.comment.create',
      entityType: 'inbox',
      entityId: inboxItem.id,
      diff: { commentId: comment.id },
      ip,
      userAgent,
    });
  } catch (error) {
    console.error('comments.inbox.persist_failed', error);
  }
}
