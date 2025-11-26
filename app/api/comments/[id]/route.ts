import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '../lib/auth';
import { deleteStoredComment, updateCommentStatus } from '../lib/store';
import type { CommentStatus } from '../lib/types';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

  const updated = updateCommentStatus(params.id, body.status);
  if (!updated) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
  }

  const moderatedAt = new Date().toISOString();
  console.info('Comment status updated.', {
    commentId: params.id,
    status: body.status,
    adminId: admin.id,
    adminDisplayName: admin.displayName,
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
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = assertAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
  }

  const deleted = deleteStoredComment(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
  }

  const moderatedAt = new Date().toISOString();
  console.info('Comment deleted.', {
    commentId: params.id,
    adminId: admin.id,
    adminDisplayName: admin.displayName,
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
}
