import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    person: {
      id: 'person-1',
      auth_user_id: 'auth-1',
      full_name: 'Maria Souza',
      email: 'maria@test.com',
      phone: '(11) 99999-9999',
      status: 'active',
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    },
    roles: [
      {
        id: 'role-1',
        name: 'tenant_admin',
        slug: 'tenant_admin',
        scope: 'tenant',
        is_global: false,
      },
    ],
    permissions: [
      {
        id: 'perm-1',
        name: 'companies.read',
        module: 'companies',
        description: null,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'perm-2',
        name: 'jobs.read',
        module: 'jobs',
        description: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
  }),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    identity: {
      id: 'person-1',
      authUserId: 'auth-1',
      email: 'maria@test.com',
      firstName: 'Maria',
      displayName: 'Maria Souza',
      avatarUrl: undefined,
      role: { id: 'role-1', name: 'tenant_admin', is_global: false },
      roleLabel: 'Administrador do Tenant',
      roleScope: 'tenant',
      tenant: { id: 'tenant-1', name: 'J&S Empregos LTDA' },
      tenantLabel: 'J&S Empregos LTDA',
      memberships: [
        {
          id: 'm1',
          person_id: 'person-1',
          tenant_id: 'tenant-1',
          membership_role: 'role-1',
          status: 'active',
        },
      ],
      permissions: [
        {
          id: 'perm-1',
          name: 'companies.read',
          module: 'companies',
          description: null,
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'perm-2',
          name: 'jobs.read',
          module: 'jobs',
          description: null,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      effectiveScopes: ['tenant'] as const,
      isAdminMaster: false,
      isCandidate: false,
      isEmpresa: false,
      firstLoginState: null,
      legalAcceptances: [],
      contextLabel: 'J&S Empregos LTDA',
      greeting: 'Bom dia',
      dateTime: '30/10/2026, 09:00',
    },
    availableMemberships: [
      {
        id: 'm1',
        tenant_id: 'tenant-1',
        membership_role: 'role-1',
        status: 'active',
      },
    ],
  }),
}));

vi.mock('@/components/ui/SEO', () => ({
  SEO: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="seo">{children}</div>
  ),
}));

import MinhaConta from '@/pages/MinhaConta';

describe('MinhaConta - Dados reais da identidade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Exibe nome completo da pessoa (dados reais de people)', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
  });

  it('2. Exibe e-mail da autenticação (dados reais)', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.getByText('maria@test.com')).toBeInTheDocument();
  });

  it('3. Exibe telefone da pessoa quando disponível', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
  });

  it('4. Exibe status da conta (ativo)', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('5. Exibe papel efetivo (não admin_master por fallback)', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.getByText('Administrador do Tenant')).toBeInTheDocument();
  });

  it('6. Exibe tenant atual vinculado ao membership real', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    // O tenantLabel aparece dentro de um <p> com classe text-muted-foreground
    expect(screen.getByText(/J&S/)).toBeInTheDocument();
  });

  it('7. Exibe contagem de permissões efetivas', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.getByText(/2 permissão/)).toBeInTheDocument();
  });

  it('8. Não exibe dados de admin_master quando usuário é tenant_admin', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Administrador Master')).not.toBeInTheDocument();
  });

  it('9. Exibe botão "Sair da conta"', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.getByText('Sair da conta')).toBeInTheDocument();
  });
});
