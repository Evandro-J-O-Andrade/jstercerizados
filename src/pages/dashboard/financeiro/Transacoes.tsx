'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import { financialTransactionRepository } from '@/repositories/finance.repository';
import type {
  FinancialTransaction,
  FinancialTransactionCreateInput,
} from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

export default function FinanceiroTransacoesPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FinancialTransactionCreateInput>({
    tenant_id: '',
    cost_center_id: '',
    type: 'debit',
    amount: 0,
    competence_date: '',
    description: '',
  });

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data =
        await financialTransactionRepository.findAll(currentTenantId);
      setItems(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;
    try {
      await financialTransactionRepository.create({
        ...form,
        tenant_id: currentTenantId,
      });
      setShowForm(false);
      setForm({
        tenant_id: currentTenantId,
        cost_center_id: '',
        type: 'debit',
        amount: 0,
        competence_date: '',
        description: '',
      });
      await load();
      addToast({ type: 'success', message: 'Transação criada com sucesso!' });
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao salvar',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !currentTenantId) return;
    try {
      await financialTransactionRepository.remove(deleteId, currentTenantId);
      setDeleteId(null);
      await load();
      addToast({ type: 'success', message: 'Transação excluída com sucesso.' });
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao excluir',
      });
    }
  };

  const filtered = items.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Carregando transações...</p>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Transações financeiras
          </h2>
          <p className="text-muted-foreground text-sm">
            Registro de débitos, créditos e transferências.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova transação
        </Button>
      </div>

      <div className="border-border bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar transação..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma transação cadastrada"
          description="Quando houver transações registradas, elas aparecerão aqui."
          actionLabel="Nova transação"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {item.description}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.competence_date} •{' '}
                    {item.type === 'credit'
                      ? 'Crédito'
                      : item.type === 'debit'
                        ? 'Débito'
                        : 'Transferência'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${item.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {item.type === 'debit' ? '-' : '+'}
                    {item.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                Nova transação
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Fechar
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-foreground text-sm font-medium">
                  Descrição
                </label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Descrição"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-foreground text-sm font-medium">
                    Tipo
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target
                          .value as FinancialTransactionCreateInput['type'],
                      })
                    }
                    className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  >
                    <option value="debit">Débito</option>
                    <option value="credit">Crédito</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>
                <div>
                  <label className="text-foreground text-sm font-medium">
                    Valor
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-foreground text-sm font-medium">
                  Competência
                </label>
                <Input
                  type="date"
                  value={form.competence_date}
                  onChange={(e) =>
                    setForm({ ...form, competence_date: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir transação?"
        message="Essa ação removerá o registro permanentemente."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
