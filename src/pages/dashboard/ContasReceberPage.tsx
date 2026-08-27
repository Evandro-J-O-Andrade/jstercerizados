'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
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
      <p className="text-sm text-gray-500">Carregando contas a receber...</p>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Contas a Receber
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie recebimentos, vencimentos e status.
          </p>
        </div>
        <Button onClick={() => alert('Abrir formulário de conta a receber')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova conta
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total em aberto</p>
          <p className="text-lg font-semibold text-blue-700">
            {formatCurrency(stats.openTotal)}
          </p>
          <p className="text-xs text-gray-500">{stats.openCount} título(s)</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total vencido</p>
          <p className="text-lg font-semibold text-red-700">
            {formatCurrency(stats.overdueTotal)}
          </p>
          <p className="text-xs text-gray-500">
            {stats.overdueCount} título(s)
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total recebido</p>
          <p className="text-lg font-semibold text-green-700">
            {formatCurrency(stats.receivedTotal)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
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
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
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
          onClick={() => alert('Exportar contas a receber')}
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
          onAction={() => alert('Abrir formulário de conta a receber')}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Descrição
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Vencimento
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Valor
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(item.due_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    {item.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1 text-gray-500 hover:bg-gray-100">
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
