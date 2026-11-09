import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RHColaboradoresListPage from './RHColaboradoresListPage';

const { findPage } = vi.hoisted(() => ({ findPage: vi.fn() }));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    currentTenantId: 'tenant-1',
    hasAnyPermission: () => true,
  }),
}));

vi.mock('@/repositories/employees.repository', () => ({
  employeesRepository: { findPage },
}));

const row = (id: string, name: string) => ({
  id,
  tenant_id: 'tenant-1',
  employee_code: `E-${id}`,
  hire_date: '2026-01-10',
  termination_date: null,
  salary: null,
  status: 'active',
  created_at: '2026-01-10T00:00:00Z',
  updated_at: '2026-01-10T00:00:00Z',
  person: { id, full_name: name, email: `${id}@ex.com` },
});

describe('RHColaboradoresListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders real paginated results and total count', async () => {
    findPage.mockResolvedValue({
      data: [row('11111111-1111-4111-8111-111111111111', 'Ana Silva')],
      count: 25,
      error: null,
    });

    render(
      <MemoryRouter>
        <RHColaboradoresListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Ana Silva')).toBeInTheDocument();
    expect(screen.getByText(/1–1 de 25 registro/i)).toBeInTheDocument();
    expect(screen.getByText(/Página 1 de 2/i)).toBeInTheDocument();
    expect(findPage).toHaveBeenCalledWith(
      'tenant-1',
      { search: undefined, status: undefined },
      { limit: 20, offset: 0 },
    );
  });

  it('moves to next page with real offset', async () => {
    findPage.mockResolvedValue({
      data: [row('11111111-1111-4111-8111-111111111111', 'Ana Silva')],
      count: 25,
      error: null,
    });

    render(
      <MemoryRouter>
        <RHColaboradoresListPage />
      </MemoryRouter>,
    );
    await screen.findByText('Ana Silva');
    fireEvent.click(screen.getByRole('button', { name: /próxima página/i }));

    await waitFor(() =>
      expect(findPage).toHaveBeenLastCalledWith(
        'tenant-1',
        { search: undefined, status: undefined },
        { limit: 20, offset: 20 },
      ),
    );
  });

  it('shows canonical empty state when no records', async () => {
    findPage.mockResolvedValue({ data: [], count: 0, error: null });

    render(
      <MemoryRouter>
        <RHColaboradoresListPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Nenhum colaborador encontrado/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/dado fictício/i)).not.toBeInTheDocument();
  });
});
