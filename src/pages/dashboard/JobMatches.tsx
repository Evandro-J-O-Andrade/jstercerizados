import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { jobMatchesRepository } from '@/repositories/job-matches.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type {
  JobMatch,
  JobMatchCreateInput,
  JobMatchUpdateInput,
} from '@/types/domain/candidate';

export default function JobMatches() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [candidates, setCandidates] = useState<
    Array<{ id: string; person?: { full_name?: string } | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [candidateFilter, setCandidateFilter] = useState<string>('all');
  const [selected, setSelected] = useState<JobMatch | null>(null);
  const [form, setForm] = useState({
    candidate_id: '',
    job_id: '',
    score: '',
    algorithm_version: '1.0',
    is_eligible: true,
    sent_notification: false,
    invalidated_at: '',
    invalidated_reason: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [matchesData, candidatesData] = await Promise.all([
          jobMatchesRepository.findByTenant(currentTenantId),
          candidatesRepository.findAll(currentTenantId),
        ]);

        if (!cancelled) {
          setMatches(matchesData);
          setCandidates(
            candidatesData.map((c) => ({
              id: c.id,
              person: c.person,
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar matches',
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

  const openCreate = () => {
    setSelected(null);
    setForm({
      candidate_id: '',
      job_id: '',
      score: '',
      algorithm_version: '1.0',
      is_eligible: true,
      sent_notification: false,
      invalidated_at: '',
      invalidated_reason: '',
    });
  };

  const openEdit = (item: JobMatch) => {
    setSelected(item);
    setForm({
      candidate_id: item.candidate_id,
      job_id: item.job_id,
      score: item.score.toString(),
      algorithm_version: item.algorithm_version || '1.0',
      is_eligible: item.is_eligible,
      sent_notification: item.sent_notification,
      invalidated_at: item.invalidated_at || '',
      invalidated_reason: item.invalidated_reason || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: JobMatchCreateInput | JobMatchUpdateInput = {
        candidate_id: form.candidate_id,
        job_id: form.job_id,
        tenant_id: currentTenantId,
        score: Number(form.score),
        algorithm_version: form.algorithm_version,
        is_eligible: form.is_eligible,
        sent_notification: form.sent_notification,
      };

      if (selected) {
        const updated = await jobMatchesRepository.update(
          selected.id,
          selected.tenant_id,
          payload as JobMatchUpdateInput,
        );
        setMatches((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)),
        );
      } else {
        const created = await jobMatchesRepository.create(
          payload as JobMatchCreateInput,
        );
        setMatches((prev) => [created, ...prev]);
      }

      setSelected(null);
      setForm({
        candidate_id: '',
        job_id: '',
        score: '',
        algorithm_version: '1.0',
        is_eligible: true,
        sent_notification: false,
        invalidated_at: '',
        invalidated_reason: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar match');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const item = matches.find((m) => m.id === id);
      if (!item) return;
      await jobMatchesRepository.delete(id, item.tenant_id);
      setMatches((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover match');
    }
  };

  const filtered = matches.filter((item) => {
    const candidate = candidates.find((c) => c.id === item.candidate_id);
    const text =
      `${candidate?.person?.full_name || ''} ${item.job_id}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    const matchesCandidate =
      candidateFilter === 'all' || item.candidate_id === candidateFilter;
    return matchesSearch && matchesCandidate;
  });

  const candidateLabel = (candidateId: string) => {
    const c = candidates.find((item) => item.id === candidateId);
    return c?.person?.full_name || '—';
  };

  return (
    <ModuleWorkspace
      title="Matches de Vagas"
      description="Gerencie os matches entre candidatos e vagas."
      icon={Search}
      breadcrumbItems={[{ label: 'Matches' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo match
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Search className="text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por candidato ou vaga..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border px-3 py-1.5 text-sm"
            value={candidateFilter}
            onChange={(e) => setCandidateFilter(e.target.value)}
          >
            <option value="all">Todos os candidatos</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.person?.full_name || 'Sem nome'}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Carregando matches...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Nenhum match encontrado.</p>
          </Card>
        ) : (
          <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Candidato
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Vaga
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Score
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Elegível
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {candidateLabel(item.candidate_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {item.job_id}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {item.score.toFixed(2)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {item.is_eligible ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Card className="p-6">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {selected ? 'Editar match' : 'Novo match'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Candidato
                </label>
                <select
                  required
                  disabled={!!selected}
                  className="w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                  value={form.candidate_id}
                  onChange={(e) =>
                    setForm({ ...form, candidate_id: e.target.value })
                  }
                >
                  <option value="">Selecione um candidato</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.person?.full_name || 'Sem nome'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  ID da Vaga
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.job_id}
                  onChange={(e) => setForm({ ...form, job_id: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Versão do algoritmo
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.algorithm_version}
                  onChange={(e) =>
                    setForm({ ...form, algorithm_version: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_eligible}
                    onChange={(e) =>
                      setForm({ ...form, is_eligible: e.target.checked })
                    }
                  />
                  <span className="text-sm">Elegível</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.sent_notification}
                    onChange={(e) =>
                      setForm({ ...form, sent_notification: e.target.checked })
                    }
                  />
                  <span className="text-sm">Notificação enviada</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm">
                {selected ? 'Salvar alterações' : 'Criar match'}
              </Button>
              {selected && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelected(null);
                    setForm({
                      candidate_id: '',
                      job_id: '',
                      score: '',
                      algorithm_version: '1.0',
                      is_eligible: true,
                      sent_notification: false,
                      invalidated_at: '',
                      invalidated_reason: '',
                    });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </ModuleWorkspace>
  );
}

