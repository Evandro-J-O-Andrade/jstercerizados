import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RHDashboardPage } from './RHDashboardPage';

const mocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({ useAuth: mocks.useAuth }));
vi.mock('@/repositories/employees.repository', () => ({
  employeesRepository: { findAll: mocks.findAll },
}));

describe('RHDashboardPage', () => {
  beforeEach(() => {
    mocks.findAll.mockReset();
    mocks.useAuth.mockReturnValue({
      currentTenantId: '11111111-1111-4111-8111-111111111111',
      hasAnyPermission: () => true,
    });
  });

  it('mantém um estado vazio honesto sem fabricar indicadores', async () => {
    mocks.findAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <RHDashboardPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('A base de colaboradores está vazia'),
    ).toBeInTheDocument();
    expect(screen.getByText('Sem colaboradores')).toBeInTheDocument();
    expect(mocks.findAll).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
    );
  });

  it('deriva KPIs de contratos e documentos dos registros reais', async () => {
    mocks.findAll.mockResolvedValue([
      {
        id: '22222222-2222-4222-8222-222222222222',
        tenant_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'RH-001',
        hire_date: new Date().toISOString(),
        termination_date: null,
        salary: null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        person: { full_name: 'Pessoa de teste' },
        contracts: [{ id: 'contract-1' }],
        documents: [{ id: 'document-1', expiry_date: null }],
      },
    ]);

    render(
      <MemoryRouter>
        <RHDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getAllByText('Pessoa de teste').length).toBeGreaterThan(0),
    );
    expect(screen.getByText('Contratos')).toBeVisible();
    expect(screen.getByText('Documentos')).toBeVisible();
    expect(screen.getAllByText('Ativos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(3);
  });
});
