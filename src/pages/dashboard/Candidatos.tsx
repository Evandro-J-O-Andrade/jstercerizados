import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { cn } from '@/utils';
import { Users } from 'lucide-react';
import type { Candidate } from '@/types/domain/candidate';

export default function Candidatos() {
  const { currentTenantId } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await candidatesRepository.findAll(currentTenantId);
        if (!cancelled) {
          setCandidates(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar candidatos',
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
    <ModuleWorkspace
      title="Candidatos"
      description="Acompanhe os candidatos inscritos."
      icon={Users}
      breadcrumbItems={[{ label: 'Candidatos' }]}
    >
      {isLoading && (
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando candidatos...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {!isLoading && !error && candidates.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhum candidato cadastrado no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && candidates.length > 0 && (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {candidate.person?.full_name || 'Sem nome'}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {candidate.person?.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.person?.phone && (
                      <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                        {candidate.person.phone}
                      </span>
                    )}
                    {candidate.person?.document && (
                      <span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-medium">
                        {candidate.person.document}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    candidate.status === 'active' &&
                      'bg-success/10 text-success',
                    candidate.status === 'inactive' &&
                      'bg-warning/10 text-warning',
                    candidate.status === 'pending' &&
                      'bg-muted text-muted-foreground',
                  )}
                >
                  {candidate.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ModuleWorkspace>
  );
}
