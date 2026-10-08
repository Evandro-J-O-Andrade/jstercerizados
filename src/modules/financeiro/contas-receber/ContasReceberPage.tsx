'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import { useToast } from '@/components/feedback/ToastContext';
import { accountsReceivableRepository } from '@/repositories/accounts-receivable.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { AccountReceivable } from '@/types/domain/finance';

const statusLabels: Record<string, string> = {
  open: 'Em aberto',
  received: 'Recebido',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
  partially_received: 'Parcialmente recebido',
};

export default function ContasReceberPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await accountsReceivableRepository.findAll(currentTenantId);
      let filtered = data;

      if (statusFilter !== 'all') {
        filtered = filtered.filter((item) => item.status === statusFilter);
      }

      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.description.toLowerCase().includes(term) ||
            item.payment_reference?.toLowerCase().includes(term) ||
            item.payment_method?.toLowerCase().includes(term),
        );
      }

      setItems(filtered);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar contas a receber',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteId || !currentTenantId) return;
    try {
      await accountsReceivableRepository.remove(deleteId, currentTenantId);
      setItems((prev) => prev.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao excluir conta a receber',
      );
    }
  };

  const stats = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const open = items.filter((item) => item.status === 'open');
    const openTotal = open.reduce((sum, item) => sum + item.amount, 0);
    const overdue = items.filter((item) => item.status === 'overdue');
    const overdueTotal = overdue.reduce((sum, item) => sum + item.amount, 0);
    const received = items.filter((item) => item.status === 'received');
    const receivedTotal = received.reduce((sum, item) => sum + item.amount, 0);

    return {
      total,
      openTotal,
      overdueTotal,
      receivedTotal,
      openCount: open.length,
      overdueCount: overdue.length,
    };
  }, [items]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">
        Carregando contas a receber...
      </p>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Contas a Receber
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie recebimentos, vencimentos e status.
          </p>
        </div>
        <Button
          onClick={() =>
            addToast({
              type: 'info',
              message: 'Abrir formulário de conta a receber',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova conta
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
          <p className="text-muted-foreground text-xs">Total em aberto</p>
          <p className="text-lg font-semibold text-blue-700">
            {formatCurrency(stats.openTotal)}
          </p>
          <p className="text-muted-foreground text-xs">
            {stats.openCount} título(s)
          </p>
        </div>
        <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
          <p className="text-muted-foreground text-xs">Total vencido</p>
          <p className="text-lg font-semibold text-red-700">
            {formatCurrency(stats.overdueTotal)}
          </p>
          <p className="text-muted-foreground text-xs">
            {stats.overdueCount} título(s)
          </p>
        </div>
        <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
          <p className="text-muted-foreground text-xs">Total recebido</p>
          <p className="text-lg font-semibold text-green-700">
            {formatCurrency(stats.receivedTotal)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="text-muted-foreground h-4 w-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição, referência ou forma de pagamento..."
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
          <option value="overdue">Vencido</option>
          <option value="received">Recebido</option>
          <option value="partially_received">Parcialmente recebido</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <Button variant="secondary" onClick={load}>
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            addToast({ type: 'info', message: 'Exportar contas a receber' })
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma conta a receber cadastrada"
          description="Ainda não há contas a receber registradas para este ambiente."
          actionLabel="Nova conta"
          onAction={() =>
            addToast({
              type: 'info',
              message: 'Abrir formulário de conta a receber',
            })
          }
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="divide-border bg-background min-w-full divide-y text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-4 py-2 text-left font-medium">
                  Descrição
                </th>
                <th className="text-muted-foreground px-4 py-2 text-left font-medium">
                  Vencimento
                </th>
                <th className="text-muted-foreground px-4 py-2 text-left font-medium">
                  Valor
                </th>
                <th className="text-muted-foreground px-4 py-2 text-left font-medium">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-2 text-left font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="text-foreground px-4 py-2 font-medium">
                    {item.description}
                  </td>
                  <td className="text-muted-foreground px-4 py-2">
                    {new Date(item.due_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="text-foreground px-4 py-2">
                    {item.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <span className="bg-muted text-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button className="text-muted-foreground hover:bg-muted rounded p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir conta a receber?"
        message="Essa ação removerá o título. Se houver recebimentos relacionados, essa operação pode ser bloqueada."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
