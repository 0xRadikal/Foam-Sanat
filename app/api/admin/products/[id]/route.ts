import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ProductStatus, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { recordAuditLog } from '@/app/lib/audit';
import { productSchema } from '@/app/admin/validation';
import { requireSession } from '../../lib/session';
import { slugify } from '@/app/lib/slug';
import { canDeleteProducts, canEditProducts } from '@/app/lib/rbac';
import { enforceRateLimit } from '../../lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { deleteCommentsByProduct } from '@/app/api/comments/lib/store';
import { hardDeleteProduct, isHardDeleteAllowed } from '../lib';

function isUnauthorized(error: unknown): boolean {
  return (error as Error | undefined)?.message === 'UNAUTHORIZED';
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession();
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        media: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('product.detail.failed', error);
    return NextResponse.json({ error: 'Unable to fetch product.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    if (!canEditProducts(session.user?.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const rateLimit = enforceRateLimit(`admin:products:update:${session.user?.id ?? 'unknown'}`);
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
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const slug = payload.slug || slugify(payload.titleEn || payload.titleFa);

    const duplicate = await prisma.product.findFirst({
      where: {
        slug,
        NOT: { id: params.id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }

    const newPublishedAt =
      payload.status === ProductStatus.PUBLISHED
        ? existing.publishedAt ?? new Date()
        : null;

    const product = await prisma.product.update({
      where: { id: params.id },
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
        publishedAt: newPublishedAt,
        media: {
          deleteMany: {},
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
      action: 'product.update',
      entityType: 'product',
      entityId: product.id,
      diff: payload as Prisma.InputJsonValue,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    revalidatePath('/products');
    revalidatePath('/fa/products');

    return NextResponse.json({ data: product });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('product.update.failed', error);
    return NextResponse.json({ error: 'Unable to update product.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const role = session.user?.role as Role;
    if (!canDeleteProducts(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const rateLimit = enforceRateLimit(`admin:products:delete:${session.user?.id ?? 'unknown'}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: rateLimit.retryAfterSeconds ? { 'Retry-After': rateLimit.retryAfterSeconds.toString() } : undefined },
      );
    }

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const hardDeleteRequested = request.nextUrl.searchParams.get('hard') === 'true';
    if (hardDeleteRequested) {
      if (!isHardDeleteAllowed(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const { confirmation } = (await request.json().catch(() => ({}))) as { confirmation?: string };
      if (confirmation !== 'DELETE') {
        return NextResponse.json({ error: 'Confirmation required.' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await hardDeleteProduct(tx, params.id);
      });
      try {
        await deleteCommentsByProduct(params.id);
      } catch (error) {
        console.warn('comments.delete_by_product.failed', error);
      }

      await recordAuditLog({
        actorId: session.user?.id ?? null,
        action: 'product.hard_delete',
        entityType: 'product',
        entityId: params.id,
        diff: { id: params.id },
        ip: request.ip ?? undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
      });

      revalidatePath('/products');
      revalidatePath('/fa/products');
      return new NextResponse(null, { status: 204 });
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), status: ProductStatus.ARCHIVED },
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'product.soft_delete',
      entityType: 'product',
      entityId: params.id,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    revalidatePath('/products');
    revalidatePath('/fa/products');

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('product.delete.failed', error);
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}
