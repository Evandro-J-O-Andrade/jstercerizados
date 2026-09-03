import { describe, it, expect } from 'vitest';
import { mapCompanyToClientVisual } from '@/types/domain/client-visual';
import type { Company } from '@/types/domain/company';

function makeCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: 'company-1',
    tenant_id: '00000000-0000-0000-0000-000000000000',
    name: 'Acme',
    legal_name: null,
    document: null,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    trading_name: null,
    cnpj: null,
    cnpj_root: null,
    state_registration: null,
    municipal_registration: null,
    company_type_id: null,
    industry: null,
    phone: null,
    email: null,
    website: 'https://acme.example.com',
    linkedin_url: null,
    logo_url: '/images/acme.png',
    address: null,
    size: null,
    metadata: {},
    created_by: null,
    description: 'Descrição da Acme',
    short_description: null,
    company_segment: null,
    socials: null,
    ...overrides,
  };
}

describe('mapCompanyToClientVisual', () => {
  it('maps basic fields from Company to ClientVisual', () => {
    const result = mapCompanyToClientVisual(makeCompany());
    expect(result.id).toBe('company-1');
    expect(result.name).toBe('Acme');
    expect(result.logo).toBe('/images/acme.png');
    expect(result.image).toBeNull();
    expect(result.website).toBe('https://acme.example.com');
    expect(result.description).toBe('Descrição da Acme');
    expect(result.socials).toBeNull();
  });

  it('prefers description over short_description', () => {
    const result = mapCompanyToClientVisual(
      makeCompany({ short_description: 'Curta', description: 'Longa' }),
    );
    expect(result.description).toBe('Longa');
  });

  it('falls back to short_description when description is null', () => {
    const result = mapCompanyToClientVisual(
      makeCompany({ description: null, short_description: 'Curta' }),
    );
    expect(result.description).toBe('Curta');
  });

  it('reads hero_image_url from metadata', () => {
    const result = mapCompanyToClientVisual(
      makeCompany({
        metadata: { hero_image_url: '/images/hero-acme.webp' },
      }),
    );
    expect(result.image).toBe('/images/hero-acme.webp');
  });

  it('ignores metadata.hero_image_url when it is not a string', () => {
    const result = mapCompanyToClientVisual(
      makeCompany({
        metadata: { hero_image_url: 123 as unknown as string },
      }),
    );
    expect(result.image).toBeNull();
  });

  it('handles missing metadata gracefully', () => {
    const result = mapCompanyToClientVisual(
      makeCompany({
        metadata: undefined as unknown as Record<string, unknown>,
      }),
    );
    expect(result.image).toBeNull();
  });

  it('extracts only linkedin and instagram from socials', () => {
    const result = mapCompanyToClientVisual(
      makeCompany({
        socials: {
          linkedin: 'https://linkedin.com/acme',
          instagram: 'https://instagram.com/acme',
          twitter: 'https://twitter.com/acme',
          facebook: 'https://facebook.com/acme',
        },
      }),
    );
    expect(result.socials).toEqual({
      linkedin: 'https://linkedin.com/acme',
      instagram: 'https://instagram.com/acme',
    });
  });

  it('returns null socials when Company has no socials', () => {
    const result = mapCompanyToClientVisual(makeCompany({ socials: null }));
    expect(result.socials).toBeNull();
  });
});
