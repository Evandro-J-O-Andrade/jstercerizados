import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Empresas from '@/pages/dashboard/Empresas';
import { useAuth } from '@/contexts/AuthContext';
import { companiesRepository } from '@/repositories/companies.repository';

vi.mock('@/contexts/AuthContext');
vi.mock('@/repositories/companies.repository');

const mockUseAuth = vi.mocked(useAuth);
const mockCompaniesRepository = vi.mocked(companiesRepository);

interface BaseAuth {
  isAuthenticated: boolean;
  isLoading: boolean;
  person: Record<string, unknown>;
  tenantMemberships: never[];
  currentTenantId: string;
  tenants: Array<{ id: string; name: string }>;
  roles: never[];
  permissions: Array<{ resource: string; action: string }>;
  roleAssignments: never[];
  firstLoginState: null;
  legalAcceptances: never[];
  isAdminMaster: boolean;
  isCandidate: boolean;
  isEmpresa: boolean;
  authError: null;
  user: null;
  tenantIds: string[];
  login: ReturnType<typeof vi.fn>;
  loginWithProvider: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  resetPassword: ReturnType<typeof vi.fn>;
  updateProfile: ReturnType<typeof vi.fn>;
  changePassword: ReturnType<typeof vi.fn>;
  acceptTerms: ReturnType<typeof vi.fn>;
  switchTenant: ReturnType<typeof vi.fn>;
  hasPermission: ReturnType<typeof vi.fn>;
  hasAnyPermission: ReturnType<typeof vi.fn>;
  hasAllPermissions: ReturnType<typeof vi.fn>;
}

const baseAuth: BaseAuth = {
  isAuthenticated: true,
  isLoading: false,
  person: { id: 'p1', full_name: 'Admin' },
  tenantMemberships: [],
  currentTenantId: 'tenant-1',
  tenants: [{ id: 'tenant-1', name: 'J&S' }],
  roles: [],
  permissions: [
    { resource: 'companies', action: 'read' },
    { resource: 'companies', action: 'create' },
    { resource: 'companies', action: 'update' },
    { resource: 'companies', action: 'delete' },
  ],
  roleAssignments: [],
  firstLoginState: null,
  legalAcceptances: [],
  isAdminMaster: false,
  isCandidate: false,
  isEmpresa: false,
  authError: null,
  user: null,
  tenantIds: [],
  login: vi.fn(),
  loginWithProvider: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  acceptTerms: vi.fn(),
  switchTenant: vi.fn(),
  hasPermission: vi.fn(() => true),
  hasAnyPermission: vi.fn(() => true),
  hasAllPermissions: vi.fn(() => true),
};

function renderEmpresas(authState: Partial<BaseAuth> = {}) {
  const merged = { ...baseAuth, ...authState };
  mockUseAuth.mockReturnValue(merged as any);
  return render(
    <MemoryRouter>
      <Empresas />
    </MemoryRouter>,
  );
}

describe('Empresas — UI States & Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir loading inicial', async () => {
    mockCompaniesRepository.findAll.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([]), 100);
        }),
    );

    renderEmpresas();

    expect(screen.getByText('Carregando seu conteúdo...')).toBeInTheDocument();
  });

  it('deve exibir empty state quando não há empresas', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([]);

    renderEmpresas();

    await waitFor(() => {
      expect(screen.getByText('Nenhuma empresa cadastrada')).toBeInTheDocument();
    });
  });

  it('deve exibir lista de empresas quando há dados', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([
      {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Empresa Teste',
        trading_name: 'Empresa Teste LTDA',
        cnpj: '12345678000100',
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
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
      },
    ]);

    renderEmpresas();

    await waitFor(() => {
      expect(screen.getByText('Empresa Teste LTDA')).toBeInTheDocument();
    });
  });

  it('deve exibir botão Nova empresa quando tem permissão de create', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([]);

    renderEmpresas();

    await waitFor(() => {
      const buttons = screen.getAllByText('Nova empresa');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('não deve exibir botão Nova empresa sem permissão de create', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([]);

    renderEmpresas({
      permissions: [{ resource: 'companies', action: 'read' }],
      hasAnyPermission: vi.fn(() => false),
    });

    await waitFor(() => {
      expect(screen.queryByText('Nova empresa')).not.toBeInTheDocument();
    });
  });

  it('deve exibir erro quando findAll falha', async () => {
    mockCompaniesRepository.findAll.mockRejectedValue(
      new Error('Falha na conexão'),
    );

    renderEmpresas();

    await waitFor(() => {
      expect(screen.getByText('Falha na conexão')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de criação ao clicar em Nova empresa', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([]);

    renderEmpresas();

    await waitFor(() => {
      expect(screen.getByText('Nenhuma empresa cadastrada')).toBeInTheDocument();
    });

    const novaButtons = screen.getAllByText('Nova empresa');
    novaButtons[0].click();

    await waitFor(() => {
      expect(screen.getByText('Nova empresa', { selector: 'h3' })).toBeInTheDocument();
    });
  });

  it('deve fechar modal ao clicar em Cancelar', async () => {
    mockCompaniesRepository.findAll.mockResolvedValue([]);

    renderEmpresas();

    await waitFor(() => {
      expect(screen.getByText('Nenhuma empresa cadastrada')).toBeInTheDocument();
    });

    const novaButtons = screen.getAllByText('Nova empresa');
    novaButtons[0].click();

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    screen.getByText('Cancelar').click();

    await waitFor(() => {
      expect(screen.queryByText('Nome')).not.toBeInTheDocument();
    });
  });
});
