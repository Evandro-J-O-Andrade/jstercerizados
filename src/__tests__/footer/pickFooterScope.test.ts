import { describe, it, expect } from 'vitest';
import {
  pickFooterScope,
  normalizeRoleName,
  filterActiveLinks,
  type FooterGroup,
} from '@/types/footer';

describe('pickFooterScope', () => {
  it('retorna global_public quando nao autenticado', () => {
    expect(pickFooterScope(false, null)).toBe('global_public');
    expect(pickFooterScope(false, 'candidato')).toBe('global_public');
  });

  it('retorna candidate para role candidato', () => {
    expect(pickFooterScope(true, 'candidato')).toBe('candidate');
  });

  it('retorna admin_master para admin_master', () => {
    expect(pickFooterScope(true, 'admin_master')).toBe('admin_master');
  });

  it('retorna admin_master para platform_admin', () => {
    expect(pickFooterScope(true, 'platform_admin')).toBe('admin_master');
  });

  it('retorna manager para rh_manager', () => {
    expect(pickFooterScope(true, 'rh_manager')).toBe('manager');
  });

  it('retorna manager para finance_manager', () => {
    expect(pickFooterScope(true, 'finance_manager')).toBe('manager');
  });

  it('retorna provider para commercial', () => {
    expect(pickFooterScope(true, 'commercial')).toBe('provider');
  });

  it('retorna company para operations_manager', () => {
    expect(pickFooterScope(true, 'operations_manager')).toBe('company');
  });
});

describe('normalizeRoleName', () => {
  it('null vira global_public', () => {
    expect(normalizeRoleName(null)).toBe('global_public');
    expect(normalizeRoleName(undefined)).toBe('global_public');
  });

  it('desconhecido cai em manager', () => {
    expect(normalizeRoleName('algum_role_inexistente')).toBe('manager');
  });
});

describe('filterActiveLinks', () => {
  it('remove grupos sem links validos', () => {
    const groups: FooterGroup[] = [
      {
        group: 'Vazio',
        links: [{ label: '', href: '/x' }],
      },
      {
        group: 'Valido',
        links: [{ label: 'A', href: '/a' }],
      },
    ];
    const out = filterActiveLinks(groups);
    expect(out.map((g) => g.group)).toEqual(['Valido']);
  });

  it('preserva ordem dos grupos', () => {
    const groups: FooterGroup[] = [
      { group: 'B', links: [{ label: 'b', href: '/b' }] },
      { group: 'A', links: [{ label: 'a', href: '/a' }] },
    ];
    const out = filterActiveLinks(groups);
    expect(out.map((g) => g.group)).toEqual(['B', 'A']);
  });
});
