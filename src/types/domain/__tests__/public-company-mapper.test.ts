import { describe, it, expect } from 'vitest';
import { mapPublicCompanyByTypeToClientVisual } from '@/types/domain/client-visual';
import type { PublicCompanyByType } from '@/repositories/companies.repository';

function makeRow(
  overrides: Partial<PublicCompanyByType> = {},
): PublicCompanyByType {
  return {
    company_id: 'row-1',
    company_name: 'Acme',
    legal_name: null,
    trading_name: null,
    logo_url: '/images/acme.png',
    description: 'Descrição da Acme',
    website: 'https://acme.example.com',
    industry: null,
    company_size: null,
    company_status: 'active',
    relationship_id: 'rel-1',
    relationship_status: 'active',
    relationship_type: 'client',
    relationship_type_name: 'Cliente',
    relationship_metadata: null,
    relationship_started_at: null,
    ...overrides,
  };
}

describe('mapPublicCompanyByTypeToClientVisual', () => {
  it('maps basic fields from public view row to ClientVisual', () => {
    const visual = mapPublicCompanyByTypeToClientVisual(makeRow());
    expect(visual.id).toBe('row-1');
    expect(visual.name).toBe('Acme');
    expect(visual.logo).toBe('/images/acme.png');
    expect(visual.website).toBe('https://acme.example.com');
    expect(visual.description).toBe('Descrição da Acme');
  });

  it('prefers company.description over relationship metadata', () => {
    const visual = mapPublicCompanyByTypeToClientVisual(
      makeRow({
        description: 'Descrição da tabela',
        relationship_metadata: { description: 'Descrição do metadata' },
      }),
    );
    expect(visual.description).toBe('Descrição da tabela');
  });

  it('falls back to relationship metadata description when company.description is null', () => {
    const visual = mapPublicCompanyByTypeToClientVisual(
      makeRow({
        description: null,
        relationship_metadata: { description: 'Descrição do metadata' },
      }),
    );
    expect(visual.description).toBe('Descrição do metadata');
  });

  it('prefers company.website over relationship metadata', () => {
    const visual = mapPublicCompanyByTypeToClientVisual(
      makeRow({
        website: 'https://tabela.example.com',
        relationship_metadata: { website: 'https://metadata.example.com' },
      }),
    );
    expect(visual.website).toBe('https://tabela.example.com');
  });

  it('uses relationship metadata hero_image_url as image', () => {
    const visual = mapPublicCompanyByTypeToClientVisual(
      makeRow({
        logo_url: '/images/logo.png',
        relationship_metadata: { hero_image_url: '/images/hero.png' },
      }),
    );
    expect(visual.image).toBe('/images/hero.png');
  });

  it('image is null when hero_image_url missing and no fallback configured', () => {
    const visual = mapPublicCompanyByTypeToClientVisual(
      makeRow({ logo_url: '/images/logo.png', relationship_metadata: null }),
    );
    expect(visual.image).toBeNull();
  });

  it('handles null relationship_metadata without throwing', () => {
    const visual = mapPublicCompanyByTypeToClientVisual(
      makeRow({ relationship_metadata: null }),
    );
    expect(visual.image).toBeNull();
    expect(visual.socials).toBeNull();
  });
});
