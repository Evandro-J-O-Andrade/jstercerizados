import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { ClipboardList, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { recruitmentProcessesRepository } from '@/repositories/recruitment-processes.repository';
import { jobsRepository } from '@/repositories/jobs.repository';
import { cn } from '@/utils';
import type {
  RecruitmentProcess,
  RecruitmentProcessCreateInput,
  RecruitmentProcessUpdateInput,
} from '@/types/domain/recruitment-process';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Aberto' },
  { value: 'closed', label: 'Fechado' },
  { value: 'draft', label: 'Rascunho' },
] as const;

export default function ProcessosSeletivos() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [items, setItems] = useState<RecruitmentProcess[]>([]);
  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<RecruitmentProcess | null>(null);
  const [form, setForm] = useState({
    job_id: '',
    title: '',
    description: '',
    status: 'open' as RecruitmentProcess['status'],
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [processesData, jobsData] = await Promise.all([
          recruitmentProcessesRepository.findAll(currentTenantId),
          jobsRepository.findAll(currentTenantId),
        ]);
        if (!cancelled) {
          setItems(processesData);
          setJobs(jobsData.map((job) => ({ id: job.id, title: job.title })));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar processos seletivos',
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
      title: '',
      description: '',
      status: 'open',
    });
  };

  const openEdit = (processo: RecruitmentProcess) => {
    setSelected(processo);
    setForm({
      job_id: processo.job_id || '',
      title: processo.title,
      description: processo.description || '',
      status: processo.status,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload:
        RecruitmentProcessCreateInput | RecruitmentProcessUpdateInput = {
        job_id: form.job_id || null,
        title: form.title,
        description: form.description || null,
        status: form.status,
      };

      if (selected) {
        const updated = await recruitmentProcessesRepository.update(
          selected.id,
          currentTenantId,
          payload as RecruitmentProcessUpdateInput,
        );
        if (updated) {
          setItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          );
        }
      } else {
        const created = await recruitmentProcessesRepository.create({
          ...payload,
          tenant_id: currentTenantId,
        } as RecruitmentProcessCreateInput);
        if (created) {
          setItems((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        job_id: '',
        title: '',
        description: '',
        status: 'open',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar processo seletivo',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await recruitmentProcessesRepository.remove(id, currentTenantId || '');
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao remover processo seletivo',
      );
    }
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusLabel = (value: string) =>
    STATUS_OPTIONS.find((s) => s.value === value)?.label || value;

  return (
    <ModuleWorkspace
      title="Processos Seletivos"
      description="Acompanhe processos e etapas."
      icon={ClipboardList}
      breadcrumbItems={[{ label: 'Processos Seletivos' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo processo
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
              placeholder="Buscar por título ou descrição..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border px-3 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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
            <p className="text-muted-foreground">Carregando processos...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhum processo seletivo encontrado.
            </p>
          </Card>
        ) : (
          <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Título
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Status
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Vaga
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
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          item.status === 'open' &&
                            'bg-success/10 text-success',
                          item.status === 'closed' &&
                            'bg-warning/10 text-warning',
                          item.status === 'draft' &&
                            'bg-muted text-muted-foreground',
                        )}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {jobs.find((job) => job.id === item.job_id)?.title || '—'}
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

        {(selected || !selected) && (
          <Card className="p-6">
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              {selected ? 'Editar processo seletivo' : 'Novo processo seletivo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Vaga
                  </label>
                  <select
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
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as RecruitmentProcess['status'],
                      })
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Ex: Processo seletivo para Analista Administrativo"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Descrição
                  </label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Detalhes do processo seletivo"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  {selected ? 'Salvar alterações' : 'Criar processo'}
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
                        title: '',
                        description: '',
                        status: 'open',
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
      </div>
    </ModuleWorkspace>
  );
}

