import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const mockUseAuth = vi.mocked(useAuth);

function renderWithRoute(
  initialEntries: string[],
  authState: Partial<ReturnType<typeof useAuth>>,
) {
  mockUseAuth.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    person: { id: 'p1', full_name: 'Teste', email: 't@t.com' } as any,
    tenantMemberships: [],
    currentTenantId: 't1',
    tenants: [{ id: 't1', name: 'J&S' }],
    roles: [],
    permissions: [],
    roleAssignments: [],
    firstLoginState: null,
    legalAcceptances: [],
    isAdminMaster: false,
    isCandidate: false,
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
    ...authState,
  } as any);

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute
              allowedRoles={[
                'admin_master',
                'tenant_admin',
                'rh_manager',
                'recruiter',
                'finance',
                'finance_manager',
                'commercial',
                'operator',
                'operations_manager',
                'stock_manager',
                'security_manager',
                'facilities_manager',
                'lawyer',
                'it_admin',
                'support',
                'viewer',
              ]}
            >
              <div data-testid="dashboard-shell">Dashboard Admin</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidato"
          element={
            <div data-testid="candidate-dashboard">Candidate Portal</div>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute — candidato RBAC (P0)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(' candidato puro em /dashboard é redirecionado para /candidato', () => {
    const { container } = renderWithRoute(['/dashboard'], {
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      isCandidate: true,
      isAdminMaster: false,
    });

    expect(container.textContent).not.toContain('Dashboard Admin');
    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
  });

  it(' candidato puro em /dashboard/global é redirecionado para /candidato', () => {
    const { container } = renderWithRoute(['/dashboard/global'], {
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      isCandidate: true,
      isAdminMaster: false,
    });

    expect(container.textContent).not.toContain('Dashboard Admin');
    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
  });

  it(' candidato puro em /dashboard/candidatos é redirecionado para /candidato', () => {
    const { container } = renderWithRoute(['/dashboard/candidatos'], {
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      isCandidate: true,
      isAdminMaster: false,
    });

    expect(container.textContent).not.toContain('Dashboard Admin');
    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
  });

  it(' admin_master em /dashboard não é redirecionado (mantém acesso)', () => {
    renderWithRoute(['/dashboard'], {
      roles: [{ id: 'r1', name: 'admin_master', scope: 'global' } as any],
      isCandidate: true,
      isAdminMaster: true,
    });

    expect(screen.getByTestId('dashboard-shell')).toBeInTheDocument();
  });

  it(' rh_manager em /dashboard não é redirecionado (mantém acesso)', () => {
    renderWithRoute(['/dashboard'], {
      roles: [{ id: 'r1', name: 'rh_manager', scope: 'tenant' } as any],
      isCandidate: false,
      isAdminMaster: false,
    });

    expect(screen.getByTestId('dashboard-shell')).toBeInTheDocument();
  });
});

describe('ProtectedRoute — candidato RBAC (P1 — redirect contextual)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(' TESTE 1: candidato acessa /candidato permanece no portal candidato', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      person: { id: 'p1', full_name: 'Candidato', email: 'c@t.com' } as any,
      tenantMemberships: [],
      currentTenantId: 't1',
      tenants: [{ id: 't1', name: 'J&S' }],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      permissions: [],
      roleAssignments: [],
      firstLoginState: null,
      legalAcceptances: [],
      isAdminMaster: false,
      isCandidate: true,
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
    } as any);

    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <Routes>
          <Route
            path="/candidato"
            element={
              <ProtectedRoute>
                <div data-testid="candidato-portal">Portal Candidato</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('candidato-portal')).toBeInTheDocument();
  });

  it(' TESTE 2: candidato tentando /dashboard é redirecionado para /candidato', () => {
    const { container } = renderWithRoute(['/dashboard'], {
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      isCandidate: true,
      isAdminMaster: false,
    });

    expect(container.textContent).not.toContain('Dashboard Admin');
    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
  });

  it(' TESTE 3: candidato tentando /dashboard/global é redirecionado para /candidato', () => {
    const { container } = renderWithRoute(['/dashboard/global'], {
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      isCandidate: true,
      isAdminMaster: false,
    });

    expect(container.textContent).not.toContain('Dashboard Admin');
    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
  });

  it(' TESTE 4: candidato tentando sub-rota administrativa é redirecionado para /candidato', () => {
    const { container } = renderWithRoute(['/dashboard/candidatos'], {
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      isCandidate: true,
      isAdminMaster: false,
    });

    expect(container.textContent).not.toContain('Dashboard Admin');
    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
  });

  it(' TESTE 5: Admin Master acessa /dashboard permanece no dashboard', () => {
    renderWithRoute(['/dashboard'], {
      roles: [{ id: 'r1', name: 'admin_master', scope: 'global' } as any],
      isCandidate: false,
      isAdminMaster: true,
    });

    expect(screen.getByTestId('dashboard-shell')).toBeInTheDocument();
  });

  it(' TESTE 6: Admin Master acessa /dashboard/global não é redirecionado para /candidato', () => {
    const { container } = renderWithRoute(['/dashboard/global'], {
      roles: [{ id: 'r1', name: 'admin_master', scope: 'global' } as any],
      isCandidate: false,
      isAdminMaster: true,
    });

    expect(container.textContent).toContain('Dashboard Admin');
    expect(container.textContent).not.toContain('Portal Candidato');
  });

  it(' TESTE 7: usuário não autenticado é redirecionado para /entrar (não para /candidato)', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      person: null,
      tenantMemberships: [],
      currentTenantId: null,
      tenants: [],
      roles: [],
      permissions: [],
      roleAssignments: [],
      firstLoginState: null,
      legalAcceptances: [],
      isAdminMaster: false,
      isCandidate: false,
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
    } as any);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin_master']}>
                <div data-testid="dashboard-shell">Dashboard Admin</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/entrar"
            element={<div data-testid="entrar-page">Entrar</div>}
          />
          <Route
            path="/candidato"
            element={
              <div data-testid="candidate-dashboard">Candidate Portal</div>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('entrar-page')).toBeInTheDocument();
    expect(screen.queryByTestId('candidate-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-shell')).not.toBeInTheDocument();
  });

  it(' TESTE 8: redirect para /candidato não causa loop (apenas uma navegação)', () => {
    const navigationCount = { value: 0 };

    function TrackingCandidate() {
      navigationCount.value += 1;
      return <div data-testid="candidate-dashboard">Candidate Portal</div>;
    }

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      person: { id: 'p1', full_name: 'Candidato', email: 'c@t.com' } as any,
      tenantMemberships: [],
      currentTenantId: 't1',
      tenants: [{ id: 't1', name: 'J&S' }],
      roles: [{ id: 'r1', name: 'candidato', scope: 'tenant' } as any],
      permissions: [],
      roleAssignments: [],
      firstLoginState: null,
      legalAcceptances: [],
      isAdminMaster: false,
      isCandidate: true,
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
    } as any);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'admin_master',
                  'tenant_admin',
                  'rh_manager',
                  'recruiter',
                  'finance',
                  'finance_manager',
                  'commercial',
                  'operator',
                  'operations_manager',
                  'stock_manager',
                  'security_manager',
                  'facilities_manager',
                  'lawyer',
                  'it_admin',
                  'support',
                  'viewer',
                ]}
              >
                <div data-testid="dashboard-shell">Dashboard Admin</div>
              </ProtectedRoute>
            }
          />
          <Route path="/candidato" element={<TrackingCandidate />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
    expect(navigationCount.value).toBe(1);
  });
});
