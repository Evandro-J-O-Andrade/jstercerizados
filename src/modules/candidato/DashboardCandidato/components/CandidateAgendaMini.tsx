import { Calendar, ArrowRight, Building2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { formatDate } from '@/utils';

const INTERVIEW_STAGES = ['interview', 'technical_interview', 'presentation', 'offer'];

const STAGE_LABELS: Record<string, string> = {
  interview: 'Entrevista',
  technical_interview: 'Entrevista técnica',
  presentation: 'Apresentação',
  offer: 'Oferta',
};

export function CandidateAgendaMini() {
  const { applications } = useCandidato();

  const upcoming = applications
    .filter((app) => INTERVIEW_STAGES.includes(app.current_stage))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Agenda</h3>
            <p className="text-sm text-slate-500">Próximas etapas</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href="/candidato/entrevistas">
            Ver tudo
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="p-6">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Sem entrevistas agendadas
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Assim que houver um agendamento, ele aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((app) => (
              <div
                key={app.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {app.job?.title || 'Vaga não informada'}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {app.job?.company_relationship_id
                          ? 'Empresa vinculada'
                          : 'Empresa não informada'}
                      </span>
                      <span>•</span>
                      <span>Atualizado em {formatDate(app.updated_at)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline">
                  {STAGE_LABELS[app.current_stage]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
