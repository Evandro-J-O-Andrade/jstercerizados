import { useState, useEffect, useCallback } from 'react';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type { Database } from '@/types/database';

type Candidate = Database['public']['Tables']['candidates']['Row'];

export function useCandidates(tenantId: string | null) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadCandidates = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await candidatesRepository.findAll(tenantId);
      setCandidates(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load candidates'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const createCandidate = async (
    candidate: Database['public']['Tables']['candidates']['Insert'],
  ) => {
    if (!tenantId) throw new Error('Tenant not selected');
    const newCandidate = await candidatesRepository.create(tenantId, candidate);
    setCandidates((prev) => [newCandidate, ...prev]);
    return newCandidate;
  };

  const updateCandidate = async (
    id: string,
    candidate: Database['public']['Tables']['candidates']['Update'],
  ) => {
    const updated = await candidatesRepository.update(id, candidate);
    setCandidates((prev) =>
      prev.map((item) => (item.id === id ? updated : item)),
    );
    return updated;
  };

  const deleteCandidate = async (id: string) => {
    await candidatesRepository.delete(id);
    setCandidates((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    candidates: candidates as Candidate[],
    isLoading,
    error: error as Error | null,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    refresh: loadCandidates,
  };
}
