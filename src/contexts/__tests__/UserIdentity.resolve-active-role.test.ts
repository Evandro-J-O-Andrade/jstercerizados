import { describe, it, expect, vi } from 'vitest';
import { deriveUserIdentity, type UserIdentity } from '@/contexts/UserIdentity';
import type {
  Role,
  RoleAssignment,
  Permission,
  Person,
  TenantMembership,
} from '@/types/auth';

function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: 'role-1',
    name: 'tenant_admin',
    slug: 'tenant_admin',
    scope: 'tenant',
    is_global: false,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

function makeAssignment(
  overrides: Partial<RoleAssignment> = {},
): RoleAssignment {
  return {
    id: 'assignment-1',
    role_id: 'role-1',
    person_id: 'person-1',
    tenant_id: 'tenant-1',
    created_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: 'person-1',
    auth_user_id: 'auth-1',
    full_name: 'Maria Souza',
    email: 'maria@test.com',
    status: 'active',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

function makeTenantMembership(
  overrides: Partial<TenantMembership> = {},
): TenantMembership {
  return {
    id: 'm1',
    person_id: 'person-1',
    tenant_id: 'tenant-1',
    membership_role: 'role-1',
    status: 'active',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

describe('UserIdentity - resolveActiveRole sem fallback admin_master', () => {
  it('1. Usuário sem role assignment válida: papel é null, sem admin_master por fallback', () => {
    const person = makePerson();
    const roles: Role[] = [
      makeRole({ name: 'admin_master', scope: 'global', is_global: true }),
    ];
    const roleAssignments: RoleAssignment[] = [];
    const memberships: TenantMembership[] = [makeTenantMembership()];
    const permissions: Permission[] = [];

    const identity: UserIdentity = deriveUserIdentity(
      person,
      roles,
      null,
      [{ id: 'tenant-1', name: 'Tenant Teste' }],
      memberships,
      roleAssignments,
      permissions,
      false,
      false,
      false,
      null,
      [],
    );

    expect(identity.role).toBeNull();
    expect(identity.roleLabel).toBe('Usuário');
    expect(identity.isAdminMaster).toBe(false);
    expect(identity.roleScope).toBe('tenant');
  });

  it('2. Usuário com role assignment tenant_admin válida: papel resolvido, sem admin_master', () => {
    const person = makePerson();
    const roles: Role[] = [
      makeRole({ name: 'tenant_admin', scope: 'tenant', is_global: false }),
    ];
    const roleAssignments: RoleAssignment[] = [
      makeAssignment({ tenant_id: 'tenant-1' }),
    ];
    const memberships: TenantMembership[] = [makeTenantMembership()];
    const permissions: Permission[] = [];

    const identity: UserIdentity = deriveUserIdentity(
      person,
      roles,
      'tenant-1',
      [{ id: 'tenant-1', name: 'Tenant Teste' }],
      memberships,
      roleAssignments,
      permissions,
      false,
      false,
      false,
      null,
      [],
    );

    expect(identity.role).not.toBeNull();
    expect(identity.role?.name).toBe('tenant_admin');
    expect(identity.isAdminMaster).toBe(false);
    expect(identity.roleScope).toBe('tenant');
  });

  it('3. admin_master legítimo comprovado pelo banco: papel resolvido com is_global true', () => {
    const person = makePerson();
    const roles: Role[] = [
      makeRole({ name: 'admin_master', scope: 'global', is_global: true }),
    ];
    const roleAssignments: RoleAssignment[] = [
      makeAssignment({ tenant_id: null }),
    ];
    const memberships: TenantMembership[] = [makeTenantMembership()];
    const permissions: Permission[] = [];

    const identity: UserIdentity = deriveUserIdentity(
      person,
      roles,
      null,
      [],
      memberships,
      roleAssignments,
      permissions,
      true,
      false,
      false,
      null,
      [],
    );

    expect(identity.role).not.toBeNull();
    expect(identity.role?.name).toBe('admin_master');
    expect(identity.isAdminMaster).toBe(true);
    expect(identity.roleScope).toBe('global');
  });

  it('4. Usuário com múltiplos memberships mas sem role assignment: sem papel administrativo', () => {
    const person = makePerson();
    const roles: Role[] = [
      makeRole({ name: 'viewer', scope: 'tenant', is_global: false }),
    ];
    const roleAssignments: RoleAssignment[] = [];
    const memberships: TenantMembership[] = [
      makeTenantMembership({ tenant_id: 'tenant-1' }),
      makeTenantMembership({ id: 'm2', tenant_id: 'tenant-2' }),
    ];
    const permissions: Permission[] = [];

    const identity: UserIdentity = deriveUserIdentity(
      person,
      roles,
      null,
      [
        { id: 'tenant-1', name: 'Tenant 1' },
        { id: 'tenant-2', name: 'Tenant 2' },
      ],
      memberships,
      roleAssignments,
      permissions,
      false,
      false,
      false,
      null,
      [],
    );

    expect(identity.role).toBeNull();
    expect(identity.isAdminMaster).toBe(false);
  });
});
