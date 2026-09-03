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
