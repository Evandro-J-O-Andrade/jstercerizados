import { useEffect, useState } from 'react';
import { serviceCatalogRepository } from '@/repositories/service-catalog.repository';
import type { Service } from '@/types/domain/recruitment';

export function useServices(tenantId: string | null) {
  const [items, setItems] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    serviceCatalogRepository
      .findAll(tenantId)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar serviços',
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
    services: items,
    isLoading,
    error,
    refetch: () => serviceCatalogRepository.findAll(tenantId ?? ''),
  };
}
