import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ProductStatus, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { recordAuditLog } from '@/app/lib/audit';
import { productSchema } from '@/app/admin/validation';
import { requireSession } from '../lib/session';
import { slugify } from '@/app/lib/slug';
import { canEditProducts } from '@/app/lib/rbac';

const DEFAULT_PAGE_SIZE = 10;

function parsePagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? DEFAULT_PAGE_SIZE);
  return {
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: Number.isNaN(pageSize) || pageSize < 1 ? DEFAULT_PAGE_SIZE : Math.min(pageSize, 50),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const search = request.nextUrl.searchParams.get('q') ?? '';
    const status = request.nextUrl.searchParams.get('status') as ProductStatus | null;
    const categoryId = request.nextUrl.searchParams.get('categoryId');
    const { page, pageSize } = parsePagination(request.nextUrl.searchParams);

    const where = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { titleFa: { contains: search, mode: 'insensitive' as const } },
              { titleEn: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
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

    const raw = await request.json();
    const parsed = productSchema.safeParse({
      ...raw,
      slug: raw.slug || undefined,
      price: raw.price ? Number(raw.price) : undefined,
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
        price: payload.price ?? undefined,
        specs: payload.specs as Prisma.InputJsonValue,
        seoTitleFa: payload.seoTitleFa ?? undefined,
        seoTitleEn: payload.seoTitleEn ?? undefined,
        seoDescFa: payload.seoDescFa ?? undefined,
        seoDescEn: payload.seoDescEn ?? undefined,
        publishedAt: payload.status === ProductStatus.PUBLISHED ? new Date() : null,
        images: {
          create: payload.images?.map((img) => ({
            url: img.url,
            altFa: img.altFa ?? undefined,
            altEn: img.altEn ?? undefined,
            sortOrder: img.sortOrder ?? 0,
          })),
        },
      },
      include: { images: true, category: true },
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

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('product.create.failed', error);
    return NextResponse.json({ error: 'Unable to create product.' }, { status: 500 });
  }
}
