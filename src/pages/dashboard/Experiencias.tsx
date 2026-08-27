import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { employeeExperiencesRepository } from '@/repositories/employee-experiences.repository';
import { employeesRepository } from '@/repositories/employees.repository';
import type {
  EmployeeExperience,
  EmployeeExperienceCreateInput,
  EmployeeExperienceUpdateInput,
} from '@/types/domain/employee-experience';

export default function Experiencias() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [experiences, setExperiences] = useState<EmployeeExperience[]>([]);
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
  const [selected, setSelected] = useState<EmployeeExperience | null>(null);
  const [form, setForm] = useState({
    employee_id: '',
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    achievements: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [experiencesData, employeesData] = await Promise.all([
          employeeExperiencesRepository.findAll(''),
          employeesRepository.findAll(currentTenantId),
        ]);
        if (!cancelled) {
          setExperiences(experiencesData);
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
      employee_id: '',
      company_name: '',
      job_title: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      achievements: '',
    });
  };

  const openEdit = (experience: EmployeeExperience) => {
    setSelected(experience);
    setForm({
      employee_id: experience.employee_id,
      company_name: experience.company_name,
      job_title: experience.job_title,
      start_date: experience.start_date,
      end_date: experience.end_date || '',
      is_current: experience.is_current,
      description: experience.description || '',
      achievements: experience.achievements || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload:
        EmployeeExperienceCreateInput | EmployeeExperienceUpdateInput = {
        employee_id: form.employee_id,
        company_name: form.company_name,
        job_title: form.job_title,
        start_date: form.start_date,
        end_date: form.end_date || null,
        is_current: form.is_current,
        description: form.description || null,
        achievements: form.achievements || null,
      };

      if (selected) {
        const updated = await employeeExperiencesRepository.update(
          selected.id,
          selected.employee_id,
          payload as EmployeeExperienceUpdateInput,
        );
        if (updated) {
          setExperiences((prev) =>
            prev.map((exp) => (exp.id === updated.id ? updated : exp)),
          );
        }
      } else {
        const created = await employeeExperiencesRepository.create(
          payload as EmployeeExperienceCreateInput,
        );
        if (created) {
          setExperiences((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        employee_id: '',
        company_name: '',
        job_title: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        achievements: '',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar experiência',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const experience = experiences.find((exp) => exp.id === id);
      if (!experience) return;
      await employeeExperiencesRepository.remove(id, experience.employee_id);
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover experiência',
      );
    }
  };

  const filtered = experiences.filter((exp) => {
    const matchesSearch =
      !search ||
      exp.company_name.toLowerCase().includes(search.toLowerCase()) ||
      exp.job_title.toLowerCase().includes(search.toLowerCase());
    const matchesEmployee =
      employeeFilter === 'all' || exp.employee_id === employeeFilter;
    return matchesSearch && matchesEmployee;
  });

  const employeeLabel = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    const name = emp?.person?.full_name;
    return name || emp?.job_title || '—';
  };

  return (
    <ModuleWorkspace
      title="Experiências"
      description="Gerencie as experiências profissionais."
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
                    Funcionário
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
                {filtered.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {employeeLabel(exp.employee_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {exp.company_name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {exp.job_title}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {exp.start_date}
                      {exp.end_date ? ` - ${exp.end_date}` : ' - Atual'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(exp)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(exp.id)}
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
              {selected ? 'Editar experiência' : 'Nova experiência'}
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
                    Empresa
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.company_name}
                    onChange={(e) =>
                      setForm({ ...form, company_name: e.target.value })
                    }
                    placeholder="Ex: Empresa XYZ"
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
                    value={form.job_title}
                    onChange={(e) =>
                      setForm({ ...form, job_title: e.target.value })
                    }
                    placeholder="Ex: Analista"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Data Início
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Data Fim
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={form.is_current}
                    onChange={(e) =>
                      setForm({ ...form, is_current: e.target.checked })
                    }
                  />
                  <label htmlFor="is_current" className="text-sm">
                    Emprego atual
                  </label>
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
                    placeholder="Descrição das atividades"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Conquistas
                  </label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={3}
                    value={form.achievements}
                    onChange={(e) =>
                      setForm({ ...form, achievements: e.target.value })
                    }
                    placeholder="Principais conquistas"
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
                        employee_id: '',
                        company_name: '',
                        job_title: '',
                        start_date: '',
                        end_date: '',
                        is_current: false,
                        description: '',
                        achievements: '',
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

