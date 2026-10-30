import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/pages/dashboard/DashboardForbidden', () => ({
  default: () => <div data-testid="dashboard-forbidden">Acesso não autorizado</div>,
}));

import { useAuth } from '@/contexts/AuthContext';
import { PermissionGuard } from '../PermissionGuard';

const mockUseAuth = vi.mocked(useAuth);

function renderWithRouter(ui: ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('PermissionGuard — fail-closed (Fase D.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nega acesso quando permission é string vazia', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      person: { id: 'p1', full_name: 'Usuário', email: 'u@t.com' } as any,
      permissions: [],
      authError: null,
    } as any);

    renderWithRouter(
      <PermissionGuard permission="">
        <div data-testid="conteudo-liberado">Conteúdo privado</div>
      </PermissionGuard>,
    );

    expect(screen.getByTestId('dashboard-forbidden')).toBeInTheDocument();
    expect(screen.queryByTestId('conteudo-liberado')).not.toBeInTheDocument();
  });

  it('nega acesso quando permission é undefined', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      person: { id: 'p1', full_name: 'Usuário', email: 'u@t.com' } as any,
      permissions: [],
      authError: null,
    } as any);

    renderWithRouter(
      <PermissionGuard>
        <div data-testid="conteudo-liberado">Conteúdo privado</div>
      </PermissionGuard>,
    );

    expect(screen.getByTestId('dashboard-forbidden')).toBeInTheDocument();
    expect(screen.queryByTestId('conteudo-liberado')).not.toBeInTheDocument();
  });

  it('nega acesso quando permissions array está vazio', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      person: { id: 'p1', full_name: 'Usuário', email: 'u@t.com' } as any,
      permissions: [],
      authError: null,
    } as any);

    renderWithRouter(
      <PermissionGuard permissions={[]}>
        <div data-testid="conteudo-liberado">Conteúdo privado</div>
      </PermissionGuard>,
    );

    expect(screen.getByTestId('dashboard-forbidden')).toBeInTheDocument();
    expect(screen.queryByTestId('conteudo-liberado')).not.toBeInTheDocument();
  });

  it('libera acesso quando permissão válida é concedida', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      person: { id: 'p1', full_name: 'Usuário', email: 'u@t.com' } as any,
      permissions: [{ resource: 'jobs', action: 'read' }],
      authError: null,
    } as any);

    renderWithRouter(
      <PermissionGuard permission="jobs.read">
        <div data-testid="conteudo-liberado">Conteúdo privado</div>
      </PermissionGuard>,
    );

    expect(screen.getByTestId('conteudo-liberado')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-forbidden')).not.toBeInTheDocument();
  });

  it('nega acesso quando usuário não tem a permissão exigida', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      person: { id: 'p1', full_name: 'Usuário', email: 'u@t.com' } as any,
      permissions: [{ resource: 'jobs', action: 'read' }],
      authError: null,
    } as any);

    renderWithRouter(
      <PermissionGuard permission="companies.read">
        <div data-testid="conteudo-liberado">Conteúdo privado</div>
      </PermissionGuard>,
    );

    expect(screen.getByTestId('dashboard-forbidden')).toBeInTheDocument();
    expect(screen.queryByTestId('conteudo-liberado')).not.toBeInTheDocument();
  });
});

