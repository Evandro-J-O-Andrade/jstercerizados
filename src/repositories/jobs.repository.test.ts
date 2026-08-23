import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jobsRepository } from '@/repositories/jobs.repository';

describe('jobsRepository — V2.1 contract', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('deve buscar vagas filtrando por tenant_id', async () => {
    const fakeTenantId = 'tenant-123';
    const fakeJobs = [
      {
        id: 'job-1',
        tenant_id: fakeTenantId,
        title: 'Vaga Teste',
        status: 'published',
        created_at: '2026-08-23T00:00:00Z',
      },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: fakeJobs, error: null }),
    });

    const mockClient = {
      from: mockFrom,
    } as any;

    vi.spyOn(jobsRepository as any, 'getClient').mockReturnValue(mockClient);

    const result = await jobsRepository.findAll(fakeTenantId);

    expect(mockFrom).toHaveBeenCalledWith('jobs');
    expect(result).toEqual(fakeJobs);
  });

  it('deve lançar erro quando a consulta falhar', async () => {
    const fakeTenantId = 'tenant-123';
    const fakeError = { message: 'Erro de conexão' };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: fakeError }),
    });

    const mockClient = {
      from: mockFrom,
    } as any;

    vi.spyOn(jobsRepository as any, 'getClient').mockReturnValue(mockClient);

    await expect(jobsRepository.findAll(fakeTenantId)).rejects.toThrow(
      'Failed to fetch jobs: Erro de conexão',
    );
  });

  it('deve buscar vaga por ID', async () => {
    const fakeJob = {
      id: 'job-1',
      tenant_id: 'tenant-123',
      title: 'Vaga Teste',
      status: 'published',
      created_at: '2026-08-23T00:00:00Z',
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: fakeJob, error: null }),
    });

    const mockClient = {
      from: mockFrom,
    } as any;

    vi.spyOn(jobsRepository as any, 'getClient').mockReturnValue(mockClient);

    const result = await jobsRepository.findById('job-1');

    expect(result).toEqual(fakeJob);
  });

  it('deve criar vaga com tenant_id', async () => {
    const fakeTenantId = 'tenant-123';
    const fakeJob = {
      id: 'job-new',
      tenant_id: fakeTenantId,
      title: 'Nova Vaga',
      status: 'draft',
      created_at: '2026-08-23T00:00:00Z',
    };

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: fakeJob, error: null }),
    });

    const mockClient = {
      from: mockFrom,
    } as any;

    vi.spyOn(jobsRepository as any, 'getClient').mockReturnValue(mockClient);

    const result = await jobsRepository.create(fakeTenantId, {
      title: 'Nova Vaga',
      status: 'draft',
    });

    expect(result).toEqual(fakeJob);
  });

  it('deve atualizar vaga por ID', async () => {
    const fakeJob = {
      id: 'job-1',
      tenant_id: 'tenant-123',
      title: 'Vaga Atualizada',
      status: 'published',
      created_at: '2026-08-23T00:00:00Z',
    };

    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: fakeJob, error: null }),
    });

    const mockClient = {
      from: mockFrom,
    } as any;

    vi.spyOn(jobsRepository as any, 'getClient').mockReturnValue(mockClient);

    const result = await jobsRepository.update('job-1', {
      title: 'Vaga Atualizada',
    });

    expect(result).toEqual(fakeJob);
  });

  it('deve deletar vaga por ID', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const mockClient = {
      from: mockFrom,
    } as any;

    vi.spyOn(jobsRepository as any, 'getClient').mockReturnValue(mockClient);

    await expect(jobsRepository.delete('job-1')).resolves.toBeUndefined();
  });
});
