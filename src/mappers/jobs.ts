import type { Database } from '@/types/database';
import type { Vaga } from '@/types/common';

type Job = Database['public']['Tables']['jobs']['Row'];
type Company = Database['public']['Tables']['companies']['Row'];

export function mapJobToVaga(job: Job, company?: Company | null): Vaga {
  return {
    id: job.id,
    slug: job.id,
    titulo: job.title,
    empresa: company?.name ?? job.title,
    cidade: job.location?.split(',')[0]?.trim() ?? undefined,
    estado: job.location?.split(',')[1]?.trim() ?? undefined,
    tipoContrato: (job.employment_type as Vaga['tipoContrato']) ?? undefined,
    tipo_contrato: (job.employment_type as Vaga['tipoContrato']) ?? undefined,
    salarioMin: job.salary ? Number(job.salary) : undefined,
    salario_min: job.salary ? Number(job.salary) : undefined,
    salarioTipo: 'mensal',
    salario_tipo: 'mensal',
    modalidade: 'PRESENCIAL',
    beneficios: job.benefits
      ? job.benefits
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean)
      : [],
    requisitos: job.requirements ?? undefined,
    descricao: job.description ?? undefined,
    responsibilities: job.description ?? undefined,
    area: undefined,
    workload: undefined,
    workSchedule: undefined,
    work_schedule: undefined,
    vagas: 1,
    status:
      job.status === 'draft'
        ? 'BORRAR'
        : job.status === 'published'
          ? 'ATIVA'
          : 'BORRAR',
    data_publicacao: job.published_at ?? job.created_at,
    dataPublicacao: job.published_at ?? job.created_at,
    created_at: job.created_at,
    updated_at: job.updated_at,
  };
}
