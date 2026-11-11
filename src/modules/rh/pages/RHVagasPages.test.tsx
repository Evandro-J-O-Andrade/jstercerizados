import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RHVagasConsultaPage from './RHVagasConsultaPage';
import RHVagaDetalhePage from './RHVagaDetalhePage';

const { listJobs, getJobById, listApplications } = vi.hoisted(() => ({
  listJobs: vi.fn(),
  getJobById: vi.fn(),
  listApplications: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    currentTenantId: 'tenant-1',
    hasAnyPermission: (perms: string[]) =>
      perms.includes('jobs.read') || perms.includes('applications.read'),
  }),
}));

vi.mock('@/modules/recrutamento/repositories/jobs.repository', () => ({
  jobsRepository: { list: listJobs, getById: getJobById },
}));
vi.mock('@/modules/recrutamento/repositories/applications.repository', () => ({
  applicationsRepository: { list: listApplications },
}));

const job = (over: Record<string, unknown> = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  tenant_id: 'tenant-1',
  title: 'Analista RH',
  slug: 'analista-rh',
  status: 'published',
  published_at: '2026-01-01T00:00:00Z',
  contract_type: 'clt',
  work_mode: 'onsite',
  city: 'Santos',
  state: 'SP',
  company_name: 'J&S',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...over,
});

describe('RH vagas (own pages)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listApplications.mockResolvedValue({ data: [], error: null, count: 0 });
  });

  it('list links to RH detail and shows public CTA only for published+slug', async () => {
    listJobs.mockResolvedValue({
      data: [
        job(),
        job({
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Rascunho',
          slug: 'rascunho',
          status: 'draft',
          published_at: null,
        }),
      ],
      count: 2,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/rh/vagas']}>
        <RHVagasConsultaPage />
      </MemoryRouter>,
    );

    const detailLink = await screen.findByRole('link', { name: 'Analista RH' });
    expect(detailLink.getAttribute('href')).toBe(
      '/dashboard/rh/vagas/550e8400-e29b-41d4-a716-446655440000',
    );
    const publicLink = screen.getByRole('link', { name: /Ver no site/i });
    expect(publicLink.getAttribute('href')).toBe('/vagas/analista-rh');
    expect(publicLink).not.toHaveAttribute('target');
    expect(
      screen.queryByRole('link', { name: /Ver no site/i, hidden: false }),
    ).toBeInTheDocument();
    // only one public CTA for the published+slug job
    expect(screen.getAllByRole('link', { name: /Ver no site/i })).toHaveLength(
      1,
    );
    expect(
      screen.queryByText(/Abrir no Recrutamento/i),
    ).not.toBeInTheDocument();
  });

  it('detail stays in RH and blocks invalid UUID before query', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/rh/vagas/:id']}>
        <Routes>
          <Route
            path="/dashboard/rh/vagas/:id"
            element={<RHVagaDetalhePage />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByText(/Identificador da vaga inválido/i),
    ).toBeInTheDocument();
    expect(getJobById).not.toHaveBeenCalled();
  });

  it('detail loads real job and uses slug for public CTA', async () => {
    getJobById.mockResolvedValue({
      data: job({ description: 'Descrição real' }),
      error: null,
    });
    render(
      <MemoryRouter
        initialEntries={[
          '/dashboard/rh/vagas/550e8400-e29b-41d4-a716-446655440000',
        ]}
      >
        <Routes>
          <Route
            path="/dashboard/rh/vagas/:id"
            element={<RHVagaDetalhePage />}
          />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(getJobById).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'tenant-1',
      ),
    );
    expect(await screen.findByText(/Descrição real/i)).toBeInTheDocument();
    const publicLink = screen.getByRole('link', { name: /Ver vaga no site/i });
    expect(publicLink.getAttribute('href')).toBe('/vagas/analista-rh');
    expect(publicLink).not.toHaveAttribute('target');
    expect(
      screen.getAllByRole('link', { name: /Voltar/i })[0].getAttribute('href'),
    ).toBe('/dashboard/rh/vagas');
  });
});
