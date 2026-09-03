import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  companiesRepository,
  type PublicCompanyByType,
} from '@/repositories/companies.repository';
import { PARTNERS_LOGOS } from '@/mock/partners';
import type { PartnerVisual } from '@/types/domain/partner-visual';
import { mapPublicCompanyByTypeToPartnerVisual } from '@/types/domain/partner-visual';

/**
 * Build a MOCK fallback for the partners vitrine, derived from PARTNERS_LOGOS.
 * Keeps the approved snapshot when the DB is empty / not yet seeded.
 */
function buildPartnerMockFallback(): PublicCompanyByType[] {
  return PARTNERS_LOGOS.map((p, index) => ({
    company_id: `mock-partner-${index}-${p.name}`,
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
    relationship_id: `mock-rel-partner-${index}`,
    relationship_status: 'active',
    relationship_type: 'partner',
    relationship_type_name: 'Parceiro',
    relationship_metadata: {
      ...(p.photo ? { hero_image_url: p.photo } : {}),
      ...(p.link ? { website: p.link } : {}),
    },
    relationship_started_at: null,
    socials: null,
  }));
}

/**
 * Public hook used by /parceiros vitrine.
 * DB-first via `public_companies_by_type` (relationship_type = 'partner'),
 * with MOCK fallback to PARTNERS_LOGOS so the snapshot stays visible while
 * the migration is being applied.
 */
export function usePublicPartnersAsPartnerVisuals() {
  const [items, setItems] = useState<PartnerVisual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'db' | 'mock' | 'none'>('none');

  const fallback = useMemo(
    () => buildPartnerMockFallback().map(mapPublicCompanyByTypeToPartnerVisual),
    [],
  );

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rows =
        await companiesRepository.findPublicByRelationshipType('partner');
      const mapped = rows
        .filter((r) => r.relationship_type === 'partner')
        .map(mapPublicCompanyByTypeToPartnerVisual);

      if (mapped.length > 0) {
        setItems(mapped);
        setSource('db');
      } else {
        console.info('[usePublicPartners] DB vazio — fallback MOCK');
        setItems(fallback);
        setSource('mock');
      }
    } catch (err) {
      console.warn('[usePublicPartners] Erro DB — fallback MOCK', err);
      setItems(fallback);
      setSource('mock');
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar parceiros',
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
      partners: items,
      isLoading,
      error,
      source,
      refetch: load,
    }),
    [items, isLoading, error, source, load],
  );
}
