import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Briefcase,
  Building2,
  Wallet,
  Package,
  Headphones,
  UserCog,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  DashboardCard,
  DashboardErrorState,
  DashboardMetricGrid,
  DashboardSection,
  DashboardSkeleton,
} from '@/components/dashboard';
import {
  filterDashboardMetrics,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';
import { EmptyState } from '@/components/fallback';
import { employeesRepository } from '@/repositories/employees.repository';
import { jobsRepository } from '@/repositories/jobs.repository';
import { companiesRepository } from '@/repositories/companies.repository';
import { accountsPayableRepository } from '@/repositories/accounts-payable.repository';
import { accountsReceivableRepository } from '@/repositories/accounts-receivable.repository';
import { cashFlowRepository } from '@/repositories/cash-flow.repository';
import { stockRepository } from '@/repositories/stock.repository';
import { servicesRepository } from '@/repositories/services.repository';
import { supportRepository } from '@/repositories/support.repository';
import type { Employee } from '@/types/domain/employee';
import type { Job } from '@/types/domain/job';
import type { Company } from '@/types/domain/company';
import type { AccountPayable } from '@/types/domain/finance';
import type { AccountReceivable } from '@/types/domain/finance';
import type { CashFlow } from '@/types/domain/finance';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';

interface ModuleSummary {
  id: string;
  title: string;
  icon: LucideIcon;
  total: number;
  route: string;
  permission: string;
  format?: 'number' | 'currency';
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export default function RelatoriosPage() {
  const { currentTenantId } = useAuth();
  const { activePermissions } = useAccount();
  const { isAdminMaster } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [products, setProducts] = useState<
    { id: string; name: string; category: string | null }[]
  >([]);
  const [services, setServices] = useState<
    { id: string; name: string; active: boolean }[]
  >([]);
  const [tickets, setTickets] = useState<
    { id: string; status: string; priority: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentTenantId) return;
    const tenantId = currentTenantId;
    setLoading(true);
    setError(null);
    Promise.all([
      employeesRepository.findAll(tenantId),
      jobsRepository.findAll(tenantId),
      companiesRepository.findAll(tenantId),
      accountsPayableRepository.findAll(tenantId),
      accountsReceivableRepository.findAll(tenantId),
      cashFlowRepository.findAll(tenantId),
      stockRepository.findProducts(tenantId),
      servicesRepository.findServices(tenantId),
      supportRepository.findTickets(tenantId),
    ])
      .then(([emp, jobsData, comp, pay, rec, cf, stock, svc, supp]) => {
        setEmployees(emp);
        setJobs(jobsData);
        setCompanies(comp);
        setPayables(pay);
        setReceivables(rec);
        setCashFlows(cf);
        setProducts(stock);
        setServices(svc);
        setTickets(supp);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar relatório geral',
        ),
      )
      .finally(() => setLoading(false));
  }, [currentTenantId]);

  const summaries = useMemo<ModuleSummary[]>(
    () => [
      {
        id: 'rh',
        title: 'RH',
        icon: Users,
        total: employees.length,
        route: '/dashboard/rh',
        permission: 'people.read',
        tone: 'primary',
      },
      {
        id: 'recrutamento',
        title: 'Recrutamento',
        icon: Briefcase,
        total: jobs.length,
        route: '/dashboard/recrutamento',
        permission: 'jobs.read',
        tone: 'warning',
      },
      {
        id: 'crm',
        title: 'CRM',
        icon: Building2,
        total: companies.length,
        route: '/dashboard/empresas',
        permission: 'companies.read',
        tone: 'success',
      },
      {
        id: 'financeiro',
        title: 'Financeiro',
        icon: Wallet,
        total:
          payables.reduce((sum, item) => sum + item.amount, 0) +
          receivables.reduce((sum, item) => sum + item.amount, 0),
        route: '/dashboard/financeiro',
        permission: 'finance.read',
        format: 'currency',
        tone: 'success',
      },
      {
        id: 'estoque',
        title: 'Estoque',
        icon: Package,
        total: products.length,
        route: '/dashboard/estoque',
        permission: 'stock_movements.read',
        tone: 'warning',
      },
      {
        id: 'servicos',
        title: 'Serviços',
        icon: UserCog,
        total: services.length,
        route: '/dashboard/servicos',
        permission: 'service_orders.read',
        tone: 'primary',
      },
      {
        id: 'suporte',
        title: 'Suporte',
        icon: Headphones,
        total: tickets.length,
        route: '/dashboard/suporte',
        permission: 'support_tickets.read',
        tone: 'danger',
      },
    ],
    [
      companies.length,
      employees.length,
      jobs.length,
      payables,
      products.length,
      receivables,
      services.length,
      tickets.length,
    ],
  );
  const visibleSummaries = filterDashboardMetrics(
    summaries.map((summary) => ({
      id: summary.id,
      label: summary.title,
      value: summary.total,
      icon: summary.icon,
      href: summary.route,
      permission: summary.permission,
      format: summary.format,
      tone: summary.tone,
      description: `Abrir módulo de ${summary.title.toLowerCase()}`,
    })),
    activePermissions,
    isAdminMaster,
  );

  const financeKpis = useMemo(
    () => ({
      totalPayables: payables.reduce((sum, item) => sum + item.amount, 0),
      totalReceivables: receivables.reduce((sum, item) => sum + item.amount, 0),
      totalIncome: cashFlows
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0),
      totalExpense: cashFlows
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0),
    }),
    [payables, receivables, cashFlows],
  );
  const financeBalance = financeKpis.totalIncome - financeKpis.totalExpense;
  const financeMetrics: DashboardMetric[] = [
    {
      id: 'reports-payables',
      label: 'Contas a pagar',
      value: financeKpis.totalPayables,
      icon: ArrowUpCircle,
      permission: 'finance.read',
      format: 'currency',
      tone: 'danger',
    },
    {
      id: 'reports-receivables',
      label: 'Contas a receber',
      value: financeKpis.totalReceivables,
      icon: ArrowDownCircle,
      permission: 'finance.read',
      format: 'currency',
      tone: 'success',
    },
    {
      id: 'reports-income',
      label: 'Entradas',
      value: financeKpis.totalIncome,
      icon: TrendingUp,
      permission: 'finance.read',
      format: 'currency',
      tone: 'success',
    },
    {
      id: 'reports-expense',
      label: 'Saídas',
      value: financeKpis.totalExpense,
      icon: TrendingDown,
      permission: 'finance.read',
      format: 'currency',
      tone: 'danger',
    },
    {
      id: 'reports-balance',
      label: 'Saldo',
      value: financeBalance,
      icon: Wallet,
      permission: 'finance.read',
      format: 'currency',
      tone: 'neutral',
    },
  ];
  const visibleFinanceMetrics = filterDashboardMetrics(
    financeMetrics,
    activePermissions,
    isAdminMaster,
  );

  const operationalMetrics: DashboardMetric[] = [
    {
      id: 'reports-active-employees',
      label: 'Funcionários ativos',
      value: employees.filter((item) => item.status === 'active').length,
      icon: Users,
      permission: 'people.read',
      tone: 'primary',
    },
    {
      id: 'reports-published-jobs',
      label: 'Vagas publicadas',
      value: jobs.filter((item) => item.status === 'published').length,
      icon: Briefcase,
      permission: 'jobs.read',
      tone: 'warning',
    },
    {
      id: 'reports-active-services',
      label: 'Serviços ativos',
      value: services.filter((item) => item.active).length,
      icon: UserCog,
      permission: 'service_orders.read',
      tone: 'success',
    },
    {
      id: 'reports-open-tickets',
      label: 'Chamados abertos',
      value: tickets.filter(
        (item) => item.status === 'open' || item.status === 'in_progress',
      ).length,
      icon: Headphones,
      permission: 'support_tickets.read',
      tone: 'danger',
    },
  ];
  const visibleOperationalMetrics = filterDashboardMetrics(
    operationalMetrics,
    activePermissions,
    isAdminMaster,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Relatório Geral
          </h1>
          <p className="text-muted-foreground text-sm">
            Visão consolidada de todos os módulos da operação.
          </p>
        </div>
        <DashboardSkeleton count={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            Relatório Geral
          </h1>
          <p className="text-muted-foreground text-sm">
            Visão consolidada de todos os módulos da operação.
          </p>
        </div>
        <DashboardErrorState
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">
          Relatório Geral
        </h1>
        <p className="text-muted-foreground text-sm">
          Visão consolidada de todos os módulos da operação.
        </p>
      </div>

      {visibleSummaries.length > 0 ? (
        <DashboardMetricGrid>
          {visibleSummaries.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} />
          ))}
        </DashboardMetricGrid>
      ) : (
        <EmptyState
          title="Nenhum módulo disponível"
          description="Seu perfil não possui módulos liberados para visualização."
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSection
          title="Financeiro"
          description="Resumo dos lançamentos e fluxo de caixa."
          icon={Wallet}
        >
          {visibleFinanceMetrics.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleFinanceMetrics.map((metric) => (
                <DashboardCard key={metric.id} metric={metric} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem dados financeiros"
              description="Quando houver lançamentos, os indicadores aparecerão aqui."
            />
          )}
        </DashboardSection>

        <DashboardSection
          title="Operacional"
          description="Indicadores de pessoas, recrutamento, serviços e suporte."
          icon={Briefcase}
        >
          {visibleOperationalMetrics.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleOperationalMetrics.map((metric) => (
                <DashboardCard key={metric.id} metric={metric} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem dados operacionais"
              description="Quando houver dados na operação, os indicadores aparecerão aqui."
            />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
