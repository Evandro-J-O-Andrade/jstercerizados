import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Briefcase,
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
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleIcon } from '@/components/portal/PortalSidebar';
import { getSupabaseClient } from '@/lib/supabase';
import {
  buildGlobalDashboardKpis,
  type GlobalDashboardStats,
} from './global-dashboard-model';

interface DashboardStats extends GlobalDashboardStats {
  notifications: number;
  recentEvents: Array<{
    id: string;
    event_name: string;
    aggregate_type: string;
    created_at: string;
  }>;
  loading: boolean;
  error: string | null;
}

const ICONS = {
  tenants: Building2,
  companies: Building2,
  people: Users,
  candidates: Users,
  jobs: Briefcase,
  applications: FileText,
  'service-orders': Wrench,
  'support-tickets': Headphones,
} as const;

const MODULE_GROUPS = [
  { category: 'plataforma', label: 'Plataforma' },
  { category: 'negocio', label: 'Operação' },
  { category: 'ia', label: 'IA & Automação' },
  { category: 'seguranca', label: 'Segurança' },
  { category: 'documentos', label: 'Documentos' },
] as const;

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR');
}

function permissionGranted(
  permissions: { resource: string; action: string }[],
  permission: string,
) {
  if (!permission) return true;
  return permissions.some(
    (item) => `${item.resource}.${item.action}` === permission,
  );
}

export default function DashboardHome() {
  const {
    currentTenantId,
    tenantMemberships,
    isAdminMaster,
    roles,
    roleAssignments,
  } = useAuth();
  const { availableModules, activePermissions, identity } = useAccount();

  const [stats, setStats] = useState<DashboardStats>({
    tenants: 0,
    companies: 0,
    people: 0,
    candidates: 0,
    jobs: 0,
    applications: 0,
    serviceOrders: 0,
    supportTickets: 0,
    notifications: 0,
    recentEvents: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: 'Supabase não está configurado.',
        }));
        return;
      }

      try {
        const activeTenantId =
          currentTenantId || tenantMemberships[0]?.tenant_id;
        const globalScope = isAdminMaster;

        const countTable = async (table: string) => {
          let query = supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          if (!globalScope && activeTenantId)
            query = query.eq('tenant_id', activeTenantId);
          const { count, error } = await query;
          if (error) throw error;
          return count ?? 0;
        };

        const [
          tenants,
          companies,
          people,
          candidates,
          jobs,
          applications,
          serviceOrders,
          supportTickets,
        ] = await Promise.all([
          globalScope ? countTable('tenants') : Promise.resolve(0),
          countTable('companies'),
          countTable('people'),
          countTable('candidates'),
          countTable('jobs'),
          countTable('applications'),
          countTable('service_orders'),
          countTable('support_tickets'),
        ]);

        let eventsQuery = supabase
          .from('domain_events')
          .select('id, event_name, aggregate_type, created_at')
          .order('created_at', { ascending: false })
          .limit(8);
        if (!globalScope && activeTenantId) {
          eventsQuery = eventsQuery.eq('tenant_id', activeTenantId);
        }
        const { data: events, error: eventsError } = await eventsQuery;
        if (eventsError) throw eventsError;

        if (cancelled) return;
        setStats({
          tenants,
          companies,
          people,
          candidates,
          jobs,
          applications,
          serviceOrders,
          supportTickets,
          notifications: 0,
          recentEvents: events ?? [],
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os indicadores.';
        console.error('[DASHBOARD:GLOBAL] Failed to load stats:', error);
        setStats((prev) => ({ ...prev, loading: false, error: message }));
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [currentTenantId, isAdminMaster, tenantMemberships]);

  const kpis = useMemo(() => buildGlobalDashboardKpis(stats), [stats]);
  const visibleKpis = useMemo(
    () =>
      kpis.filter((kpi) => {
        const permissionById: Record<string, string> = {
          tenants: 'tenants.read',
          companies: 'companies.read',
          people: 'people.read',
          candidates: 'candidates.read',
          jobs: 'jobs.read',
          applications: 'applications.read',
          'service-orders': 'service_orders.read',
          'support-tickets': 'support.read',
        };
        return (
          isAdminMaster ||
          permissionGranted(activePermissions, permissionById[kpi.id])
        );
      }),
    [activePermissions, isAdminMaster, kpis],
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

  const isCandidate = (roleAssignments || []).some((ra) => {
    const role = (roles || []).find((r) => r.id === ra.role_id);
    return role?.name === 'candidate';
  });

  if (isCandidate && !isAdminMaster) {
    return <Navigate to="/dashboard/candidato" replace />;
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
                Admin Master · Gestão Global
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

        {stats.error && (
          <section className="border-warning/30 bg-warning/10 text-warning rounded-xl border p-4 text-sm">
            Não foi possível carregar todos os indicadores. O painel continua
            exibindo os dados disponíveis.
            <span className="sr-only"> {stats.error}</span>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-foreground text-lg font-semibold">
                Visão executiva
              </h3>
              <p className="text-muted-foreground text-sm">
                Indicadores agregados em tempo real a partir do banco.
              </p>
            </div>
            <div className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
              <span className="bg-success h-2 w-2 rounded-full" />
              Dados ao vivo
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-card border-border animate-pulse rounded-xl border p-5"
                  >
                    <div className="bg-muted h-4 w-28 rounded" />
                    <div className="bg-muted mt-4 h-8 w-20 rounded" />
                    <div className="bg-muted mt-3 h-3 w-36 rounded" />
                  </div>
                ))
              : visibleKpis.map((kpi, index) => {
                  const Icon = ICONS[kpi.id as keyof typeof ICONS] ?? BarChart3;
                  return (
                    <motion.div
                      key={kpi.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="bg-card border-border group rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="bg-primary/10 text-primary rounded-lg p-2.5">
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowUpRight className="text-muted-foreground h-4 w-4 opacity-50 transition-opacity group-hover:opacity-100" />
                      </div>
                      <p className="text-foreground mt-5 text-2xl font-bold">
                        {formatNumber(kpi.value)}
                      </p>
                      <p className="text-foreground mt-1 text-sm font-medium">
                        {kpi.label}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {kpi.description}
                      </p>
                    </motion.div>
                  );
                })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-foreground font-semibold">
                  Todos os domínios
                </h3>
                <p className="text-muted-foreground text-sm">
                  Acesso rápido aos módulos autorizados.
                </p>
              </div>
              <BarChart3 className="text-muted-foreground h-5 w-5" />
            </div>

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
          </div>

          <div className="space-y-6">
            <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-semibold">
                    Volume operacional
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Ordens e chamados registrados.
                  </p>
                </div>
                <Activity className="text-primary h-5 w-5" />
              </div>
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
            </div>

            <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground font-semibold">
                    Atividade recente
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Últimos eventos registrados.
                  </p>
                </div>
                <Activity className="text-muted-foreground h-5 w-5" />
              </div>
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
                          {event.event_name}
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
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        </section>
      </div>
    </ModuleWorkspace>
  );
}
