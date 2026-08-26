import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { stockMovementsRepository } from '@/repositories/stock-movements.repository';
import { cn } from '@/utils';
import { Package } from 'lucide-react';
import type { StockMovement } from '@/repositories/stock-movements.repository';

export default function Estoque() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await stockMovementsRepository.findAll(currentTenantId);
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar estoque',
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
      title="Estoque"
      description="Produtos e movimentações."
      icon={Package}
      breadcrumbItems={[{ label: 'Estoque' }]}
    >
      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando estoque...</p>
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
            Nenhum item em estoque no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">{`Movimentação #${item.id.slice(0, 8)}`}</h3>
                  <p className="text-muted-foreground mt-1">
                    Produto: {item.product_id}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    item.movement_type === 'in' && 'bg-success/10 text-success',
                    item.movement_type === 'out' &&
                      'bg-destructive/10 text-destructive',
                    item.movement_type === 'adjustment' &&
                      'bg-warning/10 text-warning',
                  )}
                >
                  {item.movement_type}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ModuleWorkspace>
  );
}
