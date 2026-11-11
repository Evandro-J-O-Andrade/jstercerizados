import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const counts = Object.fromEntries(
    FUNNEL.map(({ key }) => [
      key,
      applications.filter((item) => item.current_stage === key).length,
    ]),
  );
  const activeTotal = applications.filter(
    (item) => !['rejected', 'withdrawn'].includes(item.current_stage),
  ).length;

  return (
    <Card className="border-border overflow-hidden shadow-sm">
      <div className="border-border flex items-center justify-between border-b p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              Minhas candidaturas
            </h3>
            <p className="text-muted-foreground text-sm">
              Acompanhe cada etapa do processo seletivo
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/candidato/kanban">
            Ver etapas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="p-6">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <FileText className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-foreground text-sm font-medium">
              Nenhuma candidatura enviada
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Explore as vagas publicadas e acompanhe seus processos aqui.
            </p>
            <Button className="mt-4" size="sm" asChild>
              <Link to="/candidato/buscar-vagas">Buscar vagas</Link>
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
                    className="border-border bg-card rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-foreground text-2xl font-semibold">
                        {counts[item.key] ?? 0}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="bg-muted/60 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">
                Processos em andamento
              </span>
              <span className="text-foreground font-medium">
                {activeTotal} de {applications.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
