import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  companiesRepository,
  type RelationshipType,
  type PublicCompanyByType,
} from '@/repositories/companies.repository';
import { CLIENTS_LIST } from '@/mock/clients';
import type { Company } from '@/types/domain/company';
import { useAsync } from '@/hooks/useAsync';

const MOCK_FALLBACK: Company[] = CLIENTS_LIST.map((client) => ({
  id: client.id,
  tenant_id: '00000000-0000-0000-0000-000000000000',
  name: client.name,
  legal_name: null,
  document: null,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  trading_name: null,
  cnpj: null,
  cnpj_root: null,
  state_registration: null,
  municipal_registration: null,
  company_type_id: null,
  industry: null,
  phone: null,
  email: null,
  website: client.website ?? null,
  linkedin_url: null,
  logo_url: client.logo ?? null,
  address: null,
  size: null,
  metadata: {},
  created_by: null,
  description: client.description ?? null,
  short_description: null,
  company_segment: null,
  socials: null,
}));

function buildClientFallback(): PublicCompanyByType[] {
  return CLIENTS_LIST.map((client, index) => ({
    company_id: `mock-${client.id}-${index}`,
    company_name: client.name,
    legal_name: null,
    trading_name: null,
    logo_url: client.logo ?? null,
    image_url: client.image ?? null,
    description: client.description ?? null,
    website: client.website ?? null,
    industry: null,
    company_size: null,
    company_status: 'active',
    relationship_id: `mock-rel-${client.id}`,
    relationship_status: 'active',
    relationship_type: 'client',
    relationship_type_name: 'Cliente',
    relationship_metadata: {
      ...(client.description ? { description: client.description } : {}),
      ...(client.website ? { website: client.website } : {}),
      ...(client.image ? { hero_image_url: client.image } : {}),
    },
    relationship_started_at: null,
    socials: null,
  }));
}

export function useCompaniesPublic() {
  const [items, setItems] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'db' | 'mock' | 'none'>('none');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await companiesRepository.findAllPublic();

      if (data.length > 0) {
        setItems(data);
        setSource('db');
      } else {
        console.info('[useCompaniesPublic] DB vazio — usando fallback MOCK');
        setItems(MOCK_FALLBACK);
        setSource('mock');
      }
    } catch (err) {
      console.warn(
        '[useCompaniesPublic] Erro ao carregar DB — usando fallback MOCK',
        err,
      );
      setItems(MOCK_FALLBACK);
      setSource('mock');
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar empresas',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    companies: items,
    isLoading,
    error,
    source,
    refetch: load,
  };
}

export function useCompanyPublic(slug: string | undefined) {
  const fetcher = useCallback(async (currentSlug: string) => {
    const result = await companiesRepository.findBySlug(currentSlug);
    if (result) return result;

    const toSlug = (name: string) =>
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const mockMatch = MOCK_FALLBACK.find(
      (c) => toSlug(c.name) === currentSlug || c.id === currentSlug,
    );

    if (mockMatch) {
      console.info('[useCompanyPublic] DB não retornou — usando fallback MOCK');
      return mockMatch;
    }

    return null;
  }, []);

  const asyncState = useAsync<Company | null>(
    async (currentSlug: unknown) => {
      if (typeof currentSlug !== 'string' || !currentSlug) return null;
      return fetcher(currentSlug);
    },
    { timeoutMs: 8000, warningMs: 2500, retries: 0 },
  );

  useEffect(() => {
    if (slug) {
      void asyncState.run(slug);
    } else {
      asyncState.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return useMemo(
    () => ({
      company: asyncState.data,
      isLoading: asyncState.isLoading,
      isTimeout: asyncState.isTimeout,
      isError: asyncState.isError,
      isNotFound: asyncState.isSuccess && asyncState.data === null,
      error: asyncState.error,
      refetch: () => slug && asyncState.run(slug),
    }),
    [asyncState, slug],
  );
}

/**
 * Fetch companies by commercial relationship type (customer / partner / supplier)
 * using the public read-only view `public_companies_by_type`.
 *
 * UI baseline: returns the curated MOCK list (CLIENTS_LIST / PARTNERS_LOGOS)
 * when the DB has no public rows yet, preserving the snapshot approved by the
 * client. Source is exposed so the page can render a small attribution badge
 * if desired in the future (kept internal for now to avoid UI changes).
 */
export function useCompaniesByType(type: RelationshipType) {
  const fallback = useMemo(() => buildClientFallback(), []);
  const [items, setItems] = useState<PublicCompanyByType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'db' | 'mock' | 'none'>('none');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await companiesRepository.findPublicByRelationshipType(type);

      if (data.length > 0) {
        setItems(data);
        setSource('db');
      } else {
        console.info(
          `[useCompaniesByType:${type}] DB vazio — usando fallback MOCK`,
        );
        setItems(fallback);
        setSource('mock');
      }
    } catch (err) {
      console.warn(
        `[useCompaniesByType:${type}] Erro ao carregar DB — fallback MOCK`,
        err,
      );
      setItems(fallback);
      setSource('mock');
      setError(
        err instanceof Error
          ? err.message
          : `Erro ao carregar ${type === 'client' ? 'clientes' : type === 'partner' ? 'parceiros' : 'fornecedores'}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [type, fallback]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    companies: items,
    isLoading,
    error,
    source,
    refetch: load,
  };
}
