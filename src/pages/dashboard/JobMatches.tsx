import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Search, Play, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { jobMatchesRepository } from '@/repositories/job-matches.repository';
import {
  recruitmentDemandsRepository,
  type RecruitmentDemandOption,
} from '@/repositories/recruitment-demands.repository';
import type { JobMatchGenerateResult } from '@/types/domain/candidate';

type PersonName = Record<string, string>;

export default function JobMatches() {
  const { currentTenantId } = useAuth();
  const [demands, setDemands] = useState<RecruitmentDemandOption[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<string>('');
  const [generated, setGenerated] = useState<JobMatchGenerateResult[]>([]);
  const [names, setNames] = useState<PersonName>({});
  const [isLoadingDemands, setIsLoadingDemands] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!currentTenantId) return;

    setIsLoadingDemands(true);
    setError(null);

    recruitmentDemandsRepository
      .findAll(currentTenantId)
      .then((rows) => {
        if (!cancelled) {
          setDemands(rows);
          if (rows.length) setSelectedDemand(rows[0].id);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar demandas',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDemands(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentTenantId]);

  const resolveNames = async (candidateIds: string[]) => {
    if (!candidateIds.length) {
      setNames({});
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data, error: err } = await supabase
      .from('people')
      .select('id, full_name')
      .in('id', candidateIds);

    if (err) {
      console.error('[JobMatches] people lookup', err);
      return;
    }

    const map: PersonName = {};
    (data || []).forEach((p) => {
      map[p.id] = (p.full_name as string) || p.id;
    });
    setNames(map);
  };

  const handleGenerate = async () => {
    if (!selectedDemand) return;

    setIsGenerating(true);
    setError(null);
    setGenerated([]);

    try {
      const result =
        await jobMatchesRepository.generateByDemand(selectedDemand);
      setGenerated(result);
      await resolveNames(result.map((r) => r.candidate_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar matches');
    } finally {
      setIsGenerating(false);
    }
  };

  const demandLabel = (d: RecruitmentDemandOption) => d.position;

  return (
    <ModuleWorkspace
      title="Matches de Vagas"
      description="Gere e visualize matches entre candidatos e demandas de recrutamento."
      icon={Search}
      breadcrumbItems={[{ label: 'Matches' }]}
    >
      <div className="space-y-4">
        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Gerar matches para uma demanda
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            O matching é calculado pelo backend via RPC{' '}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">
              match_candidates_to_demand
            </code>
            . Selecione uma demanda e clique em gerar.
          </p>

          {isLoadingDemands ? (
            <p className="text-muted-foreground text-sm">
              Carregando demandas de recrutamento...
            </p>
          ) : demands.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma demanda de recrutamento encontrada para este locatário.
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label className="text-muted-foreground block text-xs font-semibold uppercase">
                  Demanda
                </label>
                <select
                  className="mt-1 rounded-lg border px-3 py-2 text-sm"
                  value={selectedDemand}
                  onChange={(e) => setSelectedDemand(e.target.value)}
                  disabled={isGenerating}
                >
                  {demands.map((d) => (
                    <option key={d.id} value={d.id}>
                      {demandLabel(d)} — {d.status}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerate}
                disabled={!selectedDemand || isGenerating}
              >
                <Play className="h-4 w-4" />
                {isGenerating ? 'Gerando...' : 'Gerar matches'}
              </Button>
            </div>
          )}
        </Card>

        {generated.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-sm">
              Nenhum match gerado. Selecione uma demanda e gere matches.
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {generated.length} candidato(s) matchado(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-x-2 divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                      Candidato
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {generated.map((g) => (
                    <tr key={g.candidate_id} className="hover:bg-muted/30">
                      <td className="text-foreground px-4 py-3 text-sm">
                        {names[g.candidate_id] || g.candidate_id}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {typeof g.score === 'number'
                          ? g.score.toFixed(2)
                          : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </ModuleWorkspace>
  );
}
