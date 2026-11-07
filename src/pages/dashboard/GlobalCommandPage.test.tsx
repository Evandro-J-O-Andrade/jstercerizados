import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import type { CellContract } from '@/core/types';
import GlobalCommandPage from './GlobalCommandPage';

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    identity: { greeting: 'Olá', firstName: 'Teste', contextLabel: 'Admin' },
    activePermissions: [],
    availableModules: [],
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    permissions: ['domain_events.read'],
    isAdminMaster: true,
  }),
}));

vi.mock('@/hooks/useGlobalDashboardStats', () => ({
  useGlobalDashboardStats: () => ({
    tenants: 0,
    companies: 0,
    people: 0,
    candidates: 0,
    jobs: 0,
    applications: 0,
    serviceOrders: 0,
    supportTickets: 0,
    recentEvents: [],
    kpiErrors: {},
    loading: false,
    error: null,
  }),
}));

vi.mock('@/utils/rbac', () => ({
  hasPermission: () => true,
}));

const okCell: CellContract = {
  id: 'ok',
  name: 'OK',
  routes: [{ path: '/ok', label: 'OK' }],
  permissions: ['ok.read'],
  enabled: true,
  lifecycle: { status: 'active', health: 'healthy' },
  scope: 'tenant',
  domain: 'test',
};

describe('GlobalCommandPage observability', () => {
  beforeEach(() => {
    cellRegistry.clear();
  });

  it('renderiza estado operacional com probes/heartbeat locais', async () => {
    cellRegistry.register(okCell);
    render(
      <MemoryRouter>
        <GlobalCommandPage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText('OK')).toBeInTheDocument());
    expect(screen.getAllByText(/Probes:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Heartbeat:/i).length).toBeGreaterThan(0);
  });

  it('isola falha de observabilidade de uma célula e mantém outras visíveis', async () => {
    cellRegistry.register(okCell);
    cellRegistry.register(
      { ...okCell, id: 'broken', name: 'BROKEN' },
      undefined,
      {
        probes: [
          () => {
            throw new Error('falha probe');
          },
        ],
      },
    );
    render(
      <MemoryRouter>
        <GlobalCommandPage />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText('OK')).toBeInTheDocument());
    expect(screen.getByText('BROKEN')).toBeInTheDocument();
    expect(screen.getAllByText(/Falha isolada/i).length).toBeGreaterThan(0);
  });
});
