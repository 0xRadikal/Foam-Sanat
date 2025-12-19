import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '../../lib/session';
import { Role } from '@prisma/client';
import { canModerateComments } from '@/app/lib/rbac';
import { updateCommentsEnabled, getSiteSettings } from '@/app/lib/settings';
import { recordAuditLog } from '@/app/lib/audit';
import { enforceRateLimit } from '../../lib/rate-limit';
import { revalidatePath } from 'next/cache';

const updateSchema = z.object({
  commentsEnabled: z.boolean(),
});

export async function GET() {
  try {
    const session = await requireSession();
    if (!canModerateComments(session.user?.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await getSiteSettings();
    return NextResponse.json({ data: settings });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('settings.comments.fetch_failed', error);
    return NextResponse.json({ error: 'Unable to load settings.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canModerateComments(session.user?.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rateLimit = enforceRateLimit(`admin:settings:comments:${session.user?.id ?? 'unknown'}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: rateLimit.retryAfterSeconds ? { 'Retry-After': rateLimit.retryAfterSeconds.toString() } : undefined },
      );
    }

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const settings = await updateCommentsEnabled(parsed.data.commentsEnabled);
    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'settings.comments.update',
      entityType: 'settings',
      entityId: settings.id,
      diff: parsed.data,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    revalidatePath('/products');
    revalidatePath('/fa/products');

    return NextResponse.json({ data: settings });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('settings.comments.update_failed', error);
    return NextResponse.json({ error: 'Unable to update settings.' }, { status: 500 });
  }
}
