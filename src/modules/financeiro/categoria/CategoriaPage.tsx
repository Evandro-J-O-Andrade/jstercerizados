'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/fallback';
import { useToast } from '@/components/feedback/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { financialCategoryRepository } from '@/repositories/financial-category.repository';
import type {
  FinancialCategory,
  FinancialCategoryCreateInput,
} from '@/types/domain/finance';

type CategoryForm = Omit<FinancialCategoryCreateInput, 'tenant_id'>;

const typeLabels: Record<FinancialCategory['type'], string> = {
  revenue: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
};

export default function CategoriasPage() {
  const { currentTenantId, hasPermission } = useAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CategoryForm>({
    name: '',
    type: 'expense',
    status: 'active',
  });
  const requestIdRef = useRef(0);
  const canCreate = hasPermission('finance.create');

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (!currentTenantId) {
      setCategories([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await financialCategoryRepository.findAll(currentTenantId);
      if (requestId === requestIdRef.current) {
        setCategories(data);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar categorias',
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [currentTenantId]);

  useEffect(() => {
    void load();
    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentTenantId || !canCreate || !form.name.trim()) return;

    const tenantId = currentTenantId;
    const requestId = requestIdRef.current;
    setSaving(true);
    try {
      const created = await financialCategoryRepository.create({
        ...form,
        name: form.name.trim(),
        tenant_id: tenantId,
      });
      if (requestId === requestIdRef.current) {
        setCategories((items) =>
          [...items, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setShowForm(false);
        setForm({ name: '', type: 'expense', status: 'active' });
        addToast({
          type: 'success',
          message: 'Categoria criada com sucesso.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'Erro ao salvar categoria',
      });
    } finally {
      setSaving(false);
    }
  };

  const filtered = categories.filter((category) =>
    category.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  if (!currentTenantId) {
    return (
      <EmptyState
        title="Selecione uma organização"
        description="Escolha um tenant para consultar as categorias financeiras."
      />
    );
  }

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Carregando categorias...</p>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Categorias Financeiras
          </h1>
          <p className="text-muted-foreground text-sm">
            Classifique receitas, despesas e transferências do tenant atual.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm((visible) => !visible)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova categoria
          </Button>
        )}
      </div>

      {showForm && canCreate && (
        <form
          onSubmit={handleSubmit}
          className="border-border bg-card grid gap-4 rounded-xl border p-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end"
        >
          <label className="text-foreground space-y-1 text-sm font-medium">
            Nome
            <input
              autoFocus
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="border-border bg-background w-full rounded-lg border px-3 py-2 font-normal"
              maxLength={120}
            />
          </label>
          <label className="text-foreground space-y-1 text-sm font-medium">
            Tipo
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value as FinancialCategory['type'],
                }))
              }
              className="border-border bg-background w-full rounded-lg border px-3 py-2 font-normal"
            >
              <option value="revenue">Receita</option>
              <option value="expense">Despesa</option>
              <option value="transfer">Transferência</option>
            </select>
          </label>
          <Button type="submit" loading={saving}>
            Salvar
          </Button>
        </form>
      )}

      <div className="border-border bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome..."
          aria-label="Buscar categorias por nome"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            categories.length === 0
              ? 'Nenhuma categoria cadastrada'
              : 'Nenhuma categoria encontrada'
          }
          description={
            categories.length === 0
              ? 'As categorias financeiras cadastradas neste tenant aparecerão aqui.'
              : 'Ajuste a busca para encontrar outras categorias.'
          }
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Nome
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Tipo
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Descrição
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((category) => (
                <tr key={category.id} className="hover:bg-muted">
                  <td className="text-foreground px-4 py-3">{category.name}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {typeLabels[category.type]}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {category.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        category.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {category.status === 'active' ? 'Ativo' : 'Inativo'}
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
