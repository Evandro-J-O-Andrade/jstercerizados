import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { Sparkles, Brain } from 'lucide-react';

const CANDIDATO_HOME = '/candidato';

function MatchBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  let variant: 'success' | 'warning' | 'danger' | 'default' = 'default';
  let label = 'Match';
  if (pct >= 80) {
    variant = 'success';
    label = 'Excelente';
  } else if (pct >= 60) {
    variant = 'warning';
    label = 'Bom';
  } else if (pct >= 40) {
    variant = 'default';
    label = 'Regular';
  } else {
    variant = 'danger';
    label = 'Baixo';
  }
  return (
    <Badge variant={variant} className="text-xs font-medium">
      {pct}% — {label}
    </Badge>
  );
}

export default function CandidateVagasRecomendadas() {
const {
    matchResults,
    favoriteIds,
    isLoading,
    error,
    refetch,
    toggleFavorite,
  } = useCandidato();

  return (
    <>
      <SEO
        title={`Vagas recomendadas — ${COMPANY.name}`}
        description="Vagas compatíveis baseadas em seu perfil e matching"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Vagas recomendadas
          </h1>
          <p className="text-muted-foreground mt-1">
            Baseado no seu perfil e critérios de matching.
          </p>
        </header>

        <ContentBoundary
          status={
            isLoading
              ? 'loading'
              : error
                ? 'error'
                : matchResults && matchResults.length > 0
                  ? 'success'
                  : 'empty'
          }
          error={error}
          onRetry={() => void refetch()}
          homeRoute={CANDIDATO_HOME}
          emptyTitle="Nenhuma vaga recomendada"
          emptyDescription="Complete seu perfil para receber recomendações personalizadas."
        >
          {matchResults && matchResults.length > 0 ? (
            <div className="space-y-3">
              {matchResults.map(({ job, match }) => {
                const isFavorited = favoriteIds.has(job.id);
                return (
                  <Card key={job.id} variant="default" className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Brain className="text-primary h-4 w-4" />
                          <h3 className="text-foreground font-semibold">
                            {job.title}
                          </h3>
                          <MatchBadge score={match.score} />
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {job.city}
                          {job.state && ` ⬢ ${job.state}`}
                        </div>
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {job.skills.slice(0, 5).map((s) => (
                              <Badge
                                key={s.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {s.skill_name ?? s.skill_id}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {job.published_at && (
                          <p className="text-muted-foreground text-xs">
                            Publicada em{' '}
                            {new Date(job.published_at).toLocaleDateString(
                              'pt-BR',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant={isFavorited ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => void toggleFavorite(job.id)}
                        >
                          {isFavorited ? 'Favoritado' : 'Favoritar'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Sparkles className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground">
                Ainda não há recomendações. Complete seu perfil para receber
                vagas compatíveis.
              </p>
            </div>
          )}
        </ContentBoundary>
      </div>
    </>
  );
}

