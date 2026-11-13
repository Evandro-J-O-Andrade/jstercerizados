import { describe, it, expect } from 'vitest';
import { COMPANY } from '@/config';
import {
  buildBreadcrumbSchema,
  buildWebSiteSchema,
  buildJobPostingSchema,
  getOrganizationSchema,
} from '@/utils/schema';
import type { BreadcrumbItem } from '@/types/seo';

const SITE_URL = 'https://jsempregos.com.br';

describe('buildBreadcrumbSchema', () => {
  it('creates valid BreadcrumbList with correct positions and absolute URLs', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Vagas', href: '/vagas' },
      { label: 'Analista RH', href: '/vagas/analista-rh' },
    ];
    const schema = buildBreadcrumbSchema(items);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    });
    expect(schema.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Vagas',
      item: `${SITE_URL}/vagas`,
    });
    expect(schema.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Analista RH',
      item: `${SITE_URL}/vagas/analista-rh`,
    });
  });

  it('handles empty list', () => {
    const schema = buildBreadcrumbSchema([]);
    expect(schema.itemListElement).toHaveLength(0);
  });
});

describe('buildWebSiteSchema', () => {
  it('creates valid WebSite schema with canonical URL and no invented search action', () => {
    const schema = buildWebSiteSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe(COMPANY.brand || 'J&S Empregos');
    expect(schema.url).toBe(`${SITE_URL}/`);
    expect(schema.inLanguage).toBe('pt-BR');
    expect(schema.alternateName).toEqual(['J&S Empregos', 'JS Empregos', 'JSEmpregos']);
    expect(schema.publisher).toEqual({
      '@type': 'Organization',
      name: COMPANY.name,
    });
    expect(schema).not.toHaveProperty('potentialSearchAction');
    expect(schema).not.toHaveProperty('potentiallyAction');
    expect(schema).not.toHaveProperty('target');
  });
});

describe('buildJobPostingSchema', () => {
  const validParams = {
    title: 'Analista de RH',
    description: 'Vaga para analista de RH',
    slug: 'analista-rh',
    datePosted: '2026-08-01',
  };

  it('returns null when required fields are missing (datePosted/title/description)', () => {
    expect(buildJobPostingSchema({ title: 'A', description: 'D', slug: 'a' })).toBeNull();
    expect(buildJobPostingSchema({ title: 'A', description: '', slug: 'a', datePosted: '2026-08-01' })).toBeNull();
    expect(buildJobPostingSchema({ title: '', description: 'D', slug: 'a', datePosted: '2026-08-01' })).toBeNull();
  });

  it('creates valid JobPosting schema with required fields and canonical URL', () => {
    const schema = buildJobPostingSchema(validParams);

    expect(schema).not.toBeNull();
    expect(schema!['@context']).toBe('https://schema.org');
    expect(schema!['@type']).toBe('JobPosting');
    expect(schema!.title).toBe('Analista de RH');
    expect(schema!.description).toBe('Vaga para analista de RH');
    expect(schema!.datePosted).toBe('2026-08-01');
    expect(schema!.url).toBe(`${SITE_URL}/vagas/analista-rh`);
  });

  it('marks hiring organization as confidential when no real authorized employer is provided', () => {
    const schema = buildJobPostingSchema(validParams);

    expect(schema).not.toBeNull();
    expect(schema!.hiringOrganization).toEqual({
      '@type': 'Organization',
      name: 'Confidencial',
    });
  });

  it('uses provided authorized employer and URL when informed', () => {
    const schema = buildJobPostingSchema({
      ...validParams,
      hiringOrgName: 'Empresa Cliente LTDA',
      hiringOrgUrl: 'https://cliente.exemplo.com/',
      hiringOrgLogo: 'https://cliente.exemplo.com/logo.png',
    });

    expect(schema).not.toBeNull();
    expect(schema!.hiringOrganization).toEqual({
      '@type': 'Organization',
      name: 'Empresa Cliente LTDA',
      url: 'https://cliente.exemplo.com/',
      logo: 'https://cliente.exemplo.com/logo.png',
    });
  });

  it('omits salary/location/benefits/requirements when not provided', () => {
    const schema = buildJobPostingSchema(validParams);

    expect(schema).not.toBeNull();
    expect(schema).not.toHaveProperty('baseSalary');
    expect(schema).not.toHaveProperty('jobLocation');
    expect(schema).not.toHaveProperty('jobLocationType');
    expect(schema).not.toHaveProperty('jobBenefits');
    expect(schema).not.toHaveProperty('qualifications');
  });

  it('includes salary only when salaryMin is provided', () => {
    const schema = buildJobPostingSchema({
      ...validParams,
      salaryMin: 5000,
      salaryMax: 7000,
      salaryUnit: 'MONTH',
    });

    expect(schema).not.toBeNull();
    expect(schema!.baseSalary).toEqual({
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: 5000,
      valueMax: 7000,
      unit: 'MONTH',
    });
  });

  it('includes location as Place with PostalAddress when city/state provided', () => {
    const schema = buildJobPostingSchema({
      ...validParams,
      city: 'São Paulo',
      state: 'SP',
    });

    expect(schema).not.toBeNull();
    expect(schema!.jobLocation).toEqual({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'São Paulo',
        addressRegion: 'SP',
        addressCountry: 'BR',
      },
    });
  });

  it('sets TELECOMMUTE when work location type indicates remote work', () => {
    const schema = buildJobPostingSchema({
      ...validParams,
      workLocationType: 'TELECOMMUTE',
    });

    expect(schema).not.toBeNull();
    expect(schema!.jobLocationType).toBe('TELECOMMUTE');
  });

  it('includes benefits, qualifications and validThrough only when provided', () => {
    const schema = buildJobPostingSchema({
      ...validParams,
      benefits: ['Vale Transporte', 'Convênio Médico'],
      requirements: 'Experiência mínima de 2 anos',
      validThrough: '2026-09-01',
    });

    expect(schema).not.toBeNull();
    expect(schema!.jobBenefits).toEqual(['Vale Transporte', 'Convênio Médico']);
    expect(schema!.qualifications).toBe('Experiência mínima de 2 anos');
    expect(schema!.validThrough).toBe('2026-09-01');
  });

  it('does not invent optional fields', () => {
    const schema = buildJobPostingSchema(validParams);

    expect(schema).not.toBeNull();
    expect(schema!.baseSalary).toBeUndefined();
    expect(schema!.jobLocation).toBeUndefined();
    expect(schema!.validThrough).toBeUndefined();
  });
});

describe('getOrganizationSchema', () => {
  it('creates valid Organization schema with consistent canonical identity', () => {
    const schema = getOrganizationSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toEqual([
      'Organization',
      'LocalBusiness',
      'EmploymentAgency',
    ]);
    expect(schema.name).toBe(COMPANY.name);
    expect(schema.url).toBe(`${SITE_URL}/`);
    expect(String(schema.logo)).toContain(SITE_URL);
    expect(schema.alternateName).toEqual(['J&S Empregos', 'JS Empregos', 'JSEmpregos']);
    expect(Array.isArray(schema.contactPoint)).toBe(true);
    expect(schema.contactPoint).toHaveLength(2);
  });

  it('does not include invented social profiles when none are confirmed', () => {
    const schema = getOrganizationSchema();
    expect(schema).not.toHaveProperty('sameAs');
  });
});
