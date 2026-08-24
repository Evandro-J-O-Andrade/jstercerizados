import { useEffect, useState } from 'react';
import { partnersRepository } from '@/repositories/partners.repository';
import type { Partner } from '@/types/domain/recruitment';

export function usePartners(tenantId: string | null) {
  const [items, setItems] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    partnersRepository
      .findAll(tenantId)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar parceiros',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  return {
    partners: items,
    isLoading,
    error,
    refetch: () => partnersRepository.findAll(tenantId ?? ''),
  };
}
