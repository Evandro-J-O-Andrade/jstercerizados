import { describe, it, expect } from 'vitest';
import {
  buildBreadcrumbSchema,
  buildWebSiteSchema,
  buildJobPostingSchema,
  getOrganizationSchema,
} from '@/utils/schema';
import type { BreadcrumbItem } from '@/types/seo';

const SITE_URL = 'https://jsempregos.com.br';

describe('buildBreadcrumbSchema', () => {
  it('creates valid BreadcrumbList with correct positions', () => {
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

  it('uses absolute URLs', () => {
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    const schema = buildBreadcrumbSchema(items);
    expect(schema.itemListElement[0].item).toContain(SITE_URL);
  });

  it('handles empty list', () => {
    const schema = buildBreadcrumbSchema([]);
    expect(schema.itemListElement).toHaveLength(0);
  });
});

describe('buildWebSiteSchema', () => {
  it('creates valid WebSite schema', () => {
    const schema = buildWebSiteSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBeTruthy();
    expect(schema.url).toBe(SITE_URL);
    expect(schema.inLanguage).toBe('pt-BR');
    expect(schema.publisher).toEqual({
      '@type': 'Organization',
      name: schema.name,
    });
  });

  it('does NOT include SearchAction (no real search URL)', () => {
    const schema = buildWebSiteSchema();
    expect(schema).not.toHaveProperty('potentiallyAction');
    expect(schema).not.toHaveProperty('target');
  });
});

describe('buildJobPostingSchema', () => {
  const baseParams = {
    title: 'Analista de RH',
    description: 'Vaga para analista de RH',
    slug: 'analista-rh',
    hiringOrgName: 'J&S Empregos LTDA',
  };

  it('creates valid JobPosting schema with required fields', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('JobPosting');
    expect(schema.title).toBe('Analista de RH');
    expect(schema.description).toBe('Vaga para analista de RH');
    expect(schema.hiringOrganization).toEqual({
      '@type': 'Organization',
      name: 'J&S Empregos LTDA',
      url: SITE_URL,
      logo: undefined,
    });
    expect(schema.url).toBe(`${SITE_URL}/vagas/analista-rh`);
  });

  it('omits salary when not provided', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema).not.toHaveProperty('baseSalary');
  });

  it('includes salary only when salaryMin is provided', () => {
    const schema = buildJobPostingSchema({
      ...baseParams,
      salaryMin: 5000,
      salaryMax: 7000,
      salaryUnit: 'MONTH',
    });
    expect(schema.baseSalary).toEqual({
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: 5000,
      valueMax: 7000,
      unit: 'MONTH',
    });
  });

  it('omits location when not provided', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema).not.toHaveProperty('jobLocation');
  });

  it('includes location when city/state provided', () => {
    const schema = buildJobPostingSchema({
      ...baseParams,
      city: 'São Paulo',
      state: 'SP',
    });
    expect(schema.jobLocation).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    });
  });

  it('omits benefits when not provided', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema).not.toHaveProperty('jobBenefits');
  });

  it('includes benefits when provided', () => {
    const schema = buildJobPostingSchema({
      ...baseParams,
      benefits: ['Vale Transporte', 'Convênio Médico'],
    });
    expect(schema.jobBenefits).toEqual(['Vale Transporte', 'Convênio Médico']);
  });

  it('includes datePosted when provided', () => {
    const schema = buildJobPostingSchema({
      ...baseParams,
      datePosted: '2026-08-01',
    });
    expect(schema.datePosted).toBe('2026-08-01');
  });

  it('omits datePosted when not provided', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema).not.toHaveProperty('datePosted');
  });

  it('includes validThrough when provided', () => {
    const schema = buildJobPostingSchema({
      ...baseParams,
      validThrough: '2026-09-01',
    });
    expect(schema.validThrough).toBe('2026-09-01');
  });

  it('omits validThrough when not provided', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema).not.toHaveProperty('validThrough');
  });

  it('omits requirements when not provided', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema).not.toHaveProperty('requirements');
  });

  it('includes requirements when provided', () => {
    const schema = buildJobPostingSchema({
      ...baseParams,
      requirements: 'Experiência mínima de 2 anos',
    });
    expect(schema.requirements).toBe('Experiência mínima de 2 anos');
  });

  it('does NOT invent salary when not provided', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema.baseSalary).toBeUndefined();
  });

  it('does NOT invent location when not provided', () => {
    const schema = buildJobPostingSchema(baseParams);
    expect(schema.jobLocation).toBeUndefined();
  });
});

describe('getOrganizationSchema', () => {
  it('creates valid Organization schema', () => {
    const schema = getOrganizationSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toEqual([
      'Organization',
      'LocalBusiness',
      'EmploymentAgency',
    ]);
    expect(schema.name).toBe('J&S Empregos LTDA');
    expect(schema.url).toBe(SITE_URL);
    expect(schema.logo).toContain(SITE_URL);
    expect(schema.contactPoint).toHaveLength(2);
    expect(schema.contactPoint[0]).toEqual({
      '@type': 'ContactPoint',
      telephone: '+555511968380592',
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    });
  });

  it('includes sameAs with social links', () => {
    const schema = getOrganizationSchema();
    expect(schema.sameAs).toHaveLength(5);
    expect(schema.sameAs).toContain(
      'https://www.instagram.com/jstercerizados/',
    );
    expect(schema.sameAs).toContain('https://facebook.com/jsempregos');
    expect(schema.sameAs).toContain('https://linkedin.com/company/jsempregos');
    expect(schema.sameAs).toContain('https://youtube.com/@jsempregos');
    expect(schema.sameAs).toContain('https://tiktok.com/@jsempregos');
  });
});
