import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useAccount: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mocks.useAuth,
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: mocks.useAccount,
}));

import { AuthRoute } from '@/components/auth/AuthRoute';
import AuthWelcome from '@/pages/auth/BoasVindas';

const person = {
  full_name: 'Ana Silva',
  email: 'ana@example.com',
};

const account = {
  identity: {
    firstName: 'Ana',
    displayName: 'Ana Silva',
    email: 'ana@example.com',
    tenantLabel: 'Empresa',
    contextLabel: 'Empresa',
    dateTime: '5 de outubro de 2026 10:00',
  },
  userIdentity: { roleLabel: 'Candidato' },
};

function renderWelcome() {
  return render(
    <MemoryRouter initialEntries={['/auth/welcome']}>
      <Routes>
        <Route path="/auth/welcome" element={<AuthWelcome />} />
        <Route
          path="/login"
          element={<div data-testid="login-page">Login</div>}
        />
        <Route
          path="/candidato"
          element={<div data-testid="candidate-portal">Portal</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <AuthRoute>
              <div data-testid="protected-dashboard">Dashboard</div>
            </AuthRoute>
          }
        />
        <Route
          path="/auth/welcome"
          element={<div data-testid="welcome-page">Welcome</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('post-login welcome flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAccount.mockReturnValue(account);
  });

  it('waits for auth hydration before deciding whether to show welcome', async () => {
    mocks.useAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      person: null,
      roles: [],
      isAdminMaster: false,
      resolvePostLoginDestination: vi.fn(),
    });

    const view = renderWelcome();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();

    mocks.useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      person,
      roles: [{ name: 'candidato', scope: 'tenant' }],
      isAdminMaster: false,
      firstLoginState: { welcome_completed_at: null },
      updateFirstLoginState: vi.fn(),
      resolvePostLoginDestination: vi.fn(() => '/auth/welcome'),
    });

    view.rerender(
      <MemoryRouter initialEntries={['/auth/welcome']}>
        <Routes>
          <Route path="/auth/welcome" element={<AuthWelcome />} />
          <Route
            path="/login"
            element={<div data-testid="login-page">Login</div>}
          />
          <Route
            path="/candidato"
            element={<div data-testid="candidate-portal">Portal</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: /Seja bem-vindo, Ana/ }),
    ).toBeInTheDocument();
  });

  it('shows the returning welcome screen after a new login', async () => {
    mocks.useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      person,
      roles: [{ name: 'candidato', scope: 'tenant' }],
      isAdminMaster: false,
      firstLoginState: { welcome_completed_at: '2026-10-04T10:00:00Z' },
      updateFirstLoginState: vi.fn(),
      resolvePostLoginDestination: vi.fn(() => '/auth/welcome'),
    });

    renderWelcome();

    expect(
      await screen.findByRole('heading', { name: /Bom te ver novamente, Ana/ }),
    ).toBeInTheDocument();
  });

  it('does not treat first_login_completed as a completed welcome', async () => {
    mocks.useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      person,
      firstLoginState: {
        first_login_completed: true,
        welcome_completed_at: null,
        terms_version: '1.0',
      },
      legalAcceptances: [{ document_type: 'terms' }],
    });

    renderProtectedRoute();

    expect(await screen.findByTestId('welcome-page')).toBeInTheDocument();
  });

  it('keeps an already welcomed user on the protected route after refresh', async () => {
    mocks.useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      person,
      firstLoginState: {
        first_login_completed: true,
        welcome_completed_at: '2026-10-04T10:00:00Z',
        terms_version: '1.0',
      },
      legalAcceptances: [{ document_type: 'terms' }],
    });

    renderProtectedRoute();

    expect(
      await screen.findByTestId('protected-dashboard'),
    ).toBeInTheDocument();
  });
});
