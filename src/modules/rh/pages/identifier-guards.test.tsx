import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RHColaboradorDetalhePage from './RHColaboradorDetalhePage';
import RHColaboradorEditarPage from './RHColaboradorEditarPage';
import RecrutamentoVagaDetalhePage from '@/modules/recrutamento/pages/vagas/RecrutamentoVagaDetalhePage';
import RecrutamentoVagaEditarPage from '@/modules/recrutamento/pages/vagas/RecrutamentoVagaEditarPage';

const { findEmployeeById, getJobById, listApplications } = vi.hoisted(() => ({
  findEmployeeById: vi.fn(),
  getJobById: vi.fn(),
  listApplications: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    currentTenantId: 'tenant-1',
    hasAnyPermission: () => true,
  }),
}));

vi.mock('@/repositories/employees.repository', () => ({
  employeesRepository: { findById: findEmployeeById },
}));

vi.mock('@/modules/recrutamento/repositories', () => ({
  jobsRepository: { getById: getJobById },
  applicationsRepository: { list: listApplications },
}));

function renderRh(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/dashboard/rh/colaboradores/${id}`]}>
      <Routes>
        <Route
          path="/dashboard/rh/colaboradores/:id"
          element={<RHColaboradorDetalhePage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

function renderJob(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/dashboard/recrutamento/vagas/${id}`]}>
      <Routes>
        <Route
          path="/dashboard/recrutamento/vagas/:id"
          element={<RecrutamentoVagaDetalhePage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit(element: ReactNode, route: string, path: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('UUID guards for detail routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findEmployeeById.mockResolvedValue(null);
    getJobById.mockResolvedValue({ data: null, error: null });
    listApplications.mockResolvedValue({ data: [], error: null });
  });

  it.each([':id', 'not-a-uuid'])(
    'does not query employees with invalid id %s',
    async (id) => {
      renderRh(id);
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /identificador.*inválido/i,
      );
      expect(findEmployeeById).not.toHaveBeenCalled();
    },
  );

  it('does not query jobs or applications with a literal :id', async () => {
    renderJob(':id');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /identificador.*inválido/i,
    );
    expect(getJobById).not.toHaveBeenCalled();
    expect(listApplications).not.toHaveBeenCalled();
  });

  it('blocks invalid UUIDs in both edit routes before repository access', async () => {
    const rh = renderEdit(
      <RHColaboradorEditarPage />,
      '/dashboard/rh/colaboradores/:id/editar',
      '/dashboard/rh/colaboradores/:id/editar',
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /identificador.*inválido/i,
    );
    expect(findEmployeeById).not.toHaveBeenCalled();
    rh.unmount();

    renderEdit(
      <RecrutamentoVagaEditarPage />,
      '/dashboard/recrutamento/vagas/:id/editar',
      '/dashboard/recrutamento/vagas/:id/editar',
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /identificador.*inválido/i,
    );
    expect(getJobById).not.toHaveBeenCalled();
  });

  it('passes a valid UUID to the employee repository and shows not found', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    renderRh(id);
    await waitFor(() =>
      expect(findEmployeeById).toHaveBeenCalledWith(id, 'tenant-1'),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /não encontrado|sem acesso/i,
    );
  });

  it('passes a valid UUID to the job repository and preserves an authorization error', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    getJobById.mockResolvedValue({
      data: null,
      error: new Error('Acesso negado para esta vaga.'),
    });
    renderJob(id);
    await waitFor(() =>
      expect(getJobById).toHaveBeenCalledWith(id, 'tenant-1'),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /acesso negado/i,
    );
  });
});
