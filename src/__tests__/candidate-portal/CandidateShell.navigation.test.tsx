import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/repositories/navigation.repository', () => ({
  navigationRepository: {
    listAll: vi.fn(),
  },
}));

vi.mock('@/contexts/CandidateContext', () => ({
  CandidateProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useCandidate: () => ({
    candidate: null,
    applications: [],
    favorites: [],
    jobs: [],
  }),
}));

import { useAuth } from '@/contexts/AuthContext';
import { navigationRepository } from '@/repositories/navigation.repository';
import { CandidateShell } from '@/components/portal/CandidateShell';
import type {
  CandidatePortalModule,
  GlobalNavigationLink,
} from '@/types/navigation';
import type { Permission } from '@/types/auth';

const mockUseAuth = vi.mocked(useAuth);
const mockListAll = vi.mocked(navigationRepository.listAll);

function withRouter(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/candidato/*" element={<CandidateShell />}>
          <Route index element={<div>home-page</div>} />
          <Route path="vagas" element={<div>vagas-page</div>} />
          <Route path="perfil" element={<div>perfil-page</div>} />
          <Route path="configuracoes" element={<div>cfg-page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

const baseModules: CandidatePortalModule[] = [
  {
    id: 'm1',
    key: 'home',
    label: 'Início',
    route: '/candidato',
    icon: 'Home',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: true,
    sort_order: 10,
    is_active: true,
    target_audience: ['candidato'],
  },
  {
    id: 'm2',
    key: 'jobs',
    label: 'Vagas',
    route: '/candidato/vagas',
    icon: 'Briefcase',
    permission_key: 'jobs.read',
    show_in_sidebar: true,
    show_in_bottom_nav: true,
    sort_order: 20,
    is_active: true,
    target_audience: ['candidato'],
  },
  {
    id: 'm3',
    key: 'profile',
    label: 'Meu perfil',
    route: '/candidato/perfil',
    icon: 'User',
    permission_key: 'candidates.self.read',
    show_in_sidebar: true,
    show_in_bottom_nav: false,
    sort_order: 70,
    is_active: true,
    target_audience: ['candidato'],
  },
  {
    id: 'm4',
    key: 'settings',
    label: 'Configurações',
    route: '/candidato/configuracoes',
    icon: 'Settings',
    permission_key: 'account.manage',
    show_in_sidebar: true,
    show_in_bottom_nav: false,
    sort_order: 90,
    is_active: true,
    target_audience: ['candidato'],
  },
];

const baseGlobals: GlobalNavigationLink[] = [
  {
    id: 'g1',
    key: 'site_home',
    label: 'Site público',
    href: '/',
    icon: 'Home',
    action: 'site_home',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: false,
    show_in_footer: false,
    sort_order: 10,
    is_active: true,
    target_audience: [],
  },
  {
    id: 'g2',
    key: 'support',
    label: 'Suporte',
    href: '/suporte',
    icon: 'LifeBuoy',
    action: 'link',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: true,
    show_in_footer: true,
    sort_order: 20,
    is_active: true,
    target_audience: [],
  },
  {
    id: 'g3',
    key: 'help',
    label: 'Precisa de ajuda?',
    href: '/contato',
    icon: 'MessageCircle',
    action: 'chat',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: false,
    show_in_footer: true,
    sort_order: 30,
    is_active: true,
    target_audience: [],
  },
  {
    id: 'g4',
    key: 'accessibility',
    label: 'Acessibilidade',
    href: '#accessibility',
    icon: 'Accessibility',
    action: 'accessibility',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: false,
    show_in_footer: true,
    sort_order: 40,
    is_active: true,
    target_audience: [],
  },
  {
    id: 'g5',
    key: 'logout',
    label: 'Sair',
    href: '#logout',
    icon: 'LogOut',
    action: 'logout',
    permission_key: null,
    show_in_sidebar: true,
    show_in_bottom_nav: false,
    show_in_footer: false,
    sort_order: 99,
    is_active: true,
    target_audience: [],
  },
];

describe('CandidateShell com navegação dinâmica', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListAll.mockResolvedValue({
      modules: baseModules,
      globals: baseGlobals,
    });
  });

  it('renderiza apenas itens permitidos para candidato com permissões básicas', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'João Silva', email: 'j@x.com' } as never,
      permissions: [
        { resource: 'jobs', action: 'read' } as Permission,
        { resource: 'candidates', action: 'self.read' } as Permission,
        { resource: 'account', action: 'manage' } as Permission,
        { resource: 'notifications', action: 'read' } as Permission,
      ],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
      isAdminMaster: false,
      isCandidate: true,
      logout: vi.fn(),
    } as never);

    withRouter('/candidato');
    await waitFor(() => {
      expect(screen.getAllByText('Início').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Vagas').length).toBeGreaterThan(0);
    expect(screen.getByText('Meu perfil')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getAllByText('Suporte').length).toBeGreaterThan(0);
    expect(screen.getByText('Site público')).toBeInTheDocument();
  });

  it('omite itens cuja permission_key não está nas permissões do usuário', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'Maria', email: 'm@x.com' } as never,
      permissions: [
        { resource: 'jobs', action: 'read' } as Permission,
        { resource: 'notifications', action: 'read' } as Permission,
      ],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
      isAdminMaster: false,
      isCandidate: true,
      logout: vi.fn(),
    } as never);

    withRouter('/candidato');
    await waitFor(() => {
      expect(screen.getAllByText('Vagas').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('Meu perfil')).not.toBeInTheDocument();
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument();
  });

  it('link global sem permission_key aparece para qualquer candidato', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'Ana', email: 'a@x.com' } as never,
      permissions: [],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
      isAdminMaster: false,
      isCandidate: true,
      logout: vi.fn(),
    } as never);

    withRouter('/candidato');
    await waitFor(() => {
      expect(screen.getAllByText('Suporte').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Site público')).toBeInTheDocument();
    expect(screen.getByText('Acessibilidade')).toBeInTheDocument();
  });

  it('admin_master vê todos os itens do candidato mesmo sem permissão específica', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'Root', email: 'root@x.com' } as never,
      permissions: [],
      roles: [{ id: 'r2', name: 'admin_master', scope: 'global' } as never],
      isAdminMaster: true,
      isCandidate: true,
      logout: vi.fn(),
    } as never);

    withRouter('/candidato');
    await waitFor(() => {
      expect(screen.getAllByText('Vagas').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Meu perfil')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });
});
