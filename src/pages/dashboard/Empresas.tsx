import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { companiesRepository } from '@/repositories/companies.repository';
import { cn } from '@/utils';
import { Building2 } from 'lucide-react';
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
    <ModuleWorkspace
      title="Empresas"
      description="Cadastro e relacionamento de empresas."
      icon={Building2}
      breadcrumbItems={[{ label: 'Empresas' }]}
    >
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
                    {company.legal_name || company.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.document && (
                      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                        Documento: {company.document}
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
    </ModuleWorkspace>
  );
}
