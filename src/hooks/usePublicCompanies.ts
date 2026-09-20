import { useCallback, useEffect, useMemo, useState } from 'react';
import { companiesRepository } from '@/repositories/companies.repository';
import type { PublicCompanyByType } from '@/repositories/companies.repository';

export interface ClientVisual {
  id: string;
  name: string;
  logo: string | null;
  image: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  relationshipType: string;
  relationshipTypeName: string;
  socials: Record<string, string> | null;
}

function mapToClientVisual(row: PublicCompanyByType): ClientVisual {
  const meta = row.relationship_metadata ?? {};
  return {
    id: row.company_id,
    name: row.company_name,
    logo: row.logo_url ?? null,
    image: (meta.hero_image_url as string | undefined) ?? row.image_url ?? null,
    website:
      (meta.website as string | undefined) ?? row.website ?? null,
    description:
      (meta.description as string | undefined) ?? row.description ?? null,
    industry: row.industry,
    companySize: row.company_size,
    relationshipType: row.relationship_type,
    relationshipTypeName: row.relationship_type_name,
    socials: (row.socials as Record<string, string> | null) ?? null,
  };
}

export function usePublicClients() {
  const [items, setItems] = useState<ClientVisual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const rows = await companiesRepository.findPublicByRelationshipType(
        'client',
      );
      setItems(rows.map(mapToClientVisual));
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({ clients: items, isLoading, error, refetch: load }),
    [items, isLoading, error, load],
  );
}