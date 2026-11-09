import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthCallback from '@/pages/auth/AuthCallback';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }));

const resolveDestination = vi.fn(() => '/selecionar-tenant');

/** Constrói um mock completo e tipado do contexto de autenticação para testes isolados. */
function createAuthMock(overrides: Partial<ReturnType<typeof useAuth>> = {}): ReturnType<typeof useAuth> {
  return {
    user: null,
    person: null,
    tenantMemberships: [],
    currentTenantId: null,
    tenantIds: [],
    tenants: [],
    roles: [],
    permissions: [],
    roleAssignments: [],
    firstLoginState: null,
    legalAcceptances: [],
    isAdminMaster: false,
    isCandidate: false,
    isEmpresa: false,
    isAuthenticated: false,
    isLoading: true,
    login: vi.fn(),
    loginWithProvider: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    acceptTerms: vi.fn(),
    updateFirstLoginState: vi.fn(),
    hasPermission: vi.fn(),
    hasAnyPermission: vi.fn(),
    hasAllPermissions: vi.fn(),
    switchTenant: vi.fn(),
    refreshAuthData: vi.fn(),
    resolvePostLoginDestination: resolveDestination,
    authError: null,
    recoveryMode: false,
    ...overrides,
  };
}

let auth: ReturnType<typeof useAuth>;

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <output data-testid="destination">{pathname + search}</output>;
}

function CallbackFlow() {
  return (
    <MemoryRouter initialEntries={['/auth/callback']}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthCallback — hidratação e recuperação local', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    auth = createAuthMock();
    vi.mocked(useAuth).mockImplementation(() => auth);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('aguarda a identidade e o fim do loading antes de usar o destino canônico', () => {
    const view = render(<CallbackFlow />);
    auth = { ...auth, isAuthenticated: true, person: { id: 'person-test' } as NonNullable<typeof auth.person> };
    view.rerender(<CallbackFlow />);
    expect(resolveDestination).not.toHaveBeenCalled();
    auth = { ...auth, isLoading: false };
    view.rerender(<CallbackFlow />);
    expect(screen.getByTestId('destination')).toHaveTextContent('/selecionar-tenant');
  });

  it.each([
    { isAuthenticated: false, isLoading: false },
    { isAuthenticated: true, isLoading: false },
    { isAuthenticated: false, isLoading: true },
  ])('limita a espera sem sessão/identidade: %j', (state) => {
    auth = { ...auth, ...state };
    render(<CallbackFlow />);
    act(() => vi.advanceTimersByTime(8000));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ir para o login/i }));
    expect(screen.getByTestId('destination')).toHaveTextContent('/login');
    expect(resolveDestination).not.toHaveBeenCalled();
  });

  it('mantém a janela entre rerenders e aceita identidade que chega depois do timeout', () => {
    const view = render(<CallbackFlow />);
    act(() => vi.advanceTimersByTime(7000));
    auth = { ...auth, isAuthenticated: true, isLoading: false };
    view.rerender(<CallbackFlow />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    auth = { ...auth, person: { id: 'person-test' } as NonNullable<typeof auth.person> };
    view.rerender(<CallbackFlow />);
    expect(screen.getByTestId('destination')).toHaveTextContent('/selecionar-tenant');
  });

  it('permite nova espera local e limpa o timer ao desmontar', () => {
    const view = render(<CallbackFlow />);
    act(() => vi.advanceTimersByTime(8000));
    fireEvent.click(screen.getByRole('button', { name: /Aguardar novamente/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(8000));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
