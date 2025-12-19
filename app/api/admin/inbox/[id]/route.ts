import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { inboxStatusSchema, replySchema } from '@/app/admin/validation';
import { requireSession } from '../../lib/session';
import { recordAuditLog } from '@/app/lib/audit';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession();
    const item = await prisma.inboxItem.findUnique({
      where: { id: params.id },
      include: {
        adminReplies: {
          include: {
            admin: { select: { id: true, email: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        product: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('inbox.detail.failed', error);
    return NextResponse.json({ error: 'Unable to fetch inbox item.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const raw = await request.json();
    const parsed = inboxStatusSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const item = await prisma.inboxItem.update({
      where: { id: params.id },
      data: parsed.data,
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'inbox.status_change',
      entityType: 'inbox',
      entityId: params.id,
      diff: parsed.data,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('inbox.status.failed', error);
    return NextResponse.json({ error: 'Unable to update inbox item.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const raw = await request.json();
    const parsed = replySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const inboxItem = await prisma.inboxItem.findUnique({ where: { id: params.id } });
    if (!inboxItem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const reply = await prisma.adminReply.create({
      data: {
        inboxId: params.id,
        adminId: session.user?.id ?? '',
        body: parsed.data.body,
        sentEmail: parsed.data.sendEmail ?? false,
      },
    });

    await prisma.inboxItem.update({
      where: { id: params.id },
      data: { isRead: true, isResolved: parsed.data.sendEmail ? true : inboxItem.isResolved },
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'inbox.reply',
      entityType: 'inbox',
      entityId: params.id,
      diff: { replyId: reply.id },
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ data: reply }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('inbox.reply.failed', error);
    return NextResponse.json({ error: 'Unable to reply.' }, { status: 500 });
  }
}
