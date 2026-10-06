import { Link } from 'react-router-dom';
import { Briefcase, FileCheck, GitBranch, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
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
  if (status === 'screening' || status === 'offer_sent')
    return 'default' as const;
  return 'secondary' as const;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
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
        description="As candidaturas recebidas aparecerão aqui."
      />
    );
  }

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="divide-border min-w-full divide-y">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
              Candidato
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
              Vaga
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
              Etapa
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
              Status
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
              Recebida
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {applications.map((application) => (
            <tr key={application.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <p className="text-foreground text-sm font-medium">
                  {application.candidate_name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {application.candidate_email}
                </p>
              </td>
              <td className="text-foreground px-4 py-3 text-sm">
                {application.job_title}
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

export default function DashboardRecrutamento() {
  const { applicationsEnriched, dashboardStats, error, isLoading, refetch } =
    useRecrutamento();

  const metrics = dashboardStats
    ? [
        {
          id: 'open-jobs',
          label: 'Vagas publicadas',
          value: dashboardStats.jobs.published,
          detail: `${dashboardStats.jobs.total} vagas no total`,
          icon: Briefcase,
          route: 'vagas',
          tone: 'text-primary bg-primary/10',
        },
        {
          id: 'active-candidates',
          label: 'Candidatos ativos',
          value: dashboardStats.candidates.active,
          detail: `${dashboardStats.candidates.new_this_month} novos neste mês`,
          icon: Users,
          route: 'candidatos',
          tone: 'text-success bg-success/10',
        },
        {
          id: 'applications-review',
          label: 'Candidaturas em triagem',
          value:
            dashboardStats.applications.applied +
            dashboardStats.applications.screening,
          detail: `${dashboardStats.applications.new_today} recebidas hoje`,
          icon: FileCheck,
          route: 'candidaturas',
          tone: 'text-warning bg-warning/10',
        },
        {
          id: 'active-processes',
          label: 'Processos em andamento',
          value:
            dashboardStats.processes.open +
            dashboardStats.processes.in_progress,
          detail: `${dashboardStats.processes.total} processos no total`,
          icon: GitBranch,
          route: 'processos',
          tone: 'text-foreground bg-muted',
        },
      ]
    : [];

  const status = error ? 'error' : isLoading ? 'loading' : 'success';

  return (
    <ContentBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      homeRoute="/dashboard/recrutamento"
      className="w-full min-w-0 space-y-7"
    >
      {!dashboardStats ? (
        <EmptyState
          title="Indicadores indisponíveis"
          description="Não há dados de recrutamento disponíveis para este contexto."
        />
      ) : (
        <>
          <section aria-label="Indicadores de recrutamento">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Link
                    key={metric.id}
                    to={`/dashboard/recrutamento/${metric.route}`}
                    className="group focus-visible:ring-ring rounded-lg focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <Card className="group-hover:border-primary/40 h-full p-4 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-sm">
                            {metric.label}
                          </p>
                          <p
                            className="text-foreground mt-2 text-2xl font-semibold"
                            data-testid={`metric-${metric.id}`}
                          >
                            {metric.value.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {metric.detail}
                          </p>
                        </div>
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${metric.tone}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="min-w-0">
            <div className="border-border mb-3 flex flex-wrap items-end justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-foreground text-lg font-semibold">
                  Candidaturas recentes
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
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
            <RecentApplications
              applications={applicationsEnriched.slice(0, 8)}
            />
          </section>
        </>
      )}
    </ContentBoundary>
  );
}
