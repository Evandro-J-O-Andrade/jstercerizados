import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { cn } from '@/utils';
import type {
  Candidate,
  CandidateCreateInput,
  CandidateUpdateInput,
} from '@/types/domain/candidate';

const CANDIDATE_STATUS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'archived', label: 'Arquivado' },
  { value: 'blacklisted', label: 'Bloqueado' },
] as const;

const SALARY_TYPE_OPTIONS = [
  { value: 'negotiate', label: 'Negociável' },
  { value: 'range', label: 'Faixa' },
  { value: 'monthly', label: 'Mensal' },
] as const;

export default function Candidatos() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [form, setForm] = useState({
    person_id: '',
    headline: '',
    salary_expectation_min: '',
    salary_expectation_max: '',
    salary_type: 'negotiate' as Candidate['salary_type'],
    source: '',
    status: 'active' as Candidate['status'],
  });

  const statusCounts = candidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await candidatesRepository.findAll(currentTenantId, {
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: search || undefined,
        });
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
  }, [currentTenantId, search, statusFilter]);

  const openCreate = () => {
    setSelected(null);
    setForm({
      person_id: '',
      headline: '',
      salary_expectation_min: '',
      salary_expectation_max: '',
      salary_type: 'negotiate',
      source: '',
      status: 'active',
    });
  };

  const openEdit = (candidate: Candidate) => {
    setSelected(candidate);
    setForm({
      person_id: candidate.person_id,
      headline: candidate.headline || '',
      salary_expectation_min:
        candidate.salary_expectation_min?.toString() || '',
      salary_expectation_max:
        candidate.salary_expectation_max?.toString() || '',
      salary_type: candidate.salary_type || 'negotiate',
      source: candidate.source || '',
      status: candidate.status,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: CandidateCreateInput | CandidateUpdateInput = {
        person_id: form.person_id,
        headline: form.headline || null,
        salary_expectation_min: form.salary_expectation_min
          ? Number(form.salary_expectation_min)
          : null,
        salary_expectation_max: form.salary_expectation_max
          ? Number(form.salary_expectation_max)
          : null,
        salary_type: form.salary_type,
        source: form.source || null,
        status: form.status,
      };

      if (selected) {
        const updated = await candidatesRepository.update(
          selected.id,
          currentTenantId || '',
          payload as CandidateUpdateInput,
        );
        setCandidates((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
      } else {
        const created = await candidatesRepository.create({
          ...payload,
          tenant_id: currentTenantId || '',
        } as CandidateCreateInput);
        setCandidates((prev) => [created, ...prev]);
      }

      setSelected(null);
      setForm({
        person_id: '',
        headline: '',
        salary_expectation_min: '',
        salary_expectation_max: '',
        salary_type: 'negotiate',
        source: '',
        status: 'active',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar candidato');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await candidatesRepository.delete(id, currentTenantId || '');
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover candidato',
      );
    }
  };

  const getStatusLabel = (value: string) => {
    return CANDIDATE_STATUS.find((s) => s.value === value)?.label || value;
  };

  return (
    <ModuleWorkspace
      title="Candidatos"
      description="Acompanhe os candidatos inscritos."
      icon={Users}
      breadcrumbItems={[{ label: 'Candidatos' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo candidato
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              Total
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {candidates.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              Ativos
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {statusCounts['active'] || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              Arquivados
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {statusCounts['archived'] || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              Bloqueados
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {statusCounts['blacklisted'] || 0}
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Search className="text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, headline ou fonte..."
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
            {CANDIDATE_STATUS.map((s) => (
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
            <p className="text-muted-foreground">Carregando candidatos...</p>
          </Card>
        ) : candidates.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhum candidato encontrado.
            </p>
          </Card>
        ) : (
          <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nome
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Headline
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Fonte
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
                {candidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {candidate.person?.full_name || 'Sem nome'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {candidate.headline || '—'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {candidate.source || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          candidate.status === 'active' &&
                            'bg-success/10 text-success',
                          candidate.status === 'inactive' &&
                            'bg-warning/10 text-warning',
                          candidate.status === 'archived' &&
                            'bg-muted text-muted-foreground',
                          candidate.status === 'blacklisted' &&
                            'bg-destructive/10 text-destructive',
                        )}
                      >
                        {getStatusLabel(candidate.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(candidate)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(candidate.id)}
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
              {selected ? 'Editar candidato' : 'Novo candidato'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Person ID
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.person_id}
                    onChange={(e) =>
                      setForm({ ...form, person_id: e.target.value })
                    }
                    placeholder="UUID da pessoa"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Headline
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.headline}
                    onChange={(e) =>
                      setForm({ ...form, headline: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Salário mínimo
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.salary_expectation_min}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        salary_expectation_min: e.target.value,
                      })
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
                    value={form.salary_expectation_max}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        salary_expectation_max: e.target.value,
                      })
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
                      setForm({
                        ...form,
                        salary_type: e.target.value as Candidate['salary_type'],
                      })
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
                    Fonte
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value })
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
                        status: e.target.value as Candidate['status'],
                      })
                    }
                  >
                    {CANDIDATE_STATUS.map((s) => (
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
                        person_id: '',
                        headline: '',
                        salary_expectation_min: '',
                        salary_expectation_max: '',
                        salary_type: 'negotiate',
                        source: '',
                        status: 'active',
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
