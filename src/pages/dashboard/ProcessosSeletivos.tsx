import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { recruitmentProcessesRepository } from '@/repositories/recruitment-processes.repository';
import { cn } from '@/utils';
import type { RecruitmentProcess } from '@/repositories/recruitment-processes.repository';

export default function ProcessosSeletivos() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<RecruitmentProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data =
          await recruitmentProcessesRepository.findAll(currentTenantId);
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar processos seletivos',
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
        <h1 className="text-foreground text-2xl font-bold">
          Processos Seletivos
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe os processos seletivos em andamento.
        </p>
      </div>

      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando processos...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhum processo seletivo cadastrado no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {item.title || `Processo #${item.id.slice(0, 8)}`}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {item.description || 'Sem descrição'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    item.status === 'open' && 'bg-success/10 text-success',
                    item.status === 'closed' && 'bg-warning/10 text-warning',
                    item.status === 'draft' && 'bg-muted text-muted-foreground',
                  )}
                >
                  {item.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
