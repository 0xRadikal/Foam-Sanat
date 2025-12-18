import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ProductStatus, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { recordAuditLog } from '@/app/lib/audit';
import { productSchema } from '@/app/admin/validation';
import { requireSession } from '../../lib/session';
import { slugify } from '@/app/lib/slug';
import { canDeleteProducts, canEditProducts, canHardDelete } from '@/app/lib/rbac';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
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

    const duplicate = await prisma.product.findFirst({
      where: {
        slug,
        NOT: { id: params.id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }

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
        price: payload.price ?? undefined,
        specs: payload.specs as Prisma.InputJsonValue,
        seoTitleFa: payload.seoTitleFa ?? undefined,
        seoTitleEn: payload.seoTitleEn ?? undefined,
        seoDescFa: payload.seoDescFa ?? undefined,
        seoDescEn: payload.seoDescEn ?? undefined,
        publishedAt: payload.status === ProductStatus.PUBLISHED ? new Date() : null,
        deletedAt: payload.deletedAt ?? null,
        images: {
          deleteMany: {},
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
      action: 'product.update',
      entityType: 'product',
      entityId: product.id,
      diff: payload as Prisma.InputJsonValue,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ data: product });
  } catch (error) {
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

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (canHardDelete(role)) {
      await prisma.product.delete({ where: { id: params.id } });
      await recordAuditLog({
        actorId: session.user?.id ?? null,
        action: 'product.hard_delete',
        entityType: 'product',
        entityId: params.id,
        ip: request.ip ?? undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
      });
      return NextResponse.json({ success: true });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('product.delete.failed', error);
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}
