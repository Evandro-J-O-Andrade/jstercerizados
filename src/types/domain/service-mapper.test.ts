import { describe, it, expect } from 'vitest';
import { mapPublicServiceV1ToService } from './service-mapper';
import type { PublicServiceV1 } from '@/repositories/services.repository';

const base: PublicServiceV1 = {
  id: 'svc-1',
  name: 'Recrutamento e Seleção',
  slug: 'recrutamento-selecao',
  category: 'rh',
  short_description: 'short',
  description: 'desc',
  card_image_url: '/img/card.jpg',
  hero_image_url: '/img/hero.jpg',
  hero_title: null,
  hero_subtitle: null,
  icon: 'users',
  benefits: '["Acesso a talentos","Triagem ágil"]',
  process_steps: null,
  cta_title: null,
  cta_description: null,
  cta_button_text: null,
  cta_button_url: null,
  gallery: null,
  status: 'published',
  published_at: '2026-09-01T00:00:00+00:00',
  display_order: 10,
  metadata: {},
  seo_title: null,
  seo_description: null,
  seo_keywords: null,
};

describe('mapPublicServiceV1ToService (Bloco 5B + 5C enrichment)', () => {
  it('maps every public contract field to the legacy Service shape', () => {
    const s = mapPublicServiceV1ToService(base);
    expect(s).not.toBeNull();
    expect(s!.title).toBe('Recrutamento e Seleção');
    expect(s!.shortDescription).toBe('short');
    expect(s!.description).toBe('desc');
    expect(s!.image).toBe('/img/card.jpg');
    expect(s!.icon).toBe('users');
    expect(s!.category).toBe('rh');
    expect(s!.benefits).toEqual(['Acesso a talentos', 'Triagem ágil']);
  });

  it('returns null when slug is missing', () => {
    expect(mapPublicServiceV1ToService({ ...base, slug: '' })).toBeNull();
  });

  it('returns null when name is missing', () => {
    expect(mapPublicServiceV1ToService({ ...base, name: '' })).toBeNull();
  });

  it('returns null for unsupported categories (candidato is excluded)', () => {
    expect(
      mapPublicServiceV1ToService({ ...base, category: 'candidato' }),
    ).toBeNull();
  });

  it('falls back image to hero_image_url when card_image_url is null', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      card_image_url: null,
    });
    expect(s!.image).toBe('/img/hero.jpg');
  });

  it('uses default icon when icon is null', () => {
    const s = mapPublicServiceV1ToService({ ...base, icon: null });
    expect(s!.icon).toBe('shield');
  });

  it('returns empty gallery array when null', () => {
    const s = mapPublicServiceV1ToService(base);
    expect(s!.gallery).toEqual([]);
  });

  it('returns empty gallery array when undefined', () => {
    const s = mapPublicServiceV1ToService({ ...base, gallery: undefined });
    expect(s!.gallery).toEqual([]);
  });

  it('maps gallery items sorted by sort_order ascending', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      gallery: [
        { url: '/img/3.jpg', alt: 'terceira', sort_order: 30 },
        { url: '/img/1.jpg', alt: 'primeira', sort_order: 10 },
        { url: '/img/2.jpg', alt: 'segunda', sort_order: 20 },
      ],
    });
    expect(s!.gallery).toEqual(['/img/1.jpg', '/img/2.jpg', '/img/3.jpg']);
  });

  it('filters out gallery items without url', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      gallery: [
        { url: '/img/ok.jpg', alt: 'ok', sort_order: 0 },
        { url: '', alt: 'vazio', sort_order: 1 },
        { url: '/img/ok2.jpg', alt: null, sort_order: 2 },
      ],
    });
    expect(s!.gallery).toEqual(['/img/ok.jpg', '/img/ok2.jpg']);
  });

  it('returns processSteps undefined when null', () => {
    const s = mapPublicServiceV1ToService(base);
    expect(s!.processSteps).toBeUndefined();
  });

  it('parses process_steps jsonb array of objects', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      process_steps: [
        { step: '01', title: 'Solicitação', description: 'Contato inicial' },
        { step: '02', title: 'Análise', description: 'Perfil' },
      ],
    });
    expect(s!.processSteps).toEqual([
      { step: '01', title: 'Solicitação', description: 'Contato inicial' },
      { step: '02', title: 'Análise', description: 'Perfil' },
    ]);
  });

  it('parses process_steps jsonb wrapped in { items: [...] }', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      process_steps: {
        items: [
          { title: 'A', description: 'desc A' },
          { title: 'B', description: 'desc B' },
        ],
      },
    });
    expect(s!.processSteps).toHaveLength(2);
    expect(s!.processSteps![0].title).toBe('A');
  });

  it('parses process_steps from a JSON string', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      process_steps: JSON.stringify([
        { title: 'A', description: 'desc A' },
        { title: 'B', description: 'desc B' },
      ]),
    });
    expect(s!.processSteps).toHaveLength(2);
  });

  it('parses process_steps from "Title|Description" strings', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      process_steps: ['Solicitação | Contato inicial', 'Análise | Perfil'],
    });
    expect(s!.processSteps).toEqual([
      { step: '01', title: 'Solicitação', description: 'Contato inicial' },
      { step: '02', title: 'Análise', description: 'Perfil' },
    ]);
  });

  it('skips process_steps items missing title or description', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      process_steps: [
        { title: 'A', description: 'desc' },
        { title: 'B' },
        { description: 'C' },
        { title: 'D', description: 'desc D' },
      ],
    });
    expect(s!.processSteps).toHaveLength(2);
  });

  it('returns cta undefined when cta_title is null', () => {
    const s = mapPublicServiceV1ToService(base);
    expect(s!.cta).toBeUndefined();
  });

  it('maps cta fields from cta_title/description/button_text/button_url', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      cta_title: 'Pronto para contratar?',
      cta_description: 'Solicite uma proposta',
      cta_button_text: 'Falar agora',
      cta_button_url: 'https://wa.me/5511999999999',
    });
    expect(s!.cta).toEqual({
      title: 'Pronto para contratar?',
      description: 'Solicite uma proposta',
      buttonText: 'Falar agora',
      buttonUrl: 'https://wa.me/5511999999999',
    });
  });

  it('parses benefits as comma-separated string fallback', () => {
    const s = mapPublicServiceV1ToService({
      ...base,
      benefits: 'A, B; C',
    });
    expect(s!.benefits).toEqual(['A', 'B', 'C']);
  });
});
