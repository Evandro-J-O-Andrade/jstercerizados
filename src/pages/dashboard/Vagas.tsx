import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Briefcase, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { jobRepository } from '@/repositories/job.repository';
import { cn } from '@/utils';
import type {
  Job,
  JobCreateInput,
  JobUpdateInput,
  WorkMode,
} from '@/types/domain/job';

const JOB_STATUS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicada' },
  { value: 'archived', label: 'Arquivada' },
  { value: 'hired', label: 'Preenchida' },
  { value: 'expired', label: 'Expirada' },
] as const;

const CONTRACT_TYPE_OPTIONS = [
  { value: 'clt', label: 'CLT' },
  { value: 'internship', label: 'Estágio' },
  { value: 'temporary', label: 'Temporário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contracted', label: 'Contratado' },
  { value: 'cd', label: 'CD' },
] as const;

const WORK_MODE_OPTIONS = [
  { value: 'onsite', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'remote', label: 'Remoto' },
] as const;

const SALARY_TYPE_OPTIONS = [
  { value: 'negotiate', label: 'Negociável' },
  { value: 'range', label: 'Faixa' },
  { value: 'monthly', label: 'Mensal' },
] as const;

export default function Vagas() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const { addToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [workModeFilter, setWorkModeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_relationship_id: '' as string | null,
    title: '',
    slug: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    salary_min: '',
    salary_max: '',
    salary_type: 'negotiate',
    contract_type: 'clt',
    seniority: '',
    work_hours: '',
    work_mode: 'onsite' as WorkMode,
    city: '',
    state: '',
    location_detail: '',
    status: 'draft' as Job['status'],
    published_at: '',
    expires_at: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await jobRepository.findAll(currentTenantId);
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

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesContract =
      contractFilter === 'all' || job.contract_type === contractFilter;
    const matchesWorkMode =
      workModeFilter === 'all' || job.work_mode === workModeFilter;
    return matchesSearch && matchesStatus && matchesContract && matchesWorkMode;
  });

  const openCreate = () => {
    setSelected(null);
    setForm({
      company_relationship_id: '',
      title: '',
      slug: '',
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      salary_min: '',
      salary_max: '',
      salary_type: 'negotiate',
      contract_type: 'clt',
      seniority: '',
      work_hours: '',
      work_mode: 'onsite',
      city: '',
      state: '',
      location_detail: '',
      status: 'draft',
      published_at: '',
      expires_at: '',
    });
  };

  const openEdit = (job: Job) => {
    setSelected(job);
    setForm({
      company_relationship_id: job.company_relationship_id || '',
      title: job.title,
      slug: job.slug,
      description: job.description || '',
      responsibilities: job.responsibilities || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      salary_type: job.salary_type || 'negotiate',
      contract_type: job.contract_type || 'clt',
      seniority: job.seniority || '',
      work_hours: job.work_hours || '',
      work_mode: job.work_mode || 'onsite',
      city: job.city || '',
      state: job.state || '',
      location_detail: job.location_detail || '',
      status: job.status,
      published_at: job.published_at || '',
      expires_at: job.expires_at || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: JobCreateInput | JobUpdateInput = {
        company_relationship_id: form.company_relationship_id || null,
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        responsibilities: form.responsibilities || null,
        requirements: form.requirements || null,
        benefits: form.benefits || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        salary_type: form.salary_type,
        contract_type: form.contract_type,
        seniority: form.seniority || null,
        work_hours: form.work_hours || null,
        work_mode: form.work_mode,
        city: form.city || null,
        state: form.state || null,
        location_detail: form.location_detail || null,
        status: form.status,
        published_at: form.published_at || null,
        expires_at: form.expires_at || null,
      };

      if (selected) {
        const updated = await jobRepository.update(
          selected.id,
          currentTenantId || '',
          payload as JobUpdateInput,
        );
        setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      } else {
        const created = await jobRepository.create(
          { ...payload, tenant_id: currentTenantId || '' } as JobCreateInput,
          currentTenantId || '',
        );
        setJobs((prev) => [created, ...prev]);
      }

      setSelected(null);
      setForm({
        company_relationship_id: '',
        title: '',
        slug: '',
        description: '',
        responsibilities: '',
        requirements: '',
        benefits: '',
        salary_min: '',
        salary_max: '',
        salary_type: 'negotiate',
        contract_type: 'clt',
        seniority: '',
        work_hours: '',
        work_mode: 'onsite',
        city: '',
        state: '',
        location_detail: '',
        status: 'draft',
        published_at: '',
        expires_at: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar vaga');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm || !currentTenantId) return;
    try {
      await jobRepository.delete(deleteConfirm, currentTenantId);
      setJobs((prev) => prev.filter((j) => j.id !== deleteConfirm));
      addToast({ type: 'success', message: 'Vaga removida com sucesso.' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover vaga',
      );
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao remover vaga',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <ModuleWorkspace
      title="Vagas"
      description="Gerencie as vagas abertas e publicadas."
      icon={Briefcase}
      breadcrumbItems={[{ label: 'Vagas' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova vaga
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
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              {JOB_STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              {CONTRACT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
            >
              <option value="all">Todas as modalidades</option>
              {WORK_MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
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
            <p className="text-muted-foreground">Carregando vagas...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Nenhuma vaga encontrada.</p>
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
                    Tipo
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Modalidade
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Local
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Status
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {job.title}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {CONTRACT_TYPE_OPTIONS.find(
                        (opt) => opt.value === job.contract_type,
                      )?.label ||
                        job.contract_type ||
                        '—'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {WORK_MODE_OPTIONS.find(
                        (opt) => opt.value === job.work_mode,
                      )?.label ||
                        job.work_mode ||
                        '—'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {[job.city, job.state].filter(Boolean).join('/') || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          job.status === 'draft' &&
                            'bg-muted text-muted-foreground',
                          job.status === 'published' &&
                            'bg-success/10 text-success',
                          job.status === 'archived' &&
                            'bg-warning/10 text-warning',
                          job.status === 'hired' &&
                            'bg-primary/10 text-primary',
                          job.status === 'expired' &&
                            'bg-destructive/10 text-destructive',
                        )}
                      >
                        {JOB_STATUS.find((s) => s.value === job.status)
                          ?.label || job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(job)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(job.id)}
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
              {selected ? 'Editar vaga' : 'Nova vaga'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Tipo de contrato
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.contract_type}
                    onChange={(e) =>
                      setForm({ ...form, contract_type: e.target.value })
                    }
                  >
                    {CONTRACT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Modalidade
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.work_mode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        work_mode: e.target.value as WorkMode,
                      })
                    }
                  >
                    {WORK_MODE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Salário mínimo
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.salary_min}
                    onChange={(e) =>
                      setForm({ ...form, salary_min: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Salário máximo
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.salary_max}
                    onChange={(e) =>
                      setForm({ ...form, salary_max: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Tipo de salário
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.salary_type ?? 'negotiate'}
                    onChange={(e) =>
                      setForm({ ...form, salary_type: e.target.value })
                    }
                  >
                    {SALARY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Senioridade
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.seniority}
                    onChange={(e) =>
                      setForm({ ...form, seniority: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Cidade
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Estado
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Publicação
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.published_at}
                    onChange={(e) =>
                      setForm({ ...form, published_at: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Expiração
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.expires_at}
                    onChange={(e) =>
                      setForm({ ...form, expires_at: e.target.value })
                    }
                  />
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
                        status: e.target.value as Job['status'],
                      })
                    }
                  >
                    {JOB_STATUS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary">
                  {selected ? 'Salvar' : 'Criar'}
                </Button>
                {selected && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelected(null);
                      setForm({
                        company_relationship_id: '',
                        title: '',
                        slug: '',
                        description: '',
                        responsibilities: '',
                        requirements: '',
                        benefits: '',
                        salary_min: '',
                        salary_max: '',
                        salary_type: 'negotiate',
                        contract_type: 'clt',
                        seniority: '',
                        work_hours: '',
                        work_mode: 'onsite',
                        city: '',
                        state: '',
                        location_detail: '',
                        status: 'draft',
                        published_at: '',
                        expires_at: '',
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

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Remover vaga?"
        message="Tem certeza que deseja remover esta vaga? Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </ModuleWorkspace>
  );
}

