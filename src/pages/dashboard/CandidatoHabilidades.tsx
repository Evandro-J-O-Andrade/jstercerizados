import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidateSkillsRepository } from '@/repositories/candidate-skills.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type {
  CandidateSkill,
  CandidateSkillCreateInput,
  CandidateSkillUpdateInput,
} from '@/types/domain/candidate';

const PROFICIENCY_OPTIONS = [
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'expert', label: 'Especialista' },
] as const;

type CandidateSkillReal = {
  id: string;
  candidate_id: string;
  skill_id: string;
  proficiency: string | null;
  years_experience: number | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

const toRealSkill = (skill: CandidateSkill): CandidateSkillReal =>
  skill as unknown as CandidateSkillReal;

export default function CandidatoHabilidades() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [skills, setSkills] = useState<CandidateSkillReal[]>([]);
  const [candidates, setCandidates] = useState<
    Array<{ id: string; person?: { full_name?: string } | null }>
  >([]);
  const [globalSkills, setGlobalSkills] = useState<
    Array<{ id: string; name: string; category?: string | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [candidateFilter, setCandidateFilter] = useState<string>('all');
  const [selected, setSelected] = useState<CandidateSkillReal | null>(null);
  const [form, setForm] = useState({
    candidate_id: '',
    skill_id: '',
    proficiency: 'intermediate',
    years_experience: '',
    last_used_at: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [candidatesData, globalSkillsData] = await Promise.all([
          candidatesRepository.findAll(currentTenantId),
          fetchGlobalSkills(),
        ]);

        if (!cancelled) {
          setCandidates(
            candidatesData.map((c) => ({
              id: c.id,
              person: c.person,
            })),
          );

          const allSkills = candidatesData.flatMap((c) =>
            (c.skills || []).map(toRealSkill),
          );
          setSkills(allSkills);

          setGlobalSkills(globalSkillsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar habilidades',
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

  const fetchGlobalSkills = async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || '',
    );

    const { data, error } = await supabase
      .from('skills')
      .select('id, name, category')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const openCreate = () => {
    setSelected(null);
    setForm({
      candidate_id: '',
      skill_id: '',
      proficiency: 'intermediate',
      years_experience: '',
      last_used_at: '',
    });
  };

  const openEdit = (skill: CandidateSkillReal) => {
    setSelected(skill);
    setForm({
      candidate_id: skill.candidate_id,
      skill_id: skill.skill_id,
      proficiency: skill.proficiency || 'intermediate',
      years_experience: skill.years_experience?.toString() || '',
      last_used_at: skill.last_used_at ? skill.last_used_at.slice(0, 10) : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: CandidateSkillCreateInput | CandidateSkillUpdateInput = {
        candidate_id: form.candidate_id,
        skill_id: form.skill_id,
        proficiency: form.proficiency,
        years_experience: form.years_experience
          ? Number(form.years_experience)
          : null,
        last_used_at: form.last_used_at || null,
      };

      if (selected) {
        const updated = await candidateSkillsRepository.update(
          selected.id,
          selected.candidate_id,
          payload as CandidateSkillUpdateInput,
        );
        setSkills((prev) =>
          prev.map((s) =>
            s.id === updated.id
              ? (updated as unknown as CandidateSkillReal)
              : s,
          ),
        );
      } else {
        const created = await candidateSkillsRepository.create(
          payload as CandidateSkillCreateInput,
        );
        setSkills((prev) => [
          created as unknown as CandidateSkillReal,
          ...prev,
        ]);
      }

      setSelected(null);
      setForm({
        candidate_id: '',
        skill_id: '',
        proficiency: 'intermediate',
        years_experience: '',
        last_used_at: '',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar habilidade',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const skill = skills.find((s) => s.id === id);
      if (!skill) return;
      await candidateSkillsRepository.delete(id, skill.candidate_id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover habilidade',
      );
    }
  };

  const filtered = skills.filter((skill) => {
    const matchesSearch = !search;
    const matchesCandidate =
      candidateFilter === 'all' || skill.candidate_id === candidateFilter;
    return matchesSearch && matchesCandidate;
  });

  const candidateLabel = (candidateId: string) => {
    const c = candidates.find((item) => item.id === candidateId);
    return c?.person?.full_name || '—';
  };

  const skillLabel = (skillId: string) => {
    const g = globalSkills.find((item) => item.id === skillId);
    return g?.name || skillId;
  };

  return (
    <ModuleWorkspace
      title="Habilidades dos Candidatos"
      description="Gerencie as habilidades associadas aos candidatos."
      icon={Search}
      breadcrumbItems={[{ label: 'Habilidades' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova habilidade
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
              placeholder="Buscar por candidato ou habilidade..."
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
            <p className="text-muted-foreground">Carregando habilidades...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhuma habilidade encontrada.
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
                    Habilidade
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Proficiência
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Experiência
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((skill) => (
                  <tr
                    key={skill.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {candidateLabel(skill.candidate_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {skillLabel(skill.skill_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {skill.proficiency || '—'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {skill.years_experience
                        ? `${skill.years_experience} anos`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(skill)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(skill.id)}
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
              {selected ? 'Editar habilidade' : 'Nova habilidade'}
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
                    Habilidade
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.skill_id}
                    onChange={(e) =>
                      setForm({ ...form, skill_id: e.target.value })
                    }
                  >
                    <option value="">Selecione uma habilidade</option>
                    {globalSkills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Proficiência
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.proficiency}
                    onChange={(e) =>
                      setForm({ ...form, proficiency: e.target.value })
                    }
                  >
                    {PROFICIENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Anos de experiência
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.years_experience}
                    onChange={(e) =>
                      setForm({ ...form, years_experience: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Último uso
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.last_used_at}
                    onChange={(e) =>
                      setForm({ ...form, last_used_at: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  {selected ? 'Salvar alterações' : 'Criar habilidade'}
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
                        skill_id: '',
                        proficiency: 'intermediate',
                        years_experience: '',
                        last_used_at: '',
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

