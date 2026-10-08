'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback';
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
import { ConfirmDialog } from '@/components/feedback';
import {
  accountsPayableRepository,
  accountsReceivableRepository,
  cashFlowRepository,
} from '@/repositories/finance.repository';
import type {
  AccountPayable,
  AccountReceivable,
  CashFlow,
} from '@/types/domain/finance';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/components/feedback/ToastContext';

const statusLabel: Record<string, string> = {
  open: 'Em aberto',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
  partially_paid: 'Parcialmente pago',
  received: 'Recebido',
  partially_received: 'Parcialmente recebido',
};

const statusVariant = (status: string) => {
  switch (status) {
    case 'open':
    case 'received':
      return 'default';
    case 'overdue':
      return 'danger';
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'secondary';
    case 'partially_paid':
    case 'partially_received':
      return 'warning';
    default:
      return 'default';
  }
};

export default function FinanceiroDashboardPage() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const { activePermissions } = useAccount();
  const { addToast } = useToast();

  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<
    'payable' | 'receivable' | 'cashflow' | null
  >(null);

  const loadData = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const [payablesData, receivablesData, cashFlowsData] = await Promise.all([
        accountsPayableRepository.findAll(currentTenantId),
        accountsReceivableRepository.findAll(currentTenantId),
        cashFlowRepository.findAll(currentTenantId),
      ]);
      setPayables(payablesData);
      setReceivables(receivablesData);
      setCashFlows(cashFlowsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar dados do dashboard financeiro',
      );
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('pt-BR');
  };

  const kpis = useMemo(() => {
    const payableTotal = payables.reduce((sum, item) => sum + item.amount, 0);
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

    const totalIncome = cashFlows
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = cashFlows
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;

    return {
      payableTotal,
      payableOpen,
      payableOverdue,
      receivableTotal,
      receivableOpen,
      receivableOverdue,
      totalIncome,
      totalExpense,
      balance,
    };
  }, [payables, receivables, cashFlows]);

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'payable-total',
        label: 'Contas a pagar',
        value: kpis.payableTotal,
        description: 'Total de obrigações registradas',
        icon: ArrowUpCircle,
        tone: 'danger',
        href: '/dashboard/financeiro/contas-pagar',
        permission: 'finance.accounts_payable.read',
        format: 'currency',
      },
      {
        id: 'payable-open',
        label: 'Contas a pagar em aberto',
        value: kpis.payableOpen,
        description: 'Obrigações aguardando pagamento',
        icon: Wallet,
        tone: 'warning',
        href: '/dashboard/financeiro/contas-pagar',
        permission: 'finance.accounts_payable.read',
        format: 'currency',
      },
      {
        id: 'payable-overdue',
        label: 'Contas a pagar vencidas',
        value: kpis.payableOverdue,
        description: 'Obrigações após o vencimento',
        icon: ArrowUpCircle,
        tone: 'danger',
        href: '/dashboard/financeiro/contas-pagar',
        permission: 'finance.accounts_payable.read',
        format: 'currency',
      },
      {
        id: 'receivable-total',
        label: 'Contas a receber',
        value: kpis.receivableTotal,
        description: 'Total de recebimentos registrados',
        icon: ArrowDownCircle,
        tone: 'success',
        href: '/dashboard/financeiro/contas-receber',
        permission: 'finance.accounts_receivable.read',
        format: 'currency',
      },
      {
        id: 'receivable-open',
        label: 'Contas a receber em aberto',
        value: kpis.receivableOpen,
        description: 'Recebimentos aguardando baixa',
        icon: Wallet,
        tone: 'primary',
        href: '/dashboard/financeiro/contas-receber',
        permission: 'finance.accounts_receivable.read',
        format: 'currency',
      },
      {
        id: 'receivable-overdue',
        label: 'Contas a receber vencidas',
        value: kpis.receivableOverdue,
        description: 'Recebimentos após o vencimento',
        icon: ArrowDownCircle,
        tone: 'warning',
        href: '/dashboard/financeiro/contas-receber',
        permission: 'finance.accounts_receivable.read',
        format: 'currency',
      },
      {
        id: 'income',
        label: 'Entradas do período',
        value: kpis.totalIncome,
        description: 'Movimentações positivas de caixa',
        icon: TrendingUp,
        tone: 'success',
        href: '/dashboard/financeiro/fluxo-caixa',
        permission: 'finance.cashflow.read',
        format: 'currency',
      },
      {
        id: 'expense',
        label: 'Saídas do período',
        value: kpis.totalExpense,
        description: 'Movimentações negativas de caixa',
        icon: TrendingDown,
        tone: 'danger',
        href: '/dashboard/financeiro/fluxo-caixa',
        permission: 'finance.cashflow.read',
        format: 'currency',
      },
      {
        id: 'balance',
        label: 'Saldo do período',
        value: kpis.balance,
        description: 'Resultado das entradas menos saídas',
        icon: CircleDollarSign,
        tone: kpis.balance >= 0 ? 'success' : 'danger',
        href: '/dashboard/financeiro/fluxo-caixa',
        permission: 'finance.cashflow.read',
        format: 'currency',
      },
    ],
    [
      kpis.balance,
      kpis.payableOpen,
      kpis.payableOverdue,
      kpis.payableTotal,
      kpis.receivableOpen,
      kpis.receivableOverdue,
      kpis.receivableTotal,
      kpis.totalExpense,
      kpis.totalIncome,
    ],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  const recentPayables = useMemo(() => payables.slice(0, 5), [payables]);
  const recentReceivables = useMemo(
    () => receivables.slice(0, 5),
    [receivables],
  );
  const recentCashFlows = useMemo(() => cashFlows.slice(0, 5), [cashFlows]);

  const handleDelete = async () => {
    if (!deleteId || !deleteType || !currentTenantId) return;
    try {
      if (deleteType === 'payable') {
        await accountsPayableRepository.remove(deleteId, currentTenantId);
      } else if (deleteType === 'receivable') {
        await accountsReceivableRepository.remove(deleteId, currentTenantId);
      } else if (deleteType === 'cashflow') {
        await cashFlowRepository.remove(deleteId, currentTenantId);
      }
      await loadData();
      setDeleteId(null);
      setDeleteType(null);
      addToast({ type: 'success', message: 'Registro excluído com sucesso.' });
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao excluir',
      });
    }
  };

  if (loading) {
    return <DashboardSkeleton count={9} />;
  }

  if (error) {
    return <DashboardErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground text-sm">
            Visão geral: contas a pagar, receber, fluxo de caixa e indicadores.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              addToast({ type: 'info', message: 'Calculadora - Em breve' })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Calculadora
          </Button>
          <Button
            onClick={() =>
              addToast({
                type: 'info',
                message: 'Novo lançamento - use a aba Contas a Pagar',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo lançamento
          </Button>
        </div>
      </div>

      {visibleMetrics.length > 0 ? (
        <DashboardMetricGrid>
          {visibleMetrics.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} />
          ))}
        </DashboardMetricGrid>
      ) : (
        <EmptyState
          title="Nenhum indicador financeiro disponível"
          description="Seu perfil não possui indicadores financeiros liberados para visualização."
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground text-sm font-semibold">
              Contas a pagar recentes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                addToast({
                  type: 'info',
                  message: 'Navegar para Contas a Pagar',
                })
              }
            >
              <Eye className="mr-1 h-4 w-4" />
              Ver todas
            </Button>
          </div>
          {recentPayables.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma conta a pagar cadastrada.
            </p>
          ) : (
            <div className="space-y-2">
              {recentPayables.map((item) => (
                <div
                  key={item.id}
                  className="border-border flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {item.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Vencimento: {formatDate(item.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-700">
                      {formatCurrency(item.amount)}
                    </p>
                    <Badge variant={statusVariant(item.status)}>
                      {statusLabel[item.status] || item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground text-sm font-semibold">
              Contas a receber recentes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                addToast({
                  type: 'info',
                  message: 'Navegar para Contas a Receber',
                })
              }
            >
              <Eye className="mr-1 h-4 w-4" />
              Ver todas
            </Button>
          </div>
          {recentReceivables.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma conta a receber cadastrada.
            </p>
          ) : (
            <div className="space-y-2">
              {recentReceivables.map((item) => (
                <div
                  key={item.id}
                  className="border-border flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {item.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Vencimento: {formatDate(item.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700">
                      {formatCurrency(item.amount)}
                    </p>
                    <Badge variant={statusVariant(item.status)}>
                      {statusLabel[item.status] || item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-sm font-semibold">
            Fluxo de caixa recente
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              addToast({ type: 'info', message: 'Navegar para Fluxo de Caixa' })
            }
          >
            <Eye className="mr-1 h-4 w-4" />
            Ver todos
          </Button>
        </div>
        {recentCashFlows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum lançamento de fluxo de caixa registrado.
          </p>
        ) : (
          <div className="space-y-2">
            {recentCashFlows.map((item) => (
              <div
                key={item.id}
                className="border-border flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      item.type === 'income'
                        ? 'bg-green-50 text-green-700'
                        : item.type === 'expense'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {item.type === 'income' ? (
                      <ArrowDownCircle className="h-4 w-4" />
                    ) : item.type === 'expense' ? (
                      <ArrowUpCircle className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {item.description || 'Sem descrição'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(item.date)} • {item.category || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={`text-sm font-semibold ${
                      item.type === 'income'
                        ? 'text-green-700'
                        : item.type === 'expense'
                          ? 'text-red-700'
                          : 'text-blue-700'
                    }`}
                  >
                    {item.type === 'expense'
                      ? '-'
                      : item.type === 'income'
                        ? '+'
                        : '±'}
                    {formatCurrency(item.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteId(item.id);
                      setDeleteType('cashflow');
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir registro?"
        message="Essa ação removerá o registro."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
      />
    </div>
  );
}
