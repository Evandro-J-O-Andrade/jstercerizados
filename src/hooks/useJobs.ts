import { useState, useEffect, useCallback } from 'react';
import { jobsRepository } from '@/repositories/jobs.repository';
import type { Database } from '@/types/database';

type Job = Database['public']['Tables']['jobs']['Row'];

export function useJobs(tenantId: string | null) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadJobs = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await jobsRepository.findAll(tenantId);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load jobs'));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const createJob = async (
    job: Database['public']['Tables']['jobs']['Insert'],
  ) => {
    if (!tenantId) throw new Error('Tenant not selected');
    const newJob = await jobsRepository.create(tenantId, job);
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const updateJob = async (
    id: string,
    job: Database['public']['Tables']['jobs']['Update'],
  ) => {
    const updated = await jobsRepository.update(id, job);
    setJobs((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const deleteJob = async (id: string) => {
    await jobsRepository.delete(id);
    setJobs((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    jobs: jobs as Job[],
    isLoading,
    error: error as Error | null,
    createJob,
    updateJob,
    deleteJob,
    refresh: loadJobs,
  };
}
