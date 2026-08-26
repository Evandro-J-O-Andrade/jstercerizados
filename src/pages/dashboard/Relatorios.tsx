import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { reportsRepository } from '@/repositories/reports.repository';
import { BarChart3 } from 'lucide-react';
import type { ReportDefinition } from '@/repositories/reports.repository';

export default function Relatorios() {
  const { currentTenantId } = useAuth();
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await reportsRepository.findAll(currentTenantId);
        if (!cancelled) {
          setReports(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar relatórios',
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
      title="Relatórios"
      description="Relatórios e análises."
      icon={BarChart3}
      breadcrumbItems={[{ label: 'Relatórios' }]}
    >
      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!isLoading && !error && reports.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhum relatório disponível no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="p-6">
              <h3 className="text-foreground text-lg font-semibold">
                {report.name}
              </h3>
              <p className="text-muted-foreground mt-1">
                {report.description || 'Sem descrição'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </ModuleWorkspace>
  );
}
