import { useCallback, useEffect, useMemo, useState } from 'react';
import { jobsRepository } from '@/modules/recrutamento/repositories/jobs.repository';
import type { JobListItem, JobStatus, ContractType, WorkMode, Seniority } from '@/modules/recrutamento/types';
import type { Vaga } from '@/types/common';

function mapJobListItemToVaga(job: JobListItem): Vaga {
  const contractTypeMap: Record<ContractType, Vaga['tipo_contrato']> = {
    clt: 'CLT',
    internship: 'ESTAGIO',
    temporary: 'TEMPORARIO',
    freelance: 'FREELA',
    contracted: 'TERCEIRIZADO',
    cd: 'CD',
  };

  const workModeMap: Record<WorkMode, Vaga['modalidade']> = {
    onsite: 'PRESENCIAL',
    hybrid: 'HIBRIDO',
    remote: 'REMOTO',
  };

  const seniorityMap: Record<Seniority, Vaga['nivel']> = {
    internship: 'ESTAGIO',
    junior: 'JUNIOR',
    mid: 'PLENO',
    senior: 'SENIOR',
    master: 'MASTER',
    leadership: 'LIDERANCA',
  };

  const statusMap: Record<JobStatus, Vaga['status']> = {
    draft: 'BORRAR',
    published: 'ATIVA',
    paused: 'BORRAR',
    closed: 'ARQUIVADA',
    filled: 'CONTRATADA',
    cancelled: 'ARQUIVADA',
  };

  return {
    id: job.id,
    slug: job.slug,
    titulo: job.title,
    empresa: job.company_name,
    empresaLogo: job.company_logo_url,
    cidade: job.city ?? undefined,
    estado: job.state ?? undefined,
    tipo_contrato: job.contract_type ? contractTypeMap[job.contract_type] : undefined,
    tipoContrato: job.contract_type ? contractTypeMap[job.contract_type] : undefined,
    nivel: job.seniority ? seniorityMap[job.seniority] : undefined,
    salario_min: job.salary_min ?? undefined,
    salarioMin: job.salary_min ?? undefined,
    salario_max: job.salary_max ?? undefined,
    salarioMax: job.salary_max ?? undefined,
    salario_tipo: job.salary_type === 'range' ? 'mensal' : job.salary_type === 'monthly' ? 'mensal' : 'hora',
    salarioTipo: job.salary_type === 'range' ? 'mensal' : job.salary_type === 'monthly' ? 'mensal' : 'hora',
    salarioTexto:
      job.salary_min && job.salary_max
        ? `${job.salary_min.toLocaleString('pt-BR')} – ${job.salary_max.toLocaleString('pt-BR')}`
        : job.salary_min
        ? `${job.salary_min.toLocaleString('pt-BR')}/mês`
        : 'A combinar',
    modalidade: job.work_mode ? workModeMap[job.work_mode] : undefined,
    beneficios: job.benefits
      ? job.benefits
          .split(',')
          .map((beneficio) => beneficio.trim())
          .filter(Boolean)
      : undefined,
    requisitos: job.requirements ?? undefined,
    descricao: job.description ?? undefined,
    responsibilities: job.responsibilities ?? undefined,
    area: undefined,
    workload: job.work_hours ?? undefined,
    work_schedule: undefined,
    workSchedule: undefined,
    vagas: undefined,
    status: job.status ? statusMap[job.status] : 'BORRAR',
    data_publicacao: job.published_at ?? job.created_at,
    dataPublicacao: job.published_at ?? job.created_at,
    expiresAt: undefined,
    viewsCount: job.views_count,
    created_at: job.created_at,
    updated_at: job.updated_at,
  };
}

export function useJobs(
  tenantId: string | null,
  filters?: { status?: JobStatus; companyId?: string; search?: string },
) {
  const [items, setItems] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    jobsRepository
      .list({
        tenant_id: tenantId,
        status: filters?.status,
        search: filters?.search,
      })
      .then((result) => {
        if (!cancelled && !result.error) setItems(result.data || []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar vagas');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId, filters?.status, filters?.companyId, filters?.search]);

  return {
    jobs: items,
    isLoading,
    error,
    refetch: () => jobsRepository.list({ tenant_id: tenantId ?? '', status: filters?.status, search: filters?.search }),
  };
}

export function usePublicJobs(filters?: {
  status?: JobStatus;
  search?: string;
}) {
  const [items, setItems] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    jobsRepository
      .getPublished('', filters)
      .then((result) => {
        if (!cancelled && !result.error) setItems(result.data || []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar vagas');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters?.status, filters?.search]);

  return {
    jobs: items,
    isLoading,
    error,
    refetch: () => jobsRepository.getPublished('', filters),
  };
}

export function usePublicJob(slug?: string) {
  const [item, setItem] = useState<JobListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    jobsRepository
      .getBySlug('', slug)
      .then((result) => {
        if (!cancelled && !result.error) setItem(result.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar vaga');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return {
    job: item,
    isLoading,
    error,
    refetch: () => slug && jobsRepository.getBySlug('', slug),
  };
}

/**
 * Public hook used by /vagas and Home (Vagas em Destaque).
 * Returns the legacy `Vaga` shape consumed by both pages — same UI, DB-backed.
 * Falls back to MOCK when DB returns nothing so the snapshot stays visible.
 */
export function usePublicJobsAsVagas(opts?: {
  search?: string;
  limit?: number;
}) {
  const [items, setItems] = useState<Vaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'db' | 'mock' | 'none'>('none');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await jobsRepository.getPublished('', {
        search: opts?.search,
        limit: opts?.limit,
      });
      const rows = result.data || [];

      if (rows.length > 0) {
        const mapped = rows.map(mapJobListItemToVaga);
        setItems(mapped);
        setSource('db');
      } else {
        setItems([]);
        setSource('none');
      }
    } catch (err) {
      setItems([]);
      setSource('none');
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas');
    } finally {
      setIsLoading(false);
    }
  }, [opts?.search, opts?.limit]);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({
      jobs: items,
      isLoading,
      error,
      source,
      refetch: load,
    }),
    [items, isLoading, error, source, load],
  );
}

/**
 * Public hook used by /vagas/:slug.
 * Returns the legacy `Vaga` shape, DB-backed with MOCK fallback.
 */
export function usePublicJobBySlugAsVaga(slug?: string) {
  const [item, setItem] = useState<Vaga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) {
      setItem(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const result = await jobsRepository.getBySlug('', slug);
      const row = result.data;

      if (row) {
        setItem(mapJobListItemToVaga(row));
      } else {
        setItem(null);
      }
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : 'Erro ao carregar vaga');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({
      job: item,
      isLoading,
      isNotFound: !isLoading && !error && item === null,
      error,
      refetch: load,
    }),
    [item, isLoading, error, load],
  );
}