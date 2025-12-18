import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { categorySchema } from '@/app/admin/validation';
import { requireSession } from '../lib/session';
import { recordAuditLog } from '@/app/lib/audit';
import { slugify } from '@/app/lib/slug';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { nameFa: 'asc' },
    });
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('category.list.failed', error);
    return NextResponse.json({ error: 'Unable to load categories.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const raw = await request.json();
    const parsed = categorySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payload = parsed.data;
    const slug = payload.slug || slugify(payload.nameEn);
    const existing = await prisma.category.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        slug,
        nameFa: payload.nameFa,
        nameEn: payload.nameEn,
      },
    });

    await recordAuditLog({
      actorId: session.user?.id ?? null,
      action: 'category.create',
      entityType: 'category',
      entityId: category.id,
      diff: payload,
      ip: request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error('category.create.failed', error);
    return NextResponse.json({ error: 'Unable to create category.' }, { status: 500 });
  }
}
