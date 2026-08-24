import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { companiesRepository } from '@/repositories/companies.repository';
import { cn } from '@/utils';
import type { Company } from '@/types/domain/company';

export default function Empresas() {
  const { currentTenantId } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await companiesRepository.findAll(currentTenantId);
        if (!cancelled) {
          setCompanies(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar empresas',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentTenantId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold">Empresas</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as empresas cadastradas na plataforma.
        </p>
      </div>

      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando empresas...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!isLoading && !error && companies.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhuma empresa cadastrada no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && companies.length > 0 && (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {company.legal_name}
                  </h3>
                  {company.trading_name && (
                    <p className="text-muted-foreground mt-1">
                      {company.trading_name}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.cnpj && (
                      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                        CNPJ: {company.cnpj}
                      </span>
                    )}
                    {company.website && (
                      <span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-medium">
                        {company.website}
                      </span>
                    )}
                    {company.industry && (
                      <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                        {company.industry}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    company.status === 'active' && 'bg-success/10 text-success',
                    company.status === 'inactive' &&
                      'bg-warning/10 text-warning',
                    company.status === 'suspended' &&
                      'bg-destructive/10 text-destructive',
                    company.status === 'pending' &&
                      'bg-muted text-muted-foreground',
                  )}
                >
                  {company.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
