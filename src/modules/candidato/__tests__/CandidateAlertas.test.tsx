import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/modules/candidato/CandidatoContext', () => ({
  useCandidato: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => null),
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

vi.mock('@/components/ui/Badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, 'aria-label': ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/Input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value ?? ''} onChange={onChange} {...props} />
  ),
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
      <div data-testid="confirm-dialog">
        <p>{title}</p>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  const icons: Record<string, unknown> = { ...actual };
  [
    'Bell',
    'Plus',
    'Trash2',
    'Power',
    'PowerOff',
    'MapPin',
    'Briefcase',
  ].forEach((name) => {
    icons[name] = ({ className }: any) => (
      <svg
        data-icon={name}
        className={className}
        data-testid={`icon-${name}`}
      />
    );
  });
  return icons;
});

vi.mock('@/config', () => ({
  COMPANY: { name: 'J&S Empregos LTDA' },
  // ContentBoundary â†’ RouteLoadingFallback usa IMAGES.logo.principal.
  IMAGES: { logo: { principal: '/logo.png' } },
}));

import { useAuth } from '@/contexts/AuthContext';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import CandidateAlertas from '@/modules/candidato/pages/Alertas';

const mockUseAuth = vi.mocked(useAuth);
const mockUseCandidato = vi.mocked(useCandidato);

const mockAlerts = [
  {
    id: 'alert-1',
    name: 'Vagas SP — Auxiliar',
    keywords: 'auxiliar, limpeza',
    city: 'São Paulo',
    state: 'SP',
    contract_type: 'clt',
    work_mode: null,
    salary_min: 1800,
    salary_max: 3000,
    frequency: 'daily' as const,
    is_active: true,
  },
  {
    id: 'alert-2',
    name: 'Vagas Remoto — TI',
    keywords: 'remoto, ti',
    city: null,
    state: null,
    contract_type: null,
    work_mode: 'remoto',
    salary_min: null,
    salary_max: null,
    frequency: 'weekly' as const,
    is_active: false,
  },
];

describe('CandidateAlertas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      person: { id: 'p1', full_name: 'João Silva' } as never,
      updateProfile: vi.fn(),
    } as never);
  });

  it('renders loading state', () => {
    mockUseCandidato.mockReturnValue({
      jobAlerts: [],
      isLoading: true,
      error: null,
      createAlert: vi.fn(),
      updateAlert: vi.fn(),
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    // RouteLoadingFallback usa role="status" com aria-busy="true".
    const busyStates = screen.getAllByRole('status');
    expect(
      busyStates.some((el) => el.getAttribute('aria-busy') === 'true'),
    ).toBe(true);
  });

  it('renders empty state when no alerts', () => {
    mockUseCandidato.mockReturnValue({
      jobAlerts: [],
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert: vi.fn(),
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Você ainda não tem alertas de vagas'),
    ).toBeInTheDocument();
  });

  it('renders list of job alerts with name, frequency badge, and status', () => {
    mockUseCandidato.mockReturnValue({
      jobAlerts: mockAlerts,
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert: vi.fn(),
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    expect(screen.getByText('Vagas SP — Auxiliar')).toBeInTheDocument();
    expect(screen.getByText('Vagas Remoto — TI')).toBeInTheDocument();
    expect(screen.getAllByText('Ativo').length).toBe(1);
    expect(screen.getAllByText('Pausado').length).toBe(1);
    expect(screen.getAllByText('Diário').length).toBe(1);
    expect(screen.getAllByText('Semanal').length).toBe(1);
  });

  it('renders alert details (keywords, city, contract type, salary)', () => {
    mockUseCandidato.mockReturnValue({
      jobAlerts: mockAlerts,
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert: vi.fn(),
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    expect(screen.getByText(/auxiliar, limpeza/)).toBeInTheDocument();
    expect(screen.getByText(/São Paulo\/SP/)).toBeInTheDocument();
    expect(screen.getByText('clt')).toBeInTheDocument();
  });

  it('toggles alert active state when toggle button is clicked', async () => {
    const updateAlert = vi.fn().mockResolvedValue({ error: null });
    mockUseCandidato.mockReturnValue({
      jobAlerts: mockAlerts,
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert,
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    const pauseButton = screen.getByLabelText('Pausar alerta');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(updateAlert).toHaveBeenCalledWith('alert-1', { is_active: false });
    });
  });

  it('toggles inactive alert back to active', async () => {
    const updateAlert = vi.fn().mockResolvedValue({ error: null });
    mockUseCandidato.mockReturnValue({
      jobAlerts: mockAlerts,
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert,
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    const activateButton = screen.getByLabelText('Ativar alerta');
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(updateAlert).toHaveBeenCalledWith('alert-2', { is_active: true });
    });
  });

  it('opens create form when "Novo alerta" is clicked', () => {
    mockUseCandidato.mockReturnValue({
      jobAlerts: [],
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert: vi.fn(),
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Novo alerta'));

    expect(screen.getByText('Criar novo alerta')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Ex: "Vagas SP — Auxiliar"'),
    ).toBeInTheDocument();
  });

  it('creates an alert when the form is submitted with a name', async () => {
    const createAlert = vi.fn().mockResolvedValue({ error: null });
    mockUseCandidato.mockReturnValue({
      jobAlerts: [],
      isLoading: false,
      error: null,
      createAlert,
      updateAlert: vi.fn(),
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Novo alerta'));

    const nameInput = screen.getByPlaceholderText('Ex: "Vagas SP — Auxiliar"');
    fireEvent.change(nameInput, { target: { value: 'Meu Alerta de Teste' } });

    fireEvent.click(screen.getByText('Criar alerta'));

    await waitFor(() => {
      expect(createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Meu Alerta de Teste',
          frequency: 'daily',
          is_active: true,
        }),
      );
    });
  });

  it('shows validation error when creating alert without a name', () => {
    const createAlert = vi.fn();
    mockUseCandidato.mockReturnValue({
      jobAlerts: [],
      isLoading: false,
      error: null,
      createAlert,
      updateAlert: vi.fn(),
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Novo alerta'));
    fireEvent.click(screen.getByText('Criar alerta'));

    expect(screen.getByText('Dê um nome para o alerta.')).toBeInTheDocument();
    expect(createAlert).not.toHaveBeenCalled();
  });

  it('closes create form when cancel is clicked', () => {
    mockUseCandidato.mockReturnValue({
      jobAlerts: [],
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert: vi.fn(),
      deleteAlert: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Novo alerta'));
    expect(screen.getByText('Criar novo alerta')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Criar novo alerta')).not.toBeInTheDocument();
  });

  it('deletes an alert when confirmation dialog is confirmed', async () => {
    const deleteAlert = vi.fn().mockResolvedValue({ error: null });
    mockUseCandidato.mockReturnValue({
      jobAlerts: mockAlerts,
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert: vi.fn(),
      deleteAlert,
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    const deleteButtons = screen.getAllByLabelText('Remover alerta');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    expect(screen.getByText(/remover este alerta/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(deleteAlert).toHaveBeenCalledWith('alert-1');
    });
  });

  it('cancels alert deletion when confirmation is cancelled', async () => {
    const deleteAlert = vi.fn().mockResolvedValue({ error: null });
    mockUseCandidato.mockReturnValue({
      jobAlerts: mockAlerts,
      isLoading: false,
      error: null,
      createAlert: vi.fn(),
      updateAlert: vi.fn(),
      deleteAlert,
    } as never);

    render(
      <MemoryRouter>
        <CandidateAlertas />
      </MemoryRouter>,
    );

    const deleteButtons = screen.getAllByLabelText('Remover alerta');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    expect(deleteAlert).not.toHaveBeenCalled();
  });
});

