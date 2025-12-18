import { NextRequest, NextResponse } from 'next/server';
import { InboxType } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { inboxStatusSchema } from '@/app/admin/validation';
import { requireSession } from '../lib/session';
import { recordAuditLog } from '@/app/lib/audit';

const PAGE_SIZE = 15;

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') as InboxType | null;
    const productId = request.nextUrl.searchParams.get('productId');
    const spam = request.nextUrl.searchParams.get('spam');
    const unresolved = request.nextUrl.searchParams.get('unresolved');
    const unread = request.nextUrl.searchParams.get('unread');
    const dateFrom = request.nextUrl.searchParams.get('from');
    const dateTo = request.nextUrl.searchParams.get('to');
    const page = Number(request.nextUrl.searchParams.get('page') ?? '1');

    const where = {
      ...(type ? { type } : {}),
      ...(productId ? { productId } : {}),
      ...(spam ? { isSpam: spam === 'true' } : {}),
      ...(unresolved ? { isResolved: unresolved !== 'true' } : {}),
      ...(unread ? { isRead: unread !== 'false' } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              gte: dateFrom ? new Date(dateFrom) : undefined,
              lte: dateTo ? new Date(dateTo) : undefined,
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inboxItem.findMany({
        where,
        include: { adminReplies: true, product: { select: { id: true, titleEn: true, titleFa: true } } },
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
        skip: Math.max(page - 1, 0) * PAGE_SIZE,
      }),
      prisma.inboxItem.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      pagination: {
        page: Math.max(page, 1),
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load inbox.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
    const parsed = inboxStatusSchema.safeParse(body.update ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    if (!ids.length) {
      return NextResponse.json({ error: 'No ids provided' }, { status: 400 });
    }

    await prisma.inboxItem.updateMany({
      where: { id: { in: ids } },
      data: parsed.data,
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'inbox.bulk_update',
      entityType: 'inbox',
      entityId: ids.join(','),
      diff: parsed.data,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update inbox items.' }, { status: 500 });
  }
}
