'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/fallback';
import { bankAccountRepository } from '@/repositories/bank-account.repository';
import type { BankAccount } from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

export default function BancosPage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    bankAccountRepository.findAll(currentTenantId)
      .then(setAccounts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar contas bancárias'))
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const filtered = accounts.filter((account) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return account.bank.toLowerCase().includes(term) ||
      (account.agency?.toLowerCase().includes(term) ?? false) ||
      (account.account_number?.toLowerCase().includes(term) ?? false);
  });

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando contas bancárias...</p>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por banco, agência ou conta..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <Button onClick={() => addToast({ type: 'info', message: 'Formulário de nova conta bancária' })}>
          <Plus className="mr-2 h-4 w-4" />
          Nova conta
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma conta bancária cadastrada"
          description="Quando houver contas cadastradas, elas aparecerão aqui."
          actionLabel="Nova conta"
          onAction={() => addToast({ type: 'info', message: 'Formulário de nova conta bancária' })}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Banco</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Agência</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Conta</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Saldo atual</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((account) => (
                <tr key={account.id} className="hover:bg-muted">
                  <td className="px-4 py-3 text-foreground">{account.bank}</td>
                  <td className="px-4 py-3 text-muted-foreground">{account.agency || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{account.account_number || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{account.account_type || '—'}</td>
                  <td className="px-4 py-3 text-foreground">
                    {account.current_balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      account.status === 'active' ? 'bg-success/10 text-success' :
                      account.status === 'inactive' ? 'bg-muted text-muted-foreground' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {account.status === 'active' ? 'Ativa' : account.status === 'inactive' ? 'Inativa' : 'Bloqueada'}
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

