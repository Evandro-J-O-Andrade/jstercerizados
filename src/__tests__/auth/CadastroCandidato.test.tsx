import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CadastroCandidato from '@/pages/CadastroCandidato';
import { useAuth } from '@/contexts/AuthContext';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/auth/Turnstile', () => ({
  Turnstile: ({
    onTokenChange,
  }: {
    onTokenChange: (token: string) => void;
  }) => (
    <div data-testid="turnstile" onClick={() => onTokenChange('test-token')}>
      Turnstile Mock
    </div>
  ),
}));

vi.mock('@/components/ui/SafeImage', () => ({
  SafeImage: () => <div data-testid="safe-image" />,
}));

vi.mock('@/components/ui/SEO', () => ({
  SEO: () => null,
}));

vi.mock('@/lib/error-normalizer', () => ({
  normalizeError: (input: unknown) => ({
    userMessage: typeof input === 'string' ? input : String(input),
    technicalDetail: typeof input === 'string' ? input : String(input),
    category: 'auth',
    canRetry: false,
  }),
}));

const mockUseAuth = vi.mocked(useAuth);

describe('CadastroCandidato — candidate registration E2E', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      isLoading: false,
      logout: vi.fn(),
      login: vi.fn(),
      loginWithProvider: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      acceptTerms: vi.fn(),
      updateFirstLoginState: vi.fn(),
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      switchTenant: vi.fn(),
      resolvePostLoginDestination: vi.fn(),
      authError: null,
      recoveryMode: false,
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
    });
    mockRegister.mockResolvedValue({ status: 'success' });
  });

  it('passes signupContext: candidato to register()', async () => {
    render(
      <MemoryRouter>
        <CadastroCandidato />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'joao@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: '11999999999' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar senha/i), {
      target: { value: 'senha123' },
    });

    const turnstileNode = screen.getByTestId('turnstile');
    fireEvent.click(turnstileNode);

    fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'joao@example.com',
        'senha123',
        expect.objectContaining({
          signupContext: 'candidato',
          emailRedirectTo: '/entrar/candidato',
        }),
      );
    });
  });

  it('signupContext is candidato, NOT empresa', async () => {
    render(
      <MemoryRouter>
        <CadastroCandidato />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'joao@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: '11999999999' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar senha/i), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByTestId('turnstile'));

    fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

    await waitFor(() => {
      const callArgs = mockRegister.mock.calls[0];
      expect(callArgs[2].signupContext).toBe('candidato');
      expect(callArgs[2].signupContext).not.toBe('empresa');
    });
  });

  it('shows email_pending message when registration returns that status', async () => {
    mockRegister.mockResolvedValue({ status: 'email_pending' });

    render(
      <MemoryRouter>
        <CadastroCandidato />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'joao@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: '11999999999' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar senha/i), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByTestId('turnstile'));

    fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Cadastro realizado com sucesso/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error message when register returns error', async () => {
    mockRegister.mockResolvedValue({
      error: 'E-mail já cadastrado no sistema.',
    });

    render(
      <MemoryRouter>
        <CadastroCandidato />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'joao@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Telefone/i), {
      target: { value: '11999999999' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar senha/i), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByTestId('turnstile'));

    fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/E-mail já cadastrado/i)).toBeInTheDocument();
    });
  });
});
