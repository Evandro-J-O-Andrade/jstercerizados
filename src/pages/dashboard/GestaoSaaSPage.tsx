import { useMemo } from 'react';
import { Activity, BarChart3, Building2, Users } from 'lucide-react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
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

export default function GestaoSaaSPage() {
  const { activePermissions } = useAccount();
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
        tone: 'warning',
        href: '/dashboard/usuarios',
        permission: 'people.read',
        format: 'number',
      },
      {
        id: 'events',
        label: 'Eventos recentes',
        value: stats.recentEvents.length,
        description: 'Eventos registrados na plataforma',
        icon: Activity,
        tone: 'neutral',
        permission: 'domain_events.read',
        format: 'number',
      },
    ],
    [stats.companies, stats.people, stats.recentEvents.length, stats.tenants],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  return (
    <ModuleWorkspace
      title="Gestão SaaS"
      description="Métricas, crescimento e saúde da plataforma."
      icon={BarChart3}
      breadcrumbItems={[
        { label: 'Gestão SaaS', href: '/dashboard/gestao-saas' },
      ]}
    >
      <div className="space-y-6">
        {stats.error ? (
          <DashboardErrorState message={stats.error} />
        ) : stats.loading ? (
          <DashboardSkeleton count={4} />
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
          title="Eventos recentes da plataforma"
          description="Atividade operacional registrada nos domínios autorizados."
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
                      Tipo
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Descrição
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {stats.recentEvents.slice(0, 10).map((event) => (
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
      </div>
    </ModuleWorkspace>
  );
}
