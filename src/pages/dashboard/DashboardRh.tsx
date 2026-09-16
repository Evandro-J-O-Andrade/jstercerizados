import { useMemo, useState, useEffect } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
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
import { employeesRepository } from '@/repositories/employees.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { jobsRepository } from '@/repositories/jobs.repository';
import { applicationsRepository } from '@/repositories/applications.repository';
import { companiesRepository } from '@/repositories/companies.repository';

export default function DashboardRh() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const { activePermissions } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeCandidates: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    openJobs: 0,
    totalApplications: 0,
    totalClients: 0,
    activeClients: 0,
    recentAdmissions: 0,
    recentCandidates: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [
          candidatesData,
          employeesData,
          jobsData,
          applicationsData,
          clientsData,
        ] = await Promise.all([
          candidatesRepository.findAll(currentTenantId),
          employeesRepository.findAll(currentTenantId),
          jobsRepository.findAll(currentTenantId),
          applicationsRepository.findAll(currentTenantId),
          companiesRepository.findAll(currentTenantId),
        ]);

        if (!cancelled) {
          const activeCandidates = candidatesData.filter(
            (candidate) => candidate.status === 'active',
          ).length;
          const activeEmployees = employeesData.filter(
            (employee) => employee.status === 'active',
          ).length;
          const openJobs = jobsData.filter((job) =>
            ['published', 'draft'].includes(job.status),
          ).length;
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const recentAdmissions = employeesData.filter(
            (employee) =>
              employee.hire_date &&
              new Date(employee.hire_date) >= thirtyDaysAgo,
          ).length;
          const recentCandidates = candidatesData.filter(
            (candidate) => new Date(candidate.created_at) >= thirtyDaysAgo,
          ).length;

          setStats({
            totalCandidates: candidatesData.length,
            activeCandidates,
            totalEmployees: employeesData.length,
            activeEmployees,
            openJobs,
            totalApplications: applicationsData.length,
            totalClients: clientsData.length,
            activeClients: clientsData.filter(
              (client) => client.status === 'active',
            ).length,
            recentAdmissions,
            recentCandidates,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar dashboard',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentTenantId]);

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'candidates',
        label: 'Candidatos',
        value: stats.totalCandidates,
        description: `${stats.activeCandidates} ativos`,
        icon: UserPlus,
        tone: 'primary',
        href: '/dashboard/candidatos',
        permission: 'candidates.read',
        format: 'number',
      },
      {
        id: 'employees',
        label: 'Funcionários',
        value: stats.totalEmployees,
        description: `${stats.activeEmployees} ativos`,
        icon: Users,
        tone: 'success',
        href: '/dashboard/funcionarios',
        permission: 'people.read',
        format: 'number',
      },
      {
        id: 'open-jobs',
        label: 'Vagas abertas',
        value: stats.openJobs,
        description: `${stats.totalApplications} candidaturas`,
        icon: BriefcaseBusiness,
        tone: 'warning',
        href: '/dashboard/vagas',
        permission: 'jobs.read',
        format: 'number',
      },
      {
        id: 'clients',
        label: 'Clientes',
        value: stats.totalClients,
        description: `${stats.activeClients} ativos`,
        icon: Building2,
        tone: 'neutral',
        href: '/dashboard/empresas',
        permission: 'companies.read',
        format: 'number',
      },
      {
        id: 'recent-admissions',
        label: 'Admissões recentes',
        value: stats.recentAdmissions,
        description: 'Últimos 30 dias',
        icon: CalendarCheck,
        tone: 'success',
        permission: 'people.read',
        format: 'number',
      },
      {
        id: 'recent-candidates',
        label: 'Novos candidatos',
        value: stats.recentCandidates,
        description: 'Últimos 30 dias',
        icon: UserPlus,
        tone: 'primary',
        permission: 'candidates.read',
        format: 'number',
      },
      {
        id: 'applications-per-candidate',
        label: 'Candidaturas por candidato',
        value:
          stats.totalCandidates > 0
            ? Number(
                (stats.totalApplications / stats.totalCandidates).toFixed(2),
              )
            : 0,
        description: 'Média de candidaturas por candidato',
        icon: TrendingUp,
        tone: 'neutral',
        permission: 'applications.read',
        format: 'number',
      },
      {
        id: 'jobs-per-client',
        label: 'Vagas por cliente',
        value:
          stats.activeClients > 0
            ? Number((stats.openJobs / stats.activeClients).toFixed(2))
            : 0,
        description: 'Média por cliente ativo',
        icon: BriefcaseBusiness,
        tone: 'warning',
        permission: 'jobs.read',
        format: 'number',
      },
    ],
    [
      stats.activeCandidates,
      stats.activeClients,
      stats.activeEmployees,
      stats.openJobs,
      stats.recentAdmissions,
      stats.recentCandidates,
      stats.totalApplications,
      stats.totalCandidates,
      stats.totalClients,
      stats.totalEmployees,
    ],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  return (
    <ModuleWorkspace
      title="Dashboard RH"
      description="Visão geral do módulo de Recursos Humanos"
      icon={TrendingUp}
      breadcrumbItems={[{ label: 'Dashboard RH' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Nova ação
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {error ? (
          <DashboardErrorState message={error} />
        ) : isLoading ? (
          <DashboardSkeleton count={8} />
        ) : visibleMetrics.length > 0 ? (
          <DashboardMetricGrid>
            {visibleMetrics.map((metric) => (
              <DashboardCard key={metric.id} metric={metric} />
            ))}
          </DashboardMetricGrid>
        ) : (
          <DashboardErrorState message="Nenhum indicador de RH está liberado para o seu perfil." />
        )}
      </div>
    </ModuleWorkspace>
  );
}
