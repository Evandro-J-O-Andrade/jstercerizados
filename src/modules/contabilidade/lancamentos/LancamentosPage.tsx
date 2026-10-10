'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Download, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState } from '@/components/fallback';
import { accountingRepository } from '@/repositories/accounting.repository';
import type {
  AccountingEntry,
  AccountingEntryCreateInput,
} from '@/types/domain/accounting';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

export default function LancamentosPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AccountingEntry | null>(
    null,
  );

  const [formData, setFormData] = useState({
    chart_account_id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    debit: '0',
    credit: '0',
  });

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      accountingRepository.findEntries(currentTenantId),
      accountingRepository.findChartOfAccounts(currentTenantId),
    ])
      .then(([e, a]) => {
        setEntries(e);
        setAccounts(a);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar lançamentos contábeis',
        ),
      )
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filteredEntries = useMemo(() => {
    let data = entries;
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((entry) =>
        entry.description.toLowerCase().includes(term),
      );
    }
    return data;
  }, [entries, search]);

  const handleOpenForm = (entry?: AccountingEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        chart_account_id: entry.chart_account_id || '',
        date: entry.date,
        description: entry.description,
        debit: String(entry.debit),
        credit: String(entry.credit),
      });
    } else {
      setEditingEntry(null);
      setFormData({
        chart_account_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        debit: '0',
        credit: '0',
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const debit = parseFloat(formData.debit) || 0;
      const credit = parseFloat(formData.credit) || 0;

      if (debit === 0 && credit === 0) {
        addToast({ type: 'error', message: 'Informe débito ou crédito.' });
        return;
      }

      const payload: AccountingEntryCreateInput = {
        tenant_id: currentTenantId,
        chart_account_id: formData.chart_account_id || null,
        date: formData.date,
        description: formData.description,
        debit,
        credit,
      };

      if (editingEntry) {
        await accountingRepository.updateEntry(
          editingEntry.id,
          payload,
          currentTenantId,
        );
        addToast({
          type: 'success',
          message: 'Lançamento atualizado com sucesso!',
        });
      } else {
        await accountingRepository.createEntry(payload);
        addToast({
          type: 'success',
          message: 'Lançamento criado com sucesso!',
        });
      }

      handleCloseForm();
      const [e] = await Promise.all([
        accountingRepository.findEntries(currentTenantId),
        accountingRepository.findChartOfAccounts(currentTenantId),
      ]);
      setEntries(e);
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao salvar',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentTenantId) return;
    try {
      await accountingRepository.deleteEntry(id, currentTenantId);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      addToast({
        type: 'success',
        message: 'Lançamento excluído com sucesso.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao excluir',
      });
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Carregando lançamentos...</p>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Lançamentos Contábeis
          </h1>
          <p className="text-muted-foreground text-sm">
            Partidas do diário e lançamentos contábeis.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo lançamento
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="text-muted-foreground h-4 w-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lançamentos..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            addToast({ type: 'info', message: 'Exportar lançamentos...' })
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {filteredEntries.length === 0 ? (
        <EmptyState
          title="Nenhum lançamento cadastrado"
          description="Quando houver lançamentos registrados, eles aparecerão aqui."
          actionLabel="Novo lançamento"
          onAction={() => handleOpenForm()}
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Data
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Conta
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Descrição
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Débito
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Crédito
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Saldo
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filteredEntries.map((entry) => {
                const account = accounts.find(
                  (a) => a.id === entry.chart_account_id,
                );
                return (
                  <tr key={entry.id} className="hover:bg-muted">
                    <td className="text-muted-foreground px-4 py-3">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {account ? `${account.code} - ${account.name}` : '—'}
                    </td>
                    <td className="text-foreground px-4 py-3">
                      {entry.description}
                    </td>
                    <td className="text-destructive px-4 py-3">
                      {formatCurrency(entry.debit)}
                    </td>
                    <td className="text-success px-4 py-3">
                      {formatCurrency(entry.credit)}
                    </td>
                    <td className="text-foreground px-4 py-3">
                      {formatCurrency(entry.balance)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="m-4 max-h-[90vh] w-full max-w-md overflow-y-auto">
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingEntry ? 'Editar lançamento' : 'Novo lançamento'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCloseForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chart_account_id">Conta contábil *</Label>
                    <select
                      id="chart_account_id"
                      value={formData.chart_account_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chart_account_id: e.target.value,
                        })
                      }
                      className="border-border w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione a conta</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição *</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Descrição do lançamento"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="debit">Débito</Label>
                      <Input
                        id="debit"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.debit}
                        onChange={(e) =>
                          setFormData({ ...formData, debit: e.target.value })
                        }
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="credit">Crédito</Label>
                      <Input
                        id="credit"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.credit}
                        onChange={(e) =>
                          setFormData({ ...formData, credit: e.target.value })
                        }
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingEntry ? 'Salvar alterações' : 'Criar lançamento'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCloseForm}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
