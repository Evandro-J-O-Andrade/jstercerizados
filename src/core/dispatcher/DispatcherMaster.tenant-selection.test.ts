import { describe, expect, it } from 'vitest';
import { DispatcherMaster, type DispatchContext } from './DispatcherMaster';

const baseContext: DispatchContext = {
  correlationId: 'correlation-1',
  personId: 'person-1',
  tenantId: null,
  roleIds: ['role-tenant-admin'],
  permissionKeys: [],
  effectivePermissions: [],
  isAdminMaster: false,
};

describe('DispatcherMaster tenant context routing', () => {
  const dispatcher = new DispatcherMaster();

  it('requires an explicit tenant before routing an active membership', () => {
    expect(
      dispatcher.resolveDestination(baseContext, true, false, true, true, {
        roleNames: ['tenant_admin'],
      }),
    ).toBe('/selecionar-tenant');
  });

  it('routes to the tenant cell after the tenant is validated', () => {
    expect(
      dispatcher.resolveDestination(
        { ...baseContext, tenantId: 'tenant-1' },
        true,
        false,
        true,
        true,
        { roleNames: ['tenant_admin'] },
      ),
    ).toBe('/dashboard/admin-tenant');
  });

  it('allows a verified global admin to dispatch without selecting a tenant', () => {
    const globalContext: DispatchContext = {
      ...baseContext,
      roleIds: ['global-admin-role'],
      permissionKeys: ['tenants.read'],
      effectivePermissions: [
        {
          id: 'permission-tenants-read',
          name: 'tenants.read',
          module: 'tenants',
          created_at: '2026-11-01T00:00:00.000Z',
        },
      ],
      isAdminMaster: true,
    };

    expect(() =>
      dispatcher.dispatch(
        {
          type: 'tenant.read',
          payload: null,
          metadata: {
            tenantId: 'tenant-2',
            requiredPermissionKey: 'tenants.read',
          },
        },
        globalContext,
      ),
    ).not.toThrow();
  });

  it('denies a tenant-scoped dispatch when no tenant was explicitly selected', () => {
    const tenantContext: DispatchContext = {
      ...baseContext,
      roleIds: ['tenant-role'],
      permissionKeys: ['tenants.read'],
      effectivePermissions: [
        {
          id: 'permission-tenants-read',
          name: 'tenants.read',
          module: 'tenants',
          created_at: '2026-11-01T00:00:00.000Z',
        },
      ],
    };

    expect(() =>
      dispatcher.dispatch(
        {
          type: 'tenant.read',
          payload: null,
          metadata: {
            tenantId: 'tenant-2',
            requiredPermissionKey: 'tenants.read',
          },
        },
        tenantContext,
      ),
    ).toThrow();
  });
});
