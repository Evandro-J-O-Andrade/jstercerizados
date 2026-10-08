import { ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';

export function RecommendedJobs() {
  const { matchResults } = useCandidato();

  const topMatches = matchResults.slice(0, 3);

  if (topMatches.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">
            Vagas Recomendadas
          </h3>
          <span className="text-muted-foreground text-sm">
            Baseado no seu perfil
          </span>
        </div>
        <div className="py-8 text-center">
          <Sparkles className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
          <p className="text-muted-foreground">
            Complete seu perfil para receber recomendações personalizadas
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">
          Vagas Recomendadas
        </h3>
        <span className="text-muted-foreground text-sm">
          {matchResults.length} oportunidade(s) encontrada(s)
        </span>
      </div>
      <div className="space-y-3">
        {topMatches.map(({ job, match }) => (
          <div
            key={job.id}
            className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="text-foreground truncate font-medium">
                  {job.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="mr-1 h-2.5 w-2.5" />
                  {match.score}%
                </Badge>
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                {job.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.city}
                    {job.state ? `, ${job.state}` : ''}
                  </span>
                )}
                {job.work_mode && (
                  <span className="flex items-center gap-1">
                    <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                    {job.work_mode === 'onsite'
                      ? 'Presencial'
                      : job.work_mode === 'hybrid'
                        ? 'Híbrido'
                        : 'Remoto'}
                  </span>
                )}
              </div>
            </div>
            <span className="text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t pt-4">
        <a
          href="/candidato/vagas/recomendadas"
          className="text-primary flex items-center justify-center gap-2 text-sm font-medium hover:underline"
        >
          Ver todas as {matchResults.length} vagas
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </Card>
  );
}
