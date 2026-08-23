import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  ArrowUpRight,
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

  const stats = useMemo<StatCard[]>(() => {
    const base: StatCard[] = [];

    if (isAdminMaster) {
      base.push(
        {
          label: 'Candidatos',
          value: candidates.length,
          icon: Users,
          color: 'primary',
        },
        {
          label: 'Vagas',
          value: jobs.length,
          icon: Briefcase,
          color: 'success',
        },
        {
          label: 'Empresas',
          value: companies.length,
          icon: Building2,
          color: 'accent',
        },
        {
          label: 'Processos Seletivos',
          value: '—',
          icon: FileText,
          color: 'warning',
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
      });
    }
    if (canCandidates) {
      base.push({
        label: 'Candidatos',
        value: candidates.length,
        icon: Users,
        color: 'primary',
        href: '/dashboard/candidatos',
      });
    }
    if (canCompanies) {
      base.push({
        label: 'Empresas',
        value: companies.length,
        icon: Building2,
        color: 'accent',
        href: '/dashboard/empresas',
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

  const roleNames = useMemo(
    () => roles.map((r) => r.display_name || r.name).join(', '),
    [roles],
  );

  const userPermissions = useMemo(
    () => permissions.map((p) => `${p.resource}.${p.action}`),
    [permissions],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold">
          {greeting ? `Bem-vindo, ${greeting} 👋` : 'Bem-vindo 👋'}
        </h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {error && <div className="text-destructive text-sm">{error}</div>}

      {!isLoading && !error && (
        <>
          {stats.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat, index) => (
                <Card
                  key={stat.label}
                  className={cn(
                    'p-6',
                    stat.href && 'hover:border-primary/40 transition-colors',
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg',
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
                      <p className="text-muted-foreground text-sm">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {stats.length === 0 && !isLoading && (
            <Card className="p-6">
              <p className="text-muted-foreground text-sm">
                Não há dados suficientes para este indicador.
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-foreground mb-4 text-lg font-semibold">
                Visão geral
              </h2>
              <p className="text-muted-foreground text-sm">
                Utilize a navegação lateral para acessar os módulos permitidos
                pelo seu perfil. Os indicadores acima são carregados a partir
                dos dados reais da plataforma.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-foreground mb-4 text-lg font-semibold">
                Acesso rápido
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
                      <ArrowUpRight className="h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhuma ação rápida disponível para este perfil.
                </p>
              )}
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Informações do Usuário
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Roles</p>
                <p className="text-foreground font-medium">
                  {roleNames || 'Nenhuma'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Permissões</p>
                <p className="text-foreground font-medium">
                  {userPermissions.length} permissões
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
