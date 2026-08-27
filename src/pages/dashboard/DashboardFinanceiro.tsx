import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { accountsPayableRepository } from '@/repositories/accounts-payable.repository';
import { accountsReceivableRepository } from '@/repositories/accounts-receivable.repository';
import { cashFlowRepository } from '@/repositories/cash-flow.repository';
import { useAuth } from '@/contexts/AuthContext';

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
  const { currentTenantId } = useAuth();
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

  useEffect(() => {
    if (!currentTenantId) return;

    const fetchStats = async () => {
      try {
        const [payables, receivables, kpis] = await Promise.all([
          accountsPayableRepository.findAll(currentTenantId),
          accountsReceivableRepository.findAll(currentTenantId),
          cashFlowRepository.getKPIs(currentTenantId),
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

        const cashBalance = Number(kpis.balance ?? 0);
        const totalCredit = Number(kpis.total_credit ?? 0);
        const totalDebit = Number(kpis.total_debit ?? 0);

        setStats({
          payableTotal,
          payableOpen,
          payableOverdue,
          receivableTotal,
          receivableOpen,
          receivableOverdue,
          cashBalance,
          totalCredit,
          totalDebit,
          loading: false,
        });
      } catch (error) {
        console.error('[DashboardFinanceiro] Falha ao carregar dados', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [currentTenantId]);

  const kpis = useMemo(() => {
    return [
      {
        label: 'Contas a pagar',
        value: stats.payableTotal,
        icon: ArrowUpCircle,
        format: 'currency',
      },
      {
        label: 'Contas a pagar em aberto',
        value: stats.payableOpen,
        icon: Wallet,
        format: 'currency',
      },
      {
        label: 'Contas a pagar vencidas',
        value: stats.payableOverdue,
        icon: ArrowUpCircle,
        format: 'currency',
      },
      {
        label: 'Contas a receber',
        value: stats.receivableTotal,
        icon: ArrowDownCircle,
        format: 'currency',
      },
      {
        label: 'Contas a receber em aberto',
        value: stats.receivableOpen,
        icon: Wallet,
        format: 'currency',
      },
      {
        label: 'Contas a receber vencidas',
        value: stats.receivableOverdue,
        icon: ArrowDownCircle,
        format: 'currency',
      },
      {
        label: 'Entradas do período',
        value: stats.totalCredit,
        icon: TrendingUp,
        format: 'currency',
      },
      {
        label: 'Saídas do período',
        value: stats.totalDebit,
        icon: TrendingDown,
        format: 'currency',
      },
      {
        label: 'Saldo do período',
        value: stats.cashBalance,
        icon: CircleDollarSign,
        format: 'currency',
      },
    ];
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Dashboard Financeiro
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada do domínio financeiro.
        </p>
      </div>

      {stats.loading ? (
        <p className="text-sm text-muted-foreground">Carregando indicadores...</p>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const formattedValue =
              kpi.format === 'currency'
                ? kpi.value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                : kpi.value.toLocaleString('pt-BR');

            return (
              <div
                key={kpi.label}
                className="rounded-xl border border-border bg-background p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formattedValue}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

