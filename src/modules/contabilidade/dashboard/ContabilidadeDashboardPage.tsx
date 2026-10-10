'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Download,
  TrendingDown,
  TrendingUp,
  Wallet,
  Building2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  DashboardCard,
  DashboardErrorState,
  DashboardMetricGrid,
  DashboardSkeleton,
} from '@/components/dashboard';
import {
  filterDashboardMetrics,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';
import { accountingRepository } from '@/repositories/accounting.repository';
import type {
  AccountingEntry,
  ChartOfAccount,
} from '@/types/domain/accounting';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/components/feedback/ToastContext';

export default function ContabilidadeDashboardPage() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const { activePermissions } = useAccount();
  const { addToast } = useToast();
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const [entriesData, accountsData] = await Promise.all([
        accountingRepository.findEntries(currentTenantId),
        accountingRepository.findChartOfAccounts(currentTenantId),
      ]);
      setEntries(entriesData);
      setAccounts(accountsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar dados contábeis',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'debit',
        label: 'Total débito',
        value: kpis.totalDebit,
        icon: TrendingDown,
        tone: 'danger',
        permission: 'accounting.dashboard.read',
        format: 'currency',
      },
      {
        id: 'credit',
        label: 'Total crédito',
        value: kpis.totalCredit,
        icon: TrendingUp,
        tone: 'success',
        permission: 'accounting.dashboard.read',
        format: 'currency',
      },
      {
        id: 'balance',
        label: 'Saldo',
        value: kpis.balance,
        icon: Wallet,
        tone: kpis.balance >= 0 ? 'success' : 'danger',
        permission: 'accounting.dashboard.read',
        format: 'currency',
      },
      {
        id: 'accounts',
        label: 'Contas cadastradas',
        value: kpis.accountCount,
        icon: Building2,
        tone: 'neutral',
        permission: 'accounting.dashboard.read',
        format: 'number',
      },
    ],
    [kpis.accountCount, kpis.balance, kpis.totalCredit, kpis.totalDebit],
  );

  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return <DashboardSkeleton count={4} />;
  }

  if (error) {
    return <DashboardErrorState message={error} onRetry={loadData} />;
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
          onClick={() =>
            addToast({
              type: 'info',
              message: 'Exportar relatório contábil...',
            })
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {visibleMetrics.length > 0 ? (
        <DashboardMetricGrid>
          {visibleMetrics.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} />
          ))}
        </DashboardMetricGrid>
      ) : (
        <DashboardErrorState message="Nenhum indicador contábil está liberado para o seu perfil." />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground text-sm font-semibold">
              Últimos lançamentos
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                (window.location.href = '/dashboard/contabilidade/lancamentos')
              }
            >
              Ver todos
            </Button>
          </div>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum lançamento cadastrado.
            </p>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="border-border flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {entry.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-destructive text-sm font-semibold">
                      D: {formatCurrency(entry.debit)}
                    </p>
                    <p className="text-success text-sm font-semibold">
                      C: {formatCurrency(entry.credit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground text-sm font-semibold">
              Plano de contas
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                (window.location.href = '/dashboard/contabilidade/plano-contas')
              }
            >
              Ver todos
            </Button>
          </div>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma conta cadastrada.
            </p>
          ) : (
            <div className="space-y-2">
              {accounts.slice(0, 5).map((account) => (
                <div
                  key={account.id}
                  className="border-border flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {account.code} - {account.name}
                    </p>
                    <p className="text-muted-foreground text-xs capitalize">
                      {account.type}
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {account.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-foreground mb-3 text-sm font-semibold">
          Acesso rápido
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Lançamentos',
              href: '/dashboard/contabilidade/lancamentos',
              icon: FileText,
            },
            {
              label: 'Plano de contas',
              href: '/dashboard/contabilidade/plano-contas',
              icon: Building2,
            },
            {
              label: 'Balancetes',
              href: '/dashboard/contabilidade/balancetes',
              icon: TrendingUp,
            },
            {
              label: 'Fechamento',
              href: '/dashboard/contabilidade/fechamento',
              icon: Wallet,
            },
          ].map((mod) => (
            <a
              key={mod.label}
              href={mod.href}
              className="border-border hover:bg-muted flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors"
            >
              <mod.icon className="text-muted-foreground h-6 w-6" />
              <span className="text-center text-sm font-medium">
                {mod.label}
              </span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
