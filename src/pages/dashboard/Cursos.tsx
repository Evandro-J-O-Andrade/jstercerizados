import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { employeeCoursesRepository } from '@/repositories/employee-courses.repository';
import { employeesRepository } from '@/repositories/employees.repository';
import type {
  EmployeeCourse,
  EmployeeCourseCreateInput,
  EmployeeCourseUpdateInput,
} from '@/types/domain/employee-course';

export default function Cursos() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [courses, setCourses] = useState<EmployeeCourse[]>([]);
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
  const [selected, setSelected] = useState<EmployeeCourse | null>(null);
  const [form, setForm] = useState({
    employee_id: '',
    course_name: '',
    institution: '',
    completion_date: '',
    expiry_date: '',
    certificate_url: '',
    hours: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [coursesData, employeesData] = await Promise.all([
          employeeCoursesRepository.findAll(''),
          employeesRepository.findAll(currentTenantId),
        ]);
        if (!cancelled) {
          setCourses(coursesData);
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
            err instanceof Error ? err.message : 'Erro ao carregar cursos',
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
      course_name: '',
      institution: '',
      completion_date: '',
      expiry_date: '',
      certificate_url: '',
      hours: '',
    });
  };

  const openEdit = (course: EmployeeCourse) => {
    setSelected(course);
    setForm({
      employee_id: course.employee_id,
      course_name: course.course_name,
      institution: course.institution || '',
      completion_date: course.completion_date || '',
      expiry_date: course.expiry_date || '',
      certificate_url: course.certificate_url || '',
      hours: course.hours?.toString() || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: EmployeeCourseCreateInput | EmployeeCourseUpdateInput = {
        employee_id: form.employee_id,
        course_name: form.course_name,
        institution: form.institution || null,
        completion_date: form.completion_date || null,
        expiry_date: form.expiry_date || null,
        certificate_url: form.certificate_url || null,
        hours: form.hours ? Number(form.hours) : null,
      };

      if (selected) {
        const updated = await employeeCoursesRepository.update(
          selected.id,
          selected.employee_id,
          payload as EmployeeCourseUpdateInput,
        );
        if (updated) {
          setCourses((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c)),
          );
        }
      } else {
        const created = await employeeCoursesRepository.create(
          payload as EmployeeCourseCreateInput,
        );
        if (created) {
          setCourses((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        employee_id: '',
        course_name: '',
        institution: '',
        completion_date: '',
        expiry_date: '',
        certificate_url: '',
        hours: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar curso');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const course = courses.find((c) => c.id === id);
      if (!course) return;
      await employeeCoursesRepository.remove(id, course.employee_id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover curso');
    }
  };

  const filtered = courses.filter((course) => {
    const matchesSearch =
      !search ||
      course.course_name.toLowerCase().includes(search.toLowerCase()) ||
      (course.institution || '').toLowerCase().includes(search.toLowerCase());
    const matchesEmployee =
      employeeFilter === 'all' || course.employee_id === employeeFilter;
    return matchesSearch && matchesEmployee;
  });

  const employeeLabel = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    const name = emp?.person?.full_name;
    return name || emp?.job_title || '—';
  };

  return (
    <ModuleWorkspace
      title="Cursos"
      description="Gerencie os cursos dos funcionários."
      icon={Search}
      breadcrumbItems={[{ label: 'Cursos' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo curso
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
              placeholder="Buscar por curso ou instituição..."
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
            <p className="text-muted-foreground">Carregando cursos...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Nenhum curso encontrado.</p>
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
                    Curso
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Instituição
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Conclusão
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {employeeLabel(course.employee_id)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {course.course_name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {course.institution || '—'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {course.completion_date || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(course)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(course.id)}
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
              {selected ? 'Editar curso' : 'Novo curso'}
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
                    Curso
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.course_name}
                    onChange={(e) =>
                      setForm({ ...form, course_name: e.target.value })
                    }
                    placeholder="Ex: Curso de Inglês"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Instituição
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.institution}
                    onChange={(e) =>
                      setForm({ ...form, institution: e.target.value })
                    }
                    placeholder="Ex: Wizard"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Data Conclusão
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.completion_date}
                    onChange={(e) =>
                      setForm({ ...form, completion_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Data Validade
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.expiry_date}
                    onChange={(e) =>
                      setForm({ ...form, expiry_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Carga Horária
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.hours}
                    onChange={(e) =>
                      setForm({ ...form, hours: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Certificado
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.certificate_url}
                    onChange={(e) =>
                      setForm({ ...form, certificate_url: e.target.value })
                    }
                    placeholder="URL do certificado"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  {selected ? 'Salvar alterações' : 'Criar curso'}
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
                        course_name: '',
                        institution: '',
                        completion_date: '',
                        expiry_date: '',
                        certificate_url: '',
                        hours: '',
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

