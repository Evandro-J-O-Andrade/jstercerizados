'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import { invoiceRepository } from '@/repositories/finance.repository';
import type { Invoice, InvoiceCreateInput } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

export default function FinanceiroNotasFiscaisPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceCreateInput>({
    tenant_id: '',
    number: '',
    issue_date: '',
    due_date: '',
    amount: 0,
    status: 'draft',
  });

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceRepository.findAll(currentTenantId);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar notas fiscais',
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
      await invoiceRepository.create({ ...form, tenant_id: currentTenantId });
      setShowForm(false);
      setForm({
        tenant_id: currentTenantId,
        number: '',
        issue_date: '',
        due_date: '',
        amount: 0,
        status: 'draft',
      });
      await load();
      addToast({ type: 'success', message: 'Nota fiscal criada com sucesso!' });
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
      await invoiceRepository.remove(deleteId, currentTenantId);
      setDeleteId(null);
      await load();
      addToast({ type: 'success', message: 'Nota fiscal excluída com sucesso.' });
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao excluir',
      });
    }
  };

  const filtered = items.filter((item) =>
    item.number.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">
        Carregando notas fiscais...
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
            Notas fiscais
          </h2>
          <p className="text-muted-foreground text-sm">
            Gestão de notas fiscais e itens.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova nota
        </Button>
      </div>

      <div className="border-border bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma nota fiscal cadastrada"
          description="Quando houver notas registradas, elas aparecerão aqui."
          actionLabel="Nova nota"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">
                    Nota {item.number}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Emissão: {item.issue_date} • Vencimento: {item.due_date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-foreground text-sm font-semibold">
                    {item.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                  <Badge
                    variant={
                      item.status === 'paid'
                        ? 'success'
                        : item.status === 'overdue'
                          ? 'danger'
                          : 'secondary'
                    }
                  >
                    {item.status}
                  </Badge>
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
                Nova nota fiscal
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
                  Número
                </label>
                <Input
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="Número da nota"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-foreground text-sm font-medium">
                    Emissão
                  </label>
                  <Input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) =>
                      setForm({ ...form, issue_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-foreground text-sm font-medium">
                    Vencimento
                  </label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm({ ...form, due_date: e.target.value })
                    }
                    required
                  />
                </div>
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
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir nota fiscal?"
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
