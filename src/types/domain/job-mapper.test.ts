import { describe, it, expect } from 'vitest';
import { mapPublicJobV1ToVaga } from './job-mapper';
import type { PublicJobV1 } from '@/repositories/jobs.repository';

const base: PublicJobV1 = {
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
  salary_text: null,
  salary_min: 1950,
  salary_max: null,
  salary_type: 'monthly',
  company_id: 'comp-1',
  company_name: 'Abarca Móveis',
  company_logo_url: 'https://example.com/logo.png',
  published_at: '2026-08-25T19:01:09.525239+00:00',
  expires_at: '2026-12-31T00:00:00+00:00',
  metadata: { nivel: 'JUNIOR' },
  views_count: 0,
  tenant_id: 'tenant-1',
};

describe('mapPublicJobV1ToVaga (Bloco 5A enrichment)', () => {
  it('maps every public contract field to the legacy Vaga shape', () => {
    const vaga = mapPublicJobV1ToVaga(base);
    expect(vaga).not.toBeNull();
    expect(vaga!.titulo).toBe('Auxiliar de Produção');
    expect(vaga!.empresa).toBe('Abarca Móveis');
    expect(vaga!.empresaLogo).toBe('https://example.com/logo.png');
    expect(vaga!.cidade).toBe('Arujá');
    expect(vaga!.estado).toBe('SP');
    expect(vaga!.tipoContrato).toBe('CLT');
    expect(vaga!.modalidade).toBe('PRESENCIAL');
    expect(vaga!.salarioMin).toBe(1950);
    expect(vaga!.salarioTexto).toBeUndefined();
    expect(vaga!.expiresAt).toBe('2026-12-31T00:00:00+00:00');
    expect(vaga!.dataPublicacao).toBe('25/08/2026');
    expect(vaga!.vagas).toBe(1);
  });

  it('infers nivel from metadata.nivel (JUNIOR)', () => {
    const vaga = mapPublicJobV1ToVaga(base);
    expect(vaga!.nivel).toBe('JUNIOR');
  });

  it('falls back to PLENO when metadata.nivel is missing', () => {
    const vaga = mapPublicJobV1ToVaga({ ...base, metadata: {} });
    expect(vaga!.nivel).toBe('PLENO');
  });

  it('parses benefits as array using comma/line separators', () => {
    const vaga = mapPublicJobV1ToVaga({
      ...base,
      benefits: 'Vale refeição,\nVale transporte;Plano de saúde',
    });
    expect(vaga!.beneficios).toEqual([
      'Vale refeição',
      'Vale transporte',
      'Plano de saúde',
    ]);
  });

  it('falls back to empresa "J&S Empregos LTDA" when company_name is null', () => {
    const vaga = mapPublicJobV1ToVaga({
      ...base,
      company_name: null,
      company_logo_url: null,
    });
    expect(vaga!.empresa).toBe('J&S Empregos LTDA');
    expect(vaga!.empresaLogo).toBeUndefined();
  });

  it('uses salarioTexto when salarioMin is null', () => {
    const vaga = mapPublicJobV1ToVaga({
      ...base,
      salary_min: null,
      salary_max: null,
      salary_text: 'A combinar',
    });
    expect(vaga!.salarioMin).toBeUndefined();
    expect(vaga!.salarioTexto).toBe('A combinar');
  });

  it('returns null when slug is missing', () => {
    expect(mapPublicJobV1ToVaga({ ...base, slug: '' })).toBeNull();
  });

  it('normalizes work_mode "REMOTE" -> "REMOTO"', () => {
    const vaga = mapPublicJobV1ToVaga({ ...base, work_mode: 'remote' });
    expect(vaga!.modalidade).toBe('REMOTO');
  });

  it('normalizes work_mode "hybrid" -> "HIBRIDO"', () => {
    const vaga = mapPublicJobV1ToVaga({ ...base, work_mode: 'hybrid' });
    expect(vaga!.modalidade).toBe('HIBRIDO');
  });

  it('normalizes contract_type "temporario" -> "TEMPORARIO"', () => {
    const vaga = mapPublicJobV1ToVaga({
      ...base,
      contract_type: 'temporario',
    });
    expect(vaga!.tipoContrato).toBe('TEMPORARIO');
  });

  it('maps salary_type "hourly" -> "hora"', () => {
    const vaga = mapPublicJobV1ToVaga({ ...base, salary_type: 'hourly' });
    expect(vaga!.salarioTipo).toBe('hora');
  });

  it('formats dataPublicacao in pt-BR for an ISO timestamp', () => {
    const vaga = mapPublicJobV1ToVaga(base);
    expect(vaga!.dataPublicacao).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('leaves empresaLogo undefined when company_logo_url is null', () => {
    const vaga = mapPublicJobV1ToVaga({ ...base, company_logo_url: null });
    expect(vaga!.empresaLogo).toBeUndefined();
  });

  it('sets data_publicacao to a valid ISO when published_at is null', () => {
    const vaga = mapPublicJobV1ToVaga({ ...base, published_at: null });
    expect(() => new Date(vaga!.data_publicacao).toISOString()).not.toThrow();
  });
});
