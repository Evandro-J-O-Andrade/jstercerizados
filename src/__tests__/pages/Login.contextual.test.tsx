import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/utils/turnstile-config', () => ({
  isTurnstileEnabled: vi.fn(() => false),
  getTurnstileSiteKey: vi.fn(() => null),
  getTurnstileScriptUrl: vi.fn(() => 'about:blank'),
}));

vi.mock('@/hooks/useTurnstileToken', () => ({
  useTurnstileToken: () => ({
    token: null,
    error: null,
    loading: false,
    reset: vi.fn(),
  }),
}));

import { useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';

const mockUseAuth = vi.mocked(useAuth);

function renderLogin(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login contextual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      person: null,
      isAuthenticated: false,
      authError: null,
      login: vi.fn().mockResolvedValue({}),
      loginWithProvider: vi.fn().mockResolvedValue({}),
      register: vi.fn().mockResolvedValue({}),
      resolvePostLoginDestination: vi.fn(() => '/dashboard'),
    } as never);
  });

  it('admin: NAO renderiza botoes OAuth', () => {
    renderLogin();
    expect(screen.queryByText(/Continuar com Google/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Continuar com Microsoft/i),
    ).not.toBeInTheDocument();
  });

  it('admin: NAO renderiza link de cadastro', () => {
    renderLogin();
    expect(screen.queryByTestId('candidato-signup-link')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('empresa-signup-link'),
    ).not.toBeInTheDocument();
  });

  it('admin: renderiza form de login com titulo Painel Administrativo', () => {
    renderLogin();
    expect(screen.getByText(/Painel Administrativo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail administrativo/i)).toBeInTheDocument();
  });

  it('candidato: renderiza botoes OAuth e link de cadastro', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Candidato' }));
    await waitFor(() => {
      expect(screen.getByText(/Continuar com Google/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Continuar com Microsoft/i)).toBeInTheDocument();
    const signupLink = screen.getByTestId('candidato-signup-link');
    expect(signupLink).toHaveAttribute('href', '/cadastro/candidato');
  });

  it('empresa: renderiza botoes OAuth e link de cadastro', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Empresa' }));
    await waitFor(() => {
      expect(screen.getByText(/Continuar com Google/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Continuar com Microsoft/i)).toBeInTheDocument();
    expect(screen.getByTestId('empresa-signup-link')).toBeInTheDocument();
  });

  it('candidato: cadastro fica na rota dedicada, sem form embutido', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Candidato' }));
    await waitFor(() => {
      expect(screen.getByTestId('candidato-signup-link')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/^E-mail/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Nome completo/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Confirmar senha/i),
    ).not.toBeInTheDocument();
  });

  it('botao Google chama loginWithProvider com google', async () => {
    const loginWithProvider = vi.fn().mockResolvedValue({});
    mockUseAuth.mockReturnValue({
      user: null,
      person: null,
      isAuthenticated: false,
      authError: null,
      login: vi.fn().mockResolvedValue({}),
      loginWithProvider,
      register: vi.fn().mockResolvedValue({}),
      resolvePostLoginDestination: vi.fn(() => '/dashboard'),
    } as never);

    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Candidato' }));
    await waitFor(() => {
      expect(screen.getByText(/Continuar com Google/i)).toBeInTheDocument();
    });
    const googleBtn = screen
      .getByText(/Continuar com Google/i)
      .closest('button')!;
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(loginWithProvider).toHaveBeenCalledWith('google');
    });
  });

  it('botao Microsoft chama loginWithProvider com azure', async () => {
    const loginWithProvider = vi.fn().mockResolvedValue({});
    mockUseAuth.mockReturnValue({
      user: null,
      person: null,
      isAuthenticated: false,
      authError: null,
      login: vi.fn().mockResolvedValue({}),
      loginWithProvider,
      register: vi.fn().mockResolvedValue({}),
      resolvePostLoginDestination: vi.fn(() => '/dashboard'),
    } as never);

    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Candidato' }));
    await waitFor(() => {
      expect(screen.getByText(/Continuar com Microsoft/i)).toBeInTheDocument();
    });
    const msBtn = screen
      .getByText(/Continuar com Microsoft/i)
      .closest('button')!;
    fireEvent.click(msBtn);

    await waitFor(() => {
      expect(loginWithProvider).toHaveBeenCalledWith('azure');
    });
  });

  it('renderiza aviso de CAPTCHA desativado em modo dev', () => {
    renderLogin();
    expect(screen.getByText(/CAPTCHA desativado/i)).toBeInTheDocument();
  });
});
