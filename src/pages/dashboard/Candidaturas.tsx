import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { UserCheck, Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { applicationsRepository } from '@/repositories/applications.repository';
import { jobsRepository } from '@/repositories/jobs.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { cn } from '@/utils';
import type {
  Application,
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ApplicationStatusHistory,
} from '@/types/domain/application';

const APPLICATION_STAGES = [
  { value: 'submitted', label: 'Recebida' },
  { value: 'screening', label: 'Triagem' },
  { value: 'interview', label: 'Entrevista' },
  { value: 'technical_interview', label: 'Entrevista técnica' },
  { value: 'presentation', label: 'Apresentação' },
  { value: 'reference_check', label: 'Verificação de referências' },
  { value: 'offer', label: 'Proposta' },
  { value: 'hired', label: 'Contratado' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'withdrawn', label: 'Desistente' },
  { value: 'on_hold', label: 'Em espera' },
] as const;

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Site' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'E-mail' },
  { value: 'indication', label: 'Indicação' },
  { value: 'talent_pool', label: 'Banco de talentos' },
  { value: 'api', label: 'API' },
  { value: 'other', label: 'Outro' },
] as const;

type JobLite = { id: string; title: string };
type CandidateLite = { id: string; person?: { full_name?: string } | null };

export default function Candidaturas() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [candidates, setCandidates] = useState<CandidateLite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [candidateFilter, setCandidateFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Application | null>(null);
  const [history, setHistory] = useState<ApplicationStatusHistory[]>([]);
  const [form, setForm] = useState({
    job_id: '',
    candidate_id: '',
    source: 'website',
    notes: '',
    current_stage: 'submitted' as Application['current_stage'],
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [appsData, jobsData, candidatesData] = await Promise.all([
          applicationsRepository.findAll(currentTenantId),
          jobsRepository.findAll(currentTenantId, { status: 'published' }),
          candidatesRepository.findAll(currentTenantId),
        ]);
        if (!cancelled) {
          setApplications(appsData);
          setJobs(
            jobsData.map((job) => ({
              id: job.id,
              title: job.title,
            })),
          );
          setCandidates(
            candidatesData.map((candidate) => ({
              id: candidate.id,
              person: candidate.person,
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar candidaturas',
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
      job_id: '',
      candidate_id: '',
      source: 'website',
      notes: '',
      current_stage: 'submitted',
    });
  };

  const openEdit = (app: Application) => {
    setSelected(app);
    setForm({
      job_id: app.job_id,
      candidate_id: app.candidate_id,
      source: app.source || 'website',
      notes: app.notes || '',
      current_stage: app.current_stage,
    });
  };

  const openDetail = async (app: Application) => {
    setSelected(app);
    try {
      const historyRows = await applicationsRepository.findHistory(
        app.id,
        currentTenantId || '',
      );
      setHistory(historyRows);
    } catch (err) {
      setHistory([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: ApplicationCreateInput | ApplicationUpdateInput = {
        job_id: form.job_id,
        candidate_id: form.candidate_id,
        source: form.source,
        notes: form.notes || null,
        current_stage: form.current_stage,
      };

      if (selected) {
        const updated = await applicationsRepository.update(
          selected.id,
          currentTenantId,
          payload as ApplicationUpdateInput,
        );
        if (updated) {
          setApplications((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a)),
          );
        }
      } else {
        const created = await applicationsRepository.create({
          ...payload,
          tenant_id: currentTenantId,
        } as ApplicationCreateInput);
        if (created) {
          setApplications((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        job_id: '',
        candidate_id: '',
        source: 'website',
        notes: '',
        current_stage: 'submitted',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar candidatura',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await applicationsRepository.remove(id, currentTenantId || '');
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selected?.id === id) {
        setSelected(null);
        setHistory([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover candidatura',
      );
    }
  };

  const filtered = applications.filter((app) => {
    const candidateRecord = candidates.find(
      (c) => c.id === app.candidate_id,
    )?.person;
    const candidateName =
      (candidateRecord?.full_name as string | undefined) || '';
    const jobTitle = jobs.find((j) => j.id === app.job_id)?.title || '';
    const matchesSearch =
      !search ||
      candidateName.toLowerCase().includes(search.toLowerCase()) ||
      jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      (app.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchesStage =
      stageFilter === 'all' || app.current_stage === stageFilter;
    const matchesSource = sourceFilter === 'all' || app.source === sourceFilter;
    const matchesJob = jobFilter === 'all' || app.job_id === jobFilter;
    const matchesCandidate =
      candidateFilter === 'all' || app.candidate_id === candidateFilter;
    return (
      matchesSearch &&
      matchesStage &&
      matchesSource &&
      matchesJob &&
      matchesCandidate
    );
  });

  const stageLabel = (value: string) =>
    APPLICATION_STAGES.find((s) => s.value === value)?.label || value;

  const sourceLabel = (value: string) =>
    SOURCE_OPTIONS.find((s) => s.value === value)?.label || value;

  return (
    <ModuleWorkspace
      title="Candidaturas"
      description="Acompanhe as candidaturas, etapas e histórico."
      icon={UserCheck}
      breadcrumbItems={[{ label: 'Candidaturas' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova candidatura
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
              placeholder="Buscar por candidato, vaga ou observação..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="all">Todas as etapas</option>
              {APPLICATION_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">Todas as fontes</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            >
              <option value="all">Todas as vagas</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={candidateFilter}
              onChange={(e) => setCandidateFilter(e.target.value)}
            >
              <option value="all">Todos os candidatos</option>
              {candidates.map((candidate) => {
                const fullName = (
                  candidate.person as { full_name?: string } | undefined
                )?.full_name;
                return (
                  <option key={candidate.id} value={candidate.id}>
                    {fullName || candidate.id}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Carregando candidaturas...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhuma candidatura encontrada.
            </p>
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
                    Etapa
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Fonte
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((app) => {
                  const candidateRecord = candidates.find(
                    (c) => c.id === app.candidate_id,
                  )?.person;
                  const candidateName =
                    (candidateRecord?.full_name as string | undefined) || '—';
                  const jobTitle =
                    jobs.find((j) => j.id === app.job_id)?.title || '—';
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3 text-sm font-medium">
                        {candidateName}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {jobTitle}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium',
                            app.current_stage === 'hired' &&
                              'bg-success/10 text-success',
                            app.current_stage === 'rejected' &&
                              'bg-destructive/10 text-destructive',
                            app.current_stage === 'withdrawn' &&
                              'bg-muted text-muted-foreground',
                            ['interview', 'technical_interview'].includes(
                              app.current_stage,
                            ) && 'bg-warning/10 text-warning',
                            ![
                              'hired',
                              'rejected',
                              'withdrawn',
                              'interview',
                              'technical_interview',
                            ].includes(app.current_stage) &&
                              'bg-muted text-muted-foreground',
                          )}
                        >
                          {stageLabel(app.current_stage)}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {sourceLabel(app.source || 'other')}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {new Date(app.applied_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDetail(app)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(app)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(selected || !selected) && (
          <Card className="p-6">
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              {selected ? 'Editar candidatura' : 'Nova candidatura'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Vaga
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.job_id}
                    onChange={(e) =>
                      setForm({ ...form, job_id: e.target.value })
                    }
                  >
                    <option value="">Selecione uma vaga</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Candidato
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.candidate_id}
                    onChange={(e) =>
                      setForm({ ...form, candidate_id: e.target.value })
                    }
                  >
                    <option value="">Selecione um candidato</option>
                    {candidates.map((candidate) => {
                      const fullName = (
                        candidate.person as { full_name?: string } | undefined
                      )?.full_name;
                      return (
                        <option key={candidate.id} value={candidate.id}>
                          {fullName || candidate.id}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Fonte
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value })
                    }
                  >
                    {SOURCE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Etapa atual
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.current_stage}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        current_stage: e.target
                          .value as Application['current_stage'],
                      })
                    }
                  >
                    {APPLICATION_STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Observações
                  </label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Notas internas sobre a candidatura"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  {selected ? 'Salvar alterações' : 'Criar candidatura'}
                </Button>
                {selected && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(null);
                      setForm({
                        job_id: '',
                        candidate_id: '',
                        source: 'website',
                        notes: '',
                        current_stage: 'submitted',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>
        )}

        {selected && (
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                Histórico da candidatura
              </h3>
              <span className="text-muted-foreground text-xs">
                Atualizado em{' '}
                {new Date(selected.updated_at).toLocaleString('pt-BR')}
              </span>
            </div>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhuma alteração registrada.
              </p>
            ) : (
              <div className="divide-border max-h-96 space-y-3 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="border-border flex items-start justify-between rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {stageLabel(item.stage)}
                      </p>
                      {item.previous_stage && (
                        <p className="text-muted-foreground text-xs">
                          De: {stageLabel(item.previous_stage)}
                        </p>
                      )}
                      {item.reason && (
                        <p className="text-muted-foreground text-xs">
                          {item.reason}
                        </p>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {new Date(item.changed_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </ModuleWorkspace>
  );
}
