import { NextRequest, NextResponse } from 'next/server';
import { withRequestLogging } from '../../lib/logging';
import { assertAdmin, logModerationAudit } from '../lib/auth';
import { deleteStoredComment, updateCommentStatus } from '../lib/store';
import type { CommentStatus } from '../lib/types';

export const PATCH = withRequestLogging(
  async (
    request: NextRequest,
    context: { params: { id: string } } | undefined,
    { logger },
  ) => {
    const commentId = context?.params?.id;
    if (!commentId) {
      return NextResponse.json({ error: 'Comment id is required.' }, { status: 400 });
    }

    const admin = assertAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
    }

    let body: { status?: CommentStatus };
    try {
      body = (await request.json()) as { status?: CommentStatus };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    if (!body.status || !['pending', 'approved', 'rejected'].includes(body.status)) {
      return NextResponse.json({ error: 'A valid status must be provided.' }, { status: 400 });
    }

    const updated = updateCommentStatus(commentId, body.status);
    if (!updated) {
      logger.warn('comments.moderation.not-found', { commentId });
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    const moderatedAt = new Date().toISOString();
    logModerationAudit('update-status', admin, {
      commentId,
      status: body.status,
      moderatedAt,
    });

    return NextResponse.json({
      comment: updated,
      moderation: {
        adminId: admin.id,
        adminDisplayName: admin.displayName,
        moderatedAt,
      },
    });
  },
);

export const DELETE = withRequestLogging(
  async (
    request: NextRequest,
    context: { params: { id: string } } | undefined,
    { logger },
  ) => {
    const commentId = context?.params?.id;
    if (!commentId) {
      return NextResponse.json({ error: 'Comment id is required.' }, { status: 400 });
    }

    const admin = assertAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
    }

    const deleted = deleteStoredComment(commentId);
    if (!deleted) {
      logger.warn('comments.moderation.not-found', { commentId });
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    const moderatedAt = new Date().toISOString();
    logModerationAudit('delete-comment', admin, {
      commentId,
      moderatedAt,
    });

    return NextResponse.json({
      success: true,
      moderation: {
        adminId: admin.id,
        adminDisplayName: admin.displayName,
        moderatedAt,
      },
    });
  },
);
