import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { adminSchema } from '@/app/admin/validation';
import { requireSession } from '../../lib/session';
import { canManageAdmins } from '@/app/lib/rbac';
import { recordAuditLog } from '@/app/lib/audit';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    if (!session.user?.role || !canManageAdmins(session.user.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const raw = await request.json();
    const parsed = adminSchema.partial().safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.email) data.email = parsed.data.email;
    if (parsed.data.name) data.name = parsed.data.name;
    if (parsed.data.role) data.role = parsed.data.role;
    if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'admin.update',
      entityType: 'admin',
      entityId: params.id,
      diff: data as Prisma.InputJsonValue,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('admin.update.failed', error);
    return NextResponse.json({ error: 'Unable to update admin.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    if (!session.user?.role || !canManageAdmins(session.user.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'admin.delete',
      entityType: 'admin',
      entityId: params.id,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('admin.delete.failed', error);
    return NextResponse.json({ error: 'Unable to delete admin.' }, { status: 500 });
  }
}
