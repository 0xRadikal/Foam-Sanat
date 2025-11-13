import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '../../../lib/auth';
import { readComments, writeComments } from '../../../lib/store';

export async function DELETE(request: NextRequest, { params }: { params: { id: string; replyId: string } }) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
  }

  const comments = await readComments();
  const commentIndex = comments.findIndex((comment) => comment.id === params.id);
  if (commentIndex === -1) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
  }

  const replyIndex = comments[commentIndex].replies.findIndex((reply) => reply.id === params.replyId);
  if (replyIndex === -1) {
    return NextResponse.json({ error: 'Reply not found.' }, { status: 404 });
  }

  comments[commentIndex].replies.splice(replyIndex, 1);
  await writeComments(comments);

  return NextResponse.json({ success: true });
}
