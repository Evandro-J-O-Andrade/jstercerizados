import { useEffect, useState } from 'react';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type { Candidate } from '@/types/domain/candidate';

export function useCandidates(
  tenantId: string | null,
  filters?: { status?: string; search?: string },
) {
  const [items, setItems] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    candidatesRepository
      .findAll(tenantId, filters)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar candidatos',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId, filters?.status, filters?.search]);

  return {
    candidates: items,
    isLoading,
    error,
    refetch: () => candidatesRepository.findAll(tenantId ?? '', filters),
  };
}
