import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { servicesRepository } from '@/repositories/services.repository';
import { cn } from '@/utils';
import { Wrench } from 'lucide-react';
import type { ServiceOrder } from '@/repositories/services.repository';

export default function Servicos() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await servicesRepository.findAll(currentTenantId);
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar serviços',
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
      title="Serviços"
      description="Catálogo e ordens de serviço."
      icon={Wrench}
      breadcrumbItems={[{ label: 'Serviços' }]}
    >
      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando serviços...</p>
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
            Nenhum serviço cadastrado no momento.
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
                    {item.title || `Serviço #${item.id.slice(0, 8)}`}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {item.description || 'Sem descrição'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    item.status === 'in_progress' &&
                      'bg-success/10 text-success',
                    item.status === 'completed' && 'bg-primary/10 text-primary',
                    item.status === 'pending' && 'bg-warning/10 text-warning',
                  )}
                >
                  {item.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ModuleWorkspace>
  );
}
