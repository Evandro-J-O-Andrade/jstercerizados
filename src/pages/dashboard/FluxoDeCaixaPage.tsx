'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  Repeat,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import { cashFlowRepository } from '@/repositories/cash-flow.repository';
import type { CashFlow } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';

export default function FluxoDeCaixaPage() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cashFlowRepository.findAll(currentTenantId);
      let filtered = data;

      if (search) {
        const term = search.toLowerCase();
        filtered = data.filter(
          (item) =>
            item.description?.toLowerCase().includes(term) ||
            item.reference?.toLowerCase().includes(term) ||
            item.category?.toLowerCase().includes(term) ||
            item.subcategory?.toLowerCase().includes(term),
        );
      }

      if (typeFilter !== 'all') {
        filtered = filtered.filter((item) => item.type === typeFilter);
      }

      setItems(filtered);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar fluxo de caixa',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId, search, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = async () => {
    await load();
  };

  const handleDelete = async () => {
    if (!deleteId || !currentTenantId) return;
    try {
      await cashFlowRepository.remove(deleteId, currentTenantId);
      setItems((prev) => prev.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao excluir lançamento',
      );
    }
  };

  const totalIncome = useMemo(
    () =>
      items
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0),
    [items],
  );
  const totalExpense = useMemo(
    () =>
      items
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0),
    [items],
  );
  const balance = useMemo(
    () => totalIncome - totalExpense,
    [totalIncome, totalExpense],
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <p className="text-sm text-gray-500">Carregando fluxo de caixa...</p>
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
            Fluxo de Caixa
          </h1>
          <p className="text-sm text-gray-500">
            Entradas, saídas e transferências.
          </p>
        </div>
        <Button onClick={() => alert('Abrir formulário de lançamento')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo lançamento
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Entradas</p>
          <p className="text-lg font-semibold text-green-700">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Saídas</p>
          <p className="text-lg font-semibold text-red-700">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Saldo</p>
          <p
            className={`text-lg font-semibold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição, categoria ou referência..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos os tipos</option>
          <option value="income">Entradas</option>
          <option value="expense">Saídas</option>
          <option value="transfer">Transferências</option>
        </select>
        <Button variant="secondary" onClick={handleSearch}>
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum lançamento cadastrado"
          description="Ainda não há lançamentos de fluxo de caixa registrados."
          actionLabel="Novo lançamento"
          onAction={() => alert('Abrir formulário de lançamento')}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon =
              item.type === 'income'
                ? ArrowDownCircle
                : item.type === 'expense'
                  ? ArrowUpCircle
                  : Repeat;

            return (
              <motion.div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                layout
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      item.type === 'income'
                        ? 'bg-green-50 text-green-700'
                        : item.type === 'expense'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.description || 'Sem descrição'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.date} • {item.category || '—'}{' '}
                      {item.subcategory ? `• ${item.subcategory}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p
                    className={`text-sm font-semibold ${
                      item.type === 'income'
                        ? 'text-green-700'
                        : item.type === 'expense'
                          ? 'text-red-700'
                          : 'text-blue-700'
                    }`}
                  >
                    {item.type === 'expense'
                      ? '-'
                      : item.type === 'income'
                        ? '+'
                        : '±'}
                    {formatCurrency(item.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(item.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir lançamento?"
        message="Essa ação removerá o lançamento de fluxo de caixa."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
