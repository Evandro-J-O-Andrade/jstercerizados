import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  ArrowUpRight,
  Activity,
  Inbox,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jobsRepository } from '@/repositories/jobs.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { companiesRepository } from '@/repositories/companies.repository';
import { cn } from '@/utils';
import type { Job, Candidate, Company } from '@/types/domain';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'success' | 'accent' | 'warning';
  href?: string;
  description?: string;
}

export default function VisaoGeral() {
  const { currentTenantId, roles, permissions, isAdminMaster, person } =
    useAuth();
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
  const roleLabel = primaryRole?.display_name || primaryRole?.name || null;

  const subtitle = useMemo(() => {
    if (isAdminMaster) {
      return 'VisÃ£o geral da plataforma.';
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
        return 'Acompanhe suas vagas e processos de contrataÃ§Ã£o.';
      }
    }
    return 'Aqui estÃ¡ o resumo da sua operaÃ§Ã£o.';
  }, [isAdminMaster, roleLabel]);

  const stats = useMemo<StatCard[]>(() => {
    const base: StatCard[] = [];

    if (isAdminMaster) {
      base.push(
        {
          label: 'Candidatos',
          value: candidates.length,
          icon: Users,
          color: 'primary',
          href: '/dashboard/candidatos',
          description: 'Cadastrados na plataforma',
        },
        {
          label: 'Vagas',
          value: jobs.length,
          icon: Briefcase,
          color: 'success',
          href: '/dashboard/vagas',
          description: 'Publicadas',
        },
        {
          label: 'Empresas',
          value: companies.length,
          icon: Building2,
          color: 'accent',
          href: '/dashboard/empresas',
          description: 'Parceiras cadastradas',
        },
        {
          label: 'Processos',
          value: 'â€”',
          icon: FileText,
          color: 'warning',
          href: '/dashboard/processos-seletivos',
          description: 'Em andamento',
        },
      );
      return base;
    }

    const canJobs = permissions.some(
      (p) => `${p.resource}.${p.action}` === 'jobs.read',
    );
    const canCandidates = permissions.some(
      (p) => `${p.resource}.${p.action}` === 'candidates.read',
    );
    const canCompanies = permissions.some(
      (p) => `${p.resource}.${p.action}` === 'companies.read',
    );

    if (canJobs) {
      base.push({
        label: 'Vagas',
        value: jobs.length,
        icon: Briefcase,
        color: 'success',
        href: '/dashboard/vagas',
        description: 'Publicadas',
      });
    }
    if (canCandidates) {
      base.push({
        label: 'Candidatos',
        value: candidates.length,
        icon: Users,
        color: 'primary',
        href: '/dashboard/candidatos',
        description: 'Cadastrados',
      });
    }
    if (canCompanies) {
      base.push({
        label: 'Empresas',
        value: companies.length,
        icon: Building2,
        color: 'accent',
        href: '/dashboard/empresas',
        description: 'Parceiras',
      });
    }

    return base;
  }, [
    isAdminMaster,
    jobs.length,
    candidates.length,
    companies.length,
    permissions,
  ]);

  const quickActions = useMemo(() => {
    const actions: { label: string; href: string; permission?: string }[] = [];

    if (isAdminMaster) {
      actions.push(
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
      );
      return actions;
    }

    const canCreateJob = permissions.some(
      (p) => `${p.resource}.${p.action}` === 'jobs.create',
    );
    const canCreateCandidate = permissions.some(
      (p) => `${p.resource}.${p.action}` === 'candidates.create',
    );
    const canCreateCompany = permissions.some(
      (p) => `${p.resource}.${p.action}` === 'companies.create',
    );

    if (canCreateJob)
      actions.push({ label: 'Publicar vaga', href: '/dashboard/vagas' });
    if (canCreateCandidate)
      actions.push({
        label: 'Cadastrar candidato',
        href: '/dashboard/candidatos',
      });
    if (canCreateCompany)
      actions.push({ label: 'Nova empresa', href: '/dashboard/empresas' });

    return actions;
  }, [isAdminMaster, permissions]);

  const recentJobs = useMemo(() => jobs.slice(0, 5), [jobs]);
  const recentCandidates = useMemo(() => candidates.slice(0, 5), [candidates]);

  const isEmpty =
    !isLoading && !error && jobs.length === 0 && candidates.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          {greeting ? greeting : 'Bem-vindo'}
        </h1>
        <p className="text-muted-foreground mt-2 text-base">{subtitle}</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: stats.length || 4 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-muted h-12 w-12 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                  <div className="bg-muted h-6 w-24 animate-pulse rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5 p-6">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          {stats.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card
                  key={stat.label}
                  className={cn(
                    'group relative overflow-hidden p-6 transition-all duration-200 hover:shadow-lg',
                    stat.href && 'cursor-pointer',
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => stat.href && navigate(stat.href)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl',
                          stat.color === 'primary' &&
                            'bg-primary/10 text-primary',
                          stat.color === 'success' &&
                            'bg-success/10 text-success',
                          stat.color === 'accent' && 'bg-accent/10 text-accent',
                          stat.color === 'warning' &&
                            'bg-warning/10 text-warning',
                        )}
                      >
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-foreground text-2xl font-bold">
                          {stat.value}
                        </p>
                        <p className="text-muted-foreground text-sm font-medium">
                          {stat.label}
                        </p>
                        {stat.description && (
                          <p className="text-muted-foreground/70 mt-0.5 text-xs">
                            {stat.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {stat.href && (
                      <ArrowUpRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {isEmpty && (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Inbox className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">
                  Tudo pronto por aqui
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md text-sm">
                  Quando vocÃª publicar vagas e receber candidatos, os dados
                  aparecerÃ£o aqui automaticamente. Use o menu lateral para
                  comeÃ§ar.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/dashboard/vagas')}
                  >
                    Publicar vaga
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard/candidatos')}
                  >
                    Ver candidatos
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">
                  VisÃ£o geral
                </h2>
                <Activity className="text-muted-foreground h-5 w-5" />
              </div>
              <p className="text-muted-foreground text-sm">
                Utilize a navegaÃ§Ã£o lateral para acessar os mÃ³dulos
                permitidos pelo seu perfil. Os indicadores acima sÃ£o carregados
                a partir dos dados reais da plataforma.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-foreground mb-4 text-lg font-semibold">
                Acesso rÃ¡pido
              </h2>
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
                  Nenhuma aÃ§Ã£o rÃ¡pida disponÃ­vel para este perfil.
                </p>
              )}
            </Card>
          </div>

          {(jobs.length > 0 || candidates.length > 0) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-semibold">
                    Vagas recentes
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/vagas')}
                  >
                    Ver todas
                  </Button>
                </div>
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
                      <span
                        className={cn(
                          'ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          job.status === 'published' &&
                            'bg-success/10 text-success',
                          job.status === 'draft' &&
                            'bg-warning/10 text-warning',
                          job.status === 'archived' &&
                            'bg-muted text-muted-foreground',
                          job.status === 'hired' &&
                            'bg-primary/10 text-primary',
                          job.status === 'expired' &&
                            'bg-destructive/10 text-destructive',
                        )}
                      >
                        {job.status === 'published'
                          ? 'Publicada'
                          : job.status === 'draft'
                            ? 'Rascunho'
                            : job.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-semibold">
                    Candidatos recentes
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/candidatos')}
                  >
                    Ver todos
                  </Button>
                </div>
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
                        className={cn(
                          'ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          candidate.status === 'active'
                            ? 'bg-success/10 text-success'
                            : candidate.status === 'inactive'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-muted text-muted-foreground',
                        )}
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
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
