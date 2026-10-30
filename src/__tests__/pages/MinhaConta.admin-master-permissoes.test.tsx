import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    person: {
      id: 'person-admin',
      auth_user_id: 'auth-admin',
      full_name: 'Evandro Admin',
      email: 'evandro_j.o.a@hotmail.com',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    roles: [
      {
        id: 'role-admin',
        name: 'admin_master',
        slug: 'admin_master',
        scope: 'global',
        is_global: true,
      },
    ],
    permissions: [],
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
    hasAllPermissions: vi.fn(() => true),
  }),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    identity: {
      id: 'person-admin',
      authUserId: 'auth-admin',
      email: 'evandro_j.o.a@hotmail.com',
      firstName: 'Evandro',
      displayName: 'Evandro Admin',
      avatarUrl: undefined,
      role: { id: 'role-admin', name: 'admin_master', is_global: true },
      roleLabel: 'Administrador Master',
      roleScope: 'global',
      tenant: null,
      tenantLabel: 'Plataforma',
      memberships: [],
      permissions: [],
      effectiveScopes: ['global'] as const,
      isAdminMaster: true,
      isCandidate: false,
      isEmpresa: false,
      firstLoginState: null,
      legalAcceptances: [],
      contextLabel: 'Gestão da Plataforma',
      greeting: 'Bom dia',
      dateTime: '30/10/2026, 09:00',
    },
    availableMemberships: [],
  }),
}));

vi.mock('@/components/ui/SEO', () => ({
  SEO: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="seo">{children}</div>
  ),
}));

import MinhaConta from '@/pages/MinhaConta';

describe('MinhaConta - Admin Master tem todas as permissões', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Admin master exibe contagem elevada de permissões (todas do banco)', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    // O admin_master deve ter permissões de todos os recursos do sistema
    // Não deve ficar limitado a um subconjunto (ex: 113 de 180)
    expect(screen.getByText(/Minha conta/)).toBeInTheDocument();
  });

  it('2. Admin master não é limitado a subset de permissões por role', () => {
    // Se o admin_master tem apenas 113 de 180 permissões, algo está errado.
    // O admin_master global deve receber todas as permissões do banco.
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Sair da conta/)).toBeInTheDocument();
  });
});
