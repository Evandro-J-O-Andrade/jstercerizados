import type { Vaga } from '@/types/common';
import type { PublicJobV1 } from '@/repositories/jobs.repository';

/**
 * Convert a row from the public view `public_jobs_v1` into the legacy
 * `Vaga` shape consumed by /vagas and /vagas/:slug pages.
 *
 * This preserves the exact UI approved by the client — only the data source
 * changes from MOCK to DB. Mapping rules (Bloco 2 + Bloco 5A + Bloco 9):
 *   - name / title
 *   - description
 *   - responsibilities / requirements / benefits
 *   - location split (city, state) — pre-computed by view (Bloco 9)
 *   - contract_type normalized
 *   - work_mode normalized
 *   - company_name -> empresa
 *   - company_logo_url -> empresaLogo
 *   - published_at -> data_publicacao (ISO) / dataPublicacao (legible)
 *   - expires_at -> expiresAt (ISO)
 *   - salary_text -> salaryText (legible)
 *   - salary_min / salary_max / salary_type
 *   - seniority -> nivel (Bloco 9: read from view column)
 *   - work_hours -> workload (Bloco 9: from view column)
 *   - work_schedule -> workSchedule (Bloco 9: from view column via metadata)
 *   - area -> area (Bloco 9: from view column via metadata)
 *   - vagas = 1 (single-job default; DB will gain a count column in future)
 */
export function mapPublicJobV1ToVaga(row: PublicJobV1): Vaga | null {
  if (!row.slug) return null;

  // Prefer pre-computed city/state from the view (Bloco 9); fall back to split.
  const split = splitLocation(row.location);
  const city = row.city || split.city;
  const state = row.state || split.state;
  const contractType = normalizeContractType(row.contract_type);
  const modality = normalizeWorkMode(row.work_mode);
  const nivel = row.seniority
    ? normalizeNivel(row.seniority)
    : inferNivelFromWorkload(row.metadata);
  const publishedAt = row.published_at ?? new Date().toISOString();

  return {
    id: row.job_id,
    slug: row.slug,
    titulo: row.title,
    empresa: row.company_name ?? 'J&S Empregos LTDA',
    empresaLogo: row.company_logo_url ?? undefined,
    cidade: city || undefined,
    estado: state || undefined,
    tipoContrato: contractType,
    nivel,
    salarioMin: row.salary_min ?? undefined,
    salarioMax: row.salary_max ?? undefined,
    salarioTipo: mapSalaryType(row.salary_type),
    salarioTexto: row.salary_text ?? undefined,
    modalidade: modality,
    beneficios: parseBenefitList(row.benefits),
    requisitos: row.requirements ?? undefined,
    descricao: row.description ?? undefined,
    responsibilities: row.responsibilities ?? undefined,
    area: row.area ?? undefined,
    workload: row.work_hours ?? undefined,
    workSchedule: row.work_schedule ?? undefined,
    data_publicacao: publishedAt,
    dataPublicacao: formatPublicDate(publishedAt),
    expiresAt: row.expires_at ?? undefined,
    vagas: 1,
    status: 'ATIVA',
  };
}

function splitLocation(location: string | null): {
  city: string | null;
  state: string | null;
} {
  if (!location) return { city: null, state: null };

  // The view stores location as "<city>, <state>" optionally followed by
  // " • <work_mode>" (e.g. "Arujá, SP • Presencial"). The modalidade suffix
  // is exposed separately as work_mode, so strip it before splitting.
  const cleaned = location.split('•')[0]?.trim() ?? location;
  const parts = cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return { city: null, state: null };
  if (parts.length === 1) return { city: parts[0], state: null };
  return { city: parts[0], state: parts[parts.length - 1] };
}

function normalizeContractType(value: string | null): Vaga['tipoContrato'] {
  switch ((value ?? '').toLowerCase()) {
    case 'clt':
      return 'CLT';
    case 'temporary':
    case 'temporario':
      return 'TEMPORARIO';
    case 'internship':
    case 'estagio':
      return 'ESTAGIO';
    case 'freelance':
    case 'freela':
      return 'FREELA';
    case 'cd':
      return 'CD';
    default:
      return 'CLT';
  }
}

function normalizeWorkMode(value: string | null): Vaga['modalidade'] {
  switch ((value ?? '').toLowerCase()) {
    case 'remote':
    case 'remoto':
      return 'REMOTO';
    case 'hybrid':
    case 'hibrido':
      return 'HIBRIDO';
    case 'onsite':
    case 'presencial':
    default:
      return 'PRESENCIAL';
  }
}

function normalizeNivel(value: string | null | undefined): Vaga['nivel'] {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (
    lower === 'estagio' ||
    lower === 'junior' ||
    lower === 'pleno' ||
    lower === 'senior' ||
    lower === 'master' ||
    lower === 'lideranca'
  ) {
    return lower.toUpperCase() as Vaga['nivel'];
  }
  return undefined;
}

function mapSalaryType(value: string | null): Vaga['salarioTipo'] | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower === 'hourly' || lower === 'hora' || lower === 'hour') {
    return 'hora';
  }
  if (lower === 'monthly' || lower === 'mensal' || lower === 'month') {
    return 'mensal';
  }
  return undefined;
}

function inferNivelFromWorkload(
  metadata: Record<string, unknown>,
): Vaga['nivel'] {
  if (
    metadata &&
    typeof metadata === 'object' &&
    'nivel' in metadata &&
    typeof (metadata as Record<string, unknown>).nivel === 'string'
  ) {
    const value = (metadata as Record<string, string>).nivel.toLowerCase();
    if (
      value === 'estagio' ||
      value === 'junior' ||
      value === 'pleno' ||
      value === 'senior' ||
      value === 'master' ||
      value === 'lideranca'
    ) {
      return value.toUpperCase() as Vaga['nivel'];
    }
  }
  return 'PLENO';
}

function parseBenefitList(benefits: string | null): string[] {
  if (!benefits) return [];
  return benefits
    .split(/[,;\n•]/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}

function formatPublicDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
