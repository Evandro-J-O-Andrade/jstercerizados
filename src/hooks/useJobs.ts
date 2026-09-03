import { useCallback, useEffect, useMemo, useState } from 'react';
import { jobsRepository } from '@/repositories/jobs.repository';
import { mockGetVagas } from '@/services/mock/vagas';
import { mapPublicJobV1ToVaga } from '@/types/domain/job-mapper';
import type { Job, JobStatus } from '@/types/domain/job';
import type { Vaga } from '@/types/common';

export function useJobs(
  tenantId: string | null,
  filters?: { status?: JobStatus; companyId?: string; search?: string },
) {
  const [items, setItems] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    jobsRepository
      .findAll(tenantId, filters)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar vagas',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId, filters?.status, filters?.companyId, filters?.search]);

  return {
    jobs: items,
    isLoading,
    error,
    refetch: () => jobsRepository.findAll(tenantId ?? '', filters),
  };
}

export function usePublicJobs(filters?: {
  status?: JobStatus;
  search?: string;
}) {
  const [items, setItems] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    jobsRepository
      .findPublished(filters)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar vagas',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters?.status, filters?.search]);

  return {
    jobs: items,
    isLoading,
    error,
    refetch: () => jobsRepository.findPublished(filters),
  };
}

export function usePublicJob(slug?: string) {
  const [item, setItem] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    jobsRepository
      .findPublishedBySlug(slug)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar vaga',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return {
    job: item,
    isLoading,
    error,
    refetch: () => slug && jobsRepository.findPublishedBySlug(slug),
  };
}

/**
 * Public hook used by /vagas and Home (Vagas em Destaque).
 * Returns the legacy `Vaga` shape consumed by both pages — same UI, DB-backed.
 * Falls back to MOCK when DB returns nothing so the snapshot stays visible.
 */
export function usePublicJobsAsVagas(opts?: {
  search?: string;
  limit?: number;
}) {
  const [items, setItems] = useState<Vaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'db' | 'mock' | 'none'>('none');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rows = await jobsRepository.findPublicJobs(opts);
      const mapped = rows
        .map(mapPublicJobV1ToVaga)
        .filter((v): v is Vaga => v !== null);

      if (mapped.length > 0) {
        setItems(mapped);
        setSource('db');
      } else {
        console.info('[usePublicJobsAsVagas] DB vazio — fallback MOCK');
        setItems([]);
        setSource('mock');
      }
    } catch (err) {
      console.warn('[usePublicJobsAsVagas] Erro DB — fallback MOCK', err);
      setItems([]);
      setSource('mock');
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts?.search, opts?.limit]);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({
      jobs: items,
      isLoading,
      error,
      source,
      refetch: load,
    }),
    [items, isLoading, error, source, load],
  );
}

/**
 * Public hook used by /vagas/:slug.
 * Returns the legacy `Vaga` shape, DB-backed with MOCK fallback.
 */
export function usePublicJobBySlugAsVaga(slug?: string) {
  const [item, setItem] = useState<Vaga | null>(null);
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

      const row = await jobsRepository.findPublicJobBySlug(slug);
      const mapped = row ? mapPublicJobV1ToVaga(row) : null;

      if (mapped) {
        setItem(mapped);
        return;
      }

      const mockMatch = mockGetVagas().find((v) => v.slug === slug) ?? null;
      if (mockMatch) {
        console.info(
          '[usePublicJobBySlugAsVaga] DB sem match — usando fallback MOCK',
        );
        setItem(mockMatch);
      } else {
        setItem(null);
      }
    } catch (err) {
      console.warn(
        '[usePublicJobBySlugAsVaga] Erro DB — usando fallback MOCK',
        err,
      );
      const mockMatch = mockGetVagas().find((v) => v.slug === slug) ?? null;
      setItem(mockMatch);
      setError(err instanceof Error ? err.message : 'Erro ao carregar vaga');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () => ({
      job: item,
      isLoading,
      isNotFound: !isLoading && !error && item === null,
      error,
      refetch: load,
    }),
    [item, isLoading, error, load],
  );
}
