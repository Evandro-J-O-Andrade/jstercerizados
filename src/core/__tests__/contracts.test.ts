/**
 * Core contracts test suite — isolated unit tests for each contract.
 * These tests verify contract behavior WITHOUT integrating into the app.
 * Source: c8ce3ee (agent baseline checkpoint)
 */

import { describe, it, expect } from 'vitest';
import {
  computeEffectivePermissions,
  decidePermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../authorization/AuthorizationContract';
import {
  validateTenantContext,
  assertTenantMatch,
} from '../tenancy/TenantContract';
import {
  validateExecutionContext,
  generateCorrelationId,
  buildExecutionContext,
  assertValidContext,
} from '../execution/ExecutionContract';
import {
  validatePersonLink,
  resolveActiveTenant,
  buildIdentityContext,
  canExecuteBusinessOperation,
} from '../identity/IdentityContract';
import {
  CellRegistry,
  cellRegistry,
} from '../registry/CellRegistryContract';
import type {
  Permission,
  Role,
  RolePermission,
  Person,
  AuthUser,
  TenantMembership,
  UUID,
  IdentityContext,
} from '../types';

describe('AuthorizationContract', () => {
  const mockRoles: Role[] = [
    { id: 'role-1', name: 'admin', scope: 'tenant', level: 10 },
    { id: 'role-2', name: 'viewer', scope: 'tenant', level: 1 },
  ];

  const mockRolePermissions: RolePermission[] = [
    { role_id: 'role-1', permission_id: 'jobs.read' },
    { role_id: 'role-1', permission_id: 'jobs.write' },
    { role_id: 'role-2', permission_id: 'jobs.read' },
  ];

  const mockPermissions: Permission[] = [
    { resource: 'jobs', action: 'read', granted: true, scope: 'tenant' },
    { resource: 'jobs', action: 'write', granted: true, scope: 'tenant' },
  ];

  it('computes effective permissions from role chain', () => {
    const effective = computeEffectivePermissions(
      mockRoles,
      mockRolePermissions,
      mockPermissions,
      false,
    );
    expect(effective).toHaveLength(2);
    expect(effective.find((p) => p.resource === 'jobs' && p.action === 'read')).toBeDefined();
    expect(effective.find((p) => p.resource === 'jobs' && p.action === 'write')).toBeDefined();
  });

  it('does not duplicate permissions', () => {
    const dupRolePermissions: RolePermission[] = [
      { role_id: 'role-1', permission_id: 'jobs.read' },
      { role_id: 'role-2', permission_id: 'jobs.read' },
    ];
    const effective = computeEffectivePermissions(
      mockRoles,
      dupRolePermissions,
      mockPermissions,
      false,
    );
    expect(effective).toHaveLength(1);
  });

  it('decides permission: granted when present', () => {
    const effective = computeEffectivePermissions(
      mockRoles,
      mockRolePermissions,
      mockPermissions,
      false,
    );
    const decision = decidePermission(effective, 'jobs', 'read');
    expect(decision.granted).toBe(true);
  });

  it('decides permission: denied when absent', () => {
    const effective = computeEffectivePermissions(
      mockRoles,
      mockRolePermissions,
      mockPermissions,
      false,
    );
    const decision = decidePermission(effective, 'jobs', 'delete');
    expect(decision.granted).toBe(false);
    expect(decision.reason).toContain('not granted');
  });

  it('hasAnyPermission returns true if any required permission granted', () => {
    const effective = computeEffectivePermissions(
      mockRoles,
      mockRolePermissions,
      mockPermissions,
      false,
    );
    expect(hasAnyPermission(effective, ['jobs.read', 'jobs.delete'])).toBe(true);
  });

  it('hasAnyPermission returns false if none granted', () => {
    const effective = computeEffectivePermissions(
      mockRoles,
      mockRolePermissions,
      mockPermissions,
      false,
    );
    expect(hasAnyPermission(effective, ['jobs.delete', 'users.write'])).toBe(false);
  });

  it('hasAllPermissions returns true only if all granted', () => {
    const effective = computeEffectivePermissions(
      mockRoles,
      mockRolePermissions,
      mockPermissions,
      false,
    );
    expect(hasAllPermissions(effective, ['jobs.read', 'jobs.write'])).toBe(true);
    expect(hasAllPermissions(effective, ['jobs.read', 'jobs.delete'])).toBe(false);
  });

  it('empty required permissions returns true (no restrictions)', () => {
    const effective = computeEffectivePermissions(
      mockRoles,
      mockRolePermissions,
      mockPermissions,
      false,
    );
    expect(hasAnyPermission(effective, [])).toBe(true);
    expect(hasAllPermissions(effective, [])).toBe(true);
  });
});

describe('TenantContract', () => {
  const mockPerson: Person = {
    id: 'person-1',
    auth_user_id: 'auth-1',
    full_name: 'Test User',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockMemberships: TenantMembership[] = [
    {
      id: 'm-1',
      tenant_id: 'tenant-a',
      person_id: 'person-1',
      role_id: 'role-1',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'm-2',
      tenant_id: 'tenant-b',
      person_id: 'person-1',
      role_id: 'role-2',
      status: 'inactive',
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  it('validates active tenant membership', () => {
    const result = validateTenantContext(mockPerson, mockMemberships, 'tenant-a');
    expect(result.isValid).toBe(true);
    expect(result.membership?.tenant_id).toBe('tenant-a');
  });

  it('rejects inactive tenant membership', () => {
    const result = validateTenantContext(mockPerson, mockMemberships, 'tenant-b');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('not an active membership');
  });

  it('rejects unknown tenant', () => {
    const result = validateTenantContext(mockPerson, mockMemberships, 'tenant-c');
    expect(result.isValid).toBe(false);
  });

  it('rejects when no person', () => {
    const result = validateTenantContext(null, mockMemberships, 'tenant-a');
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('No person record');
  });

  it('rejects when no tenantId provided', () => {
    const result = validateTenantContext(mockPerson, mockMemberships, null);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('No tenantId provided');
  });

  it('assertTenantMatch throws on mismatch', () => {
    expect(() => assertTenantMatch('tenant-a', 'tenant-b')).toThrow('Tenant mismatch');
  });

  it('assertTenantMatch throws on missing context', () => {
    expect(() => assertTenantMatch(null, 'tenant-a')).toThrow('No tenant context');
  });

  it('assertTenantMatch throws on missing request', () => {
    expect(() => assertTenantMatch('tenant-a', null)).toThrow('No tenantId in request');
  });
});

describe('ExecutionContract', () => {
  it('validates complete context', () => {
    const ctx = {
      tenantId: 't-1',
      userId: 'u-1',
      routeId: 'route-1',
      moduleId: 'mod-1',
      action: 'read',
      correlationId: 'corr-1',
    };
    const result = validateExecutionContext(ctx);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails validation when fields missing', () => {
    const ctx = { tenantId: 't-1' };
    const result = validateExecutionContext(ctx);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('generates unique correlation IDs', () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^corr_[a-z0-9]+_[a-z0-9]+$/);
  });

  it('builds execution context with correlation ID', () => {
    const ctx = buildExecutionContext('t-1', 'u-1', 'route-1', 'mod-1', 'read', 'res-1');
    expect(ctx.tenantId).toBe('t-1');
    expect(ctx.userId).toBe('u-1');
    expect(ctx.correlationId).toMatch(/^corr_/);
  });

  it('assertValidContext throws on invalid', () => {
    expect(() => assertValidContext({ tenantId: 't-1' })).toThrow('Invalid execution context');
  });
});

describe('IdentityContract', () => {
  const mockAuthUser: AuthUser = { id: 'auth-1', email: 'test@example.com' };
  const mockPerson: Person = {
    id: 'person-1',
    auth_user_id: 'auth-1',
    full_name: 'Test User',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockMemberships: TenantMembership[] = [
    {
      id: 'm-1',
      tenant_id: 'tenant-a',
      person_id: 'person-1',
      role_id: 'role-1',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  it('validatePersonLink succeeds when linked', () => {
    const result = validatePersonLink(mockAuthUser, mockPerson);
    expect(result.valid).toBe(true);
  });

  it('validatePersonLink fails when no auth user', () => {
    const result = validatePersonLink(null, mockPerson);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('No authenticated user');
  });

  it('validatePersonLink fails when no person', () => {
    const result = validatePersonLink(mockAuthUser, null);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('No person record linked to auth user');
  });

  it('validatePersonLink fails when auth_user_id mismatch', () => {
    const wrongPerson: Person = { ...mockPerson, auth_user_id: 'auth-2' };
    const result = validatePersonLink(mockAuthUser, wrongPerson);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('does not match');
  });

  it('resolveActiveTenant returns requested tenant if active', () => {
    const result = resolveActiveTenant(mockMemberships, 'tenant-a');
    expect(result.tenantId).toBe('tenant-a');
    expect(result.membership).toBeDefined();
  });

  it('resolveActiveTenant rejects inactive tenant', () => {
    const inactive: TenantMembership[] = [{ ...mockMemberships[0], status: 'inactive' }];
    const result = resolveActiveTenant(inactive, 'tenant-a');
    expect(result.tenantId).toBeNull();
  });

  it('resolveActiveTenant returns first active when no request', () => {
    const result = resolveActiveTenant(mockMemberships);
    expect(result.tenantId).toBe('tenant-a');
  });

  it('buildIdentityContext constructs full context', () => {
    const identity = buildIdentityContext(mockAuthUser, mockPerson, mockMemberships, 'tenant-a');
    expect(identity.authUser).toEqual(mockAuthUser);
    expect(identity.person).toEqual(mockPerson);
    expect(identity.currentTenantId).toBe('tenant-a');
    expect(identity.isAuthenticated).toBe(true);
    expect(identity.isLoading).toBe(false);
  });

  it('canExecuteBusinessOperation requires auth + person + tenant', () => {
    const identity: IdentityContext = {
      authUser: mockAuthUser,
      person: mockPerson,
      memberships: mockMemberships,
      currentTenantId: 'tenant-a',
      availableTenants: [{ id: 'tenant-a', name: 'Tenant A' }],
      isAuthenticated: true,
      isLoading: false,
    };
    expect(canExecuteBusinessOperation(identity).canProceed).toBe(true);
  });

  it('canExecuteBusinessOperation fails without auth', () => {
    const identity: IdentityContext = {
      authUser: null,
      person: mockPerson,
      memberships: mockMemberships,
      currentTenantId: 'tenant-a',
      availableTenants: [{ id: 'tenant-a', name: 'Tenant A' }],
      isAuthenticated: false,
      isLoading: false,
    };
    expect(canExecuteBusinessOperation(identity).canProceed).toBe(false);
  });

  it('canExecuteBusinessOperation fails without person', () => {
    const identity: IdentityContext = {
      authUser: mockAuthUser,
      person: null,
      memberships: mockMemberships,
      currentTenantId: 'tenant-a',
      availableTenants: [{ id: 'tenant-a', name: 'Tenant A' }],
      isAuthenticated: true,
      isLoading: false,
    };
    expect(canExecuteBusinessOperation(identity).canProceed).toBe(false);
  });

  it('canExecuteBusinessOperation fails without tenant', () => {
    const identity: IdentityContext = {
      authUser: mockAuthUser,
      person: mockPerson,
      memberships: mockMemberships,
      currentTenantId: null,
      availableTenants: [],
      isAuthenticated: true,
      isLoading: false,
    };
    expect(canExecuteBusinessOperation(identity).canProceed).toBe(false);
  });
});

describe('CellRegistryContract', () => {
  const mockCell = {
    id: 'financeiro/contas-pagar',
    name: 'Contas a Pagar',
    version: '1.0.0',
    enabled: true,
    routes: [{ path: '/financeiro/contas-pagar', element: 'ContasPagar' }],
    requiredPermissions: ['financeiro.contas-pagar.read'],
    dependencies: ['financeiro/bancos'],
    tables: ['accounts_payable'],
  };

  let registry: CellRegistry;

  beforeEach(() => {
    registry = new CellRegistry();
  });

  it('registers and retrieves a cell', () => {
    registry.register(mockCell);
    const entry = registry.get('financeiro/contas-pagar');
    expect(entry).toBeDefined();
    expect(entry?.cell.name).toBe('Contas a Pagar');
  });

  it('warns on overwrite', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registry.register(mockCell);
    registry.register({ ...mockCell, name: 'Updated' });
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('already registered'),
    );
    consoleWarn.mockRestore();
  });

  it('unregisters a cell', () => {
    registry.register(mockCell);
    expect(registry.unregister('financeiro/contas-pagar')).toBe(true);
    expect(registry.has('financeiro/contas-pagar')).toBe(false);
  });

  it('returns only enabled cells', () => {
    const disabledCell = { ...mockCell, id: 'financeiro/bancos', enabled: false };
    registry.register(mockCell);
    registry.register(disabledCell);
    expect(registry.getEnabled()).toHaveLength(1);
  });

  it('filters by module prefix', () => {
    registry.register(mockCell);
    registry.register({ ...mockCell, id: 'financeiro/centros-custo', name: 'Centros' });
    registry.register({ ...mockCell, id: 'recrutamento/vagas', name: 'Vagas' });
    expect(registry.getByModule('financeiro')).toHaveLength(2);
  });

  it('provides stats', () => {
    registry.register(mockCell);
    registry.register({ ...mockCell, id: 'financeiro/bancos', enabled: false });
    const stats = registry.stats();
    expect(stats.total).toBe(2);
    expect(stats.enabled).toBe(1);
    expect(stats.disabled).toBe(1);
    expect(stats.byModule.financeiro).toBe(2);
  });

  it('singleton instance exists', () => {
    expect(cellRegistry).toBeInstanceOf(CellRegistry);
  });
});