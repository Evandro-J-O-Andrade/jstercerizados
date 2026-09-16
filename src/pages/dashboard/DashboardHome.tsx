import { useMemo } from 'react';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Headphones,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { NavLink, Navigate } from 'react-router-dom';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { ModuleIcon } from '@/components/portal/PortalSidebar';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useGlobalDashboardStats } from '@/hooks/useGlobalDashboardStats';
import { buildGlobalDashboardKpis } from './global-dashboard-model';

const MODULE_GROUPS = [
  { category: 'plataforma', label: 'Plataforma' },
  { category: 'negocio', label: 'Operação' },
  { category: 'ia', label: 'IA & Automação' },
  { category: 'seguranca', label: 'Segurança' },
  { category: 'documentos', label: 'Documentos' },
] as const;

const KPI_ICONS = {
  tenants: Building2,
  companies: Building2,
  people: Users,
  candidates: Users,
  jobs: BriefcaseBusiness,
  applications: FileText,
  'service-orders': Wrench,
  'support-tickets': Headphones,
} as const;

const KPI_PERMISSIONS: Record<string, string> = {
  tenants: 'tenants.read',
  companies: 'companies.read',
  people: 'people.read',
  candidates: 'candidates.read',
  jobs: 'jobs.read',
  applications: 'applications.read',
  'service-orders': 'service_orders.read',
  'support-tickets': 'support_tickets.read',
};

const KPI_ROUTES: Record<string, string> = {
  tenants: '/dashboard/tenants',
  companies: '/dashboard/empresas',
  people: '/dashboard/usuarios',
  candidates: '/dashboard/candidatos',
  jobs: '/dashboard/vagas',
  applications: '/dashboard/candidaturas',
  'service-orders': '/dashboard/servicos',
  'support-tickets': '/dashboard/suporte',
};

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR');
}

export default function DashboardHome() {
  const { isAdminMaster, isCandidate } = useAuth();
  const { availableModules, activePermissions, identity } = useAccount();
  const stats = useGlobalDashboardStats();

  const kpis = useMemo(() => buildGlobalDashboardKpis(stats), [stats]);
  const metrics = useMemo<DashboardMetric[]>(
    () =>
      kpis.map((kpi) => ({
        id: kpi.id,
        label: kpi.label,
        value: kpi.value,
        description: kpi.description,
        icon: KPI_ICONS[kpi.id as keyof typeof KPI_ICONS] ?? BarChart3,
        href: KPI_ROUTES[kpi.id],
        permission: KPI_PERMISSIONS[kpi.id],
        format: 'number',
        tone:
          kpi.id === 'candidates' || kpi.id === 'jobs'
            ? 'warning'
            : kpi.id === 'support-tickets'
              ? 'danger'
              : kpi.id === 'applications' || kpi.id === 'people'
                ? 'primary'
                : kpi.id === 'service-orders'
                  ? 'neutral'
                  : 'success',
      })),
    [kpis],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  const moduleGroups = useMemo(
    () =>
      MODULE_GROUPS.map((group) => ({
        ...group,
        modules: availableModules.filter(
          (module) => module.category === group.category,
        ),
      })).filter((group) => group.modules.length > 0),
    [availableModules],
  );

  const operationalVolume = stats.serviceOrders + stats.supportTickets;

  if (!isAdminMaster && isCandidate) {
    return <Navigate to="/candidato" replace />;
  }

  return (
    <ModuleWorkspace
      title="Dashboard Global"
      description="Visão consolidada da plataforma e de todos os domínios autorizados."
      icon={LayoutDashboard}
      breadcrumbItems={[]}
    >
      <div className="space-y-6">
        <section className="from-primary/10 via-card to-card border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                <ShieldCheck className="h-4 w-4" />
                {isAdminMaster
                  ? 'Admin Master · Gestão Global'
                  : 'Portal · Visão consolidada'}
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {identity.greeting}, {identity.firstName}.
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                Controle central da plataforma: tenants, empresas, pessoas, RH,
                operação, suporte e demais domínios disponíveis para sua conta.
              </p>
            </div>
            <div className="text-muted-foreground text-sm lg:text-right">
              <p className="text-foreground font-medium">
                {identity.contextLabel}
              </p>
              <p>
                {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
              </p>
            </div>
          </div>
        </section>

        {stats.error ? (
          <DashboardErrorState message={stats.error} />
        ) : stats.loading ? (
          <DashboardSkeleton count={visibleMetrics.length || 8} />
        ) : visibleMetrics.length > 0 ? (
          <DashboardMetricGrid>
            {visibleMetrics.map((metric) => (
              <DashboardCard key={metric.id} metric={metric} />
            ))}
          </DashboardMetricGrid>
        ) : (
          <EmptyState
            title="Nenhum indicador disponível"
            description="Seu perfil não possui indicadores liberados para visualização."
          />
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <DashboardSection
            title="Todos os domínios"
            description="Acesso rápido aos módulos autorizados."
            icon={BarChart3}
          >
            <div className="space-y-6">
              {moduleGroups.map((group) => (
                <div key={group.category}>
                  <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.modules.map((module) => (
                      <NavLink
                        key={module.id}
                        to={module.route}
                        className="border-border bg-background hover:bg-muted group flex items-center gap-3 rounded-lg border p-3 transition-colors"
                      >
                        <span className="bg-primary/10 text-primary rounded-md p-2">
                          <ModuleIcon name={module.icon} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block truncate text-sm font-medium">
                            {module.title}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {module.description}
                          </span>
                        </span>
                        <ArrowUpRight className="text-muted-foreground h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>

          <div className="space-y-6">
            <DashboardSection
              title="Volume operacional"
              description="Ordens e chamados registrados."
              icon={Activity}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-foreground text-3xl font-bold">
                    {formatNumber(operationalVolume)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    registros operacionais
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-foreground">
                    {formatNumber(stats.serviceOrders)} ordens
                  </p>
                  <p className="text-muted-foreground">
                    {formatNumber(stats.supportTickets)} chamados
                  </p>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection
              title="Atividade recente"
              description="Últimos eventos registrados."
              icon={Activity}
            >
              {stats.recentEvents.length === 0 ? (
                <div className="border-border flex items-center gap-3 rounded-lg border border-dashed p-4">
                  <CheckCircle2 className="text-success h-5 w-5 shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    Nenhum evento recente encontrado.
                  </p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {stats.recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="bg-primary/10 text-primary rounded-full p-1.5">
                        <Activity className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {event.event_type}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {event.aggregate_type || 'Evento de domínio'}
                        </p>
                      </div>
                      <time className="text-muted-foreground shrink-0 text-[11px]">
                        {new Date(event.created_at).toLocaleDateString(
                          'pt-BR',
                          { day: '2-digit', month: '2-digit' },
                        )}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </DashboardSection>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NavLink
            to="/dashboard/financeiro"
            className="bg-card border-border hover:bg-muted flex items-center gap-4 rounded-xl border p-4 transition-colors"
          >
            <CircleDollarSign className="text-success h-6 w-6" />
            <div>
              <p className="text-foreground text-sm font-medium">Financeiro</p>
              <p className="text-muted-foreground text-xs">
                Contas, faturamento e fluxo financeiro.
              </p>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/estoque"
            className="bg-card border-border hover:bg-muted flex items-center gap-4 rounded-xl border p-4 transition-colors"
          >
            <Package className="text-primary h-6 w-6" />
            <div>
              <p className="text-foreground text-sm font-medium">Estoque</p>
              <p className="text-muted-foreground text-xs">
                Produtos e movimentações.
              </p>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/relatorios"
            className="bg-card border-border hover:bg-muted flex items-center gap-4 rounded-xl border p-4 transition-colors"
          >
            <FileText className="text-accent h-6 w-6" />
            <div>
              <p className="text-foreground text-sm font-medium">Relatórios</p>
              <p className="text-muted-foreground text-xs">
                Indicadores consolidados por domínio.
              </p>
            </div>
          </NavLink>
        </div>
      </div>
    </ModuleWorkspace>
  );
}
