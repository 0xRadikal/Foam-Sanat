import { Role } from '@prisma/client';

export function canManageAdmins(role: Role): boolean {
  return role === Role.SUPERADMIN;
}

export function canHardDelete(role: Role): boolean {
  return role === Role.SUPERADMIN;
}

export function canPublish(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPERADMIN;
}

export function canEditProducts(role: Role): boolean {
  return role === Role.EDITOR || role === Role.ADMIN || role === Role.SUPERADMIN;
}

export function canDeleteProducts(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPERADMIN;
}

export function canReply(role: Role): boolean {
  return role === Role.EDITOR || role === Role.ADMIN || role === Role.SUPERADMIN;
}
