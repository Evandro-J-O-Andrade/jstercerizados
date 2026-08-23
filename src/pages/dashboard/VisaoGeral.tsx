import { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  Users,
  Briefcase,
  Building2,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
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
}

export default function VisaoGeral() {
  const { currentTenantId, roles, permissions, isAdminMaster } = useAuth();
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

  const stats = useMemo<StatCard[]>(() => {
    if (!isAdminMaster) return [];

    return [
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
      {
        label: 'Leads',
        value: '—',
        icon: TrendingUp,
        color: 'primary',
      },
      {
        label: 'Financeiro',
        value: '—',
        icon: TrendingUp,
        color: 'success',
      },
    ];
  }, [isAdminMaster, jobs.length, candidates.length, companies.length]);

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
        <h1 className="text-foreground text-2xl font-bold">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          {isAdminMaster
            ? 'Painel administrativo com visão geral do sistema.'
            : 'Bem-vindo à sua área de trabalho.'}
        </p>
      </div>

      {isLoading && (
        <div className="text-muted-foreground text-sm">Carregando dados...</div>
      )}

      {error && <div className="text-destructive text-sm">{error}</div>}

      {!isLoading && !error && isAdminMaster && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="p-6"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg',
                    stat.color === 'primary' && 'bg-primary/10 text-primary',
                    stat.color === 'success' && 'bg-success/10 text-success',
                    stat.color === 'accent' && 'bg-accent/10 text-accent',
                    stat.color === 'warning' && 'bg-warning/10 text-warning',
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-foreground text-2xl font-bold">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
    </div>
  );
}
