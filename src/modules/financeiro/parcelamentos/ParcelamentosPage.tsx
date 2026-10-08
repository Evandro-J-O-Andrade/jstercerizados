'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/fallback';
import { financialInstallmentRepository } from '@/repositories/financial-installment.repository';
import type { FinancialInstallment } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

const statusLabel: Record<string, string> = {
  open: 'Em aberto',
  paid: 'Pago',
  cancelled: 'Cancelado',
  overdue: 'Vencido',
};

export default function ParcelamentosPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [installments, setInstallments] = useState<FinancialInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data =
        await financialInstallmentRepository.findAll(currentTenantId);
      setInstallments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar parcelamentos',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = installments.filter((item) => {
    const matchesSearch =
      !search ||
      String(item.installment_number).includes(search) ||
      String(item.total_installments).includes(search);
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">
        Carregando parcelamentos...
      </p>
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
            Parcelamentos
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie parcelas de contas a pagar e receber.
          </p>
        </div>
        <Button
          onClick={() =>
            addToast({
              type: 'info',
              message: 'Novo parcelamento - Em desenvolvimento',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo parcelamento
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="text-muted-foreground h-4 w-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número da parcela ou total..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-border bg-background rounded-lg border px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="open">Em aberto</option>
          <option value="paid">Pago</option>
          <option value="overdue">Vencido</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum parcelamento cadastrado"
          description="Os parcelamentos aparecerão aqui quando houver registros."
          actionLabel="Novo parcelamento"
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
                  Nº Parcela / Total
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Conta
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Vencimento
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Valor
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="text-foreground px-4 py-3">
                    <CreditCard className="mr-1 inline h-4 w-4" />
                    Parcela {item.installment_number} /{' '}
                    {item.total_installments}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.account_receivable_id
                      ? 'A receber'
                      : item.account_payable_id
                        ? 'A pagar'
                        : '—'}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {formatDate(item.due_date)}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === 'paid'
                          ? 'bg-success/10 text-success'
                          : item.status === 'overdue'
                            ? 'bg-destructive/10 text-destructive'
                            : item.status === 'cancelled'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {statusLabel[item.status] ?? item.status}
                    </span>
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
