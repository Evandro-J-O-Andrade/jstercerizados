import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockIdentityRef = {
  current: {
    firstName: 'Maria',
    displayName: 'Maria Souza',
    email: 'm@x.com',
    personId: 'p1',
    roleName: 'admin_master',
    roleLabel: 'Administrador Master',
    roleScope: 'global' as 'global' | 'tenant',
    tenantName: 'Test Tenant',
    contextLabel: 'Gestão da Plataforma',
    greeting: 'Bom dia',
    dateTime: '30/10/2026, 09:00',
    isAdminMaster: true,
    memberships: [],
    permissions: [],
  },
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    person: { id: 'p1', full_name: 'Maria Souza', email: 'm@x.com' },
    roles: [{ id: 'r1', name: 'admin_master', is_global: true }],
    permissions: [],
    logout: vi.fn(),
    hasPermission: vi.fn(() => false),
    hasAnyPermission: vi.fn(() => false),
    hasAllPermissions: vi.fn(() => false),
  }),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    get identity() {
      return mockIdentityRef.current;
    },
    get activeRole() {
      return { id: 'r1', name: 'admin_master', is_global: true };
    },
    get activeTenantId() {
      return 'tenant-1';
    },
    get availableMemberships() {
      return [
        {
          id: 'm1',
          tenant_id: 'tenant-1',
          membership_role: 'r1',
          status: 'active',
        },
      ];
    },
    get switchAccount() {
      return vi.fn();
    },
    get effectiveScopes() {
      return ['global', 'tenant'] as const;
    },
    get permissions() {
      return [];
    },
  }),
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('@/platform/platform-context', () => ({
  usePlatformContext: () => ({ effectiveScopes: ['global', 'tenant'] }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: any) => (
      <aside {...props}>{children}</aside>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import { AdminSidebar } from '@/shell/AdminSidebar';

function renderSidebar(
  overrides: Partial<{
    isAdminMaster: boolean;
    identity: typeof mockIdentityRef.current;
  }> = {},
) {
  mockIdentityRef.current = {
    ...mockIdentityRef.current,
    ...overrides.identity,
  };

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AdminSidebar isOpen onClose={vi.fn()} onNavigate={vi.fn()} />
    </MemoryRouter>,
  );
}

describe('AdminSidebar - Primeiro item: Meu Usuário', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIdentityRef.current = {
      firstName: 'Maria',
      displayName: 'Maria Souza',
      email: 'm@x.com',
      personId: 'p1',
      roleName: 'admin_master',
      roleLabel: 'Administrador Master',
      roleScope: 'global' as const,
      tenantName: 'Test Tenant',
      contextLabel: 'Gestão da Plataforma',
      greeting: 'Bom dia',
      dateTime: '30/10/2026, 09:00',
      isAdminMaster: true,
      memberships: [],
      permissions: [],
    };
  });

  it('1. Exibe a Central 24H como primeiro item para Admin Master', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation', { name: 'Módulos' });
    const links = nav.querySelectorAll('a');
    expect(links[0]).toHaveTextContent('Central 24H');
    expect(links[0]).toHaveAttribute('href', '/dashboard/global');
    expect(links[1]).toHaveTextContent('Admin Master');
    expect(links[1]).toHaveAttribute('href', '/dashboard/admin-master');
  });

  it('2. mantém "Meu Usuário" como primeiro item para perfis de tenant', () => {
    mockIdentityRef.current = {
      ...mockIdentityRef.current,
      roleName: 'tenant_admin',
      roleScope: 'tenant',
      isAdminMaster: false,
    };
    renderSidebar({ isAdminMaster: false });
    const nav = screen.getByRole('navigation', { name: 'Módulos' });
    const primeiroLink = nav.querySelector('a');
    expect(primeiroLink).toHaveTextContent('Meu Usuário');
  });

  it('3. mantém acesso à conta no rodapé para admin_master', () => {
    renderSidebar({ isAdminMaster: true });
    expect(
      screen.getByRole('button', { name: /Maria Souza, Administrador Master/i }),
    ).toBeInTheDocument();
  });

  it('4. "Meu Usuário" aparece para tenant_admin', () => {
    mockIdentityRef.current = {
      ...mockIdentityRef.current,
      roleName: 'tenant_admin',
      roleScope: 'tenant',
      isAdminMaster: false,
    };
    renderSidebar({ isAdminMaster: false });
    expect(screen.getByText('Meu Usuário')).toBeInTheDocument();
  });
});
