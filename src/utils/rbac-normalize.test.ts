import { describe, expect, it } from 'vitest';
import { getPermissionKey, normalizePermission } from './rbac-normalize';

describe('normalizePermission', () => {
  it('usa permissions.code como chave canônica quando name não existe', () => {
    const permission = normalizePermission({
      id: 'permission-1',
      code: 'candidates.self.read',
      resource: 'candidates',
      action: 'self.read',
      description: 'Consultar o próprio perfil',
    });

    expect(permission).not.toBeNull();
    expect(getPermissionKey(permission!)).toBe('candidates.self.read');
  });

  it('mantém compatibilidade com registros legados que possuem name', () => {
    const permission = normalizePermission({
      id: 'permission-2',
      name: 'jobs.read',
      code: 'jobs.read',
    });

    expect(permission).not.toBeNull();
    expect(getPermissionKey(permission!)).toBe('jobs.read');
  });

  it('não inventa uma permissão quando o registro não possui chave válida', () => {
    expect(
      normalizePermission({ id: 'permission-3', description: 'Sem chave' }),
    ).toBeNull();
  });
});
