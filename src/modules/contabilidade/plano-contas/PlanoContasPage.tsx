'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState } from '@/components/fallback';
import { accountingRepository } from '@/repositories/accounting.repository';
import type {
  ChartOfAccount,
  ChartOfAccountCreateInput,
} from '@/types/domain/accounting';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

export default function PlanoContasPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(
    null,
  );

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
    parent_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    accountingRepository
      .findChartOfAccounts(currentTenantId)
      .then(setAccounts)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar plano de contas',
        ),
      )
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filtered = accounts.filter((account) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      account.code?.toLowerCase().includes(term) ||
      account.name?.toLowerCase().includes(term)
    );
  });

  const handleOpenForm = (account?: ChartOfAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        code: account.code,
        name: account.name,
        type: account.type,
        parent_id: account.parent_id || '',
        status: account.status,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        code: '',
        name: '',
        type: 'asset',
        parent_id: '',
        status: 'active',
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: ChartOfAccountCreateInput = {
        tenant_id: currentTenantId,
        code: formData.code,
        name: formData.name,
        type: formData.type,
        parent_id: formData.parent_id || null,
        status: formData.status,
      };

      if (editingAccount) {
        await accountingRepository.updateChartOfAccount(
          editingAccount.id,
          payload,
          currentTenantId,
        );
        addToast({ type: 'success', message: 'Conta atualizada com sucesso!' });
      } else {
        await accountingRepository.createChartOfAccount(payload);
        addToast({ type: 'success', message: 'Conta criada com sucesso!' });
      }

      handleCloseForm();
      const data =
        await accountingRepository.findChartOfAccounts(currentTenantId);
      setAccounts(data);
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao salvar',
      });
    }
  };

  const handleDelete = async (_id: string) => {
    if (!currentTenantId) return;
    try {
      await accountingRepository.deleteChartOfAccount(_id, currentTenantId);
      addToast({ type: 'success', message: 'Conta excluída com sucesso!' });
      const data =
        await accountingRepository.findChartOfAccounts(currentTenantId);
      setAccounts(data);
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao excluir',
      });
    }
  };

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">
        Carregando plano de contas...
      </p>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Plano de Contas
          </h1>
          <p className="text-muted-foreground text-sm">
            Estrutura contábil hierárquica da empresa.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova conta
        </Button>
      </div>

      <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código ou nome..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          description="Quando houver contas registradas, elas aparecerão aqui."
          actionLabel="Nova conta"
          onAction={() => handleOpenForm()}
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Código
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Nome
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Tipo
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Conta pai
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((account) => {
                const parent = accounts.find((a) => a.id === account.parent_id);
                return (
                  <tr key={account.id} className="hover:bg-muted">
                    <td className="text-foreground px-4 py-3">
                      {account.code}
                    </td>
                    <td className="text-foreground px-4 py-3">
                      {account.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 capitalize">
                      {account.type}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {parent ? `${parent.code} - ${parent.name}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          account.status === 'active'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {account.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
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
                  {editingAccount
                    ? 'Editar conta contábil'
                    : 'Nova conta contábil'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCloseForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="code">Código *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        placeholder="Ex: 1.1.01"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Ex: Caixa e equivalentes"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="type">Tipo *</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as any,
                          })
                        }
                        className="border-border w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
                        required
                      >
                        <option value="asset">Ativo</option>
                        <option value="liability">Passivo</option>
                        <option value="equity">Patrimônio líquido</option>
                        <option value="revenue">Receita</option>
                        <option value="expense">Despesa</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="parent_id">Conta pai</Label>
                      <select
                        id="parent_id"
                        value={formData.parent_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parent_id: e.target.value,
                          })
                        }
                        className="border-border w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">Nenhuma (conta principal)</option>
                        {accounts
                          .filter((a) => a.id !== editingAccount?.id)
                          .map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                      className="border-border w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingAccount ? 'Salvar alterações' : 'Criar conta'}
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
