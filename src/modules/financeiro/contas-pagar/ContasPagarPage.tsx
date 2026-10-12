'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback';
import { ConfirmDialog } from '@/components/feedback';
import { accountsPayableRepository } from '@/repositories/finance.repository';
import type { AccountPayable } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

const statusLabel: Record<string, string> = {
  open: 'Em aberto',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
  partially_paid: 'Parcialmente pago',
};

const statusVariant = (status: string) => {
  switch (status) {
    case 'open':
      return 'default';
    case 'overdue':
      return 'danger';
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'secondary';
    case 'partially_paid':
      return 'warning';
    default:
      return 'default';
  }
};

export default function ContasPagarPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    payment_reference: '',
    notes: '',
  });

  const load = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await accountsPayableRepository.findAll(currentTenantId);
      setPayables(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar contas a pagar',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenForm = () => {
    setFormData({
      description: '',
      amount: '',
      due_date: '',
      payment_reference: '',
      notes: '',
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      description: '',
      amount: '',
      due_date: '',
      payment_reference: '',
      notes: '',
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        addToast({ type: 'error', message: 'Informe um valor válido.' });
        return;
      }

      await accountsPayableRepository.create({
        tenant_id: currentTenantId,
        description: formData.description,
        amount,
        due_date: formData.due_date || new Date().toISOString().split('T')[0],
        payment_reference: formData.payment_reference || null,
        notes: formData.notes || null,
        status: 'open',
      });

      handleCloseForm();
      await load();
      addToast({ type: 'success', message: 'Conta a pagar criada com sucesso!' });
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
      await accountsPayableRepository.remove(deleteId, currentTenantId);
      setPayables((prev) => prev.filter((item) => item.id !== deleteId));
      setDeleteId(null);
      addToast({ type: 'success', message: 'Conta a pagar excluída com sucesso.' });
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao excluir',
      });
    }
  };

  const filteredPayables = useMemo(() => {
    let data = payables;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.description?.toLowerCase().includes(term) ||
          item.payment_reference?.toLowerCase().includes(term) ||
          item.notes?.toLowerCase().includes(term),
      );
    }
    return data;
  }, [payables, search]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando contas a pagar...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="secondary" onClick={load}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Contas a Pagar</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie obrigações, vencimentos e pagamentos.
          </p>
        </div>
        <Button onClick={handleOpenForm}>
          <Plus className="mr-2 h-4 w-4" />
          Nova conta
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="text-muted-foreground h-4 w-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição, referência ou observação..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {filteredPayables.length === 0 ? (
        <EmptyState
          title="Nenhuma conta a pagar cadastrada"
          description="Quando houver obrigações registradas, elas aparecerão aqui."
          actionLabel="Nova conta"
          onAction={handleOpenForm}
        />
      ) : (
        <div className="space-y-3">
          {filteredPayables.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="border-border bg-background flex items-center justify-between rounded-xl border p-4 shadow-sm"
            >
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">
                  {item.description}
                </p>
                <p className="text-muted-foreground text-xs">
                  Vencimento: {formatDate(item.due_date)}
                  {item.paid_date &&
                    ` • Pagamento: ${formatDate(item.paid_date)}`}
                  {item.payment_reference && (
                    <>
                      {' • Ref: '}
                      <span className="font-mono">{item.payment_reference}</span>
                    </>
                  )}
                </p>
                {item.notes && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Obs: {item.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-700">
                    {formatCurrency(item.amount)}
                  </p>
                  <Badge variant={statusVariant(item.status)}>
                    {statusLabel[item.status] || item.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(item.id)}
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                Nova conta a pagar
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseForm}
              >
                Fechar
              </Button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-foreground text-sm font-medium">
                  Descrição
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da conta"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-foreground text-sm font-medium">
                    Valor
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="text-foreground text-sm font-medium">
                    Vencimento
                  </label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-foreground text-sm font-medium">
                  Referência de pagamento
                </label>
                <Input
                  value={formData.payment_reference}
                  onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                  placeholder="Número do documento, boleto, etc."
                />
              </div>
              <div>
                <label className="text-foreground text-sm font-medium">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações opcionais"
                  rows={3}
                  className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Salvar
                </Button>
                <Button type="button" variant="secondary" onClick={handleCloseForm} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir conta a pagar?"
        message="Essa ação removerá a obrigação. Se houver pagamentos relacionados, essa operação pode ser bloqueada."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
