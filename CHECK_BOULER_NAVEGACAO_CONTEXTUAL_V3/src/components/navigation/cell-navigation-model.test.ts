import { describe, expect, it } from 'vitest';
import type { CellContract } from '@/core/types';
import {
  getCellNavigation,
  getCellSidebarEntries,
  getConflictingHomeRoutes,
  resolveNavigationCell,
} from './cell-navigation-model';

function cell(id: string, homeRoute: string, requiredPermissions: string[]): CellContract {
  return {
    id, name: id, enabled: true, scope: 'tenant', homeRoute,
    navigation: { sidebar: true, label: id },
    permissions: requiredPermissions,
    routes: [
      { path: '', label: 'Dashboard', requiredPermissions },
      { path: 'registros', label: 'Registros', requiredPermissions },
      { path: 'registros/novo', label: 'Novo registro', requiredPermissions: ['records.create'] },
      { path: 'registros/:id', label: 'Detalhe', requiredPermissions },
      { path: 'registros/:id/editar', label: 'Editar', requiredPermissions },
      { path: 'registros/nova', label: 'Compatibilidade', requiredPermissions },
    ],
  };
}

describe('CellRegistry ownership -> navegação contextual', () => {
  const rh = cell('rh', '/dashboard/rh', ['people.read']);
  const recruitment = cell('recrutamento', '/dashboard/recrutamento', ['recruitment.read']);
  const grants = new Set(['people.read', 'recruitment.read', 'records.create']);

  it('não compartilha home RH com recrutamento nem confunde subrotas', () => {
    const available = getCellNavigation([rh, recruitment], ['tenant'], grants, false, true);
    expect(resolveNavigationCell('/dashboard/rh/registros/novo', available)?.id).toBe('rh');
    expect(resolveNavigationCell('/dashboard/recrutamento/registros/novo', available)?.id).toBe('recrutamento');
    expect(resolveNavigationCell('/dashboard/modulos', available)).toBeNull();
    expect(resolveNavigationCell('/dashboard/global', available)).toBeNull();
  });

  it('não exibe detalhe dinâmico e só exibe criação autorizada', () => {
    const entries = getCellSidebarEntries(rh, grants);
    expect(entries.map((entry) => entry.path)).toEqual([
      '/dashboard/rh', '/dashboard/rh/registros', '/dashboard/rh/registros/novo',
    ]);
    expect(getCellSidebarEntries(rh, new Set(['people.read'])).some((entry) => entry.path.endsWith('/novo'))).toBe(false);
  });

  it('isola módulos pelo gate e tenant', () => {
    expect(getCellNavigation([rh], ['tenant'], new Set([]), false, true)).toEqual([]);
    expect(getCellNavigation([rh], ['tenant'], grants, false, false)).toEqual([]);
  });

  it('bloqueia colisões de propriedade em vez de exibir dois módulos com mesma home', () => {
    const conflicting = cell('outro-rh', '/dashboard/rh', ['people.read']);
    expect(getConflictingHomeRoutes([rh, conflicting])).toEqual(['/dashboard/rh']);
    expect(getCellNavigation([rh, conflicting], ['tenant'], grants, false, true)).toEqual([]);
  });
});
