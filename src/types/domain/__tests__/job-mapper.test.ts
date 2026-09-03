import { describe, it, expect } from 'vitest';
import { mapPublicJobV1ToVaga } from '@/types/domain/job-mapper';
import type { PublicJobV1 } from '@/repositories/jobs.repository';

function makeRow(overrides: Partial<PublicJobV1> = {}): PublicJobV1 {
  return {
    job_id: 'job-1',
    title: 'Analista de RH',
    slug: 'analista-de-rh',
    status: 'published',
    description: 'Descrição da vaga',
    responsibilities: 'Responsabilidades',
    requirements: 'Requisitos',
    benefits: 'Vale refeição, Vale transporte, Plano de saúde',
    contract_type: 'clt',
    work_mode: 'onsite',
    location: 'Arujá, SP',
    salary_text: 'R$ 5.000,00',
    salary_min: 5000,
    salary_max: null,
    salary_type: 'mensal',
    company_id: 'co-1',
    company_name: 'J&S Empregos LTDA',
    company_logo_url: null,
    published_at: '2026-08-01T10:00:00Z',
    expires_at: null,
    metadata: {},
    views_count: 0,
    tenant_id: 't-1',
    ...overrides,
  };
}

describe('mapPublicJobV1ToVaga', () => {
  it('returns null when slug is missing', () => {
    const vaga = mapPublicJobV1ToVaga(makeRow({ slug: '' }));
    expect(vaga).toBeNull();
  });

  it('maps basic fields', () => {
    const vaga = mapPublicJobV1ToVaga(makeRow());
    expect(vaga).not.toBeNull();
    expect(vaga!.id).toBe('job-1');
    expect(vaga!.slug).toBe('analista-de-rh');
    expect(vaga!.titulo).toBe('Analista de RH');
    expect(vaga!.empresa).toBe('J&S Empregos LTDA');
    expect(vaga!.cidade).toBe('Arujá');
    expect(vaga!.estado).toBe('SP');
  });

  it('parses location with city and state', () => {
    const vaga = mapPublicJobV1ToVaga(makeRow({ location: 'São Paulo, SP' }));
    expect(vaga!.cidade).toBe('São Paulo');
    expect(vaga!.estado).toBe('SP');
  });

  it('handles single-token location as city only', () => {
    const vaga = mapPublicJobV1ToVaga(makeRow({ location: 'Remoto' }));
    expect(vaga!.cidade).toBe('Remoto');
    expect(vaga!.estado).toBeUndefined();
  });

  it('normalizes contract_type lowercase to enum', () => {
    expect(
      mapPublicJobV1ToVaga(makeRow({ contract_type: 'temporary' }))!
        .tipoContrato,
    ).toBe('TEMPORARIO');
    expect(
      mapPublicJobV1ToVaga(makeRow({ contract_type: 'internship' }))!
        .tipoContrato,
    ).toBe('ESTAGIO');
    expect(
      mapPublicJobV1ToVaga(makeRow({ contract_type: 'CLT' }))!.tipoContrato,
    ).toBe('CLT');
  });

  it('normalizes work_mode lowercase to enum', () => {
    expect(
      mapPublicJobV1ToVaga(makeRow({ work_mode: 'remote' }))!.modalidade,
    ).toBe('REMOTO');
    expect(
      mapPublicJobV1ToVaga(makeRow({ work_mode: 'hybrid' }))!.modalidade,
    ).toBe('HIBRIDO');
    expect(
      mapPublicJobV1ToVaga(makeRow({ work_mode: 'onsite' }))!.modalidade,
    ).toBe('PRESENCIAL');
  });

  it('parses benefits as array of trimmed strings', () => {
    const vaga = mapPublicJobV1ToVaga(
      makeRow({ benefits: 'Vale refeição, Plano de saúde; Gympass' }),
    );
    expect(vaga!.beneficios).toEqual([
      'Vale refeição',
      'Plano de saúde',
      'Gympass',
    ]);
  });

  it('returns empty array for null benefits', () => {
    const vaga = mapPublicJobV1ToVaga(makeRow({ benefits: null }));
    expect(vaga!.beneficios).toEqual([]);
  });

  it('falls back company_name to "J&S Empregos LTDA" when null', () => {
    const vaga = mapPublicJobV1ToVaga(makeRow({ company_name: null }));
    expect(vaga!.empresa).toBe('J&S Empregos LTDA');
  });
});
