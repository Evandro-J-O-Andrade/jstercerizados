import { describe, it, expect, vi, beforeEach } from 'vitest';

// Testa a lógica de carregamento de permissões para admin_master
// Simula o comportamento do AuthContext.loadAuthData quando admin_master é true

function carregarPermissoes(
  validatedRoleIds: string[],
  adminMaster: boolean,
  rolePermsDb: Array<{ permission_id: string }>,
  allPermsDb: Array<{ id: string }>,
): string[] {
  const permissionIds = Array.from(
    new Set(rolePermsDb.map((rp) => rp.permission_id).filter(Boolean)),
  );

  let allPermissionIds: string[] = permissionIds;
  if (adminMaster) {
    allPermissionIds = Array.from(
      new Set([...permissionIds, ...(allPermsDb.map((p) => p.id) as string[])]),
    );
  }

  return allPermissionIds;
}

describe('Admin Master - Carregamento de todas as permissões do banco', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Admin master com role limitada recebe TODAS as 180 permissões do banco', () => {
    // Simula: admin_master tem apenas 1 role com 113 permissões vinculadas
    // mas o banco tem 180 permissões no total
    const rolePermsDb = Array.from({ length: 113 }, (_, i) => ({
      permission_id: `perm-${i + 1}`,
    }));

    const allPermsDb = Array.from({ length: 180 }, (_, i) => ({
      id: `perm-${i + 1}`,
    }));

    const resultado = carregarPermissoes(
      ['role-admin'],
      true, // adminMaster = true
      rolePermsDb,
      allPermsDb,
    );

    expect(resultado.length).toBe(180);
    expect(resultado).toContain('perm-1');
    expect(resultado).toContain('perm-180');
  });

  it('2. Admin master sem permissões de role ainda recebe todas do banco', () => {
    const rolePermsDb: Array<{ permission_id: string }> = [];
    const allPermsDb = Array.from({ length: 180 }, (_, i) => ({
      id: `perm-${i + 1}`,
    }));

    const resultado = carregarPermissoes(
      [],
      true, // adminMaster = true
      rolePermsDb,
      allPermsDb,
    );

    expect(resultado.length).toBe(180);
  });

  it('3. Usuário NÃO admin_master recebe apenas permissões de suas roles', () => {
    const rolePermsDb = Array.from({ length: 5 }, (_, i) => ({
      permission_id: `perm-${i + 1}`,
    }));

    const allPermsDb = Array.from({ length: 180 }, (_, i) => ({
      id: `perm-${i + 1}`,
    }));

    const resultado = carregarPermissoes(
      ['role-tenant'],
      false, // adminMaster = false
      rolePermsDb,
      allPermsDb,
    );

    expect(resultado.length).toBe(5);
    expect(resultado).not.toContain('perm-6');
  });

  it('4. admin_master não tem permissões duplicadas', () => {
    const rolePermsDb = Array.from({ length: 10 }, (_, i) => ({
      permission_id: `perm-${i + 1}`,
    }));

    const allPermsDb = Array.from({ length: 10 }, (_, i) => ({
      id: `perm-${i + 1}`,
    }));

    const resultado = carregarPermissoes(
      ['role-admin'],
      true,
      rolePermsDb,
      allPermsDb,
    );

    const unicos = new Set(resultado);
    expect(resultado.length).toBe(unicos.size);
    expect(resultado.length).toBe(10);
  });

  it('5. admin_master com permissões sobrepostas entre role e banco total', () => {
    // role tem perm-1 a perm-50, banco tem perm-1 a perm-180
    // resultado deve ser 180 (sem duplicatas)
    const rolePermsDb = Array.from({ length: 50 }, (_, i) => ({
      permission_id: `perm-${i + 1}`,
    }));

    const allPermsDb = Array.from({ length: 180 }, (_, i) => ({
      id: `perm-${i + 1}`,
    }));

    const resultado = carregarPermissoes(
      ['role-admin'],
      true,
      rolePermsDb,
      allPermsDb,
    );

    expect(resultado.length).toBe(180);
  });
});
