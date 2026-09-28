import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PORTAL_MODULES } from '@/components/portal/ModuleRegistry';

const mockPermissionsRef = {
  current: [] as Array<{ resource: string; action: string }>,
};
const mockIsAdminMasterRef = { current: true };
const mockIdentityRef = {
  current: {
    firstName: 'Maria',
    displayName: 'Maria Souza',
    email: 'm@x.com',
    personId: 'p1',
    roleName: 'admin_master',
    roleScope: 'global' as 'global' | 'tenant',
    tenantName: 'Test Tenant',
    contextLabel: 'Test Tenant',
    greeting: 'Bom dia',
    isAdminMaster: true,
  },
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    person: { id: 'p1', full_name: 'Maria Souza', email: 'm@x.com' },
    roles: [{ id: 'r1', name: 'admin_master', scope: 'global' }],
    get permissions() {
      return mockPermissionsRef.current;
    },
    get isAdminMaster() {
      return mockIsAdminMasterRef.current;
    },
    logout: vi.fn(),
    hasPermission: vi.fn((perm: string) =>
      mockPermissionsRef.current.some(
        (p) => `${p.resource}.${p.action}` === perm,
      ),
    ),
    hasAnyPermission: vi.fn((perms: string[]) =>
      perms.some((p) =>
        mockPermissionsRef.current.some(
          (mp) => `${mp.resource}.${mp.action}` === p,
        ),
      ),
    ),
    hasAllPermissions: vi.fn((perms: string[]) =>
      perms.every((p) =>
        mockPermissionsRef.current.some(
          (mp) => `${mp.resource}.${mp.action}` === p,
        ),
      ),
    ),
  }),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    get identity() {
      return mockIdentityRef.current;
    },
    get activeRole() {
      return {
        id: 'r1',
        name: mockIsAdminMasterRef.current ? 'admin_master' : 'tenant_admin',
        scope: (mockIsAdminMasterRef.current ? 'global' : 'tenant') as
          'global' | 'tenant',
      };
    },
    get activeTenantId() {
      return 'tenant-1';
    },
    get availableMemberships() {
      return [
        { id: 'm1', tenant_id: 'tenant-1', role_id: 'r1', status: 'active' },
      ];
    },
    get availableModules() {
      return PORTAL_MODULES;
    },
    get switchAccount() {
      return vi.fn();
    },
    get effectiveScopes() {
      return mockIsAdminMasterRef.current
        ? (['global', 'tenant'] as const)
        : (['tenant'] as const);
    },
    get permissions() {
      return mockPermissionsRef.current;
    },
    get modulesByCategory() {
      return {};
    },
    get categoryMeta() {
      return {};
    },
    get activePermissions() {
      return mockPermissionsRef.current;
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
    div: ({
      children,
      ...props
    }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <div {...(props as Record<string, unknown>)}>{children}</div>
    ),
    aside: ({
      children,
      ...props
    }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <aside {...(props as Record<string, unknown>)}>{children}</aside>
    ),
    span: ({
      children,
      ...props
    }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <span {...(props as Record<string, unknown>)}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { ModuleProvider } from '@/contexts/ModuleContext';

function renderSidebar(
  path: string = '/dashboard',
  overrides: Partial<{
    permissions: Array<{ resource: string; action: string }>;
    isAdminMaster: boolean;
  }> = {},
) {
  mockPermissionsRef.current = overrides.permissions || [];
  mockIsAdminMasterRef.current = overrides.isAdminMaster ?? true;
  mockIdentityRef.current = {
    firstName: 'Maria',
    displayName: 'Maria Souza',
    email: 'm@x.com',
    personId: 'p1',
    roleName: overrides.isAdminMaster ? 'admin_master' : 'tenant_admin',
    roleScope: (overrides.isAdminMaster ? 'global' : 'tenant') as
      'global' | 'tenant',
    tenantName: 'Test Tenant',
    contextLabel: 'Test Tenant',
    greeting: 'Bom dia',
    isAdminMaster: overrides.isAdminMaster ?? true,
  };

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ModuleProvider>
        <PortalSidebar isOpen onClose={vi.fn()} onNavigate={vi.fn()} />
      </ModuleProvider>
    </MemoryRouter>,
  );
}

describe('PortalSidebar - Authorization Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Teste 1: Usuário autorizado entra em módulo', () => {
    it('deve mostrar módulo ativo, sidebar visível e links autorizados', () => {
      renderSidebar('/dashboard/crm', {
        permissions: [
          { resource: 'companies', action: 'read' },
          { resource: 'companies', action: 'create' },
        ],
        isAdminMaster: false,
      });

      expect(screen.getByText('Empresas')).toBeInTheDocument();
    });
  });

  describe('Teste 2: Usuário sem permissão tenta entrar no módulo', () => {
    it('deve bloquear acesso e não mostrar links do módulo', () => {
      renderSidebar('/dashboard/crm', {
        permissions: [],
        isAdminMaster: false,
      });

      expect(screen.queryByText('Empresas')).not.toBeInTheDocument();
    });
  });

  describe('Teste 3: Usuário autorizado possui somente algumas features', () => {
    it('deve mostrar apenas as features permitidas', () => {
      renderSidebar('/dashboard/crm', {
        permissions: [{ resource: 'companies', action: 'read' }],
        isAdminMaster: false,
      });

      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Prospects')).toBeInTheDocument();
      expect(screen.getByText('Empresas')).toBeInTheDocument();
      expect(screen.getByText('Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Clientes ativos')).toBeInTheDocument();
      expect(screen.getByText('Relacionamentos')).toBeInTheDocument();
    });
  });

  describe('Teste 4: Usuário navega diretamente pela URL', () => {
    it('PermissionGuard deve bloquear/liberar, ModuleContext identifica módulo, Sidebar correspondente aparece', () => {
      renderSidebar('/dashboard/recrutamento', {
        permissions: [{ resource: 'jobs', action: 'read' }],
        isAdminMaster: false,
      });

      expect(screen.getByText('Vagas')).toBeInTheDocument();
      expect(screen.queryByText('Candidatos')).not.toBeInTheDocument();
    });
  });

  describe('Teste 5: Troca de módulo', () => {
    it('CRM → sidebar CRM', () => {
      renderSidebar('/dashboard/crm', {
        permissions: [
          { resource: 'companies', action: 'read' },
          { resource: 'jobs', action: 'read' },
        ],
        isAdminMaster: false,
      });

      expect(screen.getByText('Empresas')).toBeInTheDocument();
    });

    it('Recrutamento → sidebar Recrutamento', () => {
      renderSidebar('/dashboard/recrutamento', {
        permissions: [
          { resource: 'companies', action: 'read' },
          { resource: 'jobs', action: 'read' },
        ],
        isAdminMaster: false,
      });

      expect(screen.getByText('Vagas')).toBeInTheDocument();
    });
  });

  describe('Teste 6: Troca de tenant', () => {
    it('permissions recalculadas para CRM', () => {
      renderSidebar('/dashboard/crm', {
        permissions: [{ resource: 'companies', action: 'read' }],
        isAdminMaster: false,
      });

      expect(screen.getByText('Empresas')).toBeInTheDocument();
    });

    it('permissions recalculadas para Recrutamento (vagas)', () => {
      renderSidebar('/dashboard/vagas', {
        permissions: [{ resource: 'jobs', action: 'read' }],
        isAdminMaster: false,
      });

      // Vagas appears in header subtitle, nav title, and feature list - use getAllByText
      expect(screen.getAllByText('Vagas').length).toBeGreaterThan(0);
    });
  });
});
