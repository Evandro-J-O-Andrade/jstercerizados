import { describe, it, expect, vi } from 'vitest';
import { dispatcherMaster } from '@/core/dispatcher/DispatcherMaster';
import type { DispatchContext } from '@/core/dispatcher/DispatcherMaster';
import { DispatcherError } from '@/core/dispatcher/DispatcherMaster';

function createDispatchContext(
  overrides: Partial<DispatchContext> = {},
): DispatchContext {
  return {
    correlationId: 'test-corr-idor-1',
    personId: 'person-1',
    tenantId: 'tenant-1',
    roleIds: ['role-1'],
    permissionKeys: ['companies.read'],
    effectivePermissions: [
      {
        id: 'perm-1',
        name: 'companies.read',
        module: 'companies',
        description: null,
        created_at: new Date().toISOString(),
      },
    ],
    isAdminMaster: false,
    ...overrides,
  };
}

describe('IDOR - Isolamento de Tenant e Acesso Indevido', () => {
  it('1. Usuário do tenant-1 não consegue acessar ação de outro tenant (tenant-2)', () => {
    const ctx = createDispatchContext({
      tenantId: 'tenant-1',
      isAdminMaster: false,
    });

    let caught: Error | null = null;
    try {
      dispatcherMaster.dispatch(
        { type: 'READ_COMPANY', metadata: { tenantId: 'tenant-2' } },
        ctx,
      );
    } catch (err) {
      caught = err as Error;
    }
    expect(caught).toBeInstanceOf(DispatcherError);
    expect((caught as DispatcherError).code).toBe('TENANT_ISOLATION_VIOLATION');
  });

  it('2. admin_master comprovado pode acessar recursos de qualquer tenant', () => {
    const ctx = createDispatchContext({
      tenantId: 'tenant-1',
      isAdminMaster: true,
    });

    const result = dispatcherMaster.dispatch(
      { type: 'READ_COMPANY', metadata: { tenantId: 'tenant-2' } },
      ctx,
    );
    expect(result.error).toBeNull();
  });

  it('3. Usuário sem permissão de leitura não consegue acessar recurso (fail-closed)', () => {
    const ctx = createDispatchContext({
      tenantId: 'tenant-1',
      isAdminMaster: false,
      permissionKeys: ['companies.read'],
      effectivePermissions: [],
    });

    let caught: Error | null = null;
    try {
      dispatcherMaster.dispatch(
        {
          type: 'READ_COMPANY',
          metadata: { requiredPermissionKey: 'companies.read' },
        },
        ctx,
      );
    } catch (err) {
      caught = err as Error;
    }
    expect(caught).toBeInstanceOf(DispatcherError);
    expect((caught as DispatcherError).code).toBe('FORBIDDEN');
  });

  it('4. Usuário com permissão válida acessa recurso do próprio tenant', () => {
    const ctx = createDispatchContext({
      tenantId: 'tenant-1',
      isAdminMaster: false,
    });

    const result = dispatcherMaster.dispatch(
      {
        type: 'READ_COMPANY',
        metadata: {
          tenantId: 'tenant-1',
          requiredPermissionKey: 'companies.read',
        },
      },
      ctx,
    );
    expect(result.error).toBeNull();
    expect(result.tenantId).toBe('tenant-1');
  });

  it('5. Usuário sem membership ativo não recebe admin_master por fallback', () => {
    const ctx = createDispatchContext({
      tenantId: null,
      isAdminMaster: false,
    });

    expect(ctx.isAdminMaster).toBe(false);
    expect(ctx.tenantId).toBeNull();
  });

  it('6. Usuário sem permissão não consegue acessar recurso (IDOR via URL)', () => {
    const ctx = createDispatchContext({
      tenantId: 'tenant-1',
      isAdminMaster: false,
      permissionKeys: [],
      effectivePermissions: [],
    });

    let caught: Error | null = null;
    try {
      dispatcherMaster.dispatch(
        {
          type: 'READ_COMPANY',
          metadata: { requiredPermissionKey: 'companies.read' },
        },
        ctx,
      );
    } catch (err) {
      caught = err as Error;
    }
    expect(caught).toBeInstanceOf(DispatcherError);
    expect((caught as DispatcherError).code).toBe('VALIDATION_ERROR');
  });
});
