import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireSession } from '../lib/session';

export async function GET() {
  try {
    await requireSession();
    const [products, published, drafts, inboxUnread, unresolved] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      prisma.product.count({ where: { status: 'DRAFT', deletedAt: null } }),
      prisma.inboxItem.count({ where: { isRead: false } }),
      prisma.inboxItem.count({ where: { isResolved: false, isSpam: false } }),
    ]);

    return NextResponse.json({
      products,
      published,
      drafts,
      inboxUnread,
      unresolved,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load metrics.' }, { status: 500 });
  }
}
