import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { supportTicketsRepository } from '@/repositories/support-tickets.repository';
import { cn } from '@/utils';
import type { SupportTicket } from '@/repositories/support-tickets.repository';

export default function Suporte() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await supportTicketsRepository.findAll(currentTenantId);
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar suporte',
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
        <h1 className="text-foreground text-2xl font-bold">Suporte</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe os tickets de suporte.
        </p>
      </div>

      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando tickets...</p>
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
            Nenhum ticket de suporte no momento.
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
                    {item.title || `Ticket #${item.id.slice(0, 8)}`}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {item.description || 'Sem descrição'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    item.status === 'open' && 'bg-warning/10 text-warning',
                    item.status === 'in_progress' &&
                      'bg-primary/10 text-primary',
                    item.status === 'resolved' && 'bg-success/10 text-success',
                    item.status === 'closed' &&
                      'bg-muted text-muted-foreground',
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
