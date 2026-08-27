import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { employeesRepository } from '@/repositories/employees.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { jobsRepository } from '@/repositories/jobs.repository';
import { applicationsRepository } from '@/repositories/applications.repository';
import { companiesRepository } from '@/repositories/companies.repository';

export default function DashboardRh() {
  const { currentTenantId, isAdminMaster } = useAuth();
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
            (c) => c.status === 'active',
          ).length;
          const activeEmployees = employeesData.filter(
            (e) => e.status === 'active',
          ).length;
          const openJobs = jobsData.filter(
            (j) => j.status === 'published' || j.status === 'draft',
          ).length;

          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentAdmissions = employeesData.filter(
            (e) => e.hire_date && new Date(e.hire_date) >= thirtyDaysAgo,
          ).length;

          const recentCandidates = candidatesData.filter(
            (c) => new Date(c.created_at) >= thirtyDaysAgo,
          ).length;

          setStats({
            totalCandidates: candidatesData.length,
            activeCandidates,
            totalEmployees: employeesData.length,
            activeEmployees,
            openJobs,
            totalApplications: applicationsData.length,
            totalClients: clientsData.length,
            activeClients: clientsData.filter((c) => c.status === 'active')
              .length,
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
        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                  Candidatos
                </div>
                <div className="text-3xl font-bold">
                  {stats.totalCandidates}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {stats.activeCandidates} ativos
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                  Funcionários
                </div>
                <div className="text-3xl font-bold">{stats.totalEmployees}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {stats.activeEmployees} ativos
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                  Vagas Abertas
                </div>
                <div className="text-3xl font-bold">{stats.openJobs}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {stats.totalApplications} candidaturas
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                  Clientes
                </div>
                <div className="text-3xl font-bold">{stats.totalClients}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {stats.activeClients} ativos
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                  Admissões Recentes
                </div>
                <div className="text-success text-3xl font-bold">
                  {stats.recentAdmissions}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Últimos 30 dias
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                  Novos Candidatos
                </div>
                <div className="text-primary text-3xl font-bold">
                  {stats.recentCandidates}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Últimos 30 dias
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                  Taxa de Aprovação
                </div>
                <div className="text-3xl font-bold">
                  {stats.totalApplications > 0
                    ? Math.round(
                        (stats.totalApplications / stats.totalCandidates) * 100,
                      )
                    : 0}
                  %
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Candidaturas por candidato
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                  Vagas por Cliente
                </div>
                <div className="text-3xl font-bold">
                  {stats.activeClients > 0
                    ? Math.round(stats.openJobs / stats.activeClients)
                    : 0}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Média por cliente ativo
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </ModuleWorkspace>
  );
}

