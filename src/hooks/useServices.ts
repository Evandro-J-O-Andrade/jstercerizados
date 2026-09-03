import { useCallback, useEffect, useMemo, useState } from 'react';
import { servicesRepository } from '@/repositories/services.repository';
import { mockServices, mockGetServiceBySlug } from '@/services/mock/services';
import { mapPublicServiceV1ToService } from '@/types/domain/service-mapper';
import type { Service } from '@/types/common';

/**
 * Public hook used by /servicos.
 * Returns the legacy `Service[]` shape consumed by the page — same UI, DB-backed.
 * Falls back to MOCK when DB returns nothing so the snapshot stays visible.
 */
export function usePublicServices() {
  const [items, setItems] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'db' | 'mock' | 'none'>('none');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rows = await servicesRepository.findPublicServices();
      const mapped = rows
        .map(mapPublicServiceV1ToService)
        .filter((s): s is Service => s !== null);

      if (mapped.length > 0) {
        setItems(mapped);
        setSource('db');
      } else {
        console.info('[usePublicServices] DB vazio — fallback MOCK');
        setItems([]);
        setSource('mock');
      }
    } catch (err) {
      console.warn('[usePublicServices] Erro DB — fallback MOCK', err);
      setItems([]);
      setSource('mock');
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar serviços',
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
      services: items,
      isLoading,
      error,
      source,
      refetch: load,
    }),
    [items, isLoading, error, source, load],
  );
}

/**
 * Public hook used by /servicos/:slug.
 * Returns the legacy `Service` shape, DB-backed with MOCK fallback.
 */
export function usePublicServiceBySlug(slug?: string) {
  const [item, setItem] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) {
      setItem(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const row = await servicesRepository.findPublicServiceBySlug(slug);
      const mapped = row ? mapPublicServiceV1ToService(row) : null;

      if (mapped) {
        setItem(mapped);
        return;
      }

      const mockMatch = mockGetServiceBySlug(slug) ?? null;
      if (mockMatch && mockMatch.category !== 'candidato') {
        console.info(
          '[usePublicServiceBySlug] DB sem match — usando fallback MOCK',
        );
        setItem(mockMatch);
      } else {
        setItem(null);
      }
    } catch (err) {
      console.warn(
        '[usePublicServiceBySlug] Erro DB — usando fallback MOCK',
        err,
      );
      const mockMatch =
        mockServices.find(
          (s) => s.slug === slug && s.category !== 'candidato',
        ) ?? null;
      setItem(mockMatch);
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviço');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({
      service: item,
      isLoading,
      isNotFound: !isLoading && !error && item === null,
      error,
      refetch: load,
    }),
    [item, isLoading, error, load],
  );
}
