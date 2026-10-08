import {
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';

const STAGE_LABELS: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  applied: { label: 'Enviada', color: 'bg-info/10 text-info', icon: FileText },
  screening: {
    label: 'Triagem',
    color: 'bg-warning/10 text-warning',
    icon: Clock,
  },
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

const ACTIVE_STAGES = [
  'applied',
  'screening',
  'interview',
  'technical_interview',
  'presentation',
  'offer',
];

export function ApplicationsSummary() {
  const { applications } = useCandidato();

  if (applications.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">
            Minhas Candidaturas
          </h3>
          <span className="text-muted-foreground text-sm">
            Acompanhe suas inscrições
          </span>
        </div>
        <div className="py-8 text-center">
          <FileText className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
          <p className="text-muted-foreground">
            Nenhuma candidatura enviada ainda
          </p>
          <a
            href="/candidato/buscar-vagas"
            className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            Buscar vagas
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Card>
    );
  }

  const recentApps = applications.slice(0, 4);

  const stageCounts = applications.reduce(
    (acc, app) => {
      const stage = app.current_stage;
      acc[stage] = (acc[stage] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const activeCount = ACTIVE_STAGES.reduce(
    (sum, s) => sum + (stageCounts[s] ?? 0),
    0,
  );

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">
          Minhas Candidaturas
        </h3>
        <span className="text-muted-foreground text-sm">
          {applications.length} total • {activeCount} em andamento
        </span>
      </div>

      <div className="mb-4 space-y-2">
        {recentApps.map((app) => {
          const stageInfo = STAGE_LABELS[app.current_stage] || {
            label: app.current_stage,
            color: 'bg-muted',
            icon: FileText,
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
                <p className="text-muted-foreground truncate text-sm">
                  {app.job?.company_relationship_id
                    ? 'Empresa vinculada'
                    : 'Empresa não informada'}
                </p>
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
          href="/candidato/candidaturas"
          className="text-primary flex items-center justify-center gap-2 text-sm font-medium hover:underline"
        >
          Ver todas as {applications.length} candidaturas
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </Card>
  );
}
