import { useEffect, useState } from 'react';
import { companiesRepository } from '@/repositories/companies.repository';
import type { Company } from '@/types/domain/company';

export function useCompanies(
  tenantId: string | null,
  filters?: { status?: string; search?: string },
) {
  const [items, setItems] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    companiesRepository
      .findAll(tenantId, filters)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar empresas',
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
    companies: items,
    isLoading,
    error,
    refetch: () => companiesRepository.findAll(tenantId ?? '', filters),
  };
}
