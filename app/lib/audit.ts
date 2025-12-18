import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

type AuditPayload = {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  diff?: Prisma.InputJsonValue;
  ip?: string | null;
  userAgent?: string | null;
};

export async function recordAuditLog(entry: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        diff: entry.diff ?? undefined,
        ip: entry.ip ?? undefined,
        userAgent: entry.userAgent ?? undefined,
      },
    });
  } catch (error) {
    // Avoid throwing in audit paths; log to stderr for visibility
    // eslint-disable-next-line no-console
    console.error('audit.log.write_failed', error);
  }
}
