import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Search,
  GripVertical,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { recruitmentStagesRepository } from '@/repositories/recruitment-stages.repository';
import { recruitmentProcessesRepository } from '@/repositories/recruitment-processes.repository';
import { cn } from '@/utils';
import type {
  RecruitmentStage,
  RecruitmentStageCreateInput,
  RecruitmentStageUpdateInput,
} from '@/types/domain/recruitment-stage';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa' },
  { value: 'inactive', label: 'Inativa' },
  { value: 'completed', label: 'Concluída' },
  { value: 'skipped', label: 'Ignorada' },
] as const;

export default function Etapas() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [processes, setProcesses] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [processFilter, setProcessFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<RecruitmentStage | null>(null);
  const [form, setForm] = useState({
    recruitment_process_id: '',
    name: '',
    description: '',
    status: 'active' as RecruitmentStage['status'],
    order: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [stagesData, processesData] = await Promise.all([
          recruitmentStagesRepository.findAll(currentTenantId),
          recruitmentProcessesRepository.findAll(currentTenantId),
        ]);
        if (!cancelled) {
          setStages(stagesData);
          setProcesses(
            processesData.map((process) => ({
              id: process.id,
              title: process.title,
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar etapas',
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
      recruitment_process_id: '',
      name: '',
      description: '',
      status: 'active',
      order: 0,
    });
  };

  const openEdit = (stage: RecruitmentStage) => {
    setSelected(stage);
    setForm({
      recruitment_process_id: stage.recruitment_process_id,
      name: stage.name,
      description: stage.description || '',
      status: stage.status,
      order: stage.order,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: RecruitmentStageCreateInput | RecruitmentStageUpdateInput =
        {
          recruitment_process_id: form.recruitment_process_id,
          name: form.name,
          description: form.description || null,
          status: form.status,
          order: form.order,
        };

      if (selected) {
        const updated = await recruitmentStagesRepository.update(
          selected.id,
          currentTenantId,
          payload as RecruitmentStageUpdateInput,
        );
        if (updated) {
          setStages((prev) =>
            prev.map((stage) => (stage.id === updated.id ? updated : stage)),
          );
        }
      } else {
        const created = await recruitmentStagesRepository.create({
          ...payload,
          tenant_id: currentTenantId,
        } as RecruitmentStageCreateInput);
        if (created) {
          setStages((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        recruitment_process_id: '',
        name: '',
        description: '',
        status: 'active',
        order: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar etapa');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await recruitmentStagesRepository.remove(id, currentTenantId || '');
      setStages((prev) => prev.filter((stage) => stage.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover etapa');
    }
  };

  const filtered = stages.filter((stage) => {
    const matchesSearch =
      !search ||
      stage.name.toLowerCase().includes(search.toLowerCase()) ||
      (stage.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesProcess =
      processFilter === 'all' || stage.recruitment_process_id === processFilter;
    const matchesStatus =
      statusFilter === 'all' || stage.status === statusFilter;
    return matchesSearch && matchesProcess && matchesStatus;
  });

  const statusLabel = (value: string) =>
    STATUS_OPTIONS.find((s) => s.value === value)?.label || value;

  const processLabel = (processId: string) =>
    processes.find((p) => p.id === processId)?.title || '—';

  return (
    <ModuleWorkspace
      title="Etapas de Recrutamento"
      description="Gerencie as etapas dos processos seletivos."
      icon={ClipboardList}
      breadcrumbItems={[{ label: 'Etapas de Recrutamento' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova etapa
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
              placeholder="Buscar por nome ou descrição..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={processFilter}
              onChange={(e) => setProcessFilter(e.target.value)}
            >
              <option value="all">Todos os processos</option>
              {processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.title}
                </option>
              ))}
            </select>
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
        </div>

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Carregando etapas...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Nenhuma etapa encontrada.</p>
          </Card>
        ) : (
          <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Ordem
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nome
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Processo
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((stage) => (
                  <tr
                    key={stage.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4" />
                        {stage.order}
                      </div>
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {stage.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {processLabel(stage.recruitment_process_id)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          stage.status === 'active' &&
                            'bg-success/10 text-success',
                          stage.status === 'inactive' &&
                            'bg-warning/10 text-warning',
                          stage.status === 'completed' &&
                            'bg-success/10 text-success',
                          stage.status === 'skipped' &&
                            'bg-muted text-muted-foreground',
                        )}
                      >
                        {statusLabel(stage.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(stage)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(stage.id)}
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
              {selected ? 'Editar etapa' : 'Nova etapa'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Processo Seletivo
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.recruitment_process_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recruitment_process_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione um processo</option>
                    {processes.map((process) => (
                      <option key={process.id} value={process.id}>
                        {process.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Ordem
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Triagem"
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
                        status: e.target.value as RecruitmentStage['status'],
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
                    Descrição
                  </label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Detalhes da etapa"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  {selected ? 'Salvar alterações' : 'Criar etapa'}
                </Button>
                {selected && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(null);
                      setForm({
                        recruitment_process_id: '',
                        name: '',
                        description: '',
                        status: 'active',
                        order: 0,
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
