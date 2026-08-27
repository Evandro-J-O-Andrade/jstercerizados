import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidateLanguagesRepository } from '@/repositories/candidate-languages.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type {
  CandidateLanguage,
  CandidateLanguageCreateInput,
  CandidateLanguageUpdateInput,
} from '@/types/domain/candidate';

const LEVEL_OPTIONS = [
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'fluent', label: 'Fluente' },
  { value: 'native', label: 'Nativo' },
] as const;

export default function CandidatoIdiomas() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [languages, setLanguages] = useState<CandidateLanguage[]>([]);
  const [candidates, setCandidates] = useState<
    Array<{ id: string; person?: { full_name?: string } | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [candidateFilter, setCandidateFilter] = useState<string>('all');
  const [selected, setSelected] = useState<CandidateLanguage | null>(null);
  const [form, setForm] = useState({
    candidate_id: '',
    language: '',
    level: 'intermediate',
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

          const allLanguages = candidatesData.flatMap((c) => c.languages || []);
          setLanguages(allLanguages);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar idiomas',
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
      language: '',
      level: 'intermediate',
    });
  };

  const openEdit = (item: CandidateLanguage) => {
    setSelected(item);
    setForm({
      candidate_id: item.candidate_id,
      language: item.language,
      level: item.level,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload:
        CandidateLanguageCreateInput | CandidateLanguageUpdateInput = {
        candidate_id: form.candidate_id,
        language: form.language,
        level: form.level,
      };

      if (selected) {
        const updated = await candidateLanguagesRepository.update(
          selected.id,
          selected.candidate_id,
          payload as CandidateLanguageUpdateInput,
        );
        setLanguages((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await candidateLanguagesRepository.create(
          payload as CandidateLanguageCreateInput,
        );
        setLanguages((prev) => [created, ...prev]);
      }

      setSelected(null);
      setForm({
        candidate_id: '',
        language: '',
        level: 'intermediate',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar idioma');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const item = languages.find((e) => e.id === id);
      if (!item) return;
      await candidateLanguagesRepository.delete(id, item.candidate_id);
      setLanguages((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover idioma');
    }
  };

  const filtered = languages.filter((item) => {
    const text = `${item.language} ${item.level}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    const matchesCandidate =
      candidateFilter === 'all' || item.candidate_id === candidateFilter;
    return matchesSearch && matchesCandidate;
  });

  const candidateLabel = (candidateId: string) => {
    const c = candidates.find((item) => item.id === candidateId);
    return c?.person?.full_name || '—';
  };

  const levelLabel = (level: string) => {
    const opt = LEVEL_OPTIONS.find((o) => o.value === level);
    return opt?.label || level;
  };

  return (
    <ModuleWorkspace
      title="Idiomas dos Candidatos"
      description="Gerencie os idiomas dos candidatos."
      icon={Search}
      breadcrumbItems={[{ label: 'Idiomas' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo idioma
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
              placeholder="Buscar por idioma..."
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
            <p className="text-muted-foreground">Carregando idiomas...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Nenhum idioma encontrado.</p>
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
                    Idioma
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nível
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
                      {item.language}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {levelLabel(item.level)}
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
            {selected ? 'Editar idioma' : 'Novo idioma'}
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
                  Idioma
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Nível
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm">
                {selected ? 'Salvar alterações' : 'Criar idioma'}
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
                      language: '',
                      level: 'intermediate',
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

