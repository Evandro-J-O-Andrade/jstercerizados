import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidateExperiencesRepository } from '@/repositories/candidate-experiences.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type {
  CandidateExperience,
  CandidateExperienceCreateInput,
  CandidateExperienceUpdateInput,
} from '@/types/domain/candidate';

export default function CandidatoExperiencias() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [candidates, setCandidates] = useState<
    Array<{ id: string; person?: { full_name?: string } | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [candidateFilter, setCandidateFilter] = useState<string>('all');
  const [selected, setSelected] = useState<CandidateExperience | null>(null);
  const [form, setForm] = useState({
    candidate_id: '',
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const candidatesData =
          await candidatesRepository.findAll(currentTenantId);

        if (!cancelled) {
          setCandidates(
            candidatesData.map((c) => ({
              id: c.id,
              person: c.person,
            })),
          );

          const allExperiences = candidatesData.flatMap(
            (c) => c.experiences || [],
          );
          setExperiences(allExperiences);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar experiências',
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
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: '',
    });
  };

  const openEdit = (item: CandidateExperience) => {
    setSelected(item);
    setForm({
      candidate_id: item.candidate_id,
      company: item.company,
      position: item.position,
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      description: item.description || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload:
        CandidateExperienceCreateInput | CandidateExperienceUpdateInput = {
        candidate_id: form.candidate_id,
        company: form.company,
        position: form.position,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        description: form.description || null,
      };

      if (selected) {
        const updated = await candidateExperiencesRepository.update(
          selected.id,
          selected.candidate_id,
          payload as CandidateExperienceUpdateInput,
        );
        setExperiences((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await candidateExperiencesRepository.create(
          payload as CandidateExperienceCreateInput,
        );
        setExperiences((prev) => [created, ...prev]);
      }

      setSelected(null);
      setForm({
        candidate_id: '',
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: '',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar experiência',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const item = experiences.find((e) => e.id === id);
      if (!item) return;
      await candidateExperiencesRepository.delete(id, item.candidate_id);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover experiência',
      );
    }
  };

  const filtered = experiences.filter((item) => {
    const text = `${item.company} ${item.position}`.toLowerCase();
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
      title="Experiências dos Candidatos"
      description="Gerencie as experiências profissionais dos candidatos."
      icon={Search}
      breadcrumbItems={[{ label: 'Experiências' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova experiência
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
              placeholder="Buscar por empresa ou cargo..."
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
            <p className="text-muted-foreground">Carregando experiências...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhuma experiência encontrada.
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
                    Empresa
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Cargo
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Período
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
                      {item.company}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {item.position}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {item.start_date
                        ? `${item.start_date}${item.end_date ? ` → ${item.end_date}` : ''}`
                        : '—'}
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
            {selected ? 'Editar experiência' : 'Nova experiência'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.person?.full_name || 'Sem nome'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Empresa
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Cargo
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Início
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Fim
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
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
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm">
                {selected ? 'Salvar alterações' : 'Criar experiência'}
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
                      company: '',
                      position: '',
                      start_date: '',
                      end_date: '',
                      description: '',
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

