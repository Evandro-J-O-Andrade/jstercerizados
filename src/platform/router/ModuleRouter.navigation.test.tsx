import type { ReactElement, ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ useAccount: vi.fn() }));

vi.mock('@/platform/context', () => ({
  useAccount: mocks.useAccount,
}));

vi.mock('@/platform/permissions', () => ({
  PermissionGuard: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/core/shell/AdminModuleLayout', () => ({
  AdminModuleLayout: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { ModuleRouter } from './ModuleRouter';

function BrokenModulePage(): ReactElement {
  throw new Error('module page failed');
}

function CandidateDashboardPage() {
  return (
    <div data-testid="candidate-dashboard-content">Painel do candidato</div>
  );
}

function LocationDisplay() {
  const location = useLocation();
  return <output data-testid="current-location">{location.pathname}</output>;
}

describe('ModuleRouter navigation', () => {
  it('prioriza a rota index canônica quando o módulo também possui funcionalidades internas', () => {
    mocks.useAccount.mockReturnValue({
      activePermissions: [{ name: 'jobs.read' }],
      effectiveScopes: ['tenant'],
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/recrutamento']}>
        <Routes>
          <Route
            path="/dashboard/recrutamento/*"
            element={
              <ModuleRouter
                moduleRegistries={{
                  recrutamento: [
                    {
                      path: '',
                      label: 'Dashboard de recrutamento',
                      element: CandidateDashboardPage,
                      requiredPermissions: [],
                    },
                    {
                      path: 'vagas',
                      label: 'Vagas',
                      element: CandidateDashboardPage,
                      requiredPermissions: [],
                    },
                  ],
                }}
                moduleIds={['recrutamento']}
                moduleRouteBase="/dashboard/recrutamento"
                skipLayout
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('candidate-dashboard-content')).toBeInTheDocument();
  });

  it('renders the candidate root dashboard without the generic empty prompt', () => {
    mocks.useAccount.mockReturnValue({
      activePermissions: [{ name: 'candidates.self.read' }],
      effectiveScopes: ['tenant'],
    });

    render(
      <MemoryRouter initialEntries={['/candidato']}>
        <Routes>
          <Route
            path="/candidato/*"
            element={
              <ModuleRouter
                moduleRegistries={{
                  candidato: [
                    {
                      path: '',
                      label: 'Dashboard do candidato',
                      element: CandidateDashboardPage,
                      requiredPermissions: ['candidates.self.read'],
                    },
                  ],
                }}
                moduleIds={['candidato']}
                moduleRouteBase="/candidato"
                skipLayout
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId('candidate-dashboard-content'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Acesse as funcionalidades pelo menu lateral.'),
    ).not.toBeInTheDocument();
  });

  it('changes module feature routes without a document reload', async () => {
    mocks.useAccount.mockReturnValue({
      activePermissions: [{ name: 'jobs.read' }, { name: 'candidates.read' }],
      effectiveScopes: ['tenant'],
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/recrutamento']}>
        <LocationDisplay />
        <Link to="/dashboard/recrutamento/vagas">Vagas</Link>
        <Routes>
          <Route
            path="/dashboard/recrutamento/*"
            element={
              <ModuleRouter
                moduleRegistries={{
                  recrutamento: [
                    {
                      path: 'vagas',
                      label: 'Vagas',
                      element: CandidateDashboardPage,
                      requiredPermissions: [],
                    },
                  ],
                }}
                moduleIds={['recrutamento']}
                moduleRouteBase="/dashboard/recrutamento"
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Vagas' }));

    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toHaveTextContent(
        '/dashboard/recrutamento/vagas',
      );
    });
  });

  it('contains a page render failure inside its module boundary', async () => {
    mocks.useAccount.mockReturnValue({
      activePermissions: [{ name: 'jobs.read' }, { name: 'candidates.read' }],
      effectiveScopes: ['tenant'],
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/recrutamento/vagas']}>
        <Routes>
          <Route
            path="/dashboard/recrutamento/*"
            element={
              <ModuleRouter
                moduleRegistries={{
                  recrutamento: [
                    {
                      path: 'vagas',
                      label: 'Vagas',
                      element: BrokenModulePage,
                      requiredPermissions: [],
                    },
                  ],
                }}
                moduleIds={['recrutamento']}
                moduleRouteBase="/dashboard/recrutamento"
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });
});
