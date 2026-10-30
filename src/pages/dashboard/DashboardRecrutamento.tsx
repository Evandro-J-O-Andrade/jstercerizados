import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';
import { fetchModuleStats, type ModuleStats } from '@/lib/module-stats';
import type { ModuleDefinition } from '@/components/legacy/portal/ModuleRegistry';
import {
  jobsRepository,
} from '@/modules/recrutamento/repositories/jobs.repository';
import {
  applicationsRepository,
} from '@/modules/recrutamento/repositories/applications.repository';
import {
  recruitmentProcessRepository,
} from '@/modules/recrutamento/repositories/recruitment-process.repository';
import type { ApplicationListItem } from '@/modules/recrutamento/types';
import type { RecruitmentProcess } from '@/types/domain/recruitment-process';
import {
  getJobStatusLabel,
} from '@/modules/recrutamento/constants/jobStatus';
import {
  Clock,
  Briefcase,
  Users,
  FileText,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
} from 'lucide-react';

type StatusBadgeProps = { status: string };

function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-success/10 text-success border border-success/20',
    paused: 'bg-warning/10 text-warning border border-warning/20',
    closed: 'bg-destructive/10 text-destructive border border-destructive/20',
    filled: 'bg-secondary/10 text-secondary border border-secondary/20',
    cancelled: 'bg-destructive/10 text-destructive border border-destructive/20',
    applied: 'bg-muted text-muted-foreground',
    screening: 'bg-blue/10 text-blue border border-blue/20',
    interview: 'bg-purple/10 text-purple border border-purple/20',
    offer: 'bg-orange/10 text-orange border border-orange/20',
    hired: 'bg-success/10 text-success border border-success/20',
    rejected: 'bg-destructive/10 text-destructive border border-destructive/20',
    withdrawn: 'bg-muted text-muted-foreground',
    planning: 'bg-muted text-muted-foreground',
    open: 'bg-success/10 text-success border border-success/20',
    in_progress: 'bg-blue/10 text-blue border border-blue/20',
    completed: 'bg-secondary/10 text-secondary border border-secondary/20',
    cancelled_process: 'bg-destructive/10 text-destructive',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${variants[status] || 'bg-muted text-muted-foreground'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { label: string; value: number; positive: boolean };
}) {
  const TrendIcon = trend?.positive ? TrendingUp : TrendingDown;
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-success' : 'text-destructive'}`}>
              <TrendIcon className="h-3 w-3" />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </Card>
  );
}

export default function DashboardRecrutamento() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const { addToast } = useToast();

  const canRead = hasAnyPermission([
    'jobs.read',
    'candidates.read',
    'applications.read',
    'recruitment.read',
  ]);

  const [moduleStats, setModuleStats] = useState<ModuleStats | null>(null);
  const [jobsStats, setJobsStats] = useState<{
    total: number;
    draft: number;
    published: number;
    paused: number;
    closed: number;
    filled: number;
  } | null>(null);
  const [applicationsStats, setApplicationsStats] = useState<{
    total: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
    new_today: number;
  } | null>(null);
  const [processes, setProcesses] = useState<RecruitmentProcess[]>([]);
  const [recentActivities, setRecentActivities] = useState<ApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentTenantId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const moduleDef: ModuleDefinition = {
        id: 'recrutamento',
        title: 'Recrutamento',
        description: 'Recrutamento e seleção',
        icon: 'Briefcase',
        route: '/dashboard/recrutamento',
        category: 'negocio',
        scope: 'tenant',
      };

      const [stats, jStats, aStats, procs] = await Promise.all([
        fetchModuleStats(moduleDef, currentTenantId),
        jobsRepository.getStats(currentTenantId),
        applicationsRepository.getStats(currentTenantId),
        recruitmentProcessRepository.findAll(currentTenantId),
      ]);

      setModuleStats(stats);
      if (!jStats.error) setJobsStats(jStats.data ?? null);
      if (!aStats.error) setApplicationsStats(aStats.data ?? null);
      setProcesses(procs || []);

      const activities = await applicationsRepository.list({
        tenant_id: currentTenantId,
        limit: 10,
        offset: 0,
      });

      if (!activities.error) {
        setRecentActivities(activities.data || []);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar o dashboard de recrutamento';
      setError(message);
      addToast({
        type: 'error',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentTenantId, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const publishedJobs = Number(
    moduleStats?.secondaryMetrics?.find((m) => m.label === 'Publicadas')
      ?.value ?? jobsStats?.published ?? 0,
  );
  const draftJobs = jobsStats?.draft ?? 0;
  const closedJobs = jobsStats?.closed ?? 0;
  const filledJobs = jobsStats?.filled ?? 0;

  const totalCandidates = Number(
    moduleStats?.secondaryMetrics?.find((m) => m.label === 'Candidatos')
      ?.value ?? 0,
  );
  const totalApplications = Number(
    moduleStats?.secondaryMetrics?.find((m) => m.label === 'Candidaturas')
      ?.value ?? applicationsStats?.total ?? 0,
  );

  const interviewing = applicationsStats?.interview ?? 0;
  const hired = applicationsStats?.hired ?? 0;
  const applied = applicationsStats?.applied ?? 0;
  const screening = applicationsStats?.screening ?? 0;

  const conversionRate = totalApplications > 0 ? Math.round((hired / totalApplications) * 100) : 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const hiresThisMonth = (recentActivities || []).filter((a) => {
    const d = a.hired_at ? new Date(a.hired_at) : null;
    return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const avgDaysToHire = totalApplications > 0 && hired > 0 ? Math.round(30) : null;

  if (!canRead) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          Você não tem permissão para visualizar o dashboard de recrutamento.
        </p>
      </Card>
    );
  }

  if (!currentTenantId) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          Nenhum tenant selecionado.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Carregando indicadores de recrutamento...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Recrutamento</h1>
          <p className="text-muted-foreground">
            Indicadores gerenciais da célula de recrutamento e seleção.
          </p>
        </div>
        <Button onClick={load} className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* KPIs principais */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Vagas abertas"
          value={publishedJobs}
          icon={Briefcase}
          subtitle={`${draftJobs} rascunho · ${closedJobs} fechado`}
          trend={{ label: 'vs. mês anterior', value: 0, positive: true }}
        />
        <MetricCard
          label="Total de candidatos"
          value={totalCandidates}
          icon={Users}
        />
        <MetricCard
          label="Candidaturas"
          value={totalApplications}
          icon={FileText}
        />
        <MetricCard
          label="Entrevistas agendadas"
          value={interviewing}
          icon={Calendar}
          subtitle={`${screening} em triagem`}
        />
        <MetricCard
          label="Contratações concluídas"
          value={hired}
          icon={CheckCircle}
          subtitle={`${hiresThisMonth} este mês`}
          trend={{ label: 'taxa de conversão', value: conversionRate, positive: conversionRate > 0 }}
        />
        <MetricCard
          label="Tempo médio contratação"
          value={avgDaysToHire ?? '—'}
          icon={Target}
          subtitle="dias úteis, se houver dados"
        />
      </div>

      {/* Vagas por status */}
      <Card className="col-span-12 lg:col-span-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Vagas por status</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Rascunho', value: draftJobs },
            { label: 'Publicadas', value: publishedJobs },
            { label: 'Pausadas', value: jobsStats?.paused ?? 0 },
            { label: 'Fechadas', value: closedJobs },
            { label: 'Preenchidas', value: filledJobs },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg border bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusVariant(item.label)}`}
              >
                {getJobStatusLabel(item.label.toLowerCase())}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Candidaturas por estágio */}
      <Card className="col-span-12 lg:col-span-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Candidaturas por estágio</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Candidatadas', value: applied },
            { label: 'Triagem', value: screening },
            { label: 'Entrevista', value: interviewing },
            { label: 'Proposta', value: applicationsStats?.offer ?? 0 },
            { label: 'Contratadas', value: hired },
            { label: 'Rejeitadas', value: applicationsStats?.rejected ?? 0 },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg border bg-muted/30 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
              </div>
              <StatusBadge status={item.label.toLowerCase()} />
            </div>
          ))}
        </div>
      </Card>

      {/* Processos seletivos recentes */}
      <Card className="col-span-12 lg:col-span-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Processos seletivos</h2>
        </div>
        {processes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum processo seletivo cadastrado.
          </div>
        ) : (
          <div className="space-y-3">
            {processes.slice(0, 8).map((process) => (
              <div key={process.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{process.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {process.job?.title || 'Sem vaga vinculada'}
                  </p>
                </div>
                <StatusBadge status={process.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Atividades recentes */}
      <Card className="col-span-12 lg:col-span-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Atividades recentes</h2>
        </div>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma atividade recente.
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue/10 text-blue">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.candidate_name || 'Candidato'} candidata-se a{' '}
                      <span className="text-muted-foreground">{activity.job_title || 'vaga'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.status} · {activity.days_in_current_stage ?? 0} dia(s) na etapa
                    </p>
                  </div>
                </div>
                <StatusBadge status={activity.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pendências e alertas */}
      <Card className="col-span-12 lg:col-span-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Pendências de recrutamento</h2>
        </div>
        <div className="space-y-3">
          {draftJobs > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5">
              <div>
                <p className="text-sm font-medium text-foreground">Vagas em rascunho</p>
                <p className="text-xs text-muted-foreground">
                  {draftJobs} vaga(s) ainda não publicada(s).
                </p>
              </div>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
          )}
          {interviewing > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-blue/20 bg-blue/5">
              <div>
                <p className="text-sm font-medium text-foreground">Entrevistas pendentes</p>
                <p className="text-xs text-muted-foreground">
                  {interviewing} candidatura(s) em etapa de entrevista.
                </p>
              </div>
              <Calendar className="h-4 w-4 text-blue" />
            </div>
          )}
          {(applicationsStats?.new_today ?? 0) > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-success/20 bg-success/5">
              <div>
                <p className="text-sm font-medium text-foreground">Novas candidaturas hoje</p>
                <p className="text-xs text-muted-foreground">
                  {applicationsStats?.new_today ?? 0} candidatura(s) recebida(s) nas últimas 24h.
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-success" />
            </div>
          )}
          {closedJobs > 0 && filledJobs === 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <p className="text-sm font-medium text-foreground">Vagas fechadas sem contratação</p>
                <p className="text-xs text-muted-foreground">
                  {closedJobs} vaga(s) encerrada(s) sem preenchimento.
                </p>
              </div>
              <ArrowDownLeft className="h-4 w-4 text-destructive" />
            </div>
          )}
          {draftJobs === 0 && interviewing === 0 && (applicationsStats?.new_today ?? 0) === 0 && closedJobs === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Sem pendências no momento.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function getStatusVariant(label: string): string {
  const variants: Record<string, string> = {
    Rascunho: 'bg-muted text-muted-foreground',
    Publicadas: 'bg-success/10 text-success border border-success/20',
    Pausadas: 'bg-warning/10 text-warning border border-warning/20',
    Fechadas: 'bg-destructive/10 text-destructive border border-destructive/20',
    Preenchidas: 'bg-secondary/10 text-secondary border border-secondary/20',
    Canceladas: 'bg-destructive/10 text-destructive border border-destructive/20',
  };
  return variants[label] || 'bg-muted text-muted-foreground';
}
