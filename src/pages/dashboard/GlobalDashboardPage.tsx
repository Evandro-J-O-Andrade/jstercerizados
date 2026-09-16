import { useMemo } from 'react';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Headphones,
  LayoutDashboard,
  ShieldCheck,
  Users,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleCard } from '@/components/portal/ModuleCard';
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
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalDashboardStats } from '@/hooks/useGlobalDashboardStats';

export default function GlobalDashboardPage() {
  const { identity, activePermissions, availableModules } = useAccount();
  const { isAdminMaster } = useAuth();
  const stats = useGlobalDashboardStats();

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'tenants',
        label: 'Tenants',
        value: stats.tenants,
        description: 'Ambientes ativos na plataforma',
        icon: Building2,
        tone: 'primary',
        href: '/dashboard/tenants',
        permission: 'tenants.read',
        format: 'number',
      },
      {
        id: 'companies',
        label: 'Empresas',
        value: stats.companies,
        description: 'Empresas cadastradas',
        icon: Building2,
        tone: 'success',
        href: '/dashboard/empresas',
        permission: 'companies.read',
        format: 'number',
      },
      {
        id: 'people',
        label: 'Usuários',
        value: stats.people,
        description: 'Pessoas com identidade na plataforma',
        icon: Users,
        tone: 'primary',
        href: '/dashboard/usuarios',
        permission: 'people.read',
        format: 'number',
      },
      {
        id: 'candidates',
        label: 'Candidatos',
        value: stats.candidates,
        description: 'Candidatos no banco de talentos',
        icon: UserPlus,
        tone: 'warning',
        href: '/dashboard/candidatos',
        permission: 'candidates.read',
        format: 'number',
      },
      {
        id: 'jobs',
        label: 'Vagas',
        value: stats.jobs,
        description: 'Vagas cadastradas',
        icon: BriefcaseBusiness,
        tone: 'success',
        href: '/dashboard/vagas',
        permission: 'jobs.read',
        format: 'number',
      },
      {
        id: 'applications',
        label: 'Candidaturas',
        value: stats.applications,
        description: 'Candidaturas registradas',
        icon: ClipboardList,
        tone: 'primary',
        href: '/dashboard/candidaturas',
        permission: 'applications.read',
        format: 'number',
      },
      {
        id: 'service-orders',
        label: 'Ordens de serviço',
        value: stats.serviceOrders,
        description: 'Ordens operacionais registradas',
        icon: Wrench,
        tone: 'neutral',
        href: '/dashboard/servicos',
        permission: 'service_orders.read',
        format: 'number',
      },
      {
        id: 'support-tickets',
        label: 'Chamados',
        value: stats.supportTickets,
        description: 'Chamados de suporte registrados',
        icon: Headphones,
        tone: 'danger',
        href: '/dashboard/suporte',
        permission: 'support_tickets.read',
        format: 'number',
      },
    ],
    [
      stats.applications,
      stats.candidates,
      stats.companies,
      stats.jobs,
      stats.people,
      stats.serviceOrders,
      stats.supportTickets,
      stats.tenants,
    ],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );
  const modules = availableModules.filter((module) => module.id !== 'inicio');

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

        <DashboardSection
          title="Atividade recente da plataforma"
          description="Eventos operacionais registrados nos domínios autorizados."
          icon={Activity}
        >
          {stats.recentEvents.length === 0 ? (
            <EmptyState
              title="Nenhum evento recente"
              description="Quando houver atividade na plataforma, ela aparecerá aqui."
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-lg border">
              <table className="divide-border min-w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Evento
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Domínio
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {stats.recentEvents.slice(0, 8).map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3 text-sm font-medium">
                        {event.event_type}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {event.aggregate_type || '—'}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm whitespace-nowrap">
                        {new Date(event.created_at).toLocaleDateString(
                          'pt-BR',
                          {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>

        {modules.length > 0 && (
          <DashboardSection
            title="Módulos do Portal"
            description="Acesse as áreas operacionais disponíveis para o seu perfil."
            icon={BarChart3}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.slice(0, 6).map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  permissions={activePermissions}
                />
              ))}
            </div>
          </DashboardSection>
        )}
      </div>
    </ModuleWorkspace>
  );
}
