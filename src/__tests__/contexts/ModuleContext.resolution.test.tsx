import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    person: { id: 'p1', full_name: 'Maria Souza', email: 'm@x.com' },
    roles: [{ id: 'r1', name: 'admin_master', scope: 'global' }],
    permissions: [
      { resource: 'companies', action: 'read' },
      { resource: 'companies', action: 'create' },
      { resource: 'jobs', action: 'read' },
      { resource: 'jobs', action: 'create' },
      { resource: 'candidates', action: 'read' },
    ],
    isAdminMaster: true,
    logout: vi.fn(),
    hasPermission: vi.fn(),
    hasAnyPermission: vi.fn(),
    hasAllPermissions: vi.fn(),
  }),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    identity: {
      firstName: 'Maria',
      displayName: 'Maria Souza',
      email: 'm@x.com',
      personId: 'p1',
      roleName: 'admin_master',
      roleScope: 'global',
      tenantName: '',
      contextLabel: 'Painel Administrativo',
      greeting: '',
      isAdminMaster: true,
    },
    activeRole: { id: 'r1', name: 'admin_master', scope: 'global' },
    activeTenantId: null,
    availableMemberships: [],
    availableModules: [],
    switchAccount: vi.fn(),
    effectiveScopes: ['global', 'tenant'],
    permissions: [
      { resource: 'companies', action: 'read' },
      { resource: 'companies', action: 'create' },
      { resource: 'jobs', action: 'read' },
      { resource: 'jobs', action: 'create' },
      { resource: 'candidates', action: 'read' },
    ],
    modulesByCategory: {},
    categoryMeta: {},
    activePermissions: [],
    availableFeatures: [],
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

import { ModuleProvider, useModuleContext } from '@/contexts/ModuleContext';

function TestComponent() {
  const { currentModule, currentFeature, isModuleLauncher } =
    useModuleContext();
  return (
    <div>
      <span data-testid="is-launcher">{String(isModuleLauncher)}</span>
      <span data-testid="module-title">{currentModule?.title || 'none'}</span>
      <span data-testid="module-id">{currentModule?.id || 'none'}</span>
      <span data-testid="feature-title">{currentFeature?.title || 'none'}</span>
      <span data-testid="feature-id">{currentFeature?.id || 'none'}</span>
    </div>
  );
}

function renderWithModuleContext(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ModuleProvider>
        <TestComponent />
      </ModuleProvider>
    </MemoryRouter>,
  );
}

describe('ModuleContext - URL to Module Resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve identificar /dashboard como module launcher (isModuleLauncher = true)', () => {
    renderWithModuleContext('/dashboard');
    expect(screen.getByTestId('is-launcher').textContent).toBe('true');
    expect(screen.getByTestId('module-title').textContent).toBe('none');
  });

  it('deve identificar /dashboard/empresas como feature empresas do módulo CRM', () => {
    renderWithModuleContext('/dashboard/empresas');
    expect(screen.getByTestId('is-launcher').textContent).toBe('false');
    expect(screen.getByTestId('module-id').textContent).toBe('crm');
    expect(screen.getByTestId('module-title').textContent).toBe('CRM');
    expect(screen.getByTestId('feature-id').textContent).toBe('empresas');
    expect(screen.getByTestId('feature-title').textContent).toBe('Empresas');
  });

  it('deve identificar /dashboard/vagas como feature vagas do módulo Recrutamento', () => {
    renderWithModuleContext('/dashboard/vagas');
    expect(screen.getByTestId('is-launcher').textContent).toBe('false');
    expect(screen.getByTestId('module-id').textContent).toBe('recrutamento');
    expect(screen.getByTestId('module-title').textContent).toBe('Recrutamento');
    expect(screen.getByTestId('feature-id').textContent).toBe('vagas');
    expect(screen.getByTestId('feature-title').textContent).toBe('Vagas');
  });

  it('deve identificar sub-rotas do módulo empresas (feature empresas do CRM)', () => {
    renderWithModuleContext('/dashboard/empresas/nova');
    expect(screen.getByTestId('is-launcher').textContent).toBe('false');
    expect(screen.getByTestId('module-id').textContent).toBe('crm');
    expect(screen.getByTestId('feature-id').textContent).toBe('empresas');
    expect(screen.getByTestId('feature-title').textContent).toBe('Empresas');
  });

  it('deve identificar sub-rotas do módulo recrutamento (vagas)', () => {
    renderWithModuleContext('/dashboard/vagas/nova');
    expect(screen.getByTestId('is-launcher').textContent).toBe('false');
    expect(screen.getByTestId('module-id').textContent).toBe('recrutamento');
    expect(screen.getByTestId('feature-id').textContent).toBe('vagas');
    expect(screen.getByTestId('feature-title').textContent).toBe('Vagas');
  });

  it('deve identificar /dashboard/clientes como feature clientes do módulo RH', () => {
    renderWithModuleContext('/dashboard/clientes');
    expect(screen.getByTestId('is-launcher').textContent).toBe('false');
    expect(screen.getByTestId('module-id').textContent).toBe('rh');
    expect(screen.getByTestId('module-title').textContent).toBe(
      'Recursos Humanos',
    );
    expect(screen.getByTestId('feature-id').textContent).toBe('clientes');
    expect(screen.getByTestId('feature-title').textContent).toBe('Clientes');
  });

  it('deve identificar /dashboard/crm como módulo CRM', () => {
    renderWithModuleContext('/dashboard/crm');
    expect(screen.getByTestId('is-launcher').textContent).toBe('false');
    expect(screen.getByTestId('module-id').textContent).toBe('crm');
    expect(screen.getByTestId('module-title').textContent).toBe('CRM');
  });

  it('deve identificar /dashboard/financeiro como módulo Financeiro', () => {
    renderWithModuleContext('/dashboard/financeiro');
    expect(screen.getByTestId('is-launcher').textContent).toBe('false');
    expect(screen.getByTestId('module-id').textContent).toBe('financeiro');
    expect(screen.getByTestId('module-title').textContent).toBe('Financeiro');
  });

  it('deve identificar /dashboard/relatorios como módulo Relatórios', () => {
    renderWithModuleContext('/dashboard/relatorios');
    expect(screen.getByTestId('is-launcher').textContent).toBe('false');
    expect(screen.getByTestId('module-id').textContent).toBe('relatorios');
    expect(screen.getByTestId('module-title').textContent).toBe('Relatórios');
  });
});
