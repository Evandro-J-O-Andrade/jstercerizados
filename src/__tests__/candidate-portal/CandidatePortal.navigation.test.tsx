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

vi.mock('@/components/portal/CandidateMetroDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="candidate-dashboard">Dashboard</div>,
}));

import { useAuth } from '@/contexts/AuthContext';
import { navigationRepository } from '@/repositories/navigation.repository';
import { CandidatePortal } from '@/components/portal/CandidatePortal';
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
        <Route path="/candidato/*" element={<CandidatePortal />}>
          <Route index element={<div data-testid="home-page">home</div>} />
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

describe('CandidatePortal navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListAll.mockResolvedValue({
      modules: baseModules,
      globals: baseGlobals,
    });
  });

  it('renders content slot (children/outlet) when no route matches index', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'João Silva', email: 'j@x.com' } as never,
      permissions: [],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
      isAdminMaster: false,
      isCandidate: true,
      logout: vi.fn(),
    } as never);

    withRouter('/candidato');
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('renders only sidebar items permitted for candidate with basic permissions', async () => {
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
    expect(screen.getAllByText('Voltar para o site').length).toBeGreaterThan(0);
  });

  it('omits sidebar items whose permission_key is not in user permissions', async () => {
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

  it('renders global links without permission_key for any candidate', async () => {
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
    expect(screen.getAllByText('Voltar para o site').length).toBeGreaterThan(0);
  });

  it('admin_master sees all items even without specific permissions', async () => {
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

  it('renders "Voltar para o site" link in mobile header with correct href', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'Pedro', email: 'p@x.com' } as never,
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
      expect(screen.getAllByText('Suporte').length).toBeGreaterThan(0);
    });
    const links = screen.getAllByRole('link', {
      name: /Voltar para o site/i,
    });
    expect(links.length).toBeGreaterThanOrEqual(1);
    const headerLink = links.find(
      (b) => b.getAttribute('data-source') === 'mobile-header',
    );
    expect(headerLink).toBeDefined();
    expect(headerLink).toHaveAttribute('href', '/');
  });

  it('renders footer copyright with company name', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'Pedro', email: 'p@x.com' } as never,
      permissions: [],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
      isAdminMaster: false,
      isCandidate: true,
      logout: vi.fn(),
    } as never);

    withRouter('/candidato');
    await waitFor(() => {
      expect(screen.getAllByText(/Suporte/).length).toBeGreaterThan(0);
    });

    const footer = screen.getAllByText(/Todos os direitos reservados/i);
    expect(footer.length).toBeGreaterThan(0);
  });

  it('overrides the site_home label to "Voltar para o site" in the sidebar', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'Carla', email: 'c@x.com' } as never,
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
      expect(screen.getAllByText('Suporte').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Voltar para o site').length).toBeGreaterThan(0);
    expect(screen.queryByText('Site público')).not.toBeInTheDocument();
  });

  it('renders the Acessibilidade button in the sidebar and dispatches CustomEvent on click', async () => {
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'Ana', email: 'a@x.com' } as never,
      permissions: [],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
      isAdminMaster: false,
      isCandidate: true,
      logout: vi.fn(),
    } as never);

    const eventSpy = vi.fn();
    window.addEventListener('app:open-accessibility', eventSpy);

    withRouter('/candidato');
    await waitFor(() => {
      expect(screen.getAllByText('Suporte').length).toBeGreaterThan(0);
    });

    const accessibilityButton = screen
      .getByText('Acessibilidade')
      .closest('button');
    expect(accessibilityButton).toBeInTheDocument();
    expect(accessibilityButton).toHaveAttribute('data-key', 'accessibility');
    expect(accessibilityButton).toHaveAttribute('data-action', 'accessibility');

    accessibilityButton?.click();
    await waitFor(() => {
      expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    window.removeEventListener('app:open-accessibility', eventSpy);
  });

  it('renders the Sair (logout) button in the sidebar and calls logout on click', async () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'João', email: 'j@x.com' } as never,
      permissions: [],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
      isAdminMaster: false,
      isCandidate: true,
      logout: mockLogout,
    } as never);

    withRouter('/candidato');
    await waitFor(() => {
      expect(screen.getAllByText('Suporte').length).toBeGreaterThan(0);
    });
    const logoutButton = screen.getByRole('button', { name: 'Sair' });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('data-action', 'logout');

    logoutButton.click();
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
