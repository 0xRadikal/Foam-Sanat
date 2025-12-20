import { Role } from '@prisma/client';

const roleRank: Record<Role, number> = {
  [Role.EDITOR]: 1,
  [Role.ADMIN]: 2,
  [Role.SUPERADMIN]: 3,
};

export function isRoleAtLeast(role: Role | null | undefined, minimum?: Role | null): boolean {
  if (!minimum) return true;
  if (!role) return false;
  return roleRank[role] >= roleRank[minimum];
}

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

export function canModerateComments(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPERADMIN;
}
