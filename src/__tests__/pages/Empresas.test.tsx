import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/repositories/companies.repository', () => ({
  companiesRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import EmpresasListPage from '@/modules/empresas/pages/EmpresasListPage';
import EmpresaDetailPage from '@/modules/empresas/pages/EmpresaDetailPage';
import EmpresaFormPage from '@/modules/empresas/pages/EmpresaFormPage';
import { useAuth } from '@/contexts/AuthContext';
import { companiesRepository } from '@/repositories/companies.repository';

if (typeof globalThis.IntersectionObserver === 'undefined') {
  (globalThis as { IntersectionObserver: unknown }).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

const mockUseAuth = vi.mocked(useAuth);
const mockCompaniesRepository = vi.mocked(companiesRepository);

const baseCompany = {
  id: '11111111-1111-4111-8111-111111111111',
  tenant_id: 'tenant-1',
  name: 'Empresa Base',
  trading_name: 'Empresa Base LTDA',
  cnpj: '12345678000100',
  status: 'active' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  legal_name: null,
  document: null,
  cnpj_root: null,
  state_registration: null,
  municipal_registration: null,
  company_type_id: null,
  industry: null,
  phone: null,
  email: null,
  website: null,
  linkedin_url: null,
  logo_url: null,
  address: null,
  size: null,
  metadata: {},
  created_by: null,
  description: null,
  short_description: null,
  company_segment: null,
  socials: null,
};

function authState(overrides: Record<string, unknown> = {}) {
  const permissions = (overrides.permissions as Array<{ name: string }>) ?? [
    { name: 'companies.read' },
    { name: 'companies.create' },
    { name: 'companies.update' },
    { name: 'companies.delete' },
  ];
  return {
    isAuthenticated: true,
    isLoading: false,
    currentTenantId: 'tenant-1',
    permissions,
    hasPermission: vi.fn((perm: string) => permissions.some((p) => p.name === perm)),
    ...overrides,
  } as unknown as ReturnType<typeof useAuth>;
}

describe('Empresas - fluxos locais verificáveis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(authState());
  });

  it('abre listagem canônica (dados reais via repository) e não exibe página legada/mock', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([baseCompany]);
    render(
      <MemoryRouter initialEntries={['/dashboard/empresas/lista']}>
        <Routes>
          <Route path="/dashboard/empresas/lista" element={<EmpresasListPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Listagem de empresas/i })).toBeInTheDocument();
    });
    expect(screen.getAllByText('Empresa Base LTDA').length).toBeGreaterThan(0);
    expect(mockCompaniesRepository.findAll).toHaveBeenCalledWith('tenant-1');
    expect(screen.queryByText('Carregando seu conteúdo...')).not.toBeInTheDocument();
  });

  it('exibe estado vazio quando não há empresas', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([]);
    render(
      <MemoryRouter>
        <EmpresasListPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText('Nenhuma empresa')).toBeInTheDocument();
    });
  });

  it('oculta ação de criação sem permissão companies.create', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([]);
    mockUseAuth.mockReturnValue(authState({ permissions: [{ name: 'companies.read' }] }));

    render(
      <MemoryRouter>
        <EmpresasListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhuma empresa')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /^Nova empresa$/i })).not.toBeInTheDocument();
  });

  it('valida formulário (nome obrigatório) e chama create com dados suportados', async () => {
    const user = userEvent.setup();
    mockCompaniesRepository.findAll.mockResolvedValue([]);
    mockCompaniesRepository.create.mockResolvedValue(baseCompany);
    render(
      <MemoryRouter>
        <EmpresasListPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Nenhuma empresa')).toBeInTheDocument());
    const createButtons = screen.getAllByRole('button', { name: /Nova empresa/i });
    await user.click(createButtons[0]);
    const submit = await screen.findByRole('button', { name: /^Salvar$/i });
    const nameInput = await screen.findByPlaceholderText('Nome da empresa');
    await user.type(nameInput, 'Nova Empresa');
    await waitFor(() => expect(submit).not.toBeDisabled());
    await user.click(submit);
    await waitFor(() => expect(mockCompaniesRepository.create).toHaveBeenCalled());
    expect(mockCompaniesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nova Empresa' }),
      'tenant-1',
    );
  });

  it('não consulta repositório quando identificador de rota é inválido (detalhe)', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/empresas/not-a-uuid']}>
        <Routes>
          <Route path="/dashboard/empresas/:id" element={<EmpresaDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Identificador inválido')).toBeInTheDocument();
    });
    expect(mockCompaniesRepository.findById).not.toHaveBeenCalled();
  });

  it('não consulta repositório quando identificador de rota é inválido (edição)', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/empresas/not-a-uuid/editar']}>
        <Routes>
          <Route path="/dashboard/empresas/:id/editar" element={<EmpresaFormPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Identificador inválido')).toBeInTheDocument();
    });
    expect(mockCompaniesRepository.findById).not.toHaveBeenCalled();
  });

  it('oculta ações de editar/excluir sem permissões no detalhe', async () => {
    mockCompaniesRepository.findById.mockResolvedValue(baseCompany);
    mockUseAuth.mockReturnValue(authState({ permissions: [{ name: 'companies.read' }] }));

    render(
      <MemoryRouter initialEntries={['/dashboard/empresas/11111111-1111-4111-8111-111111111111']}>
        <Routes>
          <Route path="/dashboard/empresas/:id" element={<EmpresaDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Empresa Base LTDA/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /^Editar$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Excluir$/i })).not.toBeInTheDocument();
  });

  it('exibe ações de editar/excluir com permissões no detalhe', async () => {
    mockCompaniesRepository.findById.mockResolvedValue(baseCompany);

    render(
      <MemoryRouter initialEntries={['/dashboard/empresas/11111111-1111-4111-8111-111111111111']}>
        <Routes>
          <Route path="/dashboard/empresas/:id" element={<EmpresaDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Editar$/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /^Excluir$/i })).toBeInTheDocument();
  });
});
