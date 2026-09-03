import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  companiesRepository,
  type PublicCompanyByType,
} from '@/repositories/companies.repository';
import { PARTNERS_LOGOS } from '@/mock/partners';
import type { SupplierVisual } from '@/types/domain/supplier-visual';
import { mapPublicCompanyByTypeToSupplierVisual } from '@/types/domain/supplier-visual';

/**
 * Build a MOCK fallback for the suppliers vitrine.
 * Reaproveita PARTNERS_LOGOS para manter algum conteúdo institucional visível
 * enquanto a migration do Bloco 1 ainda não foi aplicada no Supabase remoto.
 * Quando o banco tiver fornecedores reais, a fonte DB sobrescreve isto.
 */
function buildSupplierMockFallback(): PublicCompanyByType[] {
  return PARTNERS_LOGOS.slice(0, 4).map((p, index) => ({
    company_id: `mock-supplier-${index}-${p.name}`,
    company_name: p.name,
    legal_name: null,
    trading_name: null,
    logo_url: p.logo ?? null,
    image_url: p.photo ?? null,
    description: null,
    website: p.link ?? null,
    industry: null,
    company_size: null,
    company_status: 'active',
    relationship_id: `mock-rel-supplier-${index}`,
    relationship_status: 'active',
    relationship_type: 'supplier',
    relationship_type_name: 'Fornecedor',
    relationship_metadata: {
      ...(p.photo ? { hero_image_url: p.photo } : {}),
      ...(p.link ? { website: p.link } : {}),
    },
    relationship_started_at: null,
    socials: null,
  }));
}

/**
 * Public hook used by /fornecedores vitrine.
 * DB-first via `public_companies_by_type` (relationship_type = 'supplier'),
 * with MOCK fallback so the page is never empty while migration is pending.
 */
export function usePublicSuppliersAsSupplierVisuals() {
  const [items, setItems] = useState<SupplierVisual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'db' | 'mock' | 'none'>('none');

  const fallback = useMemo(
    () =>
      buildSupplierMockFallback().map(mapPublicCompanyByTypeToSupplierVisual),
    [],
  );

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rows =
        await companiesRepository.findPublicByRelationshipType('supplier');
      const mapped = rows
        .filter((r) => r.relationship_type === 'supplier')
        .map(mapPublicCompanyByTypeToSupplierVisual);

      if (mapped.length > 0) {
        setItems(mapped);
        setSource('db');
      } else {
        console.info('[usePublicSuppliers] DB vazio — fallback MOCK');
        setItems(fallback);
        setSource('mock');
      }
    } catch (err) {
      console.warn('[usePublicSuppliers] Erro DB — fallback MOCK', err);
      setItems(fallback);
      setSource('mock');
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar fornecedores',
      );
    } finally {
      setIsLoading(false);
    }
  }, [fallback]);

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
