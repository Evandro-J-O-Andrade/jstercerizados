import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Briefcase,
  CalendarClock,
  FileCheck,
  GitBranch,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  DashboardCard,
  DashboardErrorState,
  DashboardMetricGrid,
  DashboardSection,
  DashboardSkeleton,
} from '@/components/dashboard';
import type { DashboardMetric } from '@/components/dashboard/dashboard-model';
import { EmptyState } from '@/components/fallback/EmptyState';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import type {
  ApplicationListItem,
  ApplicationStatus,
} from '@/modules/recrutamento/types';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Recebida',
  screening: 'Em triagem',
  interview_scheduled: 'Entrevista agendada',
  interviewed: 'Entrevistada',
  offer_sent: 'Proposta enviada',
  hired: 'Contratada',
  rejected: 'Rejeitada',
  withdrawn: 'Desistiu',
};

function statusVariant(status: ApplicationStatus) {
  if (status === 'hired') return 'success' as const;
  if (status === 'rejected' || status === 'withdrawn') return 'danger' as const;
  if (
    status === 'screening' ||
    status === 'interview_scheduled' ||
    status === 'offer_sent'
  )
    return 'default' as const;
  return 'secondary' as const;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function RecentApplications({
  applications,
}: {
  applications: ApplicationListItem[];
}) {
  if (applications.length === 0) {
    return (
      <EmptyState
        title="Nenhuma candidatura registrada"
        description="As candidaturas recebidas aparecerão aqui quando houver dados reais neste tenant."
      />
    );
  }

  return (
    <div className="border-border bg-card overflow-x-auto rounded-xl border">
      <table className="divide-border min-w-full divide-y">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
              Candidato
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
              Vaga
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
              Etapa
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
              Status
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
              Recebida
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {applications.map((application) => (
            <tr
              key={application.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3">
                <p className="text-foreground text-sm font-medium">
                  {application.candidate_name || '—'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {application.candidate_email || '—'}
                </p>
              </td>
              <td className="text-foreground px-4 py-3 text-sm">
                {application.job_title || '—'}
              </td>
              <td className="text-muted-foreground px-4 py-3 text-sm">
                {application.stage_name || '—'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(application.status)}>
                  {STATUS_LABELS[application.status]}
                </Badge>
              </td>
              <td className="text-muted-foreground px-4 py-3 text-sm whitespace-nowrap">
                {formatDate(application.applied_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuickLink({
  to,
  label,
  description,
  icon: Icon,
}: {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      className="border-border bg-card hover:border-primary/40 hover:bg-accent/40 focus-visible:ring-ring group flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-foreground text-sm font-semibold">{label}</p>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
      <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
    </Link>
  );
}

/**
 * Dashboard analítico canônico da célula Recrutamento (CHECK BOULER 24H).
 * Dados reais via RecrutamentoContext (tenant/RLS). Sem métricas fictícias.
 * Páginas operacionais (vagas/candidaturas/processos/etc.) permanecem independentes.
 */
export default function DashboardRecrutamento() {
  const { applicationsEnriched, dashboardStats, error, isLoading, refetch } =
    useRecrutamento();

  const metrics: DashboardMetric[] = dashboardStats
    ? [
        {
          id: 'open-jobs',
          label: 'Vagas publicadas',
          value: dashboardStats.jobs.published,
          description: `${dashboardStats.jobs.total} vagas no total`,
          icon: Briefcase,
          href: '/dashboard/recrutamento/vagas',
          tone: 'primary',
          format: 'number',
        },
        {
          id: 'active-candidates',
          label: 'Candidatos ativos',
          value: dashboardStats.candidates.active,
          description: `${dashboardStats.candidates.new_this_month} novos neste mês`,
          icon: Users,
          href: '/dashboard/recrutamento/candidatos',
          tone: 'success',
          format: 'number',
        },
        {
          id: 'applications-review',
          label: 'Candidaturas em triagem',
          value:
            dashboardStats.applications.applied +
            dashboardStats.applications.screening,
          description: `${dashboardStats.applications.new_today} recebidas hoje`,
          icon: FileCheck,
          href: '/dashboard/recrutamento/candidaturas',
          tone: 'warning',
          format: 'number',
        },
        {
          id: 'active-processes',
          label: 'Processos em andamento',
          value:
            dashboardStats.processes.open +
            dashboardStats.processes.in_progress,
          description: `${dashboardStats.processes.total} processos no total`,
          icon: GitBranch,
          href: '/dashboard/recrutamento/processos',
          tone: 'neutral',
          format: 'number',
        },
      ]
    : [];

  if (error) {
    return (
      <div className="space-y-6">
        <Header loading={isLoading} onRefresh={() => void refetch()} />
        <DashboardErrorState message={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <Header loading={isLoading} onRefresh={() => void refetch()} />

      <DashboardSection
        title="Indicadores"
        description="Métricas reais do tenant (RLS/RBAC). Indicadores indisponíveis não são inventados."
        icon={Activity}
      >
        {isLoading && !dashboardStats ? (
          <DashboardSkeleton count={4} />
        ) : !dashboardStats ? (
          <EmptyState
            title="Indicadores indisponíveis"
            description="Não há dados de recrutamento disponíveis para este contexto."
          />
        ) : (
          <DashboardMetricGrid>
            {metrics.map((metric) => (
              <DashboardCard key={metric.id} metric={metric} />
            ))}
          </DashboardMetricGrid>
        )}
      </DashboardSection>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-3 xl:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Candidaturas recentes
              </h2>
              <p className="text-muted-foreground text-sm">
                Registros mais recentes deste tenant.
              </p>
            </div>
            <Link
              to="/dashboard/recrutamento/candidaturas"
              className="text-primary text-sm font-medium hover:underline"
            >
              Ver todas
            </Link>
          </div>
          {isLoading && !dashboardStats ? (
            <DashboardSkeleton count={2} />
          ) : (
            <RecentApplications
              applications={applicationsEnriched.slice(0, 8)}
            />
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Operações
          </h2>
          <p className="text-muted-foreground text-sm">
            Páginas operacionais independentes do dashboard analítico.
          </p>
          <div className="grid gap-2">
            <QuickLink
              to="/dashboard/recrutamento/vagas"
              label="Vagas"
              description="Cadastro e gestão de vagas"
              icon={Briefcase}
            />
            <QuickLink
              to="/dashboard/recrutamento/candidaturas"
              label="Candidaturas"
              description="Triagem e acompanhamento"
              icon={FileCheck}
            />
            <QuickLink
              to="/dashboard/recrutamento/processos"
              label="Processos seletivos"
              description="Fluxos e etapas"
              icon={GitBranch}
            />
            <QuickLink
              to="/dashboard/recrutamento/candidatos"
              label="Candidatos"
              description="Perfis e histórico"
              icon={Users}
            />
          </div>
          {dashboardStats ? (
            <Card variant="outline" padding="sm" className="mt-2">
              <div className="flex items-center gap-2 text-xs">
                <CalendarClock className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">
                  Contratações (total):
                </span>
                <span className="text-foreground font-semibold">
                  {dashboardStats.applications.hired}
                </span>
                <span className="text-muted-foreground">· Rejeitadas:</span>
                <span className="text-foreground font-semibold">
                  {dashboardStats.applications.rejected}
                </span>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Header({
  loading,
  onRefresh,
}: {
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="from-primary/10 via-card to-card border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase">
            <Briefcase className="h-4 w-4" />
            Célula Recrutamento · CHECK BOULER 24H
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Dashboard de Recrutamento
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Visão analítica baseada em dados reais autorizados. Operações,
            formulários e fluxos permanecem nas páginas da célula.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="border-border bg-background text-foreground hover:bg-accent focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
        >
          <Activity className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
          {loading ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>
    </div>
  );
}
