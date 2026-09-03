import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobsRepository } from './jobs.repository';

function createBuilder(returnValue: { data: any; error: any }) {
  const builder: Record<string, any> = () => builder;
  builder.select = () => builder;
  builder.insert = () => builder;
  builder.update = () => builder;
  builder.delete = () => builder;
  builder.eq = () => builder;
  builder.neq = () => builder;
  builder.or = () => builder;
  builder.in = () => builder;
  builder.is = () => builder;
  builder.order = () => builder;
  builder.limit = () => builder;
  builder.ilike = () => builder;
  builder.single = () => builder;
  builder.maybeSingle = () => builder;
  builder.then = (resolve: (value: { data: any; error: any }) => void) =>
    resolve(returnValue);
  return builder;
}

const viewBuilder = createBuilder({ data: [], error: null });

const mockSupabase = {
  from: vi.fn((table: string) => {
    if (table === 'public_jobs_v1') return viewBuilder;
    return createBuilder({ data: [], error: null });
  }),
};

describe('JobsRepository.findPublicJobs', () => {
  let repository: JobsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new JobsRepository(mockSupabase as any);
    viewBuilder.select = () => viewBuilder;
    viewBuilder.eq = () => viewBuilder;
    viewBuilder.order = () => viewBuilder;
    viewBuilder.limit = () => viewBuilder;
    viewBuilder.ilike = () => viewBuilder;
    viewBuilder.then = (resolve: any) => resolve({ data: [], error: null });
  });

  it('queries public_jobs_v1 and orders by published_at desc', async () => {
    const orderSpy = vi.fn(() => viewBuilder);
    viewBuilder.order = orderSpy;

    const result = await repository.findPublicJobs();
    expect(result).toEqual([]);
    expect(mockSupabase.from).toHaveBeenCalledWith('public_jobs_v1');
    expect(orderSpy).toHaveBeenCalledWith('published_at', {
      ascending: false,
    });
  });

  it('returns mapped rows when view returns data', async () => {
    const mockRows = [
      {
        job_id: 'job-1',
        title: 'Auxiliar de Produção',
        slug: 'auxiliar-de-producao',
        status: 'published',
        description: 'desc',
        responsibilities: null,
        requirements: null,
        benefits: 'VT, VR',
        contract_type: 'clt',
        work_mode: 'onsite',
        location: 'Arujá, SP',
        salary_text: 'R$ 1.950,00',
        salary_min: 1950,
        salary_max: null,
        salary_type: 'monthly',
        company_id: 'comp-1',
        company_name: 'Abarca Móveis',
        company_logo_url: null,
        published_at: '2026-08-25T19:01:09.525239+00:00',
        expires_at: null,
        metadata: {},
        views_count: 0,
        tenant_id: 'tenant-1',
      },
    ];

    viewBuilder.then = (resolve: any) =>
      resolve({ data: mockRows, error: null });

    const result = await repository.findPublicJobs();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('auxiliar-de-producao');
    expect(result[0].company_name).toBe('Abarca Móveis');
  });

  it('throws when view returns error', async () => {
    viewBuilder.then = (resolve: any) =>
      resolve({ data: null, error: { message: 'view denied' } });

    await expect(repository.findPublicJobs()).rejects.toThrow('view denied');
  });

  it('returns empty array when supabase client is unavailable', async () => {
    const repo = new JobsRepository(null as any);
    const result = await repo.findPublicJobs();
    expect(result).toEqual([]);
  });

  it('applies search and limit when provided', async () => {
    const ilikeSpy = vi.fn(() => viewBuilder);
    const limitSpy = vi.fn(() => viewBuilder);
    viewBuilder.ilike = ilikeSpy;
    viewBuilder.limit = limitSpy;

    await repository.findPublicJobs({ search: 'auxiliar', limit: 5 });
    expect(ilikeSpy).toHaveBeenCalledWith('title', '%auxiliar%');
    expect(limitSpy).toHaveBeenCalledWith(5);
  });
});

describe('JobsRepository.findPublicJobBySlug', () => {
  let repository: JobsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new JobsRepository(mockSupabase as any);
    viewBuilder.select = () => viewBuilder;
    viewBuilder.eq = () => viewBuilder;
    viewBuilder.maybeSingle = () => viewBuilder;
    viewBuilder.then = (resolve: any) => resolve({ data: null, error: null });
  });

  it('queries the view filtered by slug', async () => {
    const eqSpy = vi.fn(() => viewBuilder);
    viewBuilder.eq = eqSpy;

    const result = await repository.findPublicJobBySlug('foo');
    expect(result).toBeNull();
    expect(eqSpy).toHaveBeenCalledWith('slug', 'foo');
  });

  it('returns null when client is unavailable', async () => {
    const repo = new JobsRepository(null as any);
    const result = await repo.findPublicJobBySlug('foo');
    expect(result).toBeNull();
  });
});
