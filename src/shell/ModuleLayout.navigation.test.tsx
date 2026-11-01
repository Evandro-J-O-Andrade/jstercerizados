import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useAccount: vi.fn(),
  modules: [
    {
      id: 'financeiro',
      title: 'Financeiro',
      description: '',
      icon: 'briefcase',
      route: '/dashboard/financeiro',
      category: 'negocio',
      scope: 'tenant',
      features: [
        {
          id: 'financeiro-transacoes',
          title: 'Transações',
          description: 'Transações',
          icon: 'briefcase',
          route: '/dashboard/financeiro/transacoes',
          requiredPermissions: ['finance.transactions.read'],
        },
        {
          id: 'financeiro-restrito',
          title: 'Área restrita',
          description: 'Área restrita',
          icon: 'briefcase',
          route: '/dashboard/financeiro/restrito',
          requiredPermissions: ['finance.admin'],
        },
        {
          id: 'financeiro-detalhe',
          title: 'Detalhe',
          description: 'Detalhe',
          icon: 'briefcase',
          route: '/dashboard/financeiro/contas/:id',
          requiredPermissions: ['finance.transactions.read'],
        },
      ],
    },
  ],
}));

vi.mock('@/platform/context', () => ({
  useAccount: mocks.useAccount,
}));

vi.mock('@/core/cells/cell-to-module-definition', () => ({
  getAvailableModulesFromCellRegistry: () => mocks.modules,
}));

import { ModuleLayout } from './ModuleLayout';

function CurrentPath() {
  const { pathname } = useLocation();
  return <output data-testid="current-path">{pathname}</output>;
}

describe('ModuleLayout navigation', () => {
  beforeEach(() => {
    mocks.useAccount.mockReturnValue({
      activePermissions: [{ name: 'finance.transactions.read' }],
      effectiveScopes: ['tenant'],
    });
  });

  it('renders only routes available to the active permissions', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/financeiro/transacoes']}>
        <ModuleLayout
          title="Financeiro"
          homeRoute="/dashboard/financeiro"
          moduleId="financeiro"
        >
          <div>Conteúdo do módulo</div>
        </ModuleLayout>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Dashboard' }),
    ).toHaveAttribute('href', '/dashboard/financeiro');
    expect(
      screen.getByRole('link', { name: 'Transações' }),
    ).toHaveAttribute('href', '/dashboard/financeiro/transacoes');
    expect(
      screen.queryByRole('link', { name: 'Área restrita' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Detalhe' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Conteúdo do módulo')).toBeInTheDocument();
  });

  it('navigates through the registered feature link without a page reload', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/financeiro']}>
        <CurrentPath />
        <ModuleLayout
          title="Financeiro"
          homeRoute="/dashboard/financeiro"
          moduleId="financeiro"
        >
          <div>Conteúdo do módulo</div>
        </ModuleLayout>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Transações' }));

    expect(screen.getByTestId('current-path')).toHaveTextContent(
      '/dashboard/financeiro/transacoes',
    );
  });
});
