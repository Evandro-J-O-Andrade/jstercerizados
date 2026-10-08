'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/fallback';
import { financialTransactionRepository } from '@/repositories/financial-transaction.repository';
import { costCenterRepository } from '@/repositories/cost-center.repository';
import { financialCategoryRepository } from '@/repositories/financial-category.repository';
import type { FinancialTransaction } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

const typeLabel: Record<string, string> = {
  debit: 'Débito',
  credit: 'Crédito',
  transfer: 'Transferência',
};

export default function TransacoesPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [costCenters, setCostCenters] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const [txData, ccData, catData] = await Promise.all([
        financialTransactionRepository.findAll(currentTenantId),
        costCenterRepository.findAll(currentTenantId),
        financialCategoryRepository.findAll(currentTenantId),
      ]);
      setTransactions(txData);
      setCostCenters(Object.fromEntries(ccData.map((cc) => [cc.id, cc.name])));
      setCategories(
        Object.fromEntries(catData.map((cat) => [cat.id, cat.name])),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar transações',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch =
        !search ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Carregando transações...</p>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Transações Financeiras
          </h1>
          <p className="text-muted-foreground text-sm">
            Movimentações contábeis vinculadas a centros de custo e categorias.
          </p>
        </div>
        <Button
          onClick={() =>
            addToast({
              type: 'info',
              message: 'Nova transação - Em desenvolvimento',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova transação
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="text-muted-foreground h-4 w-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border-border bg-background rounded-lg border px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos os tipos</option>
          <option value="debit">Débito</option>
          <option value="credit">Crédito</option>
          <option value="transfer">Transferência</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma transação cadastrada"
          description="As transações financeiras aparecerão aqui quando houver registros."
          actionLabel="Nova transação"
          onAction={() =>
            addToast({ type: 'info', message: 'Em desenvolvimento' })
          }
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Data competência
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Descrição
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Centro de custo
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Categoria
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  <ArrowUpDown className="inline h-4 w-4" /> Tipo
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="text-muted-foreground px-4 py-3">
                    {formatDate(item.competence_date)}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {item.description}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {costCenters[item.cost_center_id] ?? item.cost_center_id}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.category_id
                      ? (categories[item.category_id] ?? item.category_id)
                      : '—'}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 capitalize">
                    {typeLabel[item.type] ?? item.type}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {item.type === 'credit' ? (
                      <span className="text-success">
                        {formatCurrency(item.amount)}
                      </span>
                    ) : item.type === 'debit' ? (
                      <span className="text-destructive">
                        -{formatCurrency(item.amount)}
                      </span>
                    ) : (
                      <span className="text-primary">
                        {formatCurrency(item.amount)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
