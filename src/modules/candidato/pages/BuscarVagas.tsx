import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { Search, MapPin, Briefcase } from 'lucide-react';
import type { PublishedJobWithSkills } from '@/modules/candidato/repositories/candidate-portal';

const CANDIDATO_HOME = '/candidato';

function formatSalary(min?: number | null, max?: number | null): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(n);
  if (min && max) return `${fmt(min)} — ${fmt(max)}`;
  if (min) return `A partir de ${fmt(min)}`;
  if (max) return fmt(max);
  return 'A combinar';
}

function JobCard({ job }: { job: PublishedJobWithSkills }) {
  const { addToast } = useToast();
  const { toggleFavorite, favoriteIds } = useCandidato();

  const isFavorited = favoriteIds.has(job.id);

  const handleToggleFav = async () => {
    const result = await toggleFavorite(job.id);
    if (result?.error) {
      addToast({ type: 'error', message: result.error });
    } else {
      addToast({
        type: 'success',
        message: isFavorited ? 'Vaga desfavoritada!' : 'Vaga favoritada!',
      });
    }
  };

  return (
    <Card variant="default" className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <h3 className="text-foreground text-lg font-semibold">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {job.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.city}{' '}
                {job.state && `/ ${job.state}`}
              </span>
            )}
            {job.contract_type && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {job.contract_type}
              </span>
            )}
            {job.work_mode && <span>{job.work_mode}</span>}
            {job.seniority && <span>{job.seniority}</span>}
          </div>
          <p className="text-sm font-medium text-slate-700">
            {formatSalary(job.salary_min, job.salary_max)}
          </p>
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {job.skills.slice(0, 5).map((s) => (
                <Badge key={s.id} variant="outline" className="text-xs">
                  {s.skill_name ?? s.skill_id}
                </Badge>
              ))}
              {job.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button
          variant={isFavorited ? 'primary' : 'outline'}
          size="sm"
          onClick={handleToggleFav}
        >
          {isFavorited ? 'Favoritado' : 'Favoritar'}
        </Button>
      </div>
    </Card>
  );
}

export default function CandidateBuscarVagas() {
  const { publishedJobs, isLoading, error, refetch } = useCandidato();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filtered = useMemo(() => {
    if (!publishedJobs) return [];
    return publishedJobs.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        job.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation =
        !locationFilter ||
        job.city?.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });
  }, [publishedJobs, searchTerm, locationFilter]);

  return (
    <>
      <SEO
        title={`Buscar vagas — ${COMPANY.name}`}
        description="Encontre vagas compatíveis com seu perfil"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Buscar vagas
          </h1>
          <p className="text-muted-foreground mt-1">
            Encontre oportunidades compatíveis com seu perfil.
          </p>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome da vaga..."
              className="pl-10"
            />
          </div>
          <div className="relative sm:max-w-xs">
            <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Cidade..."
              className="pl-10"
            />
          </div>
        </div>

        <ContentBoundary
          status={
            isLoading
              ? 'loading'
              : error
                ? 'error'
                : publishedJobs
                  ? 'success'
                  : 'empty'
          }
          error={error}
          onRetry={() => void refetch()}
          homeRoute={CANDIDATO_HOME}
          emptyTitle="Nenhuma vaga disponível"
          emptyDescription="Volte mais tarde ou ajuste sua busca."
        >
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <Search className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
              <p className="text-muted-foreground">
                {searchTerm || locationFilter
                  ? 'Nenhuma vaga corresponde aos filtros.'
                  : 'Ainda não há vagas disponíveis.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </ContentBoundary>
      </div>
    </>
  );
}

