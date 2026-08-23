import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { financialTransactionsRepository } from '@/repositories/financial-transactions.repository';
import { cn } from '@/utils';
import type { FinancialTransaction } from '@/repositories/financial-transactions.repository';

export default function Financeiro() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<FinancialTransaction[]>([]);
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
          await financialTransactionsRepository.findAll(currentTenantId);
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar financeiro',
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
        <h1 className="text-foreground text-2xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o financeiro da empresa.
        </p>
      </div>

      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando financeiro...</p>
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
            Nenhuma movimentação financeira no momento.
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
                    {item.description || `Movimentação #${item.id.slice(0, 8)}`}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {item.category || 'Sem categoria'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    item.type === 'income' && 'bg-success/10 text-success',
                    item.type === 'expense' &&
                      'bg-destructive/10 text-destructive',
                  )}
                >
                  {item.type}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
