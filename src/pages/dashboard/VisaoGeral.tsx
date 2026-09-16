import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  FileText,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useNavigate } from 'react-router-dom';
import { jobsRepository } from '@/repositories/jobs.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { companiesRepository } from '@/repositories/companies.repository';
import type { Job, Candidate, Company } from '@/types/domain';

export default function VisaoGeral() {
  const { currentTenantId, roles, isAdminMaster, person } = useAuth();
  const { activePermissions } = useAccount();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [jobsData, candidatesData, companiesData] = await Promise.all([
          jobsRepository.findAll(currentTenantId),
          candidatesRepository.findAll(currentTenantId),
          companiesRepository.findAll(currentTenantId),
        ]);

        if (!cancelled) {
          setJobs(jobsData);
          setCandidates(candidatesData);
          setCompanies(companiesData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar dados',
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

  const displayName = person?.full_name?.trim() || null;
  const firstName = displayName?.split(' ')[0] || null;
  const greeting = firstName || displayName || null;

  const primaryRole = roles[0];
  const roleLabel = primaryRole?.name || null;

  const subtitle = useMemo(() => {
    if (isAdminMaster) {
      return 'Visão geral da plataforma.';
    }
    if (roleLabel) {
      const lower = roleLabel.toLowerCase();
      if (lower.includes('recrut') || lower.includes('rh')) {
        return 'Acompanhe seus processos seletivos e candidatos.';
      }
      if (lower.includes('candidato')) {
        return 'Confira suas oportunidades e candidaturas.';
      }
      if (lower.includes('empresa')) {
        return 'Acompanhe suas vagas e processos de contratação.';
      }
    }
    return 'Aqui está o resumo da sua operação.';
  }, [isAdminMaster, roleLabel]);

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'candidates',
        label: 'Candidatos',
        value: candidates.length,
        description: 'Cadastrados na plataforma',
        icon: Users,
        tone: 'primary',
        href: '/dashboard/candidatos',
        permission: 'candidates.read',
        format: 'number',
      },
      {
        id: 'jobs',
        label: 'Vagas',
        value: jobs.length,
        description: 'Vagas publicadas',
        icon: BriefcaseBusiness,
        tone: 'success',
        href: '/dashboard/vagas',
        permission: 'jobs.read',
        format: 'number',
      },
      {
        id: 'companies',
        label: 'Empresas',
        value: companies.length,
        description: 'Empresas parceiras cadastradas',
        icon: Building2,
        tone: 'neutral',
        href: '/dashboard/empresas',
        permission: 'companies.read',
        format: 'number',
      },
      {
        id: 'processos',
        label: 'Processos',
        value: jobs.length,
        description: 'Processos seletivos em andamento',
        icon: FileText,
        tone: 'warning',
        href: '/dashboard/processos-seletivos',
        permission: 'jobs.read',
        format: 'number',
      },
    ],
    [candidates.length, companies.length, jobs.length],
  );
  const visibleMetrics = filterDashboardMetrics(
    metrics,
    activePermissions,
    isAdminMaster,
  );

  const quickActions = useMemo(
    () =>
      [
        {
          label: 'Publicar vaga',
          href: '/dashboard/vagas',
          permission: 'jobs.create',
        },
        {
          label: 'Cadastrar candidato',
          href: '/dashboard/candidatos',
          permission: 'candidates.create',
        },
        {
          label: 'Nova empresa',
          href: '/dashboard/empresas',
          permission: 'companies.create',
        },
      ].filter(
        (action) =>
          isAdminMaster ||
          activePermissions.some(
            (item) => `${item.resource}.${item.action}` === action.permission,
          ),
      ),
    [activePermissions, isAdminMaster],
  );

  const recentJobs = useMemo(() => jobs.slice(0, 5), [jobs]);
  const recentCandidates = useMemo(() => candidates.slice(0, 5), [candidates]);
  const isEmpty =
    !isLoading &&
    !error &&
    jobs.length === 0 &&
    candidates.length === 0 &&
    companies.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          {greeting || 'Bem-vindo'}
        </h1>
        <p className="text-muted-foreground mt-2 text-base">{subtitle}</p>
      </div>

      {error ? (
        <DashboardErrorState
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : isLoading ? (
        <DashboardSkeleton count={visibleMetrics.length || 4} />
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

      {isEmpty && (
        <EmptyState
          title="Tudo pronto por aqui"
          description="Quando você publicar vagas e receber candidatos, os dados aparecerão aqui automaticamente."
          actionLabel="Publicar vaga"
          onAction={() => navigate('/dashboard/vagas')}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardSection
          title="Visão geral"
          description="Utilize a navegação lateral para acessar os módulos permitidos pelo seu perfil."
          icon={Activity}
          className="lg:col-span-2"
        >
          <p className="text-muted-foreground text-sm">
            Os indicadores são carregados a partir dos dados reais da
            plataforma.
          </p>
        </DashboardSection>

        <DashboardSection
          title="Acesso rápido"
          description="Ações disponíveis para o seu perfil."
          icon={ArrowUpRight}
        >
          {quickActions.length > 0 ? (
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate(action.href)}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nenhuma ação rápida disponível para este perfil.
            </p>
          )}
        </DashboardSection>
      </div>

      {(jobs.length > 0 || candidates.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardSection
            title="Vagas recentes"
            description="Últimas vagas cadastradas."
            icon={BriefcaseBusiness}
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/vagas')}
              >
                Ver todas
              </Button>
            }
          >
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="border-border/50 hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {job.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {job.location || 'Sem localização'}
                    </p>
                  </div>
                  <span className="bg-success/10 text-success ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {job.status === 'published'
                      ? 'Publicada'
                      : job.status === 'draft'
                        ? 'Rascunho'
                        : job.status}
                  </span>
                </div>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Candidatos recentes"
            description="Últimos candidatos cadastrados."
            icon={Users}
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/candidatos')}
              >
                Ver todos
              </Button>
            }
          >
            <div className="space-y-3">
              {recentCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border-border/50 hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {candidate.person?.full_name || 'Sem nome'}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {candidate.person?.email || 'Sem email'}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      candidate.status === 'active'
                        ? 'bg-success/10 text-success'
                        : candidate.status === 'inactive'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {candidate.status === 'active'
                      ? 'Ativo'
                      : candidate.status === 'inactive'
                        ? 'Inativo'
                        : candidate.status}
                  </span>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      )}
    </div>
  );
}
