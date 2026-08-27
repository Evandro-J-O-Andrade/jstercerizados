import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { employeeSkillsRepository } from '@/repositories/employee-skills.repository';
import { employeesRepository } from '@/repositories/employees.repository';
import { cn } from '@/utils';
import type {
  EmployeeSkill,
  EmployeeSkillCreateInput,
  EmployeeSkillUpdateInput,
} from '@/types/domain/employee-skill';

export default function Habilidades() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [employees, setEmployees] = useState<
    Array<{
      id: string;
      job_title?: string | null;
      person?: { full_name?: string } | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<EmployeeSkill | null>(null);
  const [form, setForm] = useState({
    employee_id: '',
    skill_name: '',
    proficiency_level: '',
    years_experience: '',
    is_certified: false,
    certification_name: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [skillsData, employeesData] = await Promise.all([
          employeeSkillsRepository.findAll('', currentTenantId),
          employeesRepository.findAll(currentTenantId),
        ]);
        if (!cancelled) {
          setSkills(skillsData);
          setEmployees(
            employeesData.map((emp) => ({
              id: emp.id,
              job_title: emp.job_title,
              person: emp.person,
            })),
          );
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

  const openCreate = () => {
    setSelected(null);
    setForm({
      employee_id: '',
      skill_name: '',
      proficiency_level: '',
      years_experience: '',
      is_certified: false,
      certification_name: '',
    });
  };

  const openEdit = (skill: EmployeeSkill) => {
    setSelected(skill);
    setForm({
      employee_id: skill.employee_id,
      skill_name: skill.skill_name,
      proficiency_level: skill.proficiency_level || '',
      years_experience: skill.years_experience?.toString() || '',
      is_certified: skill.is_certified,
      certification_name: skill.certification_name || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: EmployeeSkillCreateInput | EmployeeSkillUpdateInput = {
        employee_id: form.employee_id,
        skill_name: form.skill_name,
        proficiency_level: form.proficiency_level || null,
        years_experience: form.years_experience
          ? Number(form.years_experience)
          : null,
        is_certified: form.is_certified,
        certification_name: form.certification_name || null,
      };

      if (selected) {
        const updated = await employeeSkillsRepository.update(
          selected.id,
          selected.employee_id,
          currentTenantId,
          payload as EmployeeSkillUpdateInput,
        );
        if (updated) {
          setSkills((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s)),
          );
        }
      } else {
        const created = await employeeSkillsRepository.create(
          payload as EmployeeSkillCreateInput,
          currentTenantId,
        );
        if (created) {
          setSkills((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        employee_id: '',
        skill_name: '',
        proficiency_level: '',
        years_experience: '',
        is_certified: false,
        certification_name: '',
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
      await employeeSkillsRepository.remove(
        id,
        skill.employee_id,
        currentTenantId || '',
      );
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
    const matchesSearch =
      !search || skill.skill_name.toLowerCase().includes(search.toLowerCase());
    const matchesEmployee =
      employeeFilter === 'all' || skill.employee_id === employeeFilter;
    return matchesSearch && matchesEmployee;
  });

  const employeeLabel = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    const name = emp?.person?.full_name;
    return name || emp?.job_title || '—';
  };

  return (
    <ModuleWorkspace
      title="Habilidades"
      description="Gerencie as habilidades dos funcionários."
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
              placeholder="Buscar por habilidade..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border px-3 py-1.5 text-sm"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="all">Todos os funcionários</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {employeeLabel(emp.id)}
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
                    Funcionário
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Habilidade
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nível
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
                      {employeeLabel(skill.employee_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {skill.skill_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          skill.proficiency_level === 'expert'
                            ? 'bg-success/10 text-success'
                            : skill.proficiency_level === 'advanced'
                              ? 'bg-primary/10 text-primary'
                              : skill.proficiency_level === 'intermediate'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {skill.proficiency_level || '—'}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {skill.years_experience != null
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
                    Funcionário
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.employee_id}
                    onChange={(e) =>
                      setForm({ ...form, employee_id: e.target.value })
                    }
                  >
                    <option value="">Selecione um funcionário</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {employeeLabel(emp.id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Habilidade
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.skill_name}
                    onChange={(e) =>
                      setForm({ ...form, skill_name: e.target.value })
                    }
                    placeholder="Ex: React"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Nível
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.proficiency_level}
                    onChange={(e) =>
                      setForm({ ...form, proficiency_level: e.target.value })
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                    <option value="expert">Especialista</option>
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
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_certified"
                    checked={form.is_certified}
                    onChange={(e) =>
                      setForm({ ...form, is_certified: e.target.checked })
                    }
                  />
                  <label htmlFor="is_certified" className="text-sm">
                    Certificado
                  </label>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Certificação
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.certification_name}
                    onChange={(e) =>
                      setForm({ ...form, certification_name: e.target.value })
                    }
                    placeholder="Ex: AWS Certified"
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
                        employee_id: '',
                        skill_name: '',
                        proficiency_level: '',
                        years_experience: '',
                        is_certified: false,
                        certification_name: '',
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
