/**
 * Helpers puros do formulário de Vaga (validação, normalização, payload).
 * Separados do componente para compatibilidade com react-refresh.
 */
import type { Job, JobStatus } from '@/modules/recrutamento/types';

export type VagaFormValues = {
  title: string;
  slug: string;
  company_id: string;
  status: JobStatus;
  contract_type: string;
  work_mode: string;
  seniority: string;
  work_hours: string;
  city: string;
  state: string;
  location_detail: string;
  salary_type: 'range' | 'monthly' | 'negotiate';
  salary_min: string;
  salary_max: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
};

export function emptyVagaForm(): VagaFormValues {
  return {
    title: '',
    slug: '',
    company_id: '',
    status: 'draft',
    contract_type: 'clt',
    work_mode: 'onsite',
    seniority: 'junior',
    work_hours: '44h',
    city: '',
    state: '',
    location_detail: '',
    salary_type: 'negotiate',
    salary_min: '',
    salary_max: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
  };
}

export function vagaToForm(job: Job): VagaFormValues {
  return {
    title: job.title ?? '',
    slug: job.slug ?? '',
    company_id: job.company_id ?? '',
    status: job.status,
    contract_type: job.contract_type ?? 'clt',
    work_mode: job.work_mode ?? 'onsite',
    seniority: job.seniority ?? '',
    work_hours: job.work_hours ?? '',
    city: job.city ?? '',
    state: job.state ?? '',
    location_detail: job.location_detail ?? '',
    salary_type: job.salary_type ?? 'negotiate',
    salary_min: job.salary_min != null ? String(job.salary_min) : '',
    salary_max: job.salary_max != null ? String(job.salary_max) : '',
    description: job.description ?? '',
    responsibilities: job.responsibilities ?? '',
    requirements: job.requirements ?? '',
    benefits: job.benefits ?? '',
  };
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNullableNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

export function validateVagaForm(values: VagaFormValues): string | null {
  if (!values.title.trim()) return 'Informe o título da vaga.';
  if (!values.slug.trim()) return 'Informe o slug da vaga.';
  if (!values.company_id.trim()) return 'Selecione a empresa vinculada à vaga.';
  const min = toNullableNumber(values.salary_min);
  const max = toNullableNumber(values.salary_max);
  if (min != null && max != null && min > max) {
    return 'O salário mínimo não pode ser maior que o salário máximo.';
  }
  if (values.state.trim() && values.state.trim().length !== 2) {
    return 'UF deve ter 2 caracteres.';
  }
  return null;
}

export function buildVagaPayload(values: VagaFormValues) {
  const min = toNullableNumber(values.salary_min);
  const max = toNullableNumber(values.salary_max);
  return {
    title: values.title.trim(),
    slug: slugify(values.slug.trim() || values.title),
    company_id: values.company_id.trim(),
    company_relationship_id: null,
    status: values.status,
    contract_type: values.contract_type as Job['contract_type'],
    work_mode: values.work_mode as Job['work_mode'],
    seniority: (values.seniority || undefined) as Job['seniority'],
    work_hours: values.work_hours.trim() || undefined,
    city: values.city.trim() || undefined,
    state: values.state.trim().toUpperCase() || undefined,
    location_detail: values.location_detail.trim() || undefined,
    salary_type: values.salary_type,
    salary_min: min,
    salary_max: max,
    description: values.description.trim() || undefined,
    responsibilities: values.responsibilities.trim() || undefined,
    requirements: values.requirements.trim() || undefined,
    benefits: values.benefits.trim() || undefined,
    metadata: {},
  };
}
