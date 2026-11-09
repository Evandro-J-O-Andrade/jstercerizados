import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { usePermissionCheck } from '../index';

type AuthMock = ReturnType<typeof useAuth>;
type Permission = { resource: string; action: string };

const mockUseAuth = vi.mocked(useAuth);

function renderUsePermissionCheck(permissions: Permission[]) {
  mockUseAuth.mockReturnValue({
    permissions,
    isLoading: false,
  } as unknown as AuthMock);
  return renderHook(() => usePermissionCheck());
}

describe('usePermissionCheck — fail-closed (Fase D.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nega acesso quando a chave de permissão está vazia', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermission('')).toBe(false);
  });

  it('nega acesso quando a chave de permissão é undefined', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermission(undefined as unknown as string)).toBe(false);
  });

  it('nega acesso quando a lista de permissões está vazia (modo any)', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermissions([])).toBe(false);
  });

  it('nega acesso quando a lista de permissões é undefined (modo any)', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermissions(undefined as unknown as string[])).toBe(false);
  });

  it('nega acesso quando a lista de permissões está vazia (modo all)', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermissions([], 'all')).toBe(false);
  });

  it('nega acesso quando a lista de permissões é undefined (modo all)', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermissions(undefined as unknown as string[], 'all')).toBe(false);
  });

  it('nega acesso com hasPermission quando a chave está vazia', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.hasPermission('')).toBe(false);
  });

  it('nega acesso com hasAnyPermission quando a lista está vazia', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.hasAnyPermission([])).toBe(false);
  });

  it('nega acesso com hasAllPermissions quando a lista está vazia', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.hasAllPermissions([])).toBe(false);
  });

  it('nega acesso quando a permissão não é concedida ao usuário', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermission('companies.read')).toBe(false);
  });

  it('libera acesso quando a permissão válida é concedida', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermission('jobs.read')).toBe(true);
  });

  it('libera acesso em modo any quando pelo menos uma permissão é concedida', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermissions(['companies.read', 'jobs.read'])).toBe(true);
  });

  it('nega acesso em modo all quando nem todas as permissões são concedidas', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
    ]);

    expect(result.current.checkPermissions(['jobs.read', 'companies.read'], 'all')).toBe(false);
  });

  it('libera acesso em modo all quando todas as permissões são concedidas', () => {
    const { result } = renderUsePermissionCheck([
      { resource: 'jobs', action: 'read' },
      { resource: 'companies', action: 'read' },
    ]);

    expect(result.current.checkPermissions(['jobs.read', 'companies.read'], 'all')).toBe(true);
  });
});
