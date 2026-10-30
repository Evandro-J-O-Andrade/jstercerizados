import { describe, it, expect } from 'vitest';
import type { Permission } from '@/types/auth';
import { hasModulePermission } from '../ModuleRegistry';

function makePermission(resource: string, action: string): Permission {
  return {
    id: `${resource}.${action}`,
    resource,
    action,
    description: null,
    created_at: new Date().toISOString(),
  };
}

describe('hasModulePermission — fail-closed (Fase D.2)', () => {
  const permissions = [makePermission('jobs', 'read'), makePermission('companies', 'read')];

  it('retorna false quando requiredPermissions está ausente', () => {
    expect(hasModulePermission(permissions)).toBe(false);
  });

  it('retorna false quando requiredPermissions está vazio', () => {
    expect(hasModulePermission(permissions, [])).toBe(false);
  });

  it('retorna true quando usuário tem a permissão exigida', () => {
    expect(hasModulePermission(permissions, ['jobs.read'])).toBe(true);
  });

  it('retorna false quando usuário não tem a permissão exigida', () => {
    expect(hasModulePermission(permissions, ['companies.write'])).toBe(false);
  });

  it('retorna false quando nenhuma permissão do usuário corresponde', () => {
    expect(hasModulePermission(permissions, ['ia.read'])).toBe(false);
  });
});
