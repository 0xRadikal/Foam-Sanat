import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ProductStatus, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { recordAuditLog } from '@/app/lib/audit';
import { productSchema } from '@/app/admin/validation';
import { requireSession } from '../lib/session';
import { slugify } from '@/app/lib/slug';
import { canEditProducts } from '@/app/lib/rbac';
import { enforceRateLimit } from '../lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { buildProductWhere, parsePagination } from './lib';

function isUnauthorized(error: unknown): boolean {
  return (error as Error | undefined)?.message === 'UNAUTHORIZED';
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const { page, pageSize } = parsePagination(request.nextUrl.searchParams);
    const where = buildProductWhere(request.nextUrl.searchParams);

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          media: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      role: session.user?.role,
    });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('product.list.failed', error);
    return NextResponse.json({ error: 'Unable to fetch products.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canEditProducts(session.user?.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const rateLimit = enforceRateLimit(`admin:products:create:${session.user?.id ?? 'unknown'}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: rateLimit.retryAfterSeconds ? { 'Retry-After': rateLimit.retryAfterSeconds.toString() } : undefined },
      );
    }

    const raw = await request.json();
    const parsed = productSchema.safeParse({
      ...raw,
      slug: raw.slug || undefined,
      priceAmount:
        raw.priceAmount === null || raw.priceAmount === undefined || raw.priceAmount === ''
          ? undefined
          : Number(raw.priceAmount),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payload = parsed.data;
    const slug = payload.slug || slugify(payload.titleEn || payload.titleFa);

    const slugExists = await prisma.product.findFirst({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        slug,
        status: payload.status,
        categoryId: payload.categoryId ?? undefined,
        titleFa: payload.titleFa,
        titleEn: payload.titleEn,
        shortFa: payload.shortFa,
        shortEn: payload.shortEn,
        descFa: payload.descFa,
        descEn: payload.descEn,
        priceMode: payload.priceMode,
        priceAmount: payload.priceAmount ?? undefined,
        priceNoteFa: payload.priceNoteFa ?? undefined,
        priceNoteEn: payload.priceNoteEn ?? undefined,
        commentsEnabled: payload.commentsEnabled ?? true,
        specs: payload.specs as Prisma.InputJsonValue,
        seoTitleFa: payload.seoTitleFa ?? undefined,
        seoTitleEn: payload.seoTitleEn ?? undefined,
        seoDescFa: payload.seoDescFa ?? undefined,
        seoDescEn: payload.seoDescEn ?? undefined,
        publishedAt: payload.status === ProductStatus.PUBLISHED ? new Date() : null,
        media: {
          create: (payload.media ?? []).map((item) => ({
            type: item.type,
            url: item.url ?? undefined,
            emoji: item.emoji ?? undefined,
            altFa: item.altFa ?? undefined,
            altEn: item.altEn ?? undefined,
            sortOrder: item.sortOrder ?? 0,
          })),
        },
      },
      include: { media: true, category: true },
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'product.create',
      entityType: 'product',
      entityId: product.id,
      diff: payload as Prisma.InputJsonValue,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    revalidatePath('/products');
    revalidatePath('/fa/products');

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('product.create.failed', error);
    return NextResponse.json({ error: 'Unable to create product.' }, { status: 500 });
  }
}
