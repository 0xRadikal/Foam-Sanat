import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '../lib/auth';
import { readComments, sanitizeComment, writeComments } from '../lib/store';
import type { CommentStatus } from '../lib/types';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!assertAdmin(request)) {
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

  const comments = await readComments();
  const index = comments.findIndex((comment) => comment.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
  }

  comments[index].status = body.status;
  await writeComments(comments);

  return NextResponse.json({ comment: sanitizeComment(comments[index]) });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
  }

  const comments = await readComments();
  const index = comments.findIndex((comment) => comment.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
  }

  comments.splice(index, 1);
  await writeComments(comments);

  return NextResponse.json({ success: true });
}
