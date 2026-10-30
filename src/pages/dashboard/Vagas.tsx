import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Search, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';
import { jobsRepository } from '@/modules/recrutamento/repositories/jobs.repository';
import { getSupabaseClient } from '@/lib/supabase';
import { MediaUploader } from '@/components/media';
import type { MediaAsset } from '@/components/media/MediaUploader.types';
import {
  getJobStatusLabel,
} from '@/modules/recrutamento/constants/jobStatus';
import {
  getContractTypeLabel,
} from '@/modules/recrutamento/constants/contractType';
import {
  getWorkModeLabel,
} from '@/modules/recrutamento/constants/workMode';
import {
  getSeniorityLabel,
} from '@/modules/recrutamento/constants/seniority';
import type {
  Job,
  JobFilters,
  CreateJobInput,
  UpdateJobInput,
  JobStatus,
  ContractType,
  WorkMode,
  Seniority,
  SalaryType,
} from '@/modules/recrutamento/types';

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'paused', label: 'Pausado' },
  { value: 'closed', label: 'Fechado' },
  { value: 'filled', label: 'Preenchido' },
  { value: 'cancelled', label: 'Cancelado' },
];

const CONTRACT_TYPE_OPTIONS: { value: ContractType; label: string }[] = [
  { value: 'clt', label: 'CLT' },
  { value: 'internship', label: 'Estágio' },
  { value: 'temporary', label: 'Temporário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contracted', label: 'PJ' },
  { value: 'cd', label: 'CD' },
];

const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: 'onsite', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'remote', label: 'Remoto' },
];

const SENIORITY_OPTIONS: { value: Seniority; label: string }[] = [
  { value: 'internship', label: 'Estágio' },
  { value: 'junior', label: 'Júnior' },
  { value: 'mid', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'master', label: 'Master' },
  { value: 'leadership', label: 'Liderança' },
];

export default function VagasPage({
  moduleTitle = 'Vagas',
  moduleDescription = 'Gerencie as vagas de emprego disponíveis.',
}: {
  moduleTitle?: string;
  moduleDescription?: string;
} = {}) {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const { addToast } = useToast();

  const canRead = hasAnyPermission(['jobs.read']);
  const canCreate = hasAnyPermission(['jobs.create']);
  const canUpdate = hasAnyPermission(['jobs.update']);
  const canDelete = hasAnyPermission(['jobs.delete']);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [contractTypeFilter, setContractTypeFilter] = useState<
    ContractType | 'all'
  >('all');
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | 'all'>('all');
  const [seniorityFilter, setSeniorityFilter] = useState<
    Seniority | 'all'
  >('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<CreateJobInput & { imagemUrl?: string }>({
    tenant_id: currentTenantId || '',
    company_id: null,
    company_relationship_id: null,
    title: '',
    slug: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    salary_min: undefined,
    salary_max: undefined,
    salary_type: 'negotiate',
    contract_type: 'clt',
    seniority: undefined,
    work_hours: '',
    work_mode: 'onsite',
    city: '',
    state: '',
    location_detail: '',
    status: 'draft',
    imagemUrl: undefined,
  });

  useEffect(() => {
    if (!currentTenantId) {
      setJobs([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const filters: JobFilters = {
          tenant_id: currentTenantId!,
          search: search || undefined,
          status:
            statusFilter === 'all' ? undefined : [statusFilter],
          contract_type:
            contractTypeFilter === 'all'
              ? undefined
              : [contractTypeFilter],
          work_mode:
            workModeFilter === 'all' ? undefined : [workModeFilter],
          seniority: seniorityFilter === 'all' ? undefined : [seniorityFilter],
          limit: pageSize,
          offset: (page - 1) * pageSize,
        };

        const result = await jobsRepository.list(filters);

        if (cancelled) return;

        if (result.error) {
          setError(result.error.message);
          setJobs([]);
          setTotal(0);
        } else {
          setJobs(result.data || []);
          setTotal(result.count || 0);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar vagas',
        );
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
  }, [
    currentTenantId,
    search,
    statusFilter,
    contractTypeFilter,
    workModeFilter,
    seniorityFilter,
    page,
    pageSize,
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const openCreate = () => {
    setSelected(null);
    setFormError(null);
    setForm({
      tenant_id: currentTenantId || '',
      company_id: null,
      company_relationship_id: null,
      title: '',
      slug: '',
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      salary_min: undefined,
      salary_max: undefined,
      salary_type: 'negotiate',
      contract_type: 'clt',
      seniority: undefined,
      work_hours: '',
      work_mode: 'onsite',
      city: '',
      state: '',
      location_detail: '',
      status: 'draft',
      imagemUrl: undefined,
    });
  };

  const openEdit = (job: Job) => {
    setSelected(job);
    setFormError(null);
    const metadata = job.metadata as Record<string, unknown> | undefined;
    setForm({
      tenant_id: job.tenant_id,
      company_id: job.company_id,
      company_relationship_id: job.company_relationship_id,
      title: job.title,
      slug: job.slug,
      description: job.description || '',
      responsibilities: job.responsibilities || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      salary_min: job.salary_min ?? undefined,
      salary_max: job.salary_max ?? undefined,
      salary_type: job.salary_type,
      contract_type: job.contract_type,
      seniority: job.seniority ?? undefined,
      work_hours: job.work_hours || '',
      work_mode: job.work_mode,
      city: job.city || '',
      state: job.state || '',
      location_detail: job.location_detail || '',
      status: job.status,
      imagemUrl: metadata?.imagem_url as string | undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentTenantId) {
      setFormError('Tenant não identificado.');
      return;
    }

    if (!form.title.trim()) {
      setFormError('O título da vaga é obrigatório.');
      return;
    }

    if (!form.slug.trim()) {
      setFormError('O slug da vaga é obrigatório.');
      return;
    }

    // Validar unicidade do slug (exceto o próprio job em edição)
    const slugExists = jobs.some(
      (j) => j.slug === form.slug.trim() && j.id !== (selected?.id ?? ''),
    );
    if (slugExists) {
      setFormError('Este slug já está em uso por outra vaga. Escolha um slug diferente.');
      return;
    }

    setSubmitting(true);

    try {
      const { imagemUrl, ...jobFields } = form;
      const payload: CreateJobInput | UpdateJobInput = {
        ...jobFields,
        tenant_id: currentTenantId!,
        metadata: imagemUrl ? { imagem_url: imagemUrl } : {},
      };

      if (selected) {
        const result = await jobsRepository.update({
          id: selected.id,
          ...payload,
        } as UpdateJobInput);

        if (result.error) {
          setFormError(result.error.message);
          return;
        }

        setJobs((prev) =>
          prev.map((j) => (j.id === result.data!.id ? result.data! : j)),
        );
        addToast({
          type: 'success',
          message: 'Vaga atualizada com sucesso.',
        });

        // Registrar redirect de slug quando o endereço muda após publicação
        if (selected.slug !== form.slug.trim() && currentTenantId) {
          try {
            const supabase = getSupabaseClient();
            if (supabase) {
              await supabase.from('job_slug_redirects').insert({
                tenant_id: currentTenantId,
                job_id: selected.id,
                old_slug: selected.slug,
                new_slug: form.slug.trim(),
              });
            }
          } catch {
            // Não bloqueia o fluxo se o redirect não puder ser gravado
          }
        }
      } else {
        const result = await jobsRepository.create(payload as CreateJobInput);

        if (result.error) {
          setFormError(result.error.message);
          return;
        }

        setJobs((prev) => [result.data!, ...prev]);
        setTotal((prev) => prev + 1);
        addToast({
          type: 'success',
          message: 'Vaga criada com sucesso.',
        });
        setSelected(result.data!);
      }

      // Manter o job selecionado para permitir upload de mídia via MediaUploader
      const currentImagemUrl = form.imagemUrl;
      setForm({
        tenant_id: currentTenantId || '',
        company_id: null,
        company_relationship_id: null,
        title: '',
        slug: '',
        description: '',
        responsibilities: '',
        requirements: '',
        benefits: '',
        salary_min: undefined,
        salary_max: undefined,
        salary_type: 'negotiate',
        contract_type: 'clt',
        seniority: undefined,
        work_hours: '',
        work_mode: 'onsite',
        city: '',
        state: '',
        location_detail: '',
        status: 'draft',
        imagemUrl: currentImagemUrl,
      });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Erro ao salvar vaga',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm || !currentTenantId) return;

    try {
      const result = await jobsRepository.delete(deleteConfirm);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setJobs((prev) => prev.filter((j) => j.id !== deleteConfirm));
      setTotal((prev) => Math.max(0, prev - 1));
      addToast({ type: 'success', message: 'Vaga removida com sucesso.' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover vaga',
      );
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (!canRead) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          Você não tem permissão para visualizar vagas.
        </p>
      </Card>
    );
  }

  if (!currentTenantId) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          Nenhum tenant selecionado.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Carregando vagas...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{moduleTitle}</h1>
          <p className="text-muted-foreground">{moduleDescription}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova vaga
          </Button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2 w-full sm:w-auto">
              <Search className="text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar vagas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
              <Select
                value={statusFilter === 'all' ? '' : statusFilter}
                onChange={(e) => {
                  setStatusFilter((e.target.value as JobStatus) || 'all');
                  setPage(1);
                }}
              >
                <option value="">Todos os status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>

              <Select
                value={contractTypeFilter === 'all' ? '' : contractTypeFilter}
                onChange={(e) => {
                  setContractTypeFilter(
                    (e.target.value as ContractType) || 'all',
                  );
                  setPage(1);
                }}
              >
                <option value="">Todos os contratos</option>
                {CONTRACT_TYPE_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>

              <Select
                value={workModeFilter === 'all' ? '' : workModeFilter}
                onChange={(e) => {
                  setWorkModeFilter((e.target.value as WorkMode) || 'all');
                  setPage(1);
                }}
              >
                <option value="">Todos os modos</option>
                {WORK_MODE_OPTIONS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </Select>

              <Select
                value={seniorityFilter === 'all' ? '' : seniorityFilter}
                onChange={(e) => {
                  setSeniorityFilter((e.target.value as Seniority) || 'all');
                  setPage(1);
                }}
              >
                <option value="">Todas as sênioridades</option>
                {SENIORITY_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="pt-6">
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma vaga encontrada.
                </p>
              </div>
            ) : (
              <table className="divide-border min-w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Vaga
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Contrato
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Modalidade
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Sênioridade
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Localidade
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
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3 text-sm font-medium">
                        {job.title}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {getContractTypeLabel(job.contract_type)}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {getWorkModeLabel(job.work_mode)}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {job.seniority
                          ? getSeniorityLabel(job.seniority)
                          : '—'}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {job.city || job.state
                          ? `${job.city || ''}${job.city && job.state ? ' / ' : ''}${job.state || ''}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            job.status === 'published'
                              ? 'bg-success/10 text-success'
                              : job.status === 'draft'
                                ? 'bg-muted text-muted-foreground'
                                : job.status === 'paused'
                                  ? 'bg-warning/10 text-warning'
                                  : job.status === 'closed'
                                    ? 'bg-destructive/10 text-destructive'
                                    : job.status === 'filled'
                                      ? 'bg-secondary/10 text-secondary'
                                      : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {getJobStatusLabel(job.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => openEdit(job)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Editar vaga"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(job.id)}
                              className="text-destructive hover:text-destructive/80"
                              title="Remover vaga"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {total > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Exibindo{' '}
                  <span className="text-foreground font-medium">
                    {(page - 1) * pageSize + 1}
                  </span>{' - '}
                  <span className="text-foreground font-medium">
                    {Math.min(page * pageSize, total)}
                  </span>{' de '}
                  <span className="text-foreground font-medium">{total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {(formError || error) && (
        <Card className="p-6">
          {formError && (
            <p className="text-destructive">{formError}</p>
          )}
          {error && !formError && <p className="text-destructive">{error}</p>}
        </Card>
      )}

      {(canCreate || selected) && (
        <Card className="p-6">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            {selected ? 'Editar vaga' : 'Nova vaga'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Título da vaga
                </label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Ex.: Desenvolvedor Frontend"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Slug (URL amigável)
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="Ex.: desenvolvedor-frontend"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Descrição
                </label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Resumo da vaga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tipo de contrato
                </label>
                <Select
                  value={form.contract_type}
                  onChange={(e) =>
                    setForm({ ...form, contract_type: e.target.value as ContractType })
                  }
                >
                  <option value="">Selecione</option>
                  {CONTRACT_TYPE_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Modalidade de trabalho
                </label>
                <Select
                  value={form.work_mode}
                  onChange={(e) =>
                    setForm({ ...form, work_mode: e.target.value as WorkMode })
                  }
                >
                  <option value="">Selecione</option>
                  {WORK_MODE_OPTIONS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Sênioridade
                </label>
                <Select
                  value={form.seniority ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seniority: e.target.value as Seniority || undefined,
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {SENIORITY_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Responsabilidades
                </label>
                <Input
                  value={form.responsibilities}
                  onChange={(e) =>
                    setForm({ ...form, responsibilities: e.target.value })
                  }
                  placeholder="Principais responsabilidades"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Requisitos
                </label>
                <Input
                  value={form.requirements}
                  onChange={(e) =>
                    setForm({ ...form, requirements: e.target.value })
                  }
                  placeholder="Requisitos da vaga"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Benefícios
                </label>
                <Input
                  value={form.benefits}
                  onChange={(e) =>
                    setForm({ ...form, benefits: e.target.value })
                  }
                  placeholder="Benefícios oferecidos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Salário mínimo
                </label>
                <Input
                  type="number"
                  value={form.salary_min ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      salary_min: Number(e.target.value) || undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Salário máximo
                </label>
                <Input
                  type="number"
                  value={form.salary_max ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      salary_max: Number(e.target.value) || undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tipo de salário
                </label>
                <Select
                  value={form.salary_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      salary_type: e.target.value as SalaryType,
                    })
                  }
                >
                  <option value="range">Faixa</option>
                  <option value="monthly">Mensal</option>
                  <option value="negotiate">A combinar</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Cidade
                </label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Estado (UF)
                </label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Detalhe do local
                </label>
                <Input
                  value={form.location_detail}
                  onChange={(e) =>
                    setForm({ ...form, location_detail: e.target.value })
                  }
                  placeholder="Bairro, referência, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as JobStatus })
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Horário de trabalho
                </label>
                <Input
                  value={form.work_hours}
                  onChange={(e) =>
                    setForm({ ...form, work_hours: e.target.value })
                  }
                  placeholder="Ex.: 09h às 18h"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  setFormError(null);
                  setForm({
                    tenant_id: currentTenantId || '',
                    company_id: null,
                    company_relationship_id: null,
                    title: '',
                    slug: '',
                    description: '',
                    responsibilities: '',
                    requirements: '',
                    benefits: '',
                    salary_min: undefined,
                    salary_max: undefined,
                    salary_type: 'negotiate',
                    contract_type: 'clt',
                    seniority: undefined,
                    work_hours: '',
                    work_mode: 'onsite',
                    city: '',
                    state: '',
                    location_detail: '',
                    status: 'draft',
                  });
                }}
                disabled={submitting}
              >
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Upload de imagem de destaque da vaga (direto do computador) */}
      {(selected || form.imagemUrl) && (
        <Card className="p-6">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Imagem de destaque da vaga
          </h3>
          <p className="text-muted-foreground mb-4">
            Envie a imagem diretamente do computador. Ela será exibida no card
            público e na página de detalhes da vaga.
          </p>
          {selected ? (
            <MediaUploader
              entityType="job"
              entityId={selected.id}
              purpose="card"
              existingAssets={[]}
              onUploadComplete={(asset: MediaAsset) => {
                setForm((prev) => ({
                  ...prev,
                  imagemUrl: asset.file_url,
                }));
                addToast({
                  type: 'success',
                  message: 'Imagem enviada com sucesso. Salve a vaga para aplicar.',
                });
              }}
              maxSizeMB={10}
              showPreview={true}
              disabled={false}
            />
          ) : (
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                Crie ou edite uma vaga para enviar sua imagem de destaque.
              </p>
            </div>
          )}
        </Card>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Card className="p-6 w-full max-w-sm">
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              Confirmar remoção
            </h3>
            <p className="text-muted-foreground mb-6">
              Deseja realmente remover esta vaga? Esta ação será registrada como cancelamento.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
