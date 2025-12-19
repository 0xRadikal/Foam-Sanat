import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { requireSession } from '../../lib/session';
import { canDeleteProducts } from '@/app/lib/rbac';
import { buildProductWhere } from '../lib';

export const dynamic = 'force-dynamic';

const csvEscape = (value: string | number | null | undefined) => {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const role = session.user?.role as Role;
    if (!canDeleteProducts(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const where = buildProductWhere(request.nextUrl.searchParams);
    const products = await prisma.product.findMany({
      where,
      include: { category: true, media: true },
      orderBy: { updatedAt: 'desc' },
    });

    const headers = [
      'id',
      'slug',
      'status',
      'category',
      'priceMode',
      'priceAmount',
      'priceNoteFa',
      'priceNoteEn',
      'commentsEnabled',
      'mediaCount',
      'createdAt',
      'updatedAt',
    ];

    const rows = products.map((product) => [
      product.id,
      product.slug,
      product.status,
      product.category?.slug ?? '',
      product.priceMode,
      product.priceAmount ? product.priceAmount.toString() : '',
      product.priceNoteFa ?? '',
      product.priceNoteEn ?? '',
      product.commentsEnabled ? 'true' : 'false',
      String(product.media.length),
      product.createdAt.toISOString(),
      product.updatedAt.toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.map(csvEscape).join(','))].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products.csv"',
      },
    });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('product.export.failed', error);
    return NextResponse.json({ error: 'Unable to export products.' }, { status: 500 });
  }
}
