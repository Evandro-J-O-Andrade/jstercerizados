import { useMemo } from 'react';
import { BarChart3, BriefcaseBusiness, Building2, Users } from 'lucide-react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
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
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalDashboardStats } from '@/hooks/useGlobalDashboardStats';

export default function GestaoPage() {
  const { activePermissions } = useAccount();
  const { isAdminMaster } = useAuth();
  const stats = useGlobalDashboardStats();

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'companies',
        label: 'Empresas',
        value: stats.companies,
        description: 'Empresas cadastradas na operação',
        icon: Building2,
        tone: 'success',
        href: '/dashboard/empresas',
        permission: 'companies.read',
        format: 'number',
      },
      {
        id: 'people',
        label: 'Colaboradores',
        value: stats.people,
        description: 'Pessoas vinculadas à operação',
        icon: Users,
        tone: 'primary',
        href: '/dashboard/usuarios',
        permission: 'people.read',
        format: 'number',
      },
      {
        id: 'jobs',
        label: 'Vagas',
        value: stats.jobs,
        description: 'Vagas cadastradas no recrutamento',
        icon: BriefcaseBusiness,
        tone: 'warning',
        href: '/dashboard/vagas',
        permission: 'jobs.read',
        format: 'number',
      },
    ],
    [stats.companies, stats.jobs, stats.people],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  return (
    <ModuleWorkspace
      title="Gestão"
      description="Indicadores e operação da empresa."
      icon={BarChart3}
      breadcrumbItems={[{ label: 'Gestão' }]}
    >
      <div className="space-y-6">
        {stats.error ? (
          <DashboardErrorState message={stats.error} />
        ) : stats.loading ? (
          <DashboardSkeleton count={3} />
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
      </div>
    </ModuleWorkspace>
  );
}
