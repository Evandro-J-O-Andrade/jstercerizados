import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthWelcome from './BoasVindas';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    identity: {
      firstName: 'Test',
      displayName: 'Test User',
      email: 'test@test.com',
      tenantLabel: 'Test Tenant',
      contextLabel: 'Test Tenant',
      dateTime: new Date().toLocaleString('pt-BR'),
    },
    userIdentity: { roleLabel: 'Candidato' },
  }),
}));

const baseAuth = {
  isAuthenticated: true,
  isLoading: false,
  person: {
    id: 'person-1',
    auth_user_id: 'user-1',
    full_name: 'Test User',
    email: 'test@test.com',
    status: 'active',
  },
  roles: [{ id: 'role-candidato', name: 'candidato', scope: 'tenant', is_global: false }],
  isAdminMaster: false,
  isCandidate: true,
  isEmpresa: false,
  firstLoginState: {
    welcome_completed_at: null,
    first_login_completed: false,
    must_change_password: false,
    terms_version: '1.0',
  },
  legalAcceptances: [{ document_type: 'terms' }],
  tenantMemberships: [
    {
      id: 'membership-1',
      tenant_id: 'tenant-1',
      person_id: 'person-1',
      membership_role: 'candidato',
      status: 'active',
    },
  ],
  recoveryMode: false,
  updateFirstLoginState: vi.fn().mockResolvedValue({ error: null }),
  resolvePostLoginDestination: vi.fn(() => '/auth/welcome'),
  refreshAuthData: vi.fn(),
  logout: vi.fn(),
  authError: null,
  permissions: [],
  roleAssignments: [],
} as any;

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(() => ({ ...baseAuth })),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

function renderWelcome(initialEntries: string[] = ['/auth/welcome']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/auth/welcome" element={<AuthWelcome />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/auth/terms" element={<div data-testid="terms-page">Termos</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BoasVindas - Route Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mocks.useAuth.mockReturnValue({ ...baseAuth });
  });

  it('shows welcome when first access pending (welcome_completed_at null)', async () => {
    mocks.useAuth.mockReturnValue({
      ...baseAuth,
      firstLoginState: {
        welcome_completed_at: null,
        first_login_completed: false,
        must_change_password: false,
        terms_version: '1.0',
      },
    });

    renderWelcome();

    await waitFor(() => {
      expect(screen.getByText(/Seja bem-vindo/i)).toBeInTheDocument();
    });
  });

  it('shows returning welcome when welcome_completed_at is set', async () => {
    mocks.useAuth.mockReturnValue({
      ...baseAuth,
      firstLoginState: {
        welcome_completed_at: new Date().toISOString(),
        first_login_completed: true,
        must_change_password: false,
        terms_version: '1.0',
      },
    });

    renderWelcome();

    await waitFor(() => {
      expect(screen.getByText(/Bom te ver novamente/i)).toBeInTheDocument();
    });
  });

  it('shows returning welcome on direct URL access after welcome completed', async () => {
    mocks.useAuth.mockReturnValue({
      ...baseAuth,
      firstLoginState: {
        welcome_completed_at: new Date().toISOString(),
        first_login_completed: true,
        must_change_password: false,
        terms_version: '1.0',
      },
    });

    renderWelcome(['/auth/welcome']);

    await waitFor(() => {
      expect(screen.getByText(/Bom te ver novamente/i)).toBeInTheDocument();
    });
  });

  it('shows page-loader while auth is loading', async () => {
    mocks.useAuth.mockReturnValue({
      ...baseAuth,
      isLoading: true,
      isAuthenticated: false,
      person: null,
    });

    renderWelcome();

    expect(screen.getByTestId('page-loader')).toBeInTheDocument();
  });
});