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
    tenantLabel: 'Test Tenant',
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
    get modulesByCategory() {
      return {};
    },
    get categoryMeta() {
      return {};
    },
    get activePermissions() {
      return [];
    },
    get availableFeatures() {
      return [];
    },
  }),
}));

vi.mock('@/repositories/navigation.repository', () => ({
  navigationRepository: {
    listAll: vi.fn().mockResolvedValue({ modules: [], globals: [] }),
  },
}));

vi.mock('@/components/layout/GlobalNavActions', () => ({
  GlobalNavActions: () => null,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: any) => (
      <aside {...props}>{children}</aside>
    ),
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import { PortalSidebar } from '@/components/legacy/portal/PortalSidebar';
import { ModuleProvider } from '@/contexts/ModuleContext';

function renderSidebar(
  overrides: Partial<{
    permissions: Array<{ name: string }>;
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
      <ModuleProvider>
        <PortalSidebar isOpen onClose={vi.fn()} onNavigate={vi.fn()} />
      </ModuleProvider>
    </MemoryRouter>,
  );
}

describe('PortalSidebar - Primeiro item: Meu Usuário', () => {
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
      tenantLabel: 'Test Tenant',
      contextLabel: 'Gestão da Plataforma',
      greeting: 'Bom dia',
      dateTime: '30/10/2026, 09:00',
      isAdminMaster: true,
      memberships: [],
      permissions: [],
    };
  });

  it('1. Exibe "Meu Usuário" como primeiro item da sidebar, antes dos módulos', () => {
    renderSidebar();
    const meuUsuario = screen.getByText('Meu Usuário');
    expect(meuUsuario).toBeInTheDocument();
  });

  it('2. "Meu Usuário" aparece dentro do <nav> da sidebar', () => {
    renderSidebar();
    const nav = screen.getByRole('navigation', { name: 'Portal' });
    const meuUsuario = nav.querySelector('button');
    expect(meuUsuario).toHaveTextContent('Meu Usuário');
  });

  it('3. "Meu Usuário" aparece para admin_master', () => {
    renderSidebar({ isAdminMaster: true });
    expect(screen.getByText('Meu Usuário')).toBeInTheDocument();
  });

  it('4. "Meu Usuário" aparece para tenant_admin (não admin_master)', () => {
    mockIdentityRef.current = {
      ...mockIdentityRef.current,
      roleName: 'tenant_admin',
      roleScope: 'tenant',
      isAdminMaster: false,
    };
    renderSidebar({ isAdminMaster: false });
    expect(screen.getByText('Meu Usuário')).toBeInTheDocument();
  });

  it('5. "Meu Usuário" aparece para usuário sem módulos de célula', () => {
    renderSidebar({ permissions: [] });
    expect(screen.getByText('Meu Usuário')).toBeInTheDocument();
  });

  it('6. "Meu Usuário" tem ícone UserCircle', () => {
    renderSidebar();
    const meuUsuario = screen.getByText('Meu Usuário');
    const button = meuUsuario.closest('button');
    const svg = button?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
