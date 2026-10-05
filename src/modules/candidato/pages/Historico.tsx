import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { History, Briefcase, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import type { Application } from '@/types/domain/application';
import type { ApplicationStatus } from '@/types/domain/application';

const CANDIDATO_HOME = '/candidato';

const TERMINAL_STAGES: ApplicationStatus[] = [
  'hired',
  'rejected',
  'withdrawn',
  'on_hold',
];

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Enviada',
  screening: 'Triagem',
  interview: 'Entrevista',
  technical_interview: 'Técnica',
  presentation: 'Apresentação',
  reference_check: 'Referências',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rejeitada',
  withdrawn: 'Arquivada',
  on_hold: 'Em pausa',
};

function StatusBadge({ stage }: { stage: string }) {
  const label = STATUS_LABELS[stage] ?? stage;
   let variant: 'success' | 'warning' | 'danger' | 'default' = 'default';
  let icon = null;

  if (stage === 'hired') {
    variant = 'success';
    icon = <CheckCircle className="h-3 w-3" />;
  } else if (TERMINAL_STAGES.includes(stage as ApplicationStatus)) {
    variant = 'danger';
    icon = <XCircle className="h-3 w-3" />;
  } else {
    variant = 'default';
  }

  return (
    <Badge variant={variant} className="text-xs">
      {icon}
      <span className="ml-1">{label}</span>
    </Badge>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const job = app.job;

  return (
    <Card variant="default" className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="text-muted-foreground h-4 w-4" />
            <h3 className="text-foreground font-semibold">
              {job?.title ?? 'Vaga'}
            </h3>
          </div>
          {job?.city && (
            <p className="text-muted-foreground text-sm">
              {job.city}{job?.state && `, ${job.state}`}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {app.applied_at && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Candidatura em {new Date(app.applied_at).toLocaleDateString('pt-BR')}
              </span>
            )}
            {app.match_score != null && (
              <Badge variant="outline" className="text-xs">
                Match {Math.round(app.match_score)}%
              </Badge>
            )}
          </div>
        </div>
        <StatusBadge stage={app.current_stage} />
      </div>
    </Card>
  );
}

export default function CandidateHistorico() {
  const { applications, isLoading, error, refetch } = useCandidato();

  const historyApps = useMemo(() => {
    if (!applications) return [];
    return applications.filter((a) =>
      TERMINAL_STAGES.includes(a.current_stage as ApplicationStatus),
    );
  }, [applications]);

  return (
    <>
      <SEO
        title={`Meu histórico — ${COMPANY.name}`}
        description="Histórico de suas candidaturas"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Histórico de candidaturas
          </h1>
          <p className="text-muted-foreground mt-1">
            Vagas que você se candidatou e seus resultados.
          </p>
        </header>

        <ContentBoundary
          status={
            isLoading
              ? 'loading'
              : error
                ? 'error'
                : applications
                  ? 'success'
                  : 'empty'
          }
          error={error}
          onRetry={() => void refetch()}
          homeRoute={CANDIDATO_HOME}
          emptyTitle="Nenhuma candidatura finalizada"
          emptyDescription="Suas candidaturas finalizadas aparecerão aqui."
        >
          {historyApps.length === 0 ? (
            <div className="py-8 text-center">
              <History className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground">
                Nenhuma candidatura finalizada no momento.
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Após o término de um processo seletivo, ele aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyApps.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </ContentBoundary>
      </div>
    </>
  );
}

