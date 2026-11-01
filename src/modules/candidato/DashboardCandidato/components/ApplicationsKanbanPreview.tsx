import { ArrowRight, FileText, CheckCircle2, Clock, CalendarCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidato } from '@/modules/candidato/CandidatoContext';

const FUNNEL = [
  { key: 'applied', label: 'Inscrição recebida', icon: FileText },
  { key: 'screening', label: 'Em análise', icon: Clock },
  { key: 'interview', label: 'Entrevista', icon: CalendarCheck },
  { key: 'offer', label: 'Oferta', icon: CheckCircle2 },
];

export function ApplicationsKanbanPreview() {
  const { applications } = useCandidato();

  const counts = FUNNEL.reduce((acc, item) => {
    acc[item.key] = applications.filter(
      (app) => app.current_stage === item.key,
    ).length;
    return acc;
  }, {} as Record<string, number>);

  const activeTotal = applications.filter(
    (app) => !['rejected', 'withdrawn'].includes(app.current_stage),
  ).length;

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Minhas candidaturas
            </h3>
            <p className="text-sm text-slate-500">
              Acompanhe por etapa do processo
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href="/candidato/kanban">
            Ver kanban
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="p-6">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Nenhuma candidatura enviada
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Explore as vagas e candidate-se para acompanhar aqui
            </p>
            <Button className="mt-4" size="sm" asChild>
              <a href="/candidato/buscar-vagas">Buscar vagas</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {FUNNEL.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className="relative overflow-hidden rounded-xl border border-slate-100 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-2xl font-semibold text-slate-900">
                        {counts[item.key]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
              <span className="text-slate-600">Processos em andamento</span>
              <span className="font-medium text-slate-900">
                {activeTotal} de {applications.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
