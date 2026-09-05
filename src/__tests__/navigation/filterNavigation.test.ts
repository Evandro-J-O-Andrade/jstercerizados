import { describe, it, expect } from 'vitest';
import {
  filterNavigation,
  type CandidatePortalModule,
  type GlobalNavigationLink,
} from '@/types/navigation';
import type { Permission } from '@/types/auth';

const mod = (over: Partial<CandidatePortalModule>): CandidatePortalModule => ({
  id: over.id ?? over.key ?? 'm',
  key: 'k',
  label: 'L',
  route: '/r',
  icon: 'Home',
  permission_key: null,
  show_in_sidebar: true,
  show_in_bottom_nav: true,
  sort_order: 0,
  is_active: true,
  target_audience: ['candidato'],
  ...over,
});

const glb = (over: Partial<GlobalNavigationLink>): GlobalNavigationLink => ({
  id: over.id ?? over.key ?? 'g',
  key: 'k',
  label: 'L',
  href: '/h',
  icon: 'Home',
  action: 'link',
  permission_key: null,
  show_in_sidebar: true,
  show_in_bottom_nav: false,
  show_in_footer: false,
  sort_order: 0,
  is_active: true,
  target_audience: [],
  ...over,
});

describe('filterNavigation', () => {
  it('esconde módulo cuja permission_key não está no conjunto de permissões', () => {
    const out = filterNavigation(
      [
        mod({
          key: 'vagas',
          permission_key: 'jobs.read',
          route: '/candidato/vagas',
        }),
      ],
      [],
      [], // sem permissões
      ['candidato'],
    );
    expect(out.sidebarItems.find((i) => i.key === 'vagas')).toBeUndefined();
  });

  it('mostra módulo cuja permission_key está presente', () => {
    const out = filterNavigation(
      [
        mod({
          key: 'vagas',
          permission_key: 'jobs.read',
          route: '/candidato/vagas',
        }),
      ],
      [],
      [{ resource: 'jobs', action: 'read' } as Permission],
      ['candidato'],
    );
    expect(out.sidebarItems.find((i) => i.key === 'vagas')).toBeDefined();
  });

  it('link global sem permission_key aparece para qualquer role', () => {
    const out = filterNavigation(
      [],
      [glb({ key: 'support', href: '/suporte', show_in_sidebar: true })],
      [],
      ['candidato'],
    );
    expect(out.sidebarItems.find((i) => i.key === 'support')).toBeDefined();
  });

  it('admin_master ignora permission_key e vê tudo', () => {
    const out = filterNavigation(
      [
        mod({
          key: 'vagas',
          permission_key: 'jobs.read',
          route: '/candidato/vagas',
        }),
      ],
      [],
      [],
      ['admin_master'],
    );
    expect(out.sidebarItems.find((i) => i.key === 'vagas')).toBeDefined();
  });

  it('módulo de candidato não aparece para role que não está em target_audience', () => {
    const out = filterNavigation(
      [
        mod({
          key: 'vagas',
          route: '/candidato/vagas',
          target_audience: ['candidato'],
        }),
      ],
      [],
      [],
      ['rh_manager'],
    );
    expect(out.sidebarItems.find((i) => i.key === 'vagas')).toBeUndefined();
  });

  it('global link com target_audience vazio aparece para todos os roles', () => {
    const out = filterNavigation(
      [],
      [glb({ key: 'support', href: '/suporte', target_audience: [] })],
      [],
      ['rh_manager'],
    );
    expect(out.sidebarItems.find((i) => i.key === 'support')).toBeDefined();
  });

  it('respeita show_in_sidebar / show_in_bottom_nav separadamente', () => {
    const out = filterNavigation(
      [
        mod({
          key: 'vagas',
          route: '/candidato/vagas',
          show_in_sidebar: true,
          show_in_bottom_nav: true,
        }),
      ],
      [
        glb({
          key: 'support',
          href: '/suporte',
          show_in_sidebar: true,
          show_in_bottom_nav: true,
        }),
      ],
      [],
      ['candidato'],
    );
    const vagasInBottom = out.bottomNavItems.find((i) => i.key === 'vagas');
    const supportInSidebar = out.sidebarItems.find((i) => i.key === 'support');
    expect(vagasInBottom).toBeDefined();
    expect(supportInSidebar).toBeDefined();
  });

  it('item inativo é ignorado mesmo com permissão', () => {
    const out = filterNavigation(
      [mod({ key: 'vagas', route: '/candidato/vagas', is_active: false })],
      [],
      [],
      ['candidato'],
    );
    expect(out.sidebarItems.find((i) => i.key === 'vagas')).toBeUndefined();
  });

  it('ordena sidebarItems por sort_order crescente', () => {
    const out = filterNavigation(
      [
        mod({ key: 'b', route: '/b', sort_order: 30 }),
        mod({ key: 'a', route: '/a', sort_order: 10 }),
      ],
      [],
      [],
      ['candidato'],
    );
    expect(out.sidebarItems.map((i) => i.key)).toEqual(['a', 'b']);
  });
});
