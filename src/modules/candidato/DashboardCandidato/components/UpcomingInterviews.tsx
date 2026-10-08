import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Building2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { formatDate } from '@/utils';

const INTERVIEW_STAGES = [
  'interview',
  'technical_interview',
  'presentation',
  'offer',
];

const STAGE_LABELS: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  interview: {
    label: 'Entrevista',
    color: 'bg-primary/10 text-primary',
    icon: CheckCircle2,
  },
  technical_interview: {
    label: 'Entrevista Técnica',
    color: 'bg-purple/10 text-purple',
    icon: CheckCircle2,
  },
  presentation: {
    label: 'Apresentação',
    color: 'bg-indigo/10 text-indigo',
    icon: CheckCircle2,
  },
  offer: {
    label: 'Oferta',
    color: 'bg-success/10 text-success',
    icon: CheckCircle2,
  },
  hired: {
    label: 'Contratado',
    color: 'bg-success text-success-foreground',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejeitado',
    color: 'bg-destructive/10 text-destructive',
    icon: XCircle,
  },
  withdrawn: {
    label: 'Retirada',
    color: 'bg-muted text-muted-foreground',
    icon: AlertTriangle,
  },
  archived: {
    label: 'Arquivada',
    color: 'bg-muted text-muted-foreground',
    icon: AlertTriangle,
  },
};

export function UpcomingInterviews() {
  const { applications } = useCandidato();

  const upcomingInterviews = applications
    .filter((app) => INTERVIEW_STAGES.includes(app.current_stage))
    .sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    )
    .slice(0, 4);

  const totalInterviews = applications.filter((app) =>
    INTERVIEW_STAGES.includes(app.current_stage),
  ).length;

  if (upcomingInterviews.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">
            Próximas Entrevistas
          </h3>
          <span className="text-muted-foreground text-sm">
            {totalInterviews} em andamento
          </span>
        </div>
        <div className="py-8 text-center">
          <Calendar className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
          <p className="text-muted-foreground">
            Nenhuma entrevista agendada no momento
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">
          Próximas Entrevistas
        </h3>
        <span className="text-muted-foreground text-sm">
          {totalInterviews} processo(s) em andamento
        </span>
      </div>

      <div className="mb-4 space-y-3">
        {upcomingInterviews.map((app) => {
          const stageInfo = STAGE_LABELS[app.current_stage] || {
            label: app.current_stage,
            color: 'bg-muted',
            icon: CheckCircle2,
          };
          const StageIcon = stageInfo.icon;
          return (
            <div
              key={app.id}
              className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="text-foreground truncate font-medium">
                    {app.job?.title || 'Vaga não informada'}
                  </h4>
                  <Badge variant="outline" className={stageInfo.color}>
                    <StageIcon className="mr-1 h-2.5 w-2.5" />
                    {stageInfo.label}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {app.job?.company_relationship_id
                      ? 'Empresa vinculada'
                      : 'Empresa não informada'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(app.updated_at)}
                  </span>
                </div>
              </div>
              <span className="text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4">
        <a
          href="/candidato/entrevistas"
          className="text-primary flex items-center justify-center gap-2 text-sm font-medium hover:underline"
        >
          Ver todas as {totalInterviews} entrevistas
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </Card>
  );
}
