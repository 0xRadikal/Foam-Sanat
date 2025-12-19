import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ProductStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { requireSession } from '../../lib/session';
import { recordAuditLog } from '@/app/lib/audit';
import { canDeleteProducts, canPublish } from '@/app/lib/rbac';
import { enforceRateLimit } from '../../lib/rate-limit';
import { deleteCommentsByProduct } from '@/app/api/comments/lib/store';
import { hardDeleteProduct, isHardDeleteAllowed } from '../lib';
import { revalidatePath } from 'next/cache';

const bulkSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'delete', 'hard_delete']),
  ids: z.array(z.string().uuid()).min(1),
  confirmation: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const role = session.user?.role as Role;
    const rateLimit = enforceRateLimit(`admin:products:bulk:${session.user?.id ?? 'unknown'}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: rateLimit.retryAfterSeconds ? { 'Retry-After': rateLimit.retryAfterSeconds.toString() } : undefined },
      );
    }

    const parsed = bulkSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { action, ids, confirmation } = parsed.data;

    if ((action === 'publish' || action === 'unpublish') && !canPublish(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if ((action === 'delete' || action === 'hard_delete') && !canDeleteProducts(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'hard_delete') {
      if (!isHardDeleteAllowed(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (confirmation !== 'DELETE') {
        return NextResponse.json({ error: 'Confirmation required.' }, { status: 400 });
      }
    }

    let affected = 0;

    if (action === 'publish') {
      const result = await prisma.product.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { status: ProductStatus.PUBLISHED, publishedAt: new Date() },
      });
      affected = result.count;
    } else if (action === 'unpublish') {
      const result = await prisma.product.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { status: ProductStatus.DRAFT, publishedAt: null },
      });
      affected = result.count;
    } else if (action === 'delete') {
      const result = await prisma.product.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { status: ProductStatus.ARCHIVED, deletedAt: new Date() },
      });
      affected = result.count;
    } else if (action === 'hard_delete') {
      await prisma.$transaction(async (tx) => {
        for (const id of ids) {
          await hardDeleteProduct(tx, id);
        }
      });
      for (const id of ids) {
        try {
          await deleteCommentsByProduct(id);
        } catch (error) {
          console.warn('comments.delete_by_product.failed', error);
        }
      }
      affected = ids.length;
    }

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: `product.bulk.${action}`,
      entityType: 'product',
      entityId: null,
      diff: { ids, affected } as Prisma.InputJsonValue,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    revalidatePath('/products');
    revalidatePath('/fa/products');

    return NextResponse.json({ success: true, affected });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('product.bulk.failed', error);
    return NextResponse.json({ error: 'Unable to perform bulk action.' }, { status: 500 });
  }
}
