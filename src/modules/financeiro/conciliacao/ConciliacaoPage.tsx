'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import { bankReconciliationRepository } from '@/repositories/bank-reconciliation.repository';
import type { BankReconciliation } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

const statusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'divergent':
      return 'danger';
    default:
      return 'default';
  }
};

export default function ConciliacaoPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>(
    [],
  );
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadReconciliations = useCallback(async () => {
    if (!currentTenantId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await bankReconciliationRepository.findAll(currentTenantId);
      setReconciliations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar conciliacoes',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    loadReconciliations();
  }, [loadReconciliations]);

  const handleDelete = async () => {
    if (!deleteId || !currentTenantId) return;
    try {
      await bankReconciliationRepository.remove(deleteId, currentTenantId);
      setDeleteId(null);
      await loadReconciliations();
      addToast({
        type: 'success',
        message: 'Conciliacao excluida com sucesso.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao excluir',
      });
    }
  };
  const filtered = reconciliations.filter((r) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return r.bank_account?.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground text-sm">
            Carregando conciliacoes...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          title="Erro ao carregar conciliacoes"
          description={error}
          actionLabel="Tentar novamente"
          onAction={loadReconciliations}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Conciliacao Bancaria
          </h1>
          <p className="text-muted-foreground text-sm">
            Concilie extratos bancarios com lancamentos do sistema.
          </p>
        </div>
        <Button
          onClick={() =>
            addToast({ type: 'info', message: 'Em desenvolvimento' })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova conciliacao
        </Button>
      </div>

      <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Busque por conta bancaria..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma conciliacao registrada"
          description="As conciliacoes bancarias aparecerao aqui quando existentes."
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Conta bancaria
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Data do extrato
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Saldo do extrato
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Saldo conciliado
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Diferenca
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="text-foreground px-4 py-3">
                    {item.bank_account}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.statement_date}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {item.statement_balance}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {item.reconciled_balance}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {item.difference}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusVariant(item.status) === 'success'
                          ? 'bg-success/10 text-success'
                          : statusVariant(item.status) === 'warning'
                            ? 'bg-warning/10 text-warning'
                            : statusVariant(item.status) === 'danger'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir conciliacao?"
        message="Essa acao removera a conciliacao permanentemente."
        confirmLabel="Excluir"
        cancelLabel=" Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
