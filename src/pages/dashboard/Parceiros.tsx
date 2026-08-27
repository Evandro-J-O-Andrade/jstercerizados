import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { partnersRepository } from '@/repositories/partners.repository';
import { cn } from '@/utils';
import { Handshake } from 'lucide-react';
import type { Partner } from '@/types/domain/recruitment';

export default function Parceiros() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await partnersRepository.findAll(currentTenantId);
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar parceiros',
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
      title="Parceiros"
      description="Gerencie parceiros."
      icon={Handshake}
      breadcrumbItems={[{ label: 'Parceiros' }]}
    >
      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando parceiros...</p>
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
            Nenhum parceiro cadastrado no momento.
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
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {item.area || 'Parceiro comercial'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    item.status === 'approved' && 'bg-success/10 text-success',
                    item.status === 'pending' &&
                      'bg-muted text-muted-foreground',
                    item.status === 'rejected' &&
                      'bg-destructive/10 text-destructive',
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

