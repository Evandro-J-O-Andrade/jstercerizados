import type { ReactElement, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ useAccount: vi.fn() }));

vi.mock('@/platform/context', () => ({
  useAccount: mocks.useAccount,
}));

vi.mock('@/platform/permissions', () => ({
  PermissionGuard: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/components/portal/ModuleWorkspace', () => ({
  ModuleWorkspace: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('@/components/portal/ModuleSidebar', () => ({
  ModuleSidebar: () => null,
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
  it('renders the candidate root dashboard without the generic empty prompt', () => {
    mocks.useAccount.mockReturnValue({
      activePermissions: [{ resource: 'candidates.self', action: 'read' }],
      effectiveScopes: 'tenant',
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

  it('changes module feature routes without a document reload', () => {
    mocks.useAccount.mockReturnValue({
      activePermissions: [
        { resource: 'jobs', action: 'read' },
        { resource: 'candidates', action: 'read' },
      ],
      effectiveScopes: 'tenant',
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/recrutamento']}>
        <LocationDisplay />
        <Routes>
          <Route
            path="/dashboard/*"
            element={
              <ModuleRouter
                moduleRegistries={{}}
                moduleIds={['recrutamento']}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: /Vagas/ }));

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/dashboard/recrutamento/vagas',
    );
  });

  it('contains a page render failure inside its module boundary', () => {
    mocks.useAccount.mockReturnValue({
      activePermissions: [
        { resource: 'jobs', action: 'read' },
        { resource: 'candidates', action: 'read' },
      ],
      effectiveScopes: 'tenant',
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/recrutamento/vagas']}>
        <Routes>
          <Route
            path="/dashboard/*"
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
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });
});
