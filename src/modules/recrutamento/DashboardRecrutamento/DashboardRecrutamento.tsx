import { Link } from 'react-router-dom';
import {
  Activity,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GitBranch,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback/EmptyState';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import type {
  ApplicationListItem,
  ApplicationStatus,
  Job,
  RecruitmentDashboardStats,
} from '@/modules/recrutamento/types';
import { JOB_STATUS_LABELS } from '@/modules/recrutamento/constants/jobStatus';

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

const PIPELINE = [
  {
    label: 'Inscrição',
    statuses: ['applied'],
    tone: 'border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20',
  },
  {
    label: 'Triagem',
    statuses: ['screening'],
    tone: 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-950/20',
  },
  {
    label: 'Entrevista',
    statuses: ['interview_scheduled', 'interviewed'],
    tone: 'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20',
  },
  {
    label: 'Proposta',
    statuses: ['offer_sent'],
    tone: 'border-violet-200 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/20',
  },
  {
    label: 'Contratação',
    statuses: ['hired'],
    tone: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20',
  },
] satisfies Array<{
  label: string;
  statuses: ApplicationStatus[];
  tone: string;
}>;

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function PanelTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-foreground text-sm font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
    </div>
  );
}

function MetricCard({
  id,
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  id: string;
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card data-testid={`dashboard-card-${id}`} className="min-w-0 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs font-medium">
            {label}
          </p>
          <p className="text-foreground mt-2 text-2xl font-bold tabular-nums">
            {value}
          </p>
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {detail}
          </p>
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}

function Funnel({ stats }: { stats: RecruitmentDashboardStats }) {
  const total = stats.applications.total;
  const rows = [
    ['Candidaturas', total, 'bg-blue-600'],
    ['Triagem', stats.applications.screening, 'bg-indigo-500'],
    ['Entrevistas', stats.applications.interview, 'bg-violet-500'],
    ['Propostas', stats.applications.offer, 'bg-fuchsia-500'],
    ['Contratações', stats.applications.hired, 'bg-emerald-500'],
  ] as const;
  return (
    <Card className="p-4">
      <PanelTitle
        title="Funil de recrutamento"
        description="Conversão real por status"
      />
      <div className="mt-4 space-y-2">
        {rows.map(([label, value, tone], index) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-1 justify-center">
              <div
                className={`${tone} flex h-8 items-center justify-center rounded-md text-xs font-semibold text-white`}
                style={{ width: `${Math.max(28, 100 - index * 13)}%` }}
              >
                {value.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="w-24 text-xs">
              <div className="text-foreground font-medium">{label}</div>
              <div className="text-muted-foreground">
                {percent(value, total)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Distribution({ stats }: { stats: RecruitmentDashboardStats }) {
  const values = [
    stats.applications.applied,
    stats.applications.screening,
    stats.applications.interview,
    stats.applications.offer,
    stats.applications.hired,
    stats.applications.rejected,
  ];
  const total = Math.max(
    1,
    values.reduce((sum, value) => sum + value, 0),
  );
  const colors = [
    '#2563eb',
    '#6366f1',
    '#8b5cf6',
    '#f59e0b',
    '#10b981',
    '#ef4444',
  ];
  const labels = [
    'Recebidas',
    'Triagem',
    'Entrevistas',
    'Propostas',
    'Contratadas',
    'Rejeitadas',
  ];
  let cursor = 0;
  const gradient = values
    .map((value, index) => {
      const start = cursor;
      cursor += (value / total) * 360;
      return `${colors[index]} ${start}deg ${cursor}deg`;
    })
    .join(',');

  return (
    <Card className="p-4">
      <PanelTitle
        title="Candidatos por status"
        description="Distribuição atual do pipeline"
      />
      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
        <div
          className="relative h-32 w-32 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="bg-card absolute inset-7 flex flex-col items-center justify-center rounded-full">
            <span className="text-foreground text-xl font-bold">
              {stats.applications.total}
            </span>
            <span className="text-muted-foreground text-[10px]">Total</span>
          </div>
        </div>
        <ul className="w-full space-y-2">
          {labels.map((label, index) => (
            <li
              key={label}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-muted-foreground flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colors[index] }}
                />
                {label}
              </span>
              <strong className="text-foreground">
                {percent(values[index], total)}%
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function Pipeline({ applications }: { applications: ApplicationListItem[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-end justify-between gap-3">
        <PanelTitle
          title="Pipeline de candidatos"
          description="Candidaturas reais agrupadas por etapa"
        />
        <Link
          to="/dashboard/recrutamento/candidaturas"
          className="text-primary text-xs font-semibold hover:underline"
        >
          Ver pipeline completo
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {PIPELINE.map((column) => {
          const items = applications.filter((item) =>
            (column.statuses as readonly ApplicationStatus[]).includes(
              item.status,
            ),
          );
          return (
            <section
              key={column.label}
              className={`min-w-0 rounded-xl border p-3 ${column.tone}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-foreground text-sm font-semibold">
                  {column.label}
                </h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {items.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-center text-xs">
                    Sem registros
                  </p>
                ) : (
                  items.slice(0, 4).map((application) => (
                    <Link
                      key={application.id}
                      to="/dashboard/recrutamento/candidaturas"
                      className="bg-card border-border block rounded-lg border p-2.5 shadow-sm hover:-translate-y-0.5"
                    >
                      <p className="text-foreground truncate text-xs font-semibold">
                        {application.candidate_name || 'Candidato'}
                      </p>
                      <p className="text-muted-foreground mt-1 truncate text-[11px]">
                        {application.job_title || 'Vaga não informada'}
                      </p>
                      <p className="text-primary mt-2 text-[10px] font-medium">
                        {STATUS_LABELS[application.status]}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}

function TopJobs({ jobs }: { jobs: Job[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-end justify-between gap-3">
        <PanelTitle
          title="Vagas em destaque"
          description="Maior movimentação no tenant"
        />
        <Link
          to="/dashboard/recrutamento/vagas"
          className="text-primary text-xs font-semibold hover:underline"
        >
          Ver vagas
        </Link>
      </div>
      {jobs.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Nenhuma vaga com movimentação registrada.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Vaga</th>
                <th className="px-3 py-2 text-right">Candidaturas</th>
                <th className="px-3 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-3 py-2">
                    <Link
                      className="text-foreground font-medium hover:underline"
                      to={`/dashboard/recrutamento/vagas/${job.id}`}
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {job.applications_count ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Badge variant="secondary">
                      {JOB_STATUS_LABELS[job.status] ?? job.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function RecentActivity({
  applications,
}: {
  applications: ApplicationListItem[];
}) {
  return (
    <Card className="p-4">
      <PanelTitle
        title="Atividades recentes"
        description="Últimas movimentações disponíveis"
      />
      {applications.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Nenhuma atividade registrada.
        </p>
      ) : (
        <ul className="divide-border mt-3 divide-y">
          {applications.slice(0, 5).map((application) => (
            <li
              key={application.id}
              className="flex gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Activity className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-foreground truncate text-xs font-semibold">
                  {application.candidate_name} · {application.job_title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  {STATUS_LABELS[application.status]} ·{' '}
                  {formatDate(application.last_activity_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function QuickActions() {
  const actions = [
    ['/dashboard/recrutamento/vagas/novo', 'Nova vaga', Plus],
    ['/dashboard/recrutamento/candidatos', 'Candidatos', UserPlus],
    ['/dashboard/recrutamento/processos', 'Processos', GitBranch],
    ['/dashboard/recrutamento/candidaturas', 'Candidaturas', FileCheck2],
  ] as const;
  return (
    <Card className="p-4">
      <PanelTitle
        title="Ações rápidas"
        description="Operações canônicas da célula"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {actions.map(([to, label, Icon]) => (
          <Link
            key={to}
            to={to}
            className="border-border hover:border-primary/40 hover:bg-primary/5 flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center"
          >
            <Icon className="text-primary h-5 w-5" />
            <span className="text-foreground text-xs font-semibold">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardRecrutamento() {
  const {
    applicationsEnriched,
    jobs,
    dashboardStats,
    error,
    isLoading,
    refetch,
  } = useRecrutamento();

  if (error) {
    return (
      <div className="space-y-4">
        <DashboardHeader loading={isLoading} onRefresh={() => void refetch()} />
        <Card className="p-6">
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        </Card>
      </div>
    );
  }
  if (!dashboardStats && !isLoading) {
    return (
      <div className="space-y-4">
        <DashboardHeader loading={false} onRefresh={() => void refetch()} />
        <EmptyState
          title="Indicadores indisponíveis"
          description="Não há dados autorizados para compor o dashboard deste tenant."
        />
      </div>
    );
  }
  if (!dashboardStats) {
    return (
      <div className="space-y-3">
        <div className="bg-muted h-28 animate-pulse rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted h-28 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboardStats;
  const conversion = percent(
    stats.applications.hired,
    stats.applications.total,
  );
  const topJobs = [...jobs]
    .sort((a, b) => (b.applications_count ?? 0) - (a.applications_count ?? 0))
    .slice(0, 5);

  return (
    <div className="w-full min-w-0 space-y-4">
      <DashboardHeader loading={isLoading} onRefresh={() => void refetch()} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          id="active-candidates"
          label="Candidatos ativos"
          value={stats.candidates.active}
          detail={`${stats.candidates.new_this_month} novos no mês`}
          icon={Users}
          tone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
        />
        <MetricCard
          id="open-jobs"
          label="Vagas ativas"
          value={stats.jobs.published + stats.jobs.paused}
          detail={`${stats.jobs.published} publicadas`}
          icon={BriefcaseBusiness}
          tone="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
        />
        <MetricCard
          id="applications-total"
          label="Candidaturas"
          value={stats.applications.total}
          detail={`${stats.applications.new_today} recebidas hoje`}
          icon={FileCheck2}
          tone="bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
        />
        <MetricCard
          id="hired"
          label="Contratações"
          value={stats.applications.hired}
          detail={`${stats.processes.open + stats.processes.in_progress} processos ativos`}
          icon={CheckCircle2}
          tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        />
        <MetricCard
          id="conversion"
          label="Taxa de conversão"
          value={`${conversion}%`}
          detail="Candidaturas → contratação"
          icon={Target}
          tone="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
        />
        <MetricCard
          id="review"
          label="Em triagem"
          value={stats.applications.screening + stats.applications.interview}
          detail={`${stats.applications.offer} propostas enviadas`}
          icon={Clock3}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_1.2fr_.9fr]">
        <Funnel stats={stats} />
        <Card className="p-4">
          <PanelTitle
            title="Evolução de candidaturas"
            description="Série temporal ainda não instrumentada"
          />
          <div className="border-border bg-muted/20 mt-4 flex h-48 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
            <TrendingUp className="text-muted-foreground h-8 w-8" />
            <p className="text-foreground mt-3 text-sm font-medium">
              Histórico temporal indisponível
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              A área será preenchida quando o repository expuser uma série
              temporal autorizada.
            </p>
          </div>
        </Card>
        <Distribution stats={stats} />
      </div>
      <Pipeline applications={applicationsEnriched} />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_.8fr]">
        <TopJobs jobs={topJobs} />
        <RecentActivity applications={applicationsEnriched} />
        <QuickActions />
      </div>
    </div>
  );
}

function DashboardHeader({
  loading,
  onRefresh,
}: {
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          CHECK BOULER 24H · Recrutamento
        </p>
        <h1 className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Central de Recrutamento & RH
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Vagas, candidatos, processos seletivos e contratações com dados reais
          do tenant.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          leftIcon={
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          }
        >
          {loading ? 'Atualizando' : 'Atualizar'}
        </Button>
        <Button asChild leftIcon={<Plus className="h-4 w-4" />}>
          <Link to="/dashboard/recrutamento/vagas/novo">Nova vaga</Link>
        </Button>
      </div>
    </header>
  );
}
