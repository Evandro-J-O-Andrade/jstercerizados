import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Login, { type AccessFlow } from '@/pages/Login';
import AuthCallback from '@/pages/auth/AuthCallback';
import { useAuth } from '@/contexts/AuthContext';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('@/components/ui/SafeImage', () => ({ SafeImage: () => null }));
vi.mock('@/components/ui/SEO', () => ({ SEO: () => null }));
vi.mock('@/components/auth/Turnstile', () => ({ Turnstile: () => null }));

const login = vi.fn();
const loginWithProvider = vi.fn();

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
    isLoading: false,
    login,
    loginWithProvider,
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
    resolvePostLoginDestination: vi.fn(() => '/candidato'),
    authError: null,
    recoveryMode: false,
    ...overrides,
  };
}

function LocationProbe() {
  const { pathname, search, hash, state } = useLocation();
  return <output data-testid="location">{JSON.stringify({ pathname, search, hash, state })}</output>;
}

function renderFlow(path: string, requestedContext: AccessFlow = 'candidato') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path.split(/[?#]/)[0], search: path.includes('?') ? '?' + path.split('?')[1].split('#')[0] : '', hash: path.includes('#') ? '#' + path.split('#')[1] : '', state: { from: '/candidato' } }]}>
      <LocationProbe />
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Login requestedContext={requestedContext} />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login e callback — mensagens seguras e contextos preservados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    login.mockResolvedValue({});
    loginWithProvider.mockResolvedValue({});
    vi.mocked(useAuth).mockReturnValue(createAuthMock());
  });
  afterEach(cleanup);

  it.each([
    '/auth/callback?error_code=otp_expired&error_description=PRIVATE',
    '/auth/callback#error=access_denied&error_code=otp_expired&error_description=PRIVATE',
    '/entrar/candidato#error=access_denied&error_code=otp_expired&error_description=PRIVATE',
    '/login?error_code=otp_expired&error_description=PRIVATE',
  ])('mostra orientação segura para link expirado: %s', async (path) => {
    renderFlow(path);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/expirou/i));
    expect(screen.getByRole('alert')).not.toHaveTextContent('PRIVATE');
    expect(screen.getByTestId('location')).not.toHaveTextContent('error_');
    expect(screen.getByRole('link', { name: /Esqueceu a senha/i })).toHaveAttribute('href', '/recuperar-senha');
  });

  it.each(['?error=PRIVATE&error_description=SECRET', '#error_code=UNKNOWN&error_description=SECRET', '?error_description=SECRET', '?error='])('não reflete erro arbitrário e mantém parâmetros alheios: %s', async (suffix) => {
    renderFlow('/login?keep=1' + (suffix.startsWith('?') ? '&' + suffix.slice(1) : suffix));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).not.toHaveTextContent(/PRIVATE|SECRET|UNKNOWN/);
    expect(screen.getByTestId('location')).toHaveTextContent('keep=1');
    expect(screen.getByTestId('location')).toHaveTextContent('/candidato');
    expect(screen.getByTestId('location')).not.toHaveTextContent('error');
  });

  it('não consome tokens de sessão nem trata fragmento de sucesso como erro', () => {
    renderFlow('/entrar/candidato#access_token=SDK_ONLY&type=signup');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('access_token=SDK_ONLY');
  });

  it.each(['admin', 'candidato', 'empresa'] as const)('preserva erros seguros de submit no contexto %s', async (context) => {
    login.mockResolvedValue({ error: 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e spam.' });
    renderFlow('/login?error_code=otp_expired', context);
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: context === 'admin' ? 'Entrar no painel' : 'Entrar' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/caixa de entrada e spam/i));
    expect(screen.getByRole('alert')).not.toHaveTextContent(/expirou/i);
  });

  it('preserva erro seguro do contexto e do OAuth', async () => {
    vi.mocked(useAuth).mockReturnValue(createAuthMock({ authError: 'Não foi possível carregar sua identidade. Tente entrar novamente.', isEmpresa: true }));
    loginWithProvider.mockResolvedValue({ error: 'Não foi possível iniciar o acesso com o provedor. Tente novamente.' });
    renderFlow('/entrar/empresa', 'empresa');
    expect(screen.getByRole('alert')).toHaveTextContent(/carregar sua identidade/i);
    fireEvent.click(screen.getByRole('button', { name: /Continuar com Google/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/iniciar o acesso com o provedor/i));
  });
});
