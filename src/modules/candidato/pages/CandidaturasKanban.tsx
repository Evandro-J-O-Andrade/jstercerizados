import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const CANDIDATO_HOME = '/candidato';

export const KANBAN_COLUMNS: { id: string; label: string; color: string }[] = [
  {
    id: 'submitted',
    label: 'Enviada',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    id: 'screening',
    label: 'Triagem',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  {
    id: 'interview',
    label: 'Entrevista',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    id: 'technical_interview',
    label: 'Entrevista técnica',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    id: 'presentation',
    label: 'Apresentação',
    color: 'bg-pink-50 border-pink-200 text-pink-700',
  },
  {
    id: 'reference_check',
    label: 'Verificação de referências',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  {
    id: 'offer',
    label: 'Proposta',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
  },
  {
    id: 'hired',
    label: 'Contratado',
    color: 'bg-success/10 border-success text-success',
  },
  {
    id: 'rejected',
    label: 'Rejeitado',
    color: 'bg-destructive/10 border-destructive text-destructive',
  },
  {
    id: 'withdrawn',
    label: 'Desistente',
    color:
      'bg-muted-foreground/10 border-muted-foreground text-muted-foreground',
  },
  {
    id: 'on_hold',
    label: 'Em espera',
    color:
      'bg-muted-foreground/10 border-muted-foreground text-muted-foreground',
  },
];

const COLUMN_ORDER: string[] = KANBAN_COLUMNS.map((c) => c.id);

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Enviada',
  screening: 'Triagem',
  interview: 'Entrevista',
  technical_interview: 'Entrevista técnica',
  presentation: 'Apresentação',
  reference_check: 'Verificação de referências',
  offer: 'Proposta',
  hired: 'Contratado',
  rejected: 'Rejeitado',
  withdrawn: 'Desistente',
  on_hold: 'Em espera',
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function CandidateCandidaturasKanban() {
  const { applications, isLoading, error, refetch } = useCandidato();
  const navigate = useNavigate();

  // Agrupa aplicações por estágio
  const appsByStage = new Map<string, typeof applications>();
  COLUMN_ORDER.forEach((stage) => appsByStage.set(stage, []));

  if (applications) {
    applications.forEach((app) => {
      const stage = (app.current_stage ?? 'submitted') as string;
      const bucket = appsByStage.get(stage) ?? [];
      bucket.push(app);
    });
  }

  return (
    <>
      <SEO
        title={`Kanban de candidaturas — ${COMPANY.name}`}
        description="Acompanhe o andamento de suas candidaturas por etapa"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Kanban de candidaturas
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o andamento de suas candidaturas por etapa.
          </p>
        </header>

        <ContentBoundary
          status={
            isLoading
              ? 'loading'
              : error
                ? 'error'
                : applications.length === 0
                  ? 'empty'
                  : 'success'
          }
          error={error}
          onRetry={() => void refetch()}
          homeRoute={CANDIDATO_HOME}
          emptyTitle="Você ainda não se candidatou a nenhuma vaga"
          emptyDescription="Explore as vagas disponíveis e candidate-se."
          emptyActionLabel="Ver vagas"
          onEmptyAction={() => navigate('/candidato/vagas')}
        >
          <div className="flex flex-col gap-4 overflow-x-auto pb-4 md:flex-row md:gap-4">
            {COLUMN_ORDER.map((stageId) => {
              const column = KANBAN_COLUMNS.find((c) => c.id === stageId)!;
              const apps = appsByStage.get(stageId) ?? [];
              return (
                <div
                  key={stageId}
                  className="flex w-[320px] flex-shrink-0 flex-col gap-2"
                >
                  <Card className={column.color.split(' ')[0]}>
                    <div className="flex items-center justify-between px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span className="text-foreground text-sm font-medium">
                          {column.label}
                        </span>
                      </div>
                      <Badge variant="secondary">{apps.length}</Badge>
                    </div>
                    <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-2">
                      {apps.length === 0 && (
                        <div className="text-muted-foreground py-4 text-center text-xs">
                          Sem candidaturas
                        </div>
                      )}
                      {apps.map((app) => {
                        const label =
                          STAGE_LABELS[app.current_stage ?? stageId] ?? stageId;
                        return (
                          <Card
                            key={app.id}
                            variant="interactive"
                            hover
                            className="hover:bg-muted/50 border-border/50 border p-3 transition-colors"
                            onClick={() =>
                              navigate(`/candidato/vagas/${app.job?.id}`)
                            }
                          >
                            <div className="flex items-start gap-2">
                              <div className="bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-lg">
                                <Briefcase className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-foreground truncate text-sm font-semibold">
                                  {app.job?.title ?? 'Vaga'}
                                </h4>
                                {app.job?.city && (
                                  <p className="text-muted-foreground truncate text-xs">
                                    <MapPin className="mr-1 h-3 w-3 shrink-0" />
                                    {app.job.city}
                                    {app.job.state ? `/${app.job.state}` : ''}
                                  </p>
                                )}
                                <p className="text-muted-foreground mt-1 text-xs">
                                  <Calendar className="mr-1 h-3 w-3 shrink-0" />
                                  Enviada em {formatDate(app.applied_at)}
                                </p>
                                <span
                                  className="mt-1.5 inline-block rounded border border-current px-1.5 py-0.5 text-[10px] font-medium"
                                  style={{ color: 'currentColor' }}
                                >
                                  {label}
                                </span>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/candidato/candidaturas')}
            >
              Voltar para lista
            </Button>
          </div>
        </ContentBoundary>
      </div>
    </>
  );
}
