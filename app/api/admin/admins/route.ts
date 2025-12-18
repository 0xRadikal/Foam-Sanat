import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { adminSchema } from '@/app/admin/validation';
import { requireSession } from '../lib/session';
import { canManageAdmins } from '@/app/lib/rbac';
import { recordAuditLog } from '@/app/lib/audit';

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ data: admins });
  } catch (error) {
    console.error('admin.list.failed', error);
    return NextResponse.json({ error: 'Unable to load admins.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!session.user?.role || !canManageAdmins(session.user.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const raw = await request.json();
    const parsed = adminSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, name, password, role } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'admin.create',
      entityType: 'admin',
      entityId: user.id,
      diff: { email, role },
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error('admin.create.failed', error);
    return NextResponse.json({ error: 'Unable to create admin.' }, { status: 500 });
  }
}
