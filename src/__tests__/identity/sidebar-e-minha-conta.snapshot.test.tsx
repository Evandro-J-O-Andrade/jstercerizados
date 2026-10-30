import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockIdentityRef = {
  current: {
    firstName: 'Maria',
    displayName: 'Maria Souza',
    email: 'm@x.com',
    personId: 'p1',
    roleName: 'tenant_admin',
    roleLabel: 'Administrador do Tenant',
    roleScope: 'tenant' as 'global' | 'tenant',
    tenantName: 'J&S Empregos LTDA',
    tenantLabel: 'J&S Empregos LTDA',
    contextLabel: 'J&S Empregos LTDA',
    greeting: 'Bom dia',
    dateTime: '30/10/2026, 09:00',
    isAdminMaster: false,
    memberships: [],
    permissions: [],
  },
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    person: { id: 'p1', full_name: 'Maria Souza', email: 'm@x.com' },
    roles: [{ id: 'r1', name: 'tenant_admin', is_global: false }],
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
      return { id: 'r1', name: 'tenant_admin', is_global: false };
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
      return ['tenant'] as const;
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

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    toggleTheme: vi.fn(),
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

vi.mock('@/components/ui/SEO', () => ({
  SEO: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="seo">{children}</div>
  ),
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
import { AdminSidebar } from '@/shell/AdminSidebar';
import MinhaConta from '@/pages/MinhaConta';
import { ModuleProvider } from '@/contexts/ModuleContext';

describe('Snapshots - Sidebar e MinhaConta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIdentityRef.current = {
      firstName: 'Maria',
      displayName: 'Maria Souza',
      email: 'm@x.com',
      personId: 'p1',
      roleName: 'tenant_admin',
      roleLabel: 'Administrador do Tenant',
      roleScope: 'tenant' as const,
      tenantName: 'J&S Empregos LTDA',
      tenantLabel: 'J&S Empregos LTDA',
      contextLabel: 'J&S Empregos LTDA',
      greeting: 'Bom dia',
      dateTime: '30/10/2026, 09:00',
      isAdminMaster: false,
      memberships: [],
      permissions: [],
    };
  });

  it('1. Snapshot PortalSidebar com "Meu Usuário" como primeiro item', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ModuleProvider>
          <PortalSidebar isOpen onClose={vi.fn()} onNavigate={vi.fn()} />
        </ModuleProvider>
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it('2. Snapshot AdminSidebar com "Meu Usuário" como primeiro item', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AdminSidebar isOpen onClose={vi.fn()} onNavigate={vi.fn()} />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it('3. Snapshot MinhaConta com dados reais da identidade', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <MinhaConta />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
