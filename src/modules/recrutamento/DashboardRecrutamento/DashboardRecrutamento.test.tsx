import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({ useRecrutamento: vi.fn() }));

vi.mock('@/modules/recrutamento/RecrutamentoContext', () => ({
  useRecrutamento: mocks.useRecrutamento,
}));

import DashboardRecrutamento from './DashboardRecrutamento';

describe('DashboardRecrutamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRecrutamento.mockReturnValue({
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      jobs: [
        {
          id: 'job-1',
          tenant_id: 'tenant-1',
          company_id: null,
          company_relationship_id: null,
          title: 'Assistente de RH',
          slug: 'assistente-rh',
          description: null,
          responsibilities: null,
          requirements: null,
          benefits: null,
          salary_min: null,
          salary_max: null,
          salary_type: 'negotiate',
          contract_type: 'clt',
          seniority: null,
          work_hours: null,
          work_mode: 'onsite',
          city: null,
          state: null,
          location_detail: null,
          status: 'published',
          published_at: null,
          closed_at: null,
          filled_at: null,
          views_count: 0,
          applications_count: 5,
          metadata: {},
          created_at: '2026-10-01T12:00:00.000Z',
          created_by: null,
          updated_at: '2026-10-01T12:00:00.000Z',
          updated_by: null,
        },
      ],
      dashboardStats: {
        jobs: {
          total: 4,
          draft: 1,
          published: 3,
          paused: 0,
          closed: 0,
          filled: 0,
        },
        candidates: {
          total: 8,
          active: 7,
          inactive: 1,
          archived: 0,
          blacklisted: 0,
          new_this_month: 2,
        },
        applications: {
          total: 5,
          applied: 2,
          screening: 1,
          interview: 1,
          offer: 0,
          hired: 1,
          rejected: 0,
          new_today: 1,
        },
        processes: {
          total: 2,
          planning: 0,
          open: 1,
          in_progress: 1,
          completed: 0,
        },
        demands: { total: 0, open: 0, in_progress: 0, fulfilled: 0 },
        matches: { total: 0, high_score: 0, eligible_not_notified: 0 },
      },
      applicationsEnriched: [
        {
          id: 'application-1',
          tenant_id: 'tenant-1',
          job_id: 'job-1',
          candidate_id: 'candidate-1',
          person_id: 'person-1',
          process_id: null,
          current_stage_id: null,
          status: 'screening',
          applied_at: '2026-10-04T12:00:00.000Z',
          source: null,
          cover_letter: null,
          referral_source: null,
          referred_by: null,
          screening_score: null,
          screening_notes: null,
          recruiter_notes: null,
          last_activity_at: '2026-10-04T12:00:00.000Z',
          rejected_at: null,
          rejection_reason: null,
          hired_at: null,
          metadata: {},
          created_at: '2026-10-04T12:00:00.000Z',
          created_by: null,
          updated_at: '2026-10-04T12:00:00.000Z',
          updated_by: null,
          job_title: 'Assistente de RH',
          job_slug: 'assistente-rh',
          candidate_name: 'Maria Silva',
          candidate_email: 'maria@example.com',
          candidate_avatar_url: null,
          process_name: null,
          stage_name: 'Triagem',
          days_in_current_stage: 1,
        },
      ],
    });
  });

  it('renders repository-backed metrics and recent applications once', () => {
    render(
      <MemoryRouter>
        <DashboardRecrutamento />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('dashboard-card-open-jobs')).toHaveTextContent(
      '3',
    );
    expect(
      screen.getByTestId('dashboard-card-active-candidates'),
    ).toHaveTextContent('7');
    expect(
      screen.getByTestId('dashboard-card-applications-total'),
    ).toHaveTextContent('5');
    expect(screen.getByText('Funil de recrutamento')).toBeInTheDocument();
    expect(screen.getAllByText('Maria Silva').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Assistente de RH').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Em triagem').length).toBeGreaterThan(0);
  });

  it('renders error state without fake metrics', () => {
    mocks.useRecrutamento.mockReturnValue({
      isLoading: false,
      error: 'Falha real',
      refetch: vi.fn(),
      jobs: [],
      dashboardStats: null,
      applicationsEnriched: [],
    });
    render(
      <MemoryRouter>
        <DashboardRecrutamento />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Falha real');
    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument();
  });

  it('renders empty state when no stats', () => {
    mocks.useRecrutamento.mockReturnValue({
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      jobs: [],
      dashboardStats: null,
      applicationsEnriched: [],
    });
    render(
      <MemoryRouter>
        <DashboardRecrutamento />
      </MemoryRouter>,
    );
    expect(screen.getByText('Indicadores indisponíveis')).toBeInTheDocument();
  });
});
