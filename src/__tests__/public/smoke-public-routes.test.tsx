import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';

global.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  trigger = vi.fn();
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
} as unknown as typeof IntersectionObserver;

global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
} as unknown as typeof ResizeObserver;

beforeEach(() => {
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });
});

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    person: null,
    permissions: [],
    roles: [],
    isAdminMaster: false,
    isCandidate: false,
    isEmpresa: false,
    login: vi.fn(),
    loginWithProvider: vi.fn(),
    register: vi.fn(),
    authError: null,
    resolvePostLoginDestination: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('@/components/auth/Turnstile', () => ({
  Turnstile: () => null,
}));

vi.mock('@/components/sections/PalavraDoDia', () => ({
  PalavraDoDia: () => null,
}));

vi.mock('@/components/sections/CinematicShowcase', () => ({
  CinematicShowcase: () => <div data-testid="cinematic-showcase" />,
}));

vi.mock('@/hooks/useTurnstileToken', () => ({
  useTurnstileToken: () => ({ token: null, isVerified: false }),
}));

vi.mock('@/services/candidates', () => ({
  submitCandidateApplication: vi.fn().mockResolvedValue({ success: true }),
  extractDocumentsFromFormData: vi.fn(() => ({})),
}));

vi.mock('@/components/layout/NumerosChave', () => ({
  NumerosChave: () => null,
}));

vi.mock('@/components/sections/ClientCard', () => ({
  ClientCard: () => null,
}));

vi.mock('@/components/sections/HeroSplit', () => ({
  HeroSplit: () => null,
}));

vi.mock('@/components/sections/Timeline', () => ({
  Timeline: () => null,
}));

vi.mock('@/components/ui/SafeImage', () => ({
  SafeImage: ({ alt }: { alt: string }) => <img alt={alt} src="" />,
}));

vi.mock('@/components/layout/RoleBasedFooter', () => ({
  RoleBasedFooter: () => null,
}));

vi.mock('@/components/portfolio/CandidatePortfolio', () => ({
  CandidatePortfolio: () => null,
}));

vi.mock('@/components/portfolio/CompanyPortfolio', () => ({
  CompanyPortfolio: () => null,
}));

import Home from '@/pages/Home';
import Vagas from '@/pages/Vagas';
import VagaDetalhe from '@/pages/VagaDetalhe';
import Empresas from '@/pages/Empresas';
import Clientes from '@/pages/Clientes';
import Parceiros from '@/pages/Parceiros';
import Fornecedores from '@/pages/Fornecedores';
import Servicos from '@/pages/Servicos';
import ServicoDetalhe from '@/pages/ServicoDetalhe';
import Sobre from '@/pages/Sobre';
import Blog from '@/pages/Blog';
import Suporte from '@/pages/Suporte';
import FAQ from '@/pages/FAQ';
import Contato from '@/pages/Contato';
import Privacidade from '@/pages/Privacidade';
import Termos from '@/pages/Termos';
import Login from '@/pages/Login';
import TrabalheConosco from '@/pages/TrabalheConosco';

import { getSupabaseClient } from '@/lib/supabase';

const mockGetSupabaseClient = vi.mocked(getSupabaseClient);

function renderWithRouter(ui: ReactElement, initialEntries?: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
  );
}

function expectBodyContains(text: RegExp | string) {
  expect(screen.queryAllByText(text).length).toBeGreaterThan(0);
}

describe('Public route smoke tests — no crashes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSupabaseClient.mockReturnValue(null);
  });

  it('renders / (Home) without crashing', async () => {
    renderWithRouter(<Home />);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/J&S Empregos/i);
    });
  });

  it('renders /vagas without crashing', async () => {
    renderWithRouter(<Vagas />);
    await waitFor(() => {
      expectBodyContains(/Vagas/);
    });
  });

  it('renders /vagas/:slug without crashing', async () => {
    renderWithRouter(<VagaDetalhe />, ['/vagas/assessoria-rh']);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/vaga|notar/i);
    });
  });

  it('renders /empresas without crashing', async () => {
    renderWithRouter(<Empresas />);
    await waitFor(() => {
      expectBodyContains(/Empresas/);
    });
  });

  it('renders /clientes without crashing', async () => {
    renderWithRouter(<Clientes />);
    await waitFor(() => {
      expectBodyContains(/Relacionamentos/i);
    });
  });

  it('renders /parceiros without crashing', async () => {
    renderWithRouter(<Parceiros />);
    await waitFor(() => {
      expectBodyContains(/Parceiros/);
    });
  });

  it('renders /fornecedores without crashing', async () => {
    renderWithRouter(<Fornecedores />);
    await waitFor(() => {
      expectBodyContains(/Fornecedores/);
    });
  });

  it('renders /servicos without crashing', async () => {
    renderWithRouter(<Servicos />);
    await waitFor(() => {
      expectBodyContains(/Nossos Serviços/);
    });
  });

  it('renders /servicos/:slug without crashing', async () => {
    renderWithRouter(<ServicoDetalhe />, ['/servicos/assessoria-rh']);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/serviço|notar/i);
    });
  });

  it('renders /sobre without crashing', async () => {
    renderWithRouter(<Sobre />);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/Sobre|J&S Empregos/i);
    });
  });

  it('renders /blog without crashing', async () => {
    renderWithRouter(<Blog />);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/Blog|artigo/i);
    });
  });

  it('renders /suporte without crashing', async () => {
    renderWithRouter(<Suporte />);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/Suporte|ajuda/i);
    });
  });

  it('renders /faq without crashing', async () => {
    renderWithRouter(<FAQ />);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/FAQ|pergunta/i);
    });
  });

  it('renders /contato without crashing', async () => {
    renderWithRouter(<Contato />);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/Contato|contato/i);
    });
  });

  it('renders /privacidade without crashing', async () => {
    renderWithRouter(<Privacidade />);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/Privacidade|privacidade/i);
    });
  });

  it('renders /termos without crashing', async () => {
    renderWithRouter(<Termos />);
    await waitFor(() => {
      expect(document.body).toHaveTextContent(/Termos|termos/i);
    });
  });

  it('renders /login without crashing', async () => {
    renderWithRouter(<Login />);
    await waitFor(() => {
      expect(screen.getByText(/Painel Administrativo/i)).toBeInTheDocument();
    });
  });

  it('renders /trabalhe-conosco without crashing', async () => {
    renderWithRouter(<TrabalheConosco />);
    await waitFor(() => {
      expectBodyContains(/Banco de Talentos/i);
    });
  });

  it('renders /vagas gracefully when Supabase client is unavailable', async () => {
    mockGetSupabaseClient.mockClear();
    mockGetSupabaseClient.mockReturnValue(null);

    renderWithRouter(<Vagas />);
    await waitFor(() => {
      expectBodyContains(/Vagas/);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Nenhuma vaga encontrada/i),
      ).toBeInTheDocument();
    });
  });
});
