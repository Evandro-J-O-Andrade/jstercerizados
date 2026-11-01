import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  tenantId: 'tenant-a',
  jobs: { list: vi.fn(), getStats: vi.fn() },
  candidates: { list: vi.fn(), getStats: vi.fn() },
  applications: { list: vi.fn(), getStats: vi.fn() },
  matches: { list: vi.fn(), getStats: vi.fn() },
  processes: { findAll: vi.fn() },
  stages: { findAll: vi.fn() },
  talentPool: { findAll: vi.fn() },
  demands: { findAll: vi.fn() },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ currentTenantId: mocks.tenantId }),
}));

vi.mock('../repositories', () => ({
  jobsRepository: mocks.jobs,
  candidatesRepository: mocks.candidates,
  applicationsRepository: mocks.applications,
  jobMatchesRepository: mocks.matches,
  recruitmentProcessRepository: mocks.processes,
  recruitmentStageRepository: mocks.stages,
  talentPoolRepository: mocks.talentPool,
  recruitmentDemandRepository: mocks.demands,
}));

import { RecrutamentoProvider, useRecrutamento } from './RecrutamentoContext';

function JobsOutput() {
  const { jobs, isLoading } = useRecrutamento();
  return (
    <output data-testid="jobs">
      {isLoading ? 'loading' : jobs.map((job) => job.id).join(',')}
    </output>
  );
}

function TestProvider() {
  return (
    <RecrutamentoProvider>
      <JobsOutput />
    </RecrutamentoProvider>
  );
}

describe('RecrutamentoProvider tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tenantId = 'tenant-a';

    const stats = {
      data: {
        total: 0,
        draft: 0,
        published: 0,
        paused: 0,
        closed: 0,
        filled: 0,
        active: 0,
        inactive: 0,
        archived: 0,
        blacklisted: 0,
        new_this_month: 0,
        applied: 0,
        screening: 0,
        interview: 0,
        offer: 0,
        hired: 0,
        rejected: 0,
        new_today: 0,
        high_score: 0,
        eligible_not_notified: 0,
      },
      error: null,
    };

    mocks.jobs.getStats.mockResolvedValue(stats);
    mocks.candidates.list.mockResolvedValue({ data: [], error: null });
    mocks.candidates.getStats.mockResolvedValue(stats);
    mocks.applications.list.mockResolvedValue({ data: [], error: null });
    mocks.applications.getStats.mockResolvedValue(stats);
    mocks.matches.list.mockResolvedValue({ data: [], error: null });
    mocks.matches.getStats.mockResolvedValue(stats);
    mocks.processes.findAll.mockResolvedValue([]);
    mocks.stages.findAll.mockResolvedValue([]);
    mocks.talentPool.findAll.mockResolvedValue([]);
    mocks.demands.findAll.mockResolvedValue([]);
  });

  it('ignores a previous tenant response that resolves after a tenant switch', async () => {
    const pendingTenantA: Array<(result: {
      data: { id: string }[];
      error: null;
    }) => void> = [];

    mocks.jobs.list.mockImplementation(
      (filters: { tenant_id: string }) =>
        filters.tenant_id === 'tenant-a'
          ? new Promise<{ data: { id: string }[]; error: null }>((resolve) =>
              pendingTenantA.push(resolve),
            )
          : Promise.resolve({ data: [{ id: 'tenant-b-job' }], error: null }),
    );

    const view = render(<TestProvider />);
    await waitFor(() =>
      expect(pendingTenantA.length).toBeGreaterThanOrEqual(2),
    );

    mocks.tenantId = 'tenant-b';
    view.rerender(<TestProvider />);

    await waitFor(() =>
      expect(screen.getByTestId('jobs')).toHaveTextContent('tenant-b-job'),
    );

    pendingTenantA.forEach((resolve) =>
      resolve({ data: [{ id: 'tenant-a-job' }], error: null }),
    );

    await waitFor(() =>
      expect(screen.getByTestId('jobs')).toHaveTextContent('tenant-b-job'),
    );
    expect(screen.getByTestId('jobs')).not.toHaveTextContent('tenant-a-job');
  });
});
