'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import { bankReconciliationRepository } from '@/repositories/finance.repository';
import type {
  BankReconciliation,
  BankReconciliationCreateInput,
} from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';

export default function FinanceiroConciliacaoPage() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<BankReconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BankReconciliationCreateInput>({
    tenant_id: '',
    bank_account: '',
    statement_date: '',
    statement_balance: 0,
    reconciled_balance: 0,
    difference: 0,
    status: 'pending',
  });

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bankReconciliationRepository.findAll(currentTenantId);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar conciliações',
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
      await bankReconciliationRepository.create({
        ...form,
        tenant_id: currentTenantId,
      });
      setShowForm(false);
      setForm({
        tenant_id: currentTenantId,
        bank_account: '',
        statement_date: '',
        statement_balance: 0,
        reconciled_balance: 0,
        difference: 0,
        status: 'pending',
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !currentTenantId) return;
    try {
      await bankReconciliationRepository.remove(deleteId, currentTenantId);
      setDeleteId(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const filtered = items.filter((item) =>
    item.bank_account.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">
        Carregando conciliações...
      </p>
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
            Conciliação bancária
          </h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe reconciliações de extrato.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova conciliação
        </Button>
      </div>

      <div className="border-border bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por conta..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma conciliação cadastrada"
          description="Quando houver conciliações registradas, elas aparecerão aqui."
          actionLabel="Nova conciliação"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {item.bank_account}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.statement_date} • Diferença:{' '}
                    {item.difference.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">
                    {item.status === 'completed'
                      ? 'Concluída'
                      : item.status === 'pending'
                        ? 'Pendente'
                        : 'Divergência'}
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
                Nova conciliação
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
                  Conta bancária
                </label>
                <Input
                  value={form.bank_account}
                  onChange={(e) =>
                    setForm({ ...form, bank_account: e.target.value })
                  }
                  placeholder="Conta bancária"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-foreground text-sm font-medium">
                    Data do extrato
                  </label>
                  <Input
                    type="date"
                    value={form.statement_date}
                    onChange={(e) =>
                      setForm({ ...form, statement_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-foreground text-sm font-medium">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target
                          .value as BankReconciliationCreateInput['status'],
                      })
                    }
                    className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  >
                    <option value="pending">Pendente</option>
                    <option value="completed">Concluída</option>
                    <option value="discrepancy">Divergência</option>
                  </select>
                </div>
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
        title="Excluir conciliação?"
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
