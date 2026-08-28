'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import { financialCategoryRepository } from '@/repositories/finance.repository';
import type {
  FinancialCategory,
  FinancialCategoryCreateInput,
} from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';

export default function FinanceiroCategoriasPage() {
  const { currentTenantId } = useAuth();
  const [items, setItems] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FinancialCategoryCreateInput>({
    tenant_id: '',
    name: '',
    type: 'expense',
    status: 'active',
  });

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await financialCategoryRepository.findAll(currentTenantId);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar categorias',
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
      await financialCategoryRepository.create({
        ...form,
        tenant_id: currentTenantId,
      });
      setShowForm(false);
      setForm({
        tenant_id: currentTenantId,
        name: '',
        type: 'expense',
        status: 'active',
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !currentTenantId) return;
    try {
      await financialCategoryRepository.remove(deleteId, currentTenantId);
      setDeleteId(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Carregando categorias...</p>
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
            Categorias financeiras
          </h2>
          <p className="text-muted-foreground text-sm">
            Classifique receitas, despesas e transferências.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="border-border bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoria..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          description="Quando houver categorias registradas, elas aparecerão aqui."
          actionLabel="Nova categoria"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.type === 'revenue'
                      ? 'Receita'
                      : item.type === 'expense'
                        ? 'Despesa'
                        : 'Transferência'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(item.id)}
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
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
                Nova categoria
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
                  Nome
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome da categoria"
                  required
                />
              </div>
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
                        .value as FinancialCategoryCreateInput['type'],
                    })
                  }
                  className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm outline-none"
                >
                  <option value="revenue">Receita</option>
                  <option value="expense">Despesa</option>
                  <option value="transfer">Transferência</option>
                </select>
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
        title="Excluir categoria?"
        message="Essa ação removerá a categoria permanentemente."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
