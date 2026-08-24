import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { jobsRepository } from '@/repositories/jobs.repository';
import { cn } from '@/utils';
import type { Job } from '@/types/domain/job';

export default function Vagas() {
  const { currentTenantId } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await jobsRepository.findAll(currentTenantId);
        if (!cancelled) {
          setJobs(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar vagas',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentTenantId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold">Vagas</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as vagas abertas da sua empresa.
        </p>
      </div>

      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando vagas...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhuma vaga cadastrada no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.employment_type && (
                      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                        {job.employment_type}
                      </span>
                    )}
                    {job.location && (
                      <span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-medium">
                        {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="bg-success/10 text-success rounded-full px-3 py-1 text-xs font-medium">
                        {job.salary}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    job.status === 'published' && 'bg-success/10 text-success',
                    job.status === 'draft' && 'bg-warning/10 text-warning',
                    job.status === 'archived' &&
                      'bg-muted text-muted-foreground',
                    job.status === 'hired' && 'bg-primary/10 text-primary',
                    job.status === 'expired' &&
                      'bg-destructive/10 text-destructive',
                  )}
                >
                  {job.status === 'published'
                    ? 'Publicada'
                    : job.status === 'draft'
                      ? 'Rascunho'
                      : job.status === 'archived'
                        ? 'Arquivada'
                        : job.status === 'hired'
                          ? 'Preenchida'
                          : job.status === 'expired'
                            ? 'Expirada'
                            : job.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
