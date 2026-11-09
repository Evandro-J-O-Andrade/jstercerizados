import { useCallback, useEffect, useMemo, useState } from 'react';
import { companiesRepository } from '@/repositories/companies.repository';
import type { SupplierVisual } from '@/types/domain/supplier-visual';
import { mapPublicCompanyByTypeToSupplierVisual } from '@/types/domain/supplier-visual';

/**
 * Hook público da vitrine /fornecedores.
 * Fonte real: companiesRepository.findPublicByRelationshipType('supplier').
 * Sem fallback fictício: lista vazia/erro resultam em estado explícito (sem dados simulados).
 */
export function usePublicSuppliersAsSupplierVisuals() {
  const [items, setItems] = useState<SupplierVisual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'db' | 'none'>('none');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rows =
        await companiesRepository.findPublicByRelationshipType('supplier');
      const mapped = rows
        .filter((r) => r.relationship_type === 'supplier')
        .map(mapPublicCompanyByTypeToSupplierVisual);

      setItems(mapped);
      setSource(mapped.length > 0 ? 'db' : 'none');
    } catch (err) {
      console.error('[usePublicSuppliers] Falha ao carregar fornecedores', err);
      setItems([]);
      setSource('none');
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar fornecedores',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({
      suppliers: items,
      isLoading,
      error,
      source,
      refetch: load,
    }),
    [items, isLoading, error, source, load],
  );
}
