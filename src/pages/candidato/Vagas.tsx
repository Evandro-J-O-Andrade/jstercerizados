import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Heart,
  MapPin,
  Briefcase,
  Building2,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidate } from '@/contexts/CandidateContext';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { MatchScoreBadge } from '@/components/candidate/MatchScoreBadge';
import { MatchBreakdown } from '@/components/candidate/MatchBreakdown';
import type { MatchReason } from '@/types/domain/matching';

const CONTRACT_LABELS: Record<string, string> = {
  clt: 'CLT',
  internship: 'Estágio',
  temporary: 'Temporário',
  freelance: 'Freelance',
  contracted: 'Contratado',
  cd: 'CD',
};

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: 'Presencial',
  hybrid: 'Híbrido',
  remote: 'Remoto',
};

const SENIORITY_LABELS: Record<string, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  mid: 'Pleno',
  senior: 'Sênior',
  master: 'Master',
  leadership: 'Liderança',
  internship: 'Estágio',
};

export default function CandidateVagas() {
  const {
    publishedJobs,
    matchResults,
    favoriteIds,
    isLoading,
    error,
    toggleFavorite,
  } = useCandidate();
  const [search, setSearch] = useState('');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const matchMap = useMemo(() => {
    const map = new Map<string, (typeof matchResults)[number]['match']>();
    for (const { job, match } of matchResults) {
      map.set(job.id, match);
    }
    return map;
  }, [matchResults]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return publishedJobs;
    return publishedJobs.filter((j) => {
      const titleMatch = j.title.toLowerCase().includes(term);
      const cityMatch = (j.city ?? '').toLowerCase().includes(term);
      const seniorityMatch = (j.seniority ?? '').toLowerCase().includes(term);
      return titleMatch || cityMatch || seniorityMatch;
    });
  }, [publishedJobs, search]);

  return (
    <>
      <SEO
        title={`Vagas — ${COMPANY.name}`}
        description="Vagas disponíveis para candidatos"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Vagas disponíveis
          </h1>
          <p className="text-muted-foreground mt-1">
            Encontre oportunidades compatíveis com seu perfil.
          </p>
        </header>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por título, cidade ou senioridade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5 p-4">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando vagas...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="text-foreground font-medium">
              Nenhuma vaga encontrada
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {search
                ? 'Tente outros termos de busca.'
                : 'Não há vagas publicadas no momento.'}
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {filtered.map((job) => {
              const isFav = favoriteIds.has(job.id);
              const match = matchMap.get(job.id);
              const showMatchDetails = expandedMatchId === job.id;

              return (
                <li key={job.id}>
                  <Card className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-foreground text-base font-semibold">
                            {job.title}
                          </h3>
                          {match && (
                            <MatchScoreBadge
                              score={match.score}
                              compact={true}
                            />
                          )}
                        </div>
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          {job.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.city}
                              {job.state ? `/${job.state}` : ''}
                            </span>
                          )}
                          {job.contract_type && (
                            <span>
                              {CONTRACT_LABELS[job.contract_type] ??
                                job.contract_type}
                            </span>
                          )}
                          {job.work_mode && (
                            <span>
                              {WORK_MODE_LABELS[job.work_mode] ?? job.work_mode}
                            </span>
                          )}
                          {job.seniority && (
                            <span>
                              {SENIORITY_LABELS[job.seniority.toLowerCase()] ??
                                job.seniority}
                            </span>
                          )}
                        </div>

                        {match && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {match.reasons.slice(0, 3).map((r: MatchReason) => (
                              <Badge
                                key={r.criterion}
                                variant={r.matched ? 'success' : 'outline'}
                                className="text-xs"
                              >
                                {r.criterion}: {r.weight}pts
                              </Badge>
                            ))}
                          </div>
                        )}

                        {showMatchDetails && match && (
                          <div className="mt-3">
                            <MatchBreakdown match={match} />
                          </div>
                        )}

                        {match && (
                          <button
                            onClick={() =>
                              setExpandedMatchId(
                                showMatchDetails ? null : job.id,
                              )
                            }
                            className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1 text-xs font-medium"
                          >
                            <TrendingUp className="h-3 w-3" />
                            {showMatchDetails
                              ? 'Ocultar detalhes'
                              : 'Ver por que esta vaga combina'}
                          </button>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void toggleFavorite(job.id)}
                          aria-label={
                            isFav ? 'Remover dos favoritos' : 'Favoritar'
                          }
                        >
                          <Heart
                            className={
                              isFav
                                ? 'fill-destructive text-destructive h-5 w-5'
                                : 'h-5 w-5'
                            }
                          />
                        </Button>
                        <Link to={`/vagas/${job.slug}`}>
                          <Button variant="primary" size="sm">
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Ver
                          </Button>
                        </Link>
                      </div>
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
