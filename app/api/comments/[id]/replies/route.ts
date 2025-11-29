import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin, logModerationAudit } from '../../lib/auth';
import { createStoredReply } from '../../lib/store';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = assertAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
  }

  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!body.text || typeof body.text !== 'string' || body.text.trim().length < 2) {
    return NextResponse.json({ error: 'Reply text must be provided.' }, { status: 400 });
  }

  const repliedAt = new Date().toISOString();

  try {
    const reply = await createStoredReply({
      commentId: params.id,
      author: admin.displayName,
      text: body.text.trim(),
      isAdmin: true,
      adminId: admin.id,
      adminDisplayName: admin.displayName,
      respondedAt: repliedAt,
      status: 'approved',
    });

    logModerationAudit('reply-comment', admin, {
      commentId: params.id,
      replyId: reply.id,
      repliedAt,
    });

    return NextResponse.json({
      reply: {
        id: reply.id,
        author: reply.author,
        text: reply.text,
        createdAt: reply.createdAt,
        isAdmin: reply.isAdmin,
        adminId: reply.adminId,
        adminDisplayName: reply.adminDisplayName,
        respondedAt: reply.respondedAt,
        status: reply.status,
      },
    });
  } catch (error) {
    console.error('comments.reply.failed', { commentId: params.id, error });
    return NextResponse.json({ error: 'Unable to add reply.' }, { status: 404 });
  }
}
