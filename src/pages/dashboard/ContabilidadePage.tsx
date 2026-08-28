'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/fallback';
import { accountingRepository } from '@/repositories/accounting.repository';
import type {
  AccountingEntry,
  ChartOfAccount,
} from '@/types/domain/accounting';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'entries' | 'chart' | 'balance';

export default function ContabilidadePage() {
  const { currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('entries');
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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
            : 'Erro ao carregar dados contábeis',
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

  const kpis = useMemo(() => {
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
    const balance = totalDebit - totalCredit;
    return {
      totalDebit,
      totalCredit,
      balance,
      entryCount: entries.length,
      accountCount: accounts.length,
    };
  }, [entries, accounts]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">
          Carregando dados contábeis...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Contabilidade
          </h1>
          <p className="text-muted-foreground text-sm">
            Plano de contas, lançamentos e fechamento contábil.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => alert('Exportar relatório contábil...')}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total débito</p>
          <p className="text-foreground text-lg font-semibold">
            {formatCurrency(kpis.totalDebit)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total crédito</p>
          <p className="text-foreground text-lg font-semibold">
            {formatCurrency(kpis.totalCredit)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Saldo</p>
          <p
            className={`text-lg font-semibold ${kpis.balance >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {formatCurrency(kpis.balance)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Contas cadastradas</p>
          <p className="text-foreground text-lg font-semibold">
            {kpis.accountCount}
          </p>
        </Card>
      </div>

      <div className="border-border flex gap-2 overflow-x-auto border-b">
        {[
          { key: 'entries', label: 'Lançamentos' },
          { key: 'chart', label: 'Plano de contas' },
          { key: 'balance', label: 'Balancete' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'entries' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
            <Button onClick={() => alert('Formulário de novo lançamento')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo lançamento
            </Button>
          </div>

          {filteredEntries.length === 0 ? (
            <EmptyState
              title="Nenhum lançamento cadastrado"
              description="Quando houver lançamentos registrados, eles aparecerão aqui."
              actionLabel="Novo lançamento"
              onAction={() => alert('Formulário de novo lançamento')}
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
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted">
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'chart' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-end">
            <Button onClick={() => alert('Formulário de nova conta')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova conta
            </Button>
          </div>

          {accounts.length === 0 ? (
            <EmptyState
              title="Nenhuma conta cadastrada"
              description="Quando houver contas registradas, elas aparecerão aqui."
              actionLabel="Nova conta"
              onAction={() => alert('Formulário de nova conta')}
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {accounts.map((account) => (
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
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            account.status === 'active'
                              ? 'success'
                              : 'secondary'
                          }
                        >
                          {account.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'balance' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Balancete
            </h3>
            {accounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhuma conta cadastrada para compor o balancete.
              </p>
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
                        Débito
                      </th>
                      <th className="text-muted-foreground px-4 py-3 font-medium">
                        Crédito
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {accounts.map((account) => {
                      const accountEntries = entries.filter(
                        (entry) => entry.chart_account_id === account.id,
                      );
                      const debit = accountEntries.reduce(
                        (sum, entry) => sum + entry.debit,
                        0,
                      );
                      const credit = accountEntries.reduce(
                        (sum, entry) => sum + entry.credit,
                        0,
                      );
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
                          <td className="text-foreground px-4 py-3">
                            {formatCurrency(debit)}
                          </td>
                          <td className="text-foreground px-4 py-3">
                            {formatCurrency(credit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
