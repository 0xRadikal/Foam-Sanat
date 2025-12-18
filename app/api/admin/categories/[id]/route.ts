import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { categorySchema } from '@/app/admin/validation';
import { requireSession } from '../../lib/session';
import { recordAuditLog } from '@/app/lib/audit';
import { slugify } from '@/app/lib/slug';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const raw = await request.json();
    const parsed = categorySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payload = parsed.data;
    const slug = payload.slug || slugify(payload.nameEn);
    const duplicate = await prisma.category.findFirst({
      where: { slug, NOT: { id: params.id } },
    });
    if (duplicate) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        slug,
        nameFa: payload.nameFa,
        nameEn: payload.nameEn,
      },
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'category.update',
      entityType: 'category',
      entityId: category.id,
      diff: payload,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update category.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    await prisma.category.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'category.delete',
      entityType: 'category',
      entityId: params.id,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to delete category.' }, { status: 500 });
  }
}
