import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/repositories/footer.repository', () => ({
  footerRepository: {
    getByScope: vi.fn(),
    getFallback: vi.fn(),
  },
}));

import { useAuth } from '@/contexts/AuthContext';
import { footerRepository } from '@/repositories/footer.repository';
import { RoleBasedFooter } from '@/components/layout/RoleBasedFooter';
import type { FooterConfig } from '@/types/footer';

const mockUseAuth = vi.mocked(useAuth);
const mockGetByScope = vi.mocked(footerRepository.getByScope);
const mockGetFallback = vi.mocked(footerRepository.getFallback);

function withRouter(children: React.ReactNode) {
  return render(<MemoryRouter>{children}</MemoryRouter>);
}

const globalConfig: FooterConfig = {
  scope: 'global_public',
  is_active: true,
  metadata: {},
  links: [
    {
      group: 'Empresa',
      links: [
        { label: 'Sobre Nos', href: '/sobre' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    { group: 'Contato', links: [{ label: 'Suporte', href: '/suporte' }] },
  ],
};

const candidateConfig: FooterConfig = {
  scope: 'candidate',
  is_active: true,
  metadata: {},
  links: [
    {
      group: 'Area do Candidato',
      links: [
        { label: 'Vagas', href: '/candidato/vagas' },
        { label: 'Meu curriculo', href: '/candidato/curriculo' },
      ],
    },
  ],
};

describe('RoleBasedFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetByScope.mockResolvedValue(null);
    mockGetFallback.mockResolvedValue(globalConfig);
  });

  it('renderiza footer global_public quando nao autenticado', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdminMaster: false,
      roles: [],
    } as never);

    withRouter(<RoleBasedFooter />);

    await waitFor(() => {
      expect(screen.getAllByText('Sobre Nos').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Blog').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Suporte').length).toBeGreaterThan(0);
    const footer = screen.getByRole('contentinfo');
    expect(footer.getAttribute('data-scope')).toBe('global_public');
  });

  it('renderiza footer candidate quando logado como candidato', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdminMaster: false,
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as never],
    } as never);
    mockGetByScope.mockImplementation(async (scope) => {
      if (scope === 'candidate') return candidateConfig;
      return null;
    });

    withRouter(<RoleBasedFooter />);

    await waitFor(() => {
      expect(screen.getAllByText('Vagas').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Meu curriculo').length).toBeGreaterThan(0);
    const footer = screen.getByRole('contentinfo');
    expect(footer.getAttribute('data-scope')).toBe('candidate');
  });

  it('renderiza footer admin_master quando logado como admin_master', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdminMaster: true,
      roles: [{ id: 'r1', name: 'admin_master', scope: 'global' } as never],
    } as never);
    const adminConfig: FooterConfig = {
      scope: 'admin_master',
      is_active: true,
      metadata: {},
      links: [
        {
          group: 'Administracao',
          links: [
            { label: 'Tenants', href: '/dashboard/tenants' },
            { label: 'Usuarios', href: '/dashboard/usuarios' },
          ],
        },
      ],
    };
    mockGetByScope.mockImplementation(async (scope) => {
      if (scope === 'admin_master') return adminConfig;
      return null;
    });

    withRouter(<RoleBasedFooter />);

    await waitFor(() => {
      expect(screen.getAllByText('Tenants').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Usuarios').length).toBeGreaterThan(0);
    expect(screen.getByRole('contentinfo').getAttribute('data-scope')).toBe(
      'admin_master',
    );
  });

  it('cai no fallback global_public quando o escopo especifico nao existe', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdminMaster: false,
      roles: [{ id: 'r1', name: 'rh_manager', scope: 'tenant' } as never],
    } as never);
    mockGetByScope.mockResolvedValue(null);
    mockGetFallback.mockResolvedValue(globalConfig);

    withRouter(<RoleBasedFooter />);

    await waitFor(() => {
      expect(screen.getAllByText('Sobre Nos').length).toBeGreaterThan(0);
    });
    expect(screen.getByRole('contentinfo').getAttribute('data-scope')).toBe(
      'global_public',
    );
  });

  it('nao renderiza nada quando o config esta inativo', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdminMaster: false,
      roles: [],
    } as never);
    mockGetFallback.mockResolvedValue({ ...globalConfig, is_active: false });

    withRouter(<RoleBasedFooter />);

    await waitFor(() => {
      expect(screen.queryByText('Sobre Nos')).not.toBeInTheDocument();
    });
  });
});
