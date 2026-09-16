import { Link } from 'react-router-dom';
import { FileText, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useCandidate } from '@/contexts/CandidateContext';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Enviada',
  screening: 'Triagem',
  interview: 'Entrevista',
  technical_interview: 'Entrevista técnica',
  presentation: 'Apresentação',
  reference_check: 'Verificação de referências',
  offer: 'Proferta',
  hired: 'Contratado',
  rejected: 'Rejeitado',
  withdrawn: 'Desistente',
  on_hold: 'Em espera',
};

const STATUS_COLORS: Record<string, string> = {
  hired: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  withdrawn: 'bg-muted-foreground/10 text-muted-foreground',
  on_hold: 'bg-muted-foreground/10 text-muted-foreground',
  offer: 'bg-warning/10 text-warning',
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

export default function CandidateCandidaturas() {
  const { applications, isLoading, error } = useCandidate();

  return (
    <>
      <SEO
        title={`Minhas candidaturas — ${COMPANY.name}`}
        description="Acompanhe suas candidaturas"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Minhas candidaturas
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o status de cada vaga que você se candidatou.
          </p>
        </header>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5 p-4">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : applications.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="text-foreground font-medium">
              Você ainda não se candidatou a nenhuma vaga
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Explore as vagas disponíveis e candidate-se.
            </p>
            <Link
              to="/candidato/vagas"
              className="text-primary mt-3 inline-block text-sm hover:underline"
            >
              Ver vagas →
            </Link>
          </Card>
        ) : (
          <ul className="space-y-3">
            {applications.map((app) => {
              const stage = app.current_stage as string;
              const label = STATUS_LABELS[stage] ?? stage;
              const color =
                STATUS_COLORS[stage] ?? 'bg-muted/10 text-muted-foreground';
              return (
                <li key={app.id}>
                  <Card className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-foreground text-base font-semibold">
                          {app.job?.title ?? 'Vaga'}
                        </h3>
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          {app.job?.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.job.city}
                              {app.job.state ? `/${app.job.state}` : ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Enviada em {formatDate(app.applied_at)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
                      >
                        {label}
                      </span>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
