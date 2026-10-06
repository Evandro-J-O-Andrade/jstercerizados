import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Servicos from '@/pages/dashboard/Servicos';
import { useAuth } from '@/contexts/AuthContext';
import { servicesRepository } from '@/repositories/services.repository';
import type {
  Service,
  ServiceOrder,
  ServiceExecution,
} from '@/types/domain/service';

vi.mock('@/contexts/AuthContext');
vi.mock('@/repositories/services.repository');

const mockUseAuth = vi.mocked(useAuth);
const mockServicesRepository = vi.mocked(servicesRepository);

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
    { resource: 'services', action: 'read' },
    { resource: 'services', action: 'create' },
    { resource: 'services', action: 'update' },
    { resource: 'services', action: 'delete' },
  ],
  roleAssignments: [],
  firstLoginState: null,
  legalAcceptances: [],
  isAdminMaster: true,
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

function serviceRow(overrides: Partial<Service> = {}): Service {
  return {
    id: 'svc-1',
    tenant_id: 'tenant-1',
    name: 'Serviço A',
    slug: 'servico-a',
    category: 'rh',
    short_description: null,
    description: null,
    card_image_url: null,
    hero_image_url: null,
    hero_title: null,
    hero_subtitle: null,
    benefits: null,
    icon: null,
    process_steps: null,
    cta_title: null,
    cta_description: null,
    cta_button_text: null,
    cta_button_url: null,
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    status: 'published',
    published_at: null,
    display_order: null,
    created_by: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

function orderRow(overrides: Partial<ServiceOrder> = {}): ServiceOrder {
  return {
    id: 'ord-1',
    tenant_id: 'tenant-1',
    company_service_id: 'svc-1',
    status: 'open',
    scheduled_at: null,
    completed_at: null,
    quantity: 1,
    value: 0,
    period_start: null,
    period_end: null,
    location: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

function executionRow(
  overrides: Partial<ServiceExecution> = {},
): ServiceExecution {
  return {
    id: 'exec-1',
    tenant_id: 'tenant-1',
    service_order_id: 'ord-1',
    executed_by: null,
    notes: null,
    started_at: '2024-01-01',
    finished_at: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

function renderServicos(authState: Partial<BaseAuth> = {}) {
  const merged = { ...baseAuth, ...authState };
  mockUseAuth.mockReturnValue(merged as any);
  return render(
    <MemoryRouter>
      <Servicos />
    </MemoryRouter>,
  );
}

describe('Servicos — UI States & Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServicesRepository.findServices.mockResolvedValue([]);
    mockServicesRepository.findOrders.mockResolvedValue([]);
    mockServicesRepository.findExecutions.mockResolvedValue([]);
  });

  it('deve exibir loading inicial', () => {
    mockServicesRepository.findServices.mockImplementation(
      () => new Promise(() => {}),
    );

    renderServicos();

    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });

  it('deve exibir empty state quando não há serviços', async () => {
    renderServicos();

    await waitFor(() => {
      expect(
        screen.getByText('Nenhum serviço cadastrado.'),
      ).toBeInTheDocument();
    });
  });

  it('deve exibir lista de serviços quando há dados', async () => {
    mockServicesRepository.findServices.mockResolvedValue([serviceRow()]);

    renderServicos();

    await waitFor(() => {
      expect(screen.getByText('Serviço A')).toBeInTheDocument();
      expect(screen.getByText('rh')).toBeInTheDocument();
      expect(screen.getByText('published')).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando findServices falha', async () => {
    mockServicesRepository.findServices.mockRejectedValue(
      new Error('Falha na conexão'),
    );

    renderServicos();

    await waitFor(() => {
      expect(screen.getByText('Falha na conexão')).toBeInTheDocument();
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    });
  });

  it('deve exibir botão Novo para admin master', async () => {
    renderServicos();

    await waitFor(() => {
      expect(
        screen.getByText('Nenhum serviço cadastrado.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Novo')).toBeInTheDocument();
    });
  });

  it('não deve exibir ações sem admin master', async () => {
    mockServicesRepository.findServices.mockResolvedValue([serviceRow()]);

    renderServicos({ isAdminMaster: false });

    await waitFor(() => {
      expect(screen.getByText('Serviço A')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Excluir' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Novo')).not.toBeInTheDocument();
  });

  it('não deve exibir ações sem permissão de update', async () => {
    mockServicesRepository.findServices.mockResolvedValue([serviceRow()]);

    renderServicos({
      hasAnyPermission: vi.fn(() => false),
      isAdminMaster: false,
    });

    await waitFor(() => {
      expect(screen.getByText('Serviço A')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Excluir' }),
    ).not.toBeInTheDocument();
  });

  it('deve listar ordens na aba Ordens', async () => {
    mockServicesRepository.findOrders.mockResolvedValue([orderRow()]);

    renderServicos();

    await waitFor(() => {
      expect(
        screen.getByText('Nenhum serviço cadastrado.'),
      ).toBeInTheDocument();
    });

    screen.getByText('Ordens', { selector: 'button' }).click();

    await waitFor(() => {
      expect(mockServicesRepository.findOrders).toHaveBeenCalledWith(
        'tenant-1',
      );
      expect(screen.getByText('svc-1')).toBeInTheDocument();
      expect(screen.getByText('open')).toBeInTheDocument();
    });
  });

  it('deve listar execuções na aba Execuções', async () => {
    mockServicesRepository.findExecutions.mockResolvedValue([executionRow()]);

    renderServicos();

    await waitFor(() => {
      expect(
        screen.getByText('Nenhum serviço cadastrado.'),
      ).toBeInTheDocument();
    });

    screen.getByText('Execuções', { selector: 'button' }).click();

    await waitFor(() => {
      expect(mockServicesRepository.findExecutions).toHaveBeenCalledWith(
        'tenant-1',
      );
      expect(screen.getByText('ord-1')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de criação com formulário', async () => {
    renderServicos();

    await waitFor(() => {
      expect(
        screen.getByText('Nenhum serviço cadastrado.'),
      ).toBeInTheDocument();
    });

    screen.getByText('Novo').click();

    await waitFor(() => {
      expect(
        screen.getByText('Novo serviço', { selector: 'h3' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Nome')).toBeInTheDocument();
      expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
    });
  });

  it('deve criar serviço, fechar modal e recarregar lista', async () => {
    mockServicesRepository.createService.mockResolvedValue(
      serviceRow({ id: 'new-id', name: 'Serviço Novo' }),
    );

    renderServicos();

    await waitFor(() => {
      expect(
        screen.getByText('Nenhum serviço cadastrado.'),
      ).toBeInTheDocument();
    });

    screen.getByText('Novo').click();

    await waitFor(() => {
      expect(
        screen.getByText('Novo serviço', { selector: 'h3' }),
      ).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText('Nome'), 'Serviço Novo');
    await userEvent.type(screen.getByLabelText('Categoria'), 'rh');

    screen.getByRole('button', { name: 'Salvar' }).click();

    await waitFor(() => {
      expect(mockServicesRepository.createService).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Serviço Novo',
          category: 'rh',
          tenant_id: 'tenant-1',
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Novo serviço', { selector: 'h3' }),
      ).not.toBeInTheDocument();
    });

    expect(mockServicesRepository.findServices).toHaveBeenCalledTimes(2);
  });

  it('deve abrir modal de edição com dados preenchidos', async () => {
    mockServicesRepository.findServices.mockResolvedValue([serviceRow()]);

    renderServicos();

    await waitFor(() => {
      expect(screen.getByText('Serviço A')).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'Editar' }).click();

    await waitFor(() => {
      expect(
        screen.getByText('Editar serviço', { selector: 'h3' }),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toHaveValue('Serviço A');
      expect(screen.getByLabelText('Categoria')).toHaveValue('rh');
    });
  });

  it('deve atualizar serviço ao salvar edição', async () => {
    mockServicesRepository.findServices.mockResolvedValue([serviceRow()]);
    mockServicesRepository.updateService.mockResolvedValue(
      serviceRow({ name: 'Serviço Editado' }),
    );

    renderServicos();

    await waitFor(() => {
      expect(screen.getByText('Serviço A')).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'Editar' }).click();

    await waitFor(() => {
      expect(
        screen.getByText('Editar serviço', { selector: 'h3' }),
      ).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Nome');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Serviço Editado');

    screen.getAllByRole('button', { name: 'Salvar' })[0].click();

    await waitFor(() => {
      expect(mockServicesRepository.updateService).toHaveBeenCalledWith(
        'tenant-1',
        'svc-1',
        expect.objectContaining({ name: 'Serviço Editado' }),
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Editar serviço', { selector: 'h3' }),
      ).not.toBeInTheDocument();
    });

    expect(mockServicesRepository.findServices).toHaveBeenCalledTimes(2);
  });

  it('deve fechar modal de criação ao cancelar', async () => {
    renderServicos();

    await waitFor(() => {
      expect(
        screen.getByText('Nenhum serviço cadastrado.'),
      ).toBeInTheDocument();
    });

    screen.getByText('Novo').click();

    await waitFor(() => {
      expect(
        screen.getByText('Novo serviço', { selector: 'h3' }),
      ).toBeInTheDocument();
    });

    screen.getAllByText('Cancelar')[0].click();

    await waitFor(() => {
      expect(
        screen.queryByText('Novo serviço', { selector: 'h3' }),
      ).not.toBeInTheDocument();
    });
  });

  it('deve excluir serviço após confirmação', async () => {
    mockServicesRepository.findServices.mockResolvedValue([serviceRow()]);
    mockServicesRepository.deleteService.mockResolvedValue(undefined);

    renderServicos();

    await waitFor(() => {
      expect(screen.getByText('Serviço A')).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'Excluir' }).click();

    await waitFor(() => {
      expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole('button', { name: 'Excluir' });
    confirmButtons[confirmButtons.length - 1].click();

    await waitFor(() => {
      expect(mockServicesRepository.deleteService).toHaveBeenCalledWith(
        'tenant-1',
        'svc-1',
      );
    });
  });
});
