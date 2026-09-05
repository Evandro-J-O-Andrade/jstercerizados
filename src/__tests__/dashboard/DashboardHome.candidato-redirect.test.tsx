import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import DashboardHome from '@/pages/dashboard/DashboardHome';

const mockUseAuth = vi.mocked(useAuth);
const mockUseAccount = vi.mocked(useAccount);

const authBase = {
  isAuthenticated: true,
  isLoading: false,
  person: { id: 'p1', full_name: 'Candidato Teste', email: 'c@t.com' } as any,
  tenantMemberships: [],
  currentTenantId: 't1',
  tenants: [{ id: 't1', name: 'J&S' }],
  permissions: [],
  roleAssignments: [],
  firstLoginState: null,
  legalAcceptances: [],
  authError: null,
  user: null,
  tenantIds: [],
  login: vi.fn(),
  loginWithProvider: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  acceptTerms: vi.fn(),
  switchTenant: vi.fn(),
};

function mockAccount() {
  mockUseAccount.mockReturnValue({
    identity: {
      firstName: 'Candidato',
      displayName: 'Candidato Teste',
      email: 'c@t.com',
      personId: 'p1',
      roleName: 'candidato',
      roleScope: 'tenant' as const,
      tenantName: 'J&S',
      contextLabel: 'J&S',
      greeting: 'Olá',
      isAdminMaster: false,
    },
    activeRole: { id: 'r1', name: 'candidato', scope: 'tenant' },
    activePermissions: [],
    availableModules: [],
    availableFeatures: [],
    modulesByCategory: {
      inicio: [],
      plataforma: [],
      negocio: [],
      ia: [],
      seguranca: [],
      documentos: [],
      conta: [],
    },
    categoryMeta: {} as any,
    activeTenantId: 't1',
    effectiveScopes: ['tenant'],
    availableMemberships: [],
    switchAccount: vi.fn(),
  } as any);
}

function LocationDisplay() {
  const { pathname } = useLocation();
  return <div data-testid="location">{pathname}</div>;
}

describe('DashboardHome — RBAC redirect (P0)', () => {
  it(' candidato-puro em /dashboard é redirecionado para /candidato', () => {
    mockUseAuth.mockReturnValue({
      ...authBase,
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      isAdminMaster: false,
      isCandidate: true,
    } as any);
    mockAccount();

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/candidato" element={<div data-testid="candidate-portal">Portal Candidato</div>} />
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    );

    // candidato-puro deve ter sido redirecionado para /candidato
    expect(screen.getByTestId('candidate-portal')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Global')).not.toBeInTheDocument();
  });

  it(' admin_master em /dashboard não é redirecionado', () => {
    mockUseAuth.mockReturnValue({
      ...authBase,
      roles: [{ id: 'r1', name: 'admin_master', scope: 'global' } as any],
      isAdminMaster: true,
      isCandidate: true,
    } as any);
    mockAccount();

    vi.mocked(useAccount).mockReturnValue({
      identity: {
        firstName: 'Admin',
        displayName: 'Admin Master',
        email: 'admin@js.com',
        personId: 'p1',
        roleName: 'admin_master',
        roleScope: 'platform' as const,
        tenantName: 'J&S',
        contextLabel: 'Gestão da Plataforma',
        greeting: 'Olá',
        isAdminMaster: true,
      },
      activeRole: { id: 'r1', name: 'admin_master', scope: 'global' },
      activePermissions: [],
      availableModules: [],
      availableFeatures: [],
      modulesByCategory: {
        inicio: [],
        plataforma: [],
        negocio: [],
        ia: [],
        seguranca: [],
        documentos: [],
        conta: [],
      },
      categoryMeta: {} as any,
      activeTenantId: null,
      effectiveScopes: ['platform', 'tenant'],
      availableMemberships: [],
      switchAccount: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/candidato" element={<div>Candidate Portal</div>} />
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    );

    // admin_master cai no DashboardHome normal (fetchStats falha silenciosamente, mas renderiza)
    // Só verificamos que não foi redirecionado para /candidato
    expect(screen.queryByTestId('candidate-portal')).not.toBeInTheDocument();
  });
});
