import { useState, useEffect, useCallback } from 'react';
import { companiesRepository } from '@/repositories/companies.repository';
import type { Database } from '@/types/database';

type Company = Database['public']['Tables']['companies']['Row'];

export function useCompanies(tenantId: string | null) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadCompanies = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await companiesRepository.findAll(tenantId);
      setCompanies(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load companies'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const createCompany = async (
    company: Database['public']['Tables']['companies']['Insert'],
  ) => {
    if (!tenantId) throw new Error('Tenant not selected');
    const newCompany = await companiesRepository.create(tenantId, company);
    setCompanies((prev) => [newCompany, ...prev]);
    return newCompany;
  };

  const updateCompany = async (
    id: string,
    company: Database['public']['Tables']['companies']['Update'],
  ) => {
    const updated = await companiesRepository.update(id, company);
    setCompanies((prev) =>
      prev.map((item) => (item.id === id ? updated : item)),
    );
    return updated;
  };

  const deleteCompany = async (id: string) => {
    await companiesRepository.delete(id);
    setCompanies((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    companies: companies as Company[],
    isLoading,
    error: error as Error | null,
    createCompany,
    updateCompany,
    deleteCompany,
    refresh: loadCompanies,
  };
}
