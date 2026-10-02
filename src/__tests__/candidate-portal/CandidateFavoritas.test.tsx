import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/contexts/CandidateContext', () => ({
  useCandidate: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

vi.mock('@/components/feedback/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

vi.mock('@/components/feedback/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    onConfirm,
    onCancel,
    title,
    message,
  }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
  }) =>
    open ? (
      <div data-testid="confirm-dialog" data-title={title}>
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock('@/components/ui/SEO', () => ({
  SEO: ({ title }: { title: string }) => (
    <div data-testid="seo" data-title={title} />
  ),
}));

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/config', () => ({
  COMPANY: { name: 'J&S Empregos LTDA' },
}));

import { useAuth } from '@/contexts/AuthContext';
import { useCandidate } from '@/contexts/CandidateContext';
import CandidateFavoritas from '@/features/candidato/pages/Favoritas';

const mockUseAuth = vi.mocked(useAuth);
const mockUseCandidate = vi.mocked(useCandidate);

function makeFavoriteJob(id: string, title: string, city: string) {
  return {
    id,
    job_id: `job-${id}`,
    job: {
      id: `job-${id}`,
      title,
      city,
      state: 'SP',
      contract_type: 'clt',
      work_mode: 'onsite',
      slug: `vaga-${id}`,
    },
  };
}

describe('CandidateFavoritas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'Test User' } as never,
    } as never);
  });

  it('renders empty state when no favorites', () => {
    mockUseCandidate.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: null,
      toggleFavorite: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateFavoritas />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Você ainda não favoritou nenhuma vaga'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Clique no coração nas vagas para salvá-las aqui.'),
    ).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockUseCandidate.mockReturnValue({
      favorites: [],
      isLoading: true,
      error: null,
      toggleFavorite: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateFavoritas />
      </MemoryRouter>,
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseCandidate.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: 'Erro ao carregar favoritos',
      toggleFavorite: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateFavoritas />
      </MemoryRouter>,
    );

    expect(screen.getByText('Erro ao carregar favoritos')).toBeInTheDocument();
  });

  it('renders list of favorite jobs with title, city, and contract info', () => {
    const favorites = [
      makeFavoriteJob('1', 'Auxiliar de Limpeza', 'São Paulo'),
      makeFavoriteJob('2', 'Zelador', 'Campinas'),
    ];

    mockUseCandidate.mockReturnValue({
      favorites,
      isLoading: false,
      error: null,
      toggleFavorite: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateFavoritas />
      </MemoryRouter>,
    );

    expect(screen.getByText('Auxiliar de Limpeza')).toBeInTheDocument();
    expect(screen.getByText('São Paulo/SP')).toBeInTheDocument();
    expect(screen.getAllByText('CLT')).toHaveLength(2);

    expect(screen.getByText('Zelador')).toBeInTheDocument();
    expect(screen.getByText('Campinas/SP')).toBeInTheDocument();
  });

  it('renders "Explorar mais vagas" link when favorites exist', () => {
    const favorites = [makeFavoriteJob('1', 'Auxiliar', 'São Paulo')];

    mockUseCandidate.mockReturnValue({
      favorites,
      isLoading: false,
      error: null,
      toggleFavorite: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateFavoritas />
      </MemoryRouter>,
    );

    expect(screen.getByText('Explorar mais vagas')).toBeInTheDocument();
  });

  it('removes favorite when delete button clicked and confirmed', async () => {
    const toggleFavorite = vi.fn().mockResolvedValue({});
    const favorites = [makeFavoriteJob('1', 'Auxiliar', 'São Paulo')];

    mockUseCandidate.mockReturnValue({
      favorites,
      isLoading: false,
      error: null,
      toggleFavorite,
    } as never);

    render(
      <MemoryRouter>
        <CandidateFavoritas />
      </MemoryRouter>,
    );

    const removeButton = screen.getByLabelText('Remover dos favoritos');
    fireEvent.click(removeButton);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Tem certeza que deseja remover esta vaga dos seus favoritos?',
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(toggleFavorite).toHaveBeenCalledWith('job-1');
    });
  });

  it('closes delete confirmation dialog when cancel clicked', () => {
    const favorites = [makeFavoriteJob('1', 'Auxiliar', 'São Paulo')];

    mockUseCandidate.mockReturnValue({
      favorites,
      isLoading: false,
      error: null,
      toggleFavorite: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateFavoritas />
      </MemoryRouter>,
    );

    const removeButton = screen.getByLabelText('Remover dos favoritos');
    fireEvent.click(removeButton);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });
});
