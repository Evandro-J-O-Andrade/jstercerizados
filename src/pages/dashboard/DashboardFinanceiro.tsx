import { useMemo, useEffect, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
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
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { accountsPayableRepository } from '@/repositories/accounts-payable.repository';
import { accountsReceivableRepository } from '@/repositories/accounts-receivable.repository';
import { cashFlowRepository } from '@/repositories/cash-flow.repository';

interface FinanceStats {
  payableTotal: number;
  payableOpen: number;
  payableOverdue: number;
  receivableTotal: number;
  receivableOpen: number;
  receivableOverdue: number;
  cashBalance: number;
  totalCredit: number;
  totalDebit: number;
  loading: boolean;
}

export default function DashboardFinanceiro() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const { activePermissions } = useAccount();
  const [stats, setStats] = useState<FinanceStats>({
    payableTotal: 0,
    payableOpen: 0,
    payableOverdue: 0,
    receivableTotal: 0,
    receivableOpen: 0,
    receivableOverdue: 0,
    cashBalance: 0,
    totalCredit: 0,
    totalDebit: 0,
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tenantId = currentTenantId as string;
    if (!tenantId) return;

    async function fetchStats() {
      setError(null);
      setStats((previous) => ({ ...previous, loading: true }));

      try {
        const [payables, receivables, kpis] = await Promise.all([
          accountsPayableRepository.findAll(tenantId),
          accountsReceivableRepository.findAll(tenantId),
          cashFlowRepository.getKPIs(tenantId),
        ]);

        const payableTotal = payables.reduce(
          (sum, item) => sum + item.amount,
          0,
        );
        const payableOpen = payables
          .filter((item) => item.status === 'open')
          .reduce((sum, item) => sum + item.amount, 0);
        const payableOverdue = payables
          .filter((item) => item.status === 'overdue')
          .reduce((sum, item) => sum + item.amount, 0);
        const receivableTotal = receivables.reduce(
          (sum, item) => sum + item.amount,
          0,
        );
        const receivableOpen = receivables
          .filter((item) => item.status === 'open')
          .reduce((sum, item) => sum + item.amount, 0);
        const receivableOverdue = receivables
          .filter((item) => item.status === 'overdue')
          .reduce((sum, item) => sum + item.amount, 0);

        setStats({
          payableTotal,
          payableOpen,
          payableOverdue,
          receivableTotal,
          receivableOpen,
          receivableOverdue,
          cashBalance: Number(kpis.balance ?? 0),
          totalCredit: Number(kpis.total_credit ?? 0),
          totalDebit: Number(kpis.total_debit ?? 0),
          loading: false,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar indicadores financeiros',
        );
        setStats((previous) => ({ ...previous, loading: false }));
      }
    }

    fetchStats();
  }, [currentTenantId]);

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'payable-total',
        label: 'Contas a pagar',
        value: stats.payableTotal,
        description: 'Total registrado no período',
        icon: ArrowUpCircle,
        tone: 'danger',
        href: '/dashboard/financeiro/contas-pagar',
        permission: 'finance.read',
        format: 'currency',
      },
      {
        id: 'payable-open',
        label: 'Contas a pagar em aberto',
        value: stats.payableOpen,
        description: 'Pendências financeiras atuais',
        icon: Wallet,
        tone: 'warning',
        href: '/dashboard/financeiro/contas-pagar',
        permission: 'finance.read',
        format: 'currency',
      },
      {
        id: 'payable-overdue',
        label: 'Contas a pagar vencidas',
        value: stats.payableOverdue,
        description: 'Obrigações após o vencimento',
        icon: ArrowUpCircle,
        tone: 'danger',
        href: '/dashboard/financeiro/contas-pagar',
        permission: 'finance.read',
        format: 'currency',
      },
      {
        id: 'receivable-total',
        label: 'Contas a receber',
        value: stats.receivableTotal,
        description: 'Total registrado no período',
        icon: ArrowDownCircle,
        tone: 'success',
        href: '/dashboard/financeiro/contas-receber',
        permission: 'finance.read',
        format: 'currency',
      },
      {
        id: 'receivable-open',
        label: 'Contas a receber em aberto',
        value: stats.receivableOpen,
        description: 'Recebimentos pendentes',
        icon: Wallet,
        tone: 'primary',
        href: '/dashboard/financeiro/contas-receber',
        permission: 'finance.read',
        format: 'currency',
      },
      {
        id: 'receivable-overdue',
        label: 'Contas a receber vencidas',
        value: stats.receivableOverdue,
        description: 'Recebimentos após o vencimento',
        icon: ArrowDownCircle,
        tone: 'warning',
        href: '/dashboard/financeiro/contas-receber',
        permission: 'finance.read',
        format: 'currency',
      },
      {
        id: 'credit',
        label: 'Entradas do período',
        value: stats.totalCredit,
        description: 'Movimentações positivas',
        icon: TrendingUp,
        tone: 'success',
        href: '/dashboard/financeiro/fluxo-de-caixa',
        permission: 'finance.read',
        format: 'currency',
      },
      {
        id: 'debit',
        label: 'Saídas do período',
        value: stats.totalDebit,
        description: 'Movimentações negativas',
        icon: TrendingDown,
        tone: 'danger',
        href: '/dashboard/financeiro/fluxo-de-caixa',
        permission: 'finance.read',
        format: 'currency',
      },
      {
        id: 'balance',
        label: 'Saldo do período',
        value: stats.cashBalance,
        description: 'Resultado do fluxo de caixa',
        icon: CircleDollarSign,
        tone: 'neutral',
        href: '/dashboard/financeiro/fluxo-de-caixa',
        permission: 'finance.read',
        format: 'currency',
      },
    ],
    [
      stats.cashBalance,
      stats.payableOpen,
      stats.payableOverdue,
      stats.payableTotal,
      stats.receivableOpen,
      stats.receivableOverdue,
      stats.receivableTotal,
      stats.totalCredit,
      stats.totalDebit,
    ],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">
          Dashboard Financeiro
        </h1>
        <p className="text-muted-foreground text-sm">
          Visão consolidada do domínio financeiro.
        </p>
      </div>

      {error ? (
        <DashboardErrorState
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : stats.loading ? (
        <DashboardSkeleton count={9} />
      ) : visibleMetrics.length > 0 ? (
        <DashboardMetricGrid>
          {visibleMetrics.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} />
          ))}
        </DashboardMetricGrid>
      ) : (
        <DashboardErrorState message="Nenhum indicador financeiro está liberado para o seu perfil." />
      )}
    </div>
  );
}
