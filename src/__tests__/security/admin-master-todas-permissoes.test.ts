import { describe, expect, it } from 'vitest';
import { computeEffectivePermissions } from '@/core/authorization/AuthorizationContract';
import type { Permission, Role, RolePermission } from '@/types/auth';

const adminMasterRole: Role = {
  id: 'role-admin-master',
  name: 'admin_master',
  slug: 'admin_master',
  scope: 'global',
  is_global: true,
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
};

const permissionRecords: Permission[] = [
  {
    id: 'permission-tenants-read',
    name: 'tenants.read',
    module: 'tenants',
    created_at: '2026-11-01T00:00:00.000Z',
  },
  {
    id: 'permission-people-read',
    name: 'people.read',
    module: 'people',
    created_at: '2026-11-01T00:00:00.000Z',
  },
  {
    id: 'permission-audit-read',
    name: 'audit.read',
    module: 'audit',
    created_at: '2026-11-01T00:00:00.000Z',
  },
];

describe('Admin Master permission resolution', () => {
  it('uses only permissions linked to the verified role in the database', () => {
    const rolePermissionRows: RolePermission[] = [
      { role_id: adminMasterRole.id, permission_id: 'permission-tenants-read' },
      { role_id: adminMasterRole.id, permission_id: 'permission-people-read' },
    ];

    const effectivePermissions = computeEffectivePermissions(
      [adminMasterRole],
      rolePermissionRows,
      permissionRecords,
      true,
    );

    expect(effectivePermissions.map((permission) => permission.name)).toEqual([
      'tenants.read',
      'people.read',
    ]);
    expect(effectivePermissions).not.toContainEqual(
      expect.objectContaining({ name: 'audit.read' }),
    );
  });
});
