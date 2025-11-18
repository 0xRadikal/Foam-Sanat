import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '../../lib/auth';
import { createStoredReply } from '../../lib/store';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!assertAdmin(request)) {
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

  try {
    const reply = createStoredReply({
      commentId: params.id,
      author: 'Admin',
      text: body.text.trim(),
      isAdmin: true,
      status: 'approved',
    });

    return NextResponse.json({
      reply: {
        id: reply.id,
        author: reply.author,
        text: reply.text,
        createdAt: reply.createdAt,
        isAdmin: reply.isAdmin,
        status: reply.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to add reply.' },
      { status: 404 },
    );
  }
}
