import { describe, expect, it } from 'vitest';
import { Role } from '@prisma/client';
import {
  canDeleteProducts,
  canEditProducts,
  canHardDelete,
  canManageAdmins,
  canModerateComments,
} from './rbac';

describe('rbac', () => {
  it('allows editors to edit but not delete products', () => {
    expect(canEditProducts(Role.EDITOR)).toBe(true);
    expect(canDeleteProducts(Role.EDITOR)).toBe(false);
  });

  it('allows admins to delete softly but not hard delete', () => {
    expect(canDeleteProducts(Role.ADMIN)).toBe(true);
    expect(canHardDelete(Role.ADMIN)).toBe(false);
  });

  it('only superadmins can manage admins and hard delete', () => {
    expect(canManageAdmins(Role.SUPERADMIN)).toBe(true);
    expect(canHardDelete(Role.SUPERADMIN)).toBe(true);
  });

  it('only admins can moderate comments', () => {
    expect(canModerateComments(Role.EDITOR)).toBe(false);
    expect(canModerateComments(Role.ADMIN)).toBe(true);
    expect(canModerateComments(Role.SUPERADMIN)).toBe(true);
  });
});
