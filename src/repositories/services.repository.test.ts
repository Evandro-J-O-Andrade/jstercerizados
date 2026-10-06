import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServicesRepository } from './services.repository';

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
    if (table === 'public_services_v1') return viewBuilder;
    return createBuilder({ data: [], error: null });
  }),
};

describe('ServicesRepository.findPublicServices', () => {
  let repository: ServicesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ServicesRepository(mockSupabase as any);
    viewBuilder.select = () => viewBuilder;
    viewBuilder.eq = () => viewBuilder;
    viewBuilder.order = () => viewBuilder;
    viewBuilder.then = (resolve: any) => resolve({ data: [], error: null });
  });

  it('queries public_services_v1 and orders by display_order asc', async () => {
    const orderSpy = vi.fn(() => viewBuilder);
    viewBuilder.order = orderSpy;

    const result = await repository.findPublicServices();
    expect(result).toEqual([]);
    expect(mockSupabase.from).toHaveBeenCalledWith('public_services_v1');
    expect(orderSpy).toHaveBeenCalledWith('display_order', {
      ascending: true,
    });
  });

  it('returns rows when view returns data', async () => {
    const mockRows = [
      {
        id: 'svc-1',
        name: 'Recrutamento e Seleção',
        slug: 'recrutamento-selecao',
        category: 'rh',
        short_description: 'short',
        description: 'desc',
        card_image_url: '/img/recrutamento.jpg',
        hero_image_url: null,
        hero_title: null,
        hero_subtitle: null,
        icon: 'users',
        benefits: '["Acesso a talentos","Triagem ágil"]',
        process_steps: null,
        cta_title: null,
        cta_description: null,
        cta_button_text: null,
        cta_button_url: null,
        status: 'published',
        published_at: '2026-09-01T00:00:00+00:00',
        display_order: 10,
        metadata: {},
        seo_title: null,
        seo_description: null,
        seo_keywords: null,
      },
    ];

    viewBuilder.then = (resolve: any) =>
      resolve({ data: mockRows, error: null });

    const result = await repository.findPublicServices();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('recrutamento-selecao');
    expect(result[0].category).toBe('rh');
  });

  it('filters by category when provided', async () => {
    const eqSpy = vi.fn(() => viewBuilder);
    viewBuilder.eq = eqSpy;

    await repository.findPublicServices({ category: 'rh' });
    expect(eqSpy).toHaveBeenCalledWith('category', 'rh');
  });

  it('throws when view returns error', async () => {
    viewBuilder.then = (resolve: any) =>
      resolve({ data: null, error: { message: 'view denied' } });

    await expect(repository.findPublicServices()).rejects.toThrow(
      'view denied',
    );
  });

  it('returns empty array when supabase client is unavailable', async () => {
    const repo = new ServicesRepository(null as any);
    const result = await repo.findPublicServices();
    expect(result).toEqual([]);
  });
});

describe('ServicesRepository.findPublicServiceBySlug', () => {
  let repository: ServicesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ServicesRepository(mockSupabase as any);
    viewBuilder.select = () => viewBuilder;
    viewBuilder.eq = () => viewBuilder;
    viewBuilder.maybeSingle = () => viewBuilder;
    viewBuilder.then = (resolve: any) => resolve({ data: null, error: null });
  });

  it('queries the view filtered by slug', async () => {
    const eqSpy = vi.fn(() => viewBuilder);
    viewBuilder.eq = eqSpy;

    const result = await repository.findPublicServiceBySlug(
      'recrutamento-selecao',
    );
    expect(result).toBeNull();
    expect(eqSpy).toHaveBeenCalledWith('slug', 'recrutamento-selecao');
  });

  it('returns null when client is unavailable', async () => {
    const repo = new ServicesRepository(null as any);
    const result = await repo.findPublicServiceBySlug('recrutamento-selecao');
    expect(result).toBeNull();
  });

  it('returns mapped row when found', async () => {
    const mockRow = {
      id: 'svc-1',
      name: 'Recrutamento e Seleção',
      slug: 'recrutamento-selecao',
      category: 'rh',
      short_description: 'short',
      description: 'desc',
      card_image_url: '/img/recrutamento.jpg',
      hero_image_url: null,
      hero_title: null,
      hero_subtitle: null,
      icon: 'users',
      benefits: '["Acesso a talentos"]',
      process_steps: null,
      cta_title: null,
      cta_description: null,
      cta_button_text: null,
      cta_button_url: null,
      status: 'published',
      published_at: '2026-09-01T00:00:00+00:00',
      display_order: 10,
      metadata: {},
      seo_title: null,
      seo_description: null,
      seo_keywords: null,
    };

    viewBuilder.then = (resolve: any) =>
      resolve({ data: mockRow, error: null });

    const result = await repository.findPublicServiceBySlug(
      'recrutamento-selecao',
    );
    expect(result).not.toBeNull();
    expect(result?.slug).toBe('recrutamento-selecao');
  });
});

function createThenable(value: { data: any; error: any }) {
  const promise: any = Promise.resolve(value);
  promise.select = vi.fn(() => promise);
  promise.eq = vi.fn(() => promise);
  promise.order = vi.fn(() => promise);
  promise.insert = vi.fn(() => promise);
  promise.update = vi.fn(() => promise);
  promise.delete = vi.fn(() => promise);
  promise.single = vi.fn(() => Promise.resolve(value));
  return promise;
}

function serviceRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'svc-1',
    tenant_id: 'tenant-1',
    name: 'Serviço A',
    slug: 'servico-a',
    category: 'rh',
    short_description: null,
    description: null,
    card_image_url: null,
    hero_image_url: null,
    hero_title: null,
    hero_subtitle: null,
    benefits: null,
    icon: null,
    process_steps: null,
    cta_title: null,
    cta_description: null,
    cta_button_text: null,
    cta_button_url: null,
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    status: 'published',
    published_at: null,
    display_order: null,
    created_by: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

function orderRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ord-1',
    tenant_id: 'tenant-1',
    company_service_id: 'svc-1',
    status: 'open',
    scheduled_at: null,
    completed_at: null,
    quantity: 1,
    value: 0,
    period_start: null,
    period_end: null,
    location: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

function executionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'exec-1',
    tenant_id: 'tenant-1',
    service_order_id: 'ord-1',
    executed_by: null,
    notes: null,
    started_at: '2024-01-01',
    finished_at: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

describe('ServicesRepository — tenant CRUD', () => {
  let repository: ServicesRepository;
  let mockFrom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = vi.fn(() => createThenable({ data: [], error: null }));
    repository = new ServicesRepository({ from: mockFrom } as any);
  });

  describe('findServices', () => {
    it('retorna serviços do tenant ordenados por nome', async () => {
      const rows = [
        serviceRow(),
        serviceRow({ id: 'svc-2', name: 'Serviço B' }),
      ];
      mockFrom.mockReturnValueOnce(createThenable({ data: rows, error: null }));

      const result = await repository.findServices('tenant-1');

      expect(mockFrom).toHaveBeenCalledWith('services');
      const query = mockFrom.mock.results[0].value;
      expect(query.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
      expect(query.order).toHaveBeenCalledWith('name', { ascending: true });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Serviço A');
    });

    it('propaga erro do banco', async () => {
      mockFrom.mockReturnValueOnce(
        createThenable({ data: null, error: { message: 'db down' } }),
      );

      await expect(repository.findServices('tenant-1')).rejects.toThrow(
        'db down',
      );
    });

    it('retorna array vazio sem cliente supabase', async () => {
      const repo = new ServicesRepository(null as any);
      await expect(repo.findServices('tenant-1')).resolves.toEqual([]);
    });
  });

  describe('createService', () => {
    it('insere e retorna o serviço criado', async () => {
      const created = serviceRow({ id: 'new-id' });
      mockFrom.mockReturnValueOnce(
        createThenable({ data: created, error: null }),
      );

      const result = await repository.createService({
        tenant_id: 'tenant-1',
        name: 'Serviço A',
        category: 'rh',
        status: 'published',
      });

      expect(mockFrom).toHaveBeenCalledWith('services');
      const query = mockFrom.mock.results[0].value;
      expect(query.insert).toHaveBeenCalled();
      expect(query.single).toHaveBeenCalled();
      expect(result.id).toBe('new-id');
    });

    it('propaga erro do banco', async () => {
      mockFrom.mockReturnValueOnce(
        createThenable({ data: null, error: { message: 'insert failed' } }),
      );

      await expect(
        repository.createService({
          tenant_id: 'tenant-1',
          name: 'X',
          category: 'rh',
        }),
      ).rejects.toThrow('insert failed');
    });

    it('lança quando supabase não está configurado', async () => {
      const repo = new ServicesRepository(null as any);
      await expect(
        repo.createService({
          tenant_id: 'tenant-1',
          name: 'X',
          category: 'rh',
        }),
      ).rejects.toThrow('Supabase não configurado');
    });
  });

  describe('updateService', () => {
    it('atualiza serviço pelo tenant e id', async () => {
      const updated = serviceRow({ name: 'Serviço Renomeado' });
      mockFrom.mockReturnValueOnce(
        createThenable({ data: updated, error: null }),
      );

      const result = await repository.updateService('tenant-1', 'svc-1', {
        name: 'Serviço Renomeado',
      });

      expect(mockFrom).toHaveBeenCalledWith('services');
      const query = mockFrom.mock.results[0].value;
      expect(query.update).toHaveBeenCalledWith({ name: 'Serviço Renomeado' });
      expect(query.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
      expect(query.eq).toHaveBeenCalledWith('id', 'svc-1');
      expect(result.name).toBe('Serviço Renomeado');
    });

    it('propaga erro do banco', async () => {
      mockFrom.mockReturnValueOnce(
        createThenable({ data: null, error: { message: 'update failed' } }),
      );

      await expect(
        repository.updateService('tenant-1', 'svc-1', { name: 'X' }),
      ).rejects.toThrow('update failed');
    });
  });

  describe('deleteService', () => {
    it('remove serviço pelo tenant e id', async () => {
      mockFrom.mockReturnValueOnce(createThenable({ data: null, error: null }));

      await expect(
        repository.deleteService('tenant-1', 'svc-1'),
      ).resolves.toBeUndefined();

      const query = mockFrom.mock.results[0].value;
      expect(query.delete).toHaveBeenCalled();
      expect(query.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
      expect(query.eq).toHaveBeenCalledWith('id', 'svc-1');
    });

    it('propaga erro do banco', async () => {
      mockFrom.mockReturnValueOnce(
        createThenable({ data: null, error: { message: 'delete failed' } }),
      );

      await expect(
        repository.deleteService('tenant-1', 'svc-1'),
      ).rejects.toThrow('delete failed');
    });
  });

  describe('findOrders', () => {
    it('retorna ordens do tenant ordenadas por criação desc', async () => {
      const rows = [orderRow(), orderRow({ id: 'ord-2' })];
      mockFrom.mockReturnValueOnce(createThenable({ data: rows, error: null }));

      const result = await repository.findOrders('tenant-1');

      expect(mockFrom).toHaveBeenCalledWith('service_orders');
      const query = mockFrom.mock.results[0].value;
      expect(query.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
      expect(query.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('createOrder', () => {
    it('insere e retorna a ordem criada', async () => {
      const created = orderRow({ id: 'new-ord' });
      mockFrom.mockReturnValueOnce(
        createThenable({ data: created, error: null }),
      );

      const result = await repository.createOrder({
        tenant_id: 'tenant-1',
        company_service_id: 'svc-1',
        status: 'open',
      });

      expect(mockFrom).toHaveBeenCalledWith('service_orders');
      expect(result.id).toBe('new-ord');
    });
  });

  describe('updateOrder', () => {
    it('atualiza ordem pelo tenant e id', async () => {
      const updated = orderRow({ status: 'done' });
      mockFrom.mockReturnValueOnce(
        createThenable({ data: updated, error: null }),
      );

      const result = await repository.updateOrder('tenant-1', 'ord-1', {
        status: 'done',
      });

      const query = mockFrom.mock.results[0].value;
      expect(query.update).toHaveBeenCalledWith({ status: 'done' });
      expect(query.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
      expect(query.eq).toHaveBeenCalledWith('id', 'ord-1');
      expect(result.status).toBe('done');
    });
  });

  describe('deleteOrder', () => {
    it('remove ordem pelo tenant e id', async () => {
      mockFrom.mockReturnValueOnce(createThenable({ data: null, error: null }));

      await expect(
        repository.deleteOrder('tenant-1', 'ord-1'),
      ).resolves.toBeUndefined();

      const query = mockFrom.mock.results[0].value;
      expect(query.delete).toHaveBeenCalled();
      expect(query.eq).toHaveBeenCalledWith('id', 'ord-1');
    });
  });

  describe('findExecutions', () => {
    it('retorna execuções do tenant ordenadas por início desc', async () => {
      const rows = [executionRow(), executionRow({ id: 'exec-2' })];
      mockFrom.mockReturnValueOnce(createThenable({ data: rows, error: null }));

      const result = await repository.findExecutions('tenant-1');

      expect(mockFrom).toHaveBeenCalledWith('service_executions');
      const query = mockFrom.mock.results[0].value;
      expect(query.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
      expect(query.order).toHaveBeenCalledWith('started_at', {
        ascending: false,
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('createExecution', () => {
    it('insere e retorna a execução criada', async () => {
      const created = executionRow({ id: 'new-exec' });
      mockFrom.mockReturnValueOnce(
        createThenable({ data: created, error: null }),
      );

      const result = await repository.createExecution({
        tenant_id: 'tenant-1',
        service_order_id: 'ord-1',
        started_at: '2024-01-01',
      });

      expect(mockFrom).toHaveBeenCalledWith('service_executions');
      expect(result.id).toBe('new-exec');
    });
  });

  describe('updateExecution', () => {
    it('atualiza execução pelo tenant e id', async () => {
      const updated = executionRow({ finished_at: '2024-01-02' });
      mockFrom.mockReturnValueOnce(
        createThenable({ data: updated, error: null }),
      );

      const result = await repository.updateExecution('tenant-1', 'exec-1', {
        finished_at: '2024-01-02',
      });

      const query = mockFrom.mock.results[0].value;
      expect(query.update).toHaveBeenCalledWith({ finished_at: '2024-01-02' });
      expect(query.eq).toHaveBeenCalledWith('id', 'exec-1');
      expect(result.finished_at).toBe('2024-01-02');
    });
  });

  describe('deleteExecution', () => {
    it('remove execução pelo tenant e id', async () => {
      mockFrom.mockReturnValueOnce(createThenable({ data: null, error: null }));

      await expect(
        repository.deleteExecution('tenant-1', 'exec-1'),
      ).resolves.toBeUndefined();

      const query = mockFrom.mock.results[0].value;
      expect(query.delete).toHaveBeenCalled();
      expect(query.eq).toHaveBeenCalledWith('id', 'exec-1');
    });
  });
});
