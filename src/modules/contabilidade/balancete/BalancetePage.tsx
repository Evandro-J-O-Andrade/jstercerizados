'use client';

import { useEffect, useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';
import { accountingRepository } from '@/repositories/accounting.repository';
import type {
  AccountingEntry,
  ChartOfAccount,
} from '@/types/domain/accounting';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';

export default function BalancetePage() {
  const { currentTenantId } = useAuth();
  const { addToast } = useToast();
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          err instanceof Error ? err.message : 'Erro ao carregar balancete',
        ),
      )
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const balancete = useMemo(() => {
    return accounts.map((account) => {
      const accountEntries = entries.filter(
        (entry) => entry.chart_account_id === account.id,
      );
      const debit = accountEntries.reduce((sum, entry) => sum + entry.debit, 0);
      const credit = accountEntries.reduce(
        (sum, entry) => sum + entry.credit,
        0,
      );
      const balance = debit - credit;
      return {
        ...account,
        debit,
        credit,
        balance,
        hasEntries: accountEntries.length > 0,
      };
    });
  }, [accounts, entries]);

  const totals = useMemo(() => {
    const totalDebit = balancete.reduce((sum, a) => sum + a.debit, 0);
    const totalCredit = balancete.reduce((sum, a) => sum + a.credit, 0);
    return { totalDebit, totalCredit, balance: totalDebit - totalCredit };
  }, [balancete]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      asset: 'Ativo',
      liability: 'Passivo',
      equity: 'Patrimônio líquido',
      revenue: 'Receita',
      expense: 'Despesa',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">Carregando balancete...</p>
    );
  }

  if (error) {
    return <EmptyState title="Erro ao carregar" description={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Balancete</h1>
          <p className="text-muted-foreground text-sm">
            Balancete de verificação por conta contábil.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            addToast({
              type: 'info',
              message: 'Exportar balancete...',
            })
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total débito</p>
          <p className="text-destructive text-lg font-semibold">
            {formatCurrency(totals.totalDebit)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total crédito</p>
          <p className="text-success text-lg font-semibold">
            {formatCurrency(totals.totalCredit)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Saldo</p>
          <p
            className={`text-lg font-semibold ${totals.balance >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {formatCurrency(totals.balance)}
          </p>
        </Card>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          description="Cadastre contas no plano de contas para compor o balancete."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
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
                    Débito
                  </th>
                  <th className="text-muted-foreground px-4 py-3 font-medium">
                    Crédito
                  </th>
                  <th className="text-muted-foreground px-4 py-3 font-medium">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {balancete.map((account) => (
                  <tr key={account.id} className="hover:bg-muted">
                    <td className="text-foreground px-4 py-3">
                      {account.code}
                    </td>
                    <td className="text-foreground px-4 py-3">
                      {account.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 capitalize">
                      {getTypeLabel(account.type)}
                    </td>
                    <td className="text-destructive px-4 py-3">
                      {formatCurrency(account.debit)}
                    </td>
                    <td className="text-success px-4 py-3">
                      {formatCurrency(account.credit)}
                    </td>
                    <td className="text-foreground px-4 py-3 font-medium">
                      {formatCurrency(account.balance)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted font-semibold">
                  <td className="text-foreground px-4 py-3" colSpan={3}>
                    TOTAIS
                  </td>
                  <td className="text-destructive px-4 py-3">
                    {formatCurrency(totals.totalDebit)}
                  </td>
                  <td className="text-success px-4 py-3">
                    {formatCurrency(totals.totalCredit)}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {formatCurrency(totals.balance)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
