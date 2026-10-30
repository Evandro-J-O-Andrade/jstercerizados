import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { usePermissionCheck } from '../index';

const mockUseAuth = vi.mocked(useAuth);

function renderUsePermissionCheck(permissions: any[]) {
  mockUseAuth.mockReturnValue({
    permissions,
    isLoading: false,
  } as any);
  return usePermissionCheck();
}

describe('usePermissionCheck — fail-closed (Fase D.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nega acesso quando a chave de permissão está vazia', () => {
    const { checkPermission } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermission('')).toBe(false);
  });

  it('nega acesso quando a chave de permissão é undefined', () => {
    const { checkPermission } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermission(undefined as any)).toBe(false);
  });

  it('nega acesso quando a lista de permissões está vazia (modo any)', () => {
    const { checkPermissions } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermissions([])).toBe(false);
  });

  it('nega acesso quando a lista de permissões é undefined (modo any)', () => {
    const { checkPermissions } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermissions(undefined as any)).toBe(false);
  });

  it('nega acesso quando a lista de permissões está vazia (modo all)', () => {
    const { checkPermissions } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermissions([], 'all')).toBe(false);
  });

  it('nega acesso quando a lista de permissões é undefined (modo all)', () => {
    const { checkPermissions } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermissions(undefined as any, 'all')).toBe(false);
  });

  it('nega acesso com hasPermission quando a chave está vazia', () => {
    const { hasPermission } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(hasPermission('')).toBe(false);
  });

  it('nega acesso com hasAnyPermission quando a lista está vazia', () => {
    const { hasAnyPermission } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(hasAnyPermission([])).toBe(false);
  });

  it('nega acesso com hasAllPermissions quando a lista está vazia', () => {
    const { hasAllPermissions } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(hasAllPermissions([])).toBe(false);
  });

  it('nega acesso quando a permissão não é concedida ao usuário', () => {
    const { checkPermission } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermission('companies.read')).toBe(false);
  });

  it('libera acesso quando a permissão válida é concedida', () => {
    const { checkPermission } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermission('jobs.read')).toBe(true);
  });

  it('libera acesso em modo any quando pelo menos uma permissão é concedida', () => {
    const { checkPermissions } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermissions(['companies.read', 'jobs.read'])).toBe(true);
  });

  it('nega acesso em modo all quando nem todas as permissões são concedidas', () => {
    const { checkPermissions } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(checkPermissions(['jobs.read', 'companies.read'], 'all')).toBe(false);
  });

  it('libera acesso em modo all quando todas as permissões são concedidas', () => {
    const { checkPermissions } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
      { resource: 'companies', action: 'read' },
    ]);

    expect(checkPermissions(['jobs.read', 'companies.read'], 'all')).toBe(true);
  });
});
