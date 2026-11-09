import { describe, expect, it } from 'vitest';
import {
  buildVagaPayload,
  slugify,
  validateVagaForm,
  type VagaFormValues,
} from './vaga-form.utils';

const base: VagaFormValues = {
  title: 'Analista de RH',
  slug: 'analista-rh',
  company_id: 'company-1',
  status: 'draft',
  contract_type: 'clt',
  work_mode: 'onsite',
  seniority: 'junior',
  work_hours: '44h',
  city: 'São Paulo',
  state: 'sp',
  location_detail: '',
  salary_type: 'range',
  salary_min: '3000',
  salary_max: '4500',
  description: 'Desc',
  responsibilities: '',
  requirements: '',
  benefits: '',
};

describe('VagaForm helpers', () => {
  it('slugify normalizes title', () => {
    expect(slugify('Analista de RH Sênior')).toBe('analista-de-rh-senior');
  });

  it('validates required fields', () => {
    expect(validateVagaForm({ ...base, title: '' })).toMatch(/título/i);
    expect(validateVagaForm({ ...base, company_id: '' })).toMatch(/empresa/i);
    expect(validateVagaForm({ ...base, state: 'SPO' })).toMatch(/UF/i);
    expect(
      validateVagaForm({ ...base, salary_min: '5000', salary_max: '1000' }),
    ).toMatch(/mínimo/i);
  });

  it('builds payload with normalized values', () => {
    const payload = buildVagaPayload(base);
    expect(payload.slug).toBe('analista-rh');
    expect(payload.state).toBe('SP');
    expect(payload.salary_min).toBe(3000);
    expect(payload.salary_max).toBe(4500);
    expect(payload.company_relationship_id).toBeNull();
  });
});
