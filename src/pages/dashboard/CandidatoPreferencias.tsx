import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidatePreferencesRepository } from '@/repositories/candidate-preferences.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type {
  CandidatePreference,
  CandidatePreferenceCreateInput,
  CandidatePreferenceUpdateInput,
} from '@/types/domain/candidate';

export default function CandidatoPreferencias() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [preferences, setPreferences] = useState<CandidatePreference[]>([]);
  const [candidates, setCandidates] = useState<
    Array<{ id: string; person?: { full_name?: string } | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CandidatePreference | null>(null);
  const [form, setForm] = useState({
    candidate_id: '',
    desired_roles: '',
    desired_locations: '',
    salary_min: '',
    salary_max: '',
    contract_types: '',
    shifts: '',
    work_modes: '',
    max_distance_km: '',
    available_from: '',
    matching_enabled: true,
    receive_match_alerts: true,
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

          const prefsPromises = candidatesData.map((c) =>
            candidatePreferencesRepository.findByCandidate(c.id),
          );
          const prefsResults = await Promise.all(prefsPromises);
          const validPrefs = prefsResults.filter(
            (p): p is CandidatePreference => p !== null,
          );
          setPreferences(validPrefs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar preferências',
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
      desired_roles: '',
      desired_locations: '',
      salary_min: '',
      salary_max: '',
      contract_types: '',
      shifts: '',
      work_modes: '',
      max_distance_km: '',
      available_from: '',
      matching_enabled: true,
      receive_match_alerts: true,
    });
  };

  const openEdit = (item: CandidatePreference) => {
    setSelected(item);
    setForm({
      candidate_id: item.candidate_id,
      desired_roles: (item.desired_roles || []).join(', '),
      desired_locations: (item.desired_locations || []).join(', '),
      salary_min: item.salary_min?.toString() || '',
      salary_max: item.salary_max?.toString() || '',
      contract_types: (item.contract_types || []).join(', '),
      shifts: (item.shifts || []).join(', '),
      work_modes: (item.work_modes || []).join(', '),
      max_distance_km: item.max_distance_km?.toString() || '',
      available_from: item.available_from || '',
      matching_enabled: item.matching_enabled,
      receive_match_alerts: item.receive_match_alerts,
    });
  };

  const parseArray = (value: string): string[] | null => {
    if (!value.trim()) return null;
    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload:
        CandidatePreferenceCreateInput | CandidatePreferenceUpdateInput = {
        candidate_id: form.candidate_id,
        desired_roles: parseArray(form.desired_roles),
        desired_locations: parseArray(form.desired_locations),
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        contract_types: parseArray(form.contract_types),
        shifts: parseArray(form.shifts),
        work_modes: parseArray(form.work_modes),
        max_distance_km: form.max_distance_km
          ? Number(form.max_distance_km)
          : null,
        available_from: form.available_from || null,
        matching_enabled: form.matching_enabled,
        receive_match_alerts: form.receive_match_alerts,
      };

      if (selected) {
        const updated = await candidatePreferencesRepository.update(
          selected.id,
          payload as CandidatePreferenceUpdateInput,
        );
        setPreferences((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await candidatePreferencesRepository.create(
          payload as CandidatePreferenceCreateInput,
        );
        setPreferences((prev) => [...prev, created]);
      }

      setSelected(null);
      setForm({
        candidate_id: '',
        desired_roles: '',
        desired_locations: '',
        salary_min: '',
        salary_max: '',
        contract_types: '',
        shifts: '',
        work_modes: '',
        max_distance_km: '',
        available_from: '',
        matching_enabled: true,
        receive_match_alerts: true,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar preferências',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await candidatePreferencesRepository.delete(id);
      setPreferences((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover preferências',
      );
    }
  };

  const filtered = preferences.filter((item) => {
    const candidate = candidates.find((c) => c.id === item.candidate_id);
    const text =
      `${candidate?.person?.full_name || ''} ${(item.desired_roles || []).join(' ')}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    return matchesSearch;
  });

  const candidateLabel = (candidateId: string) => {
    const c = candidates.find((item) => item.id === candidateId);
    return c?.person?.full_name || '—';
  };

  return (
    <ModuleWorkspace
      title="Preferências dos Candidatos"
      description="Gerencie as preferências de matching dos candidatos."
      icon={Search}
      breadcrumbItems={[{ label: 'Preferências' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova preferência
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
              placeholder="Buscar por candidato ou cargo desejado..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Carregando preferências...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhuma preferência encontrada.
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
                    Cargos desejados
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Faixa salarial
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Matching
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
                      {(item.desired_roles || []).slice(0, 2).join(', ')}
                      {(item.desired_roles || []).length > 2 && '...'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {item.salary_min || item.salary_max
                        ? `${item.salary_min?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '—'} - ${item.salary_max?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '—'}`
                        : '—'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {item.matching_enabled ? 'Ativo' : 'Inativo'}
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
            {selected ? 'Editar preferências' : 'Nova preferência'}
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
                  Cargos desejados (separados por vírgula)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.desired_roles}
                  onChange={(e) =>
                    setForm({ ...form, desired_roles: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Localizações desejadas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.desired_locations}
                  onChange={(e) =>
                    setForm({ ...form, desired_locations: e.target.value })
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
                  Tipos de contrato (separados por vírgula)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.contract_types}
                  onChange={(e) =>
                    setForm({ ...form, contract_types: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Turnos (separados por vírgula)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.shifts}
                  onChange={(e) => setForm({ ...form, shifts: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Modalidades (separadas por vírgula)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.work_modes}
                  onChange={(e) =>
                    setForm({ ...form, work_modes: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Distância máxima (km)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.max_distance_km}
                  onChange={(e) =>
                    setForm({ ...form, max_distance_km: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Disponível a partir
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={form.available_from}
                  onChange={(e) =>
                    setForm({ ...form, available_from: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.matching_enabled}
                    onChange={(e) =>
                      setForm({ ...form, matching_enabled: e.target.checked })
                    }
                  />
                  <span className="text-sm">Matching ativado</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.receive_match_alerts}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        receive_match_alerts: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Receber alertas de matching</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm">
                {selected ? 'Salvar alterações' : 'Criar preferência'}
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
                      desired_roles: '',
                      desired_locations: '',
                      salary_min: '',
                      salary_max: '',
                      contract_types: '',
                      shifts: '',
                      work_modes: '',
                      max_distance_km: '',
                      available_from: '',
                      matching_enabled: true,
                      receive_match_alerts: true,
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

