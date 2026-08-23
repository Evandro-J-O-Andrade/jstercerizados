import { useEffect, useState } from 'react';
import { jobsRepository } from '@/repositories/jobs.repository';
import type { Job, JobStatus } from '@/types/domain/job';

export function useJobs(
  tenantId: string | null,
  filters?: { status?: JobStatus; companyId?: string; search?: string },
) {
  const [items, setItems] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    jobsRepository
      .findAll(tenantId, filters)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar vagas',
          );
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
    refetch: () => jobsRepository.findAll(tenantId ?? '', filters),
  };
}
