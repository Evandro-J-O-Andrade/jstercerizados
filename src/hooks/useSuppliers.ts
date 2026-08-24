import { useEffect, useState } from 'react';
import { suppliersRepository } from '@/repositories/suppliers.repository';
import type { Supplier } from '@/types/domain/recruitment';

export function useSuppliers(tenantId: string | null) {
  const [items, setItems] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    suppliersRepository
      .findAll(tenantId)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar fornecedores',
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
    suppliers: items,
    isLoading,
    error,
    refetch: () => suppliersRepository.findAll(tenantId ?? ''),
  };
}
