import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { employeeEducationsRepository } from '@/repositories/employee-education.repository';
import { employeesRepository } from '@/repositories/employees.repository';
import { cn } from '@/utils';
import type {
  EmployeeEducation,
  EmployeeEducationCreateInput,
  EmployeeEducationUpdateInput,
} from '@/types/domain/employee-education';

export default function Formacao() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [educations, setEducations] = useState<EmployeeEducation[]>([]);
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
  const [selected, setSelected] = useState<EmployeeEducation | null>(null);
  const [form, setForm] = useState({
    employee_id: '',
    institution: '',
    course: '',
    degree_level: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_completed: false,
    notes: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [educationsData, employeesData] = await Promise.all([
          employeeEducationsRepository.findAll('', currentTenantId),
          employeesRepository.findAll(currentTenantId),
        ]);
        if (!cancelled) {
          setEducations(educationsData);
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
            err instanceof Error ? err.message : 'Erro ao carregar formações',
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
      institution: '',
      course: '',
      degree_level: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_completed: false,
      notes: '',
    });
  };

  const openEdit = (education: EmployeeEducation) => {
    setSelected(education);
    setForm({
      employee_id: education.employee_id,
      institution: education.institution,
      course: education.course,
      degree_level: education.degree_level || '',
      field_of_study: education.field_of_study || '',
      start_date: education.start_date || '',
      end_date: education.end_date || '',
      is_completed: education.is_completed,
      notes: education.notes || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload:
        EmployeeEducationCreateInput | EmployeeEducationUpdateInput = {
        employee_id: form.employee_id,
        institution: form.institution,
        course: form.course,
        degree_level: form.degree_level || null,
        field_of_study: form.field_of_study || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        is_completed: form.is_completed,
        notes: form.notes || null,
      };

      if (selected) {
        const updated = await employeeEducationsRepository.update(
          selected.id,
          selected.employee_id,
          currentTenantId,
          payload as EmployeeEducationUpdateInput,
        );
        if (updated) {
          setEducations((prev) =>
            prev.map((edu) => (edu.id === updated.id ? updated : edu)),
          );
        }
      } else {
        const created = await employeeEducationsRepository.create(
          payload as EmployeeEducationCreateInput,
          currentTenantId,
        );
        if (created) {
          setEducations((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        employee_id: '',
        institution: '',
        course: '',
        degree_level: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        is_completed: false,
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar formação');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const education = educations.find((edu) => edu.id === id);
      if (!education) return;
      await employeeEducationsRepository.remove(
        id,
        education.employee_id,
        currentTenantId || '',
      );
      setEducations((prev) => prev.filter((edu) => edu.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover formação');
    }
  };

  const filtered = educations.filter((edu) => {
    const matchesSearch =
      !search ||
      edu.institution.toLowerCase().includes(search.toLowerCase()) ||
      edu.course.toLowerCase().includes(search.toLowerCase());
    const matchesEmployee =
      employeeFilter === 'all' || edu.employee_id === employeeFilter;
    return matchesSearch && matchesEmployee;
  });

  const employeeLabel = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    const name = emp?.person?.full_name;
    return name || emp?.job_title || '—';
  };

  return (
    <ModuleWorkspace
      title="Formação"
      description="Gerencie a formação dos funcionários."
      icon={Search}
      breadcrumbItems={[{ label: 'Formação' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova formação
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
              placeholder="Buscar por instituição ou curso..."
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
            <p className="text-muted-foreground">Carregando formação...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhuma formação encontrada.
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
                    Instituição
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Curso
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
                {filtered.map((edu) => (
                  <tr
                    key={edu.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {employeeLabel(edu.employee_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {edu.institution}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {edu.course}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          edu.is_completed
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning',
                        )}
                      >
                        {edu.is_completed ? 'Concluído' : 'Em andamento'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(edu)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(edu.id)}
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
              {selected ? 'Editar formação' : 'Nova formação'}
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
                    Instituição
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.institution}
                    onChange={(e) =>
                      setForm({ ...form, institution: e.target.value })
                    }
                    placeholder="Ex: Universidade XYZ"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Curso
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.course}
                    onChange={(e) =>
                      setForm({ ...form, course: e.target.value })
                    }
                    placeholder="Ex: Administração"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Nível
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.degree_level}
                    onChange={(e) =>
                      setForm({ ...form, degree_level: e.target.value })
                    }
                    placeholder="Ex: Graduação"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Área
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.field_of_study}
                    onChange={(e) =>
                      setForm({ ...form, field_of_study: e.target.value })
                    }
                    placeholder="Ex: Tecnologia"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Data Início
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
                    id="is_completed"
                    checked={form.is_completed}
                    onChange={(e) =>
                      setForm({ ...form, is_completed: e.target.checked })
                    }
                  />
                  <label htmlFor="is_completed" className="text-sm">
                    Concluído
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Observações
                  </label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Notas adicionais"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  {selected ? 'Salvar alterações' : 'Criar formação'}
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
                        institution: '',
                        course: '',
                        degree_level: '',
                        field_of_study: '',
                        start_date: '',
                        end_date: '',
                        is_completed: false,
                        notes: '',
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
