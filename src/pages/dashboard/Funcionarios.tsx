import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { employeesRepository } from '@/repositories/employees.repository';
import { cn } from '@/utils';
import type {
  Employee,
  EmployeeCreateInput,
  EmployeeUpdateInput,
} from '@/types/domain/employee';

const EMPLOYEE_STATUS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'terminated', label: 'Desligado' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'on_leave', label: 'Afastado' },
] as const;

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'clt', label: 'CLT' },
  { value: 'internship', label: 'Estágio' },
  { value: 'temporary', label: 'Temporário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contracted', label: 'Contratado' },
  { value: 'cd', label: 'CD' },
] as const;

const WORK_MODE_OPTIONS = [
  { value: 'onsite', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'remote', label: 'Remoto' },
] as const;

export default function Funcionarios() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    person_id: '',
    company_id: '',
    registration: '',
    job_title: '',
    department: '',
    cost_center: '',
    hire_date: '',
    termination_date: '',
    probation_end_date: '',
    employment_type: 'clt',
    work_mode: 'onsite',
    salary: '',
    salary_currency: 'BRL',
    salary_frequency: 'monthly',
    status: 'active',
    manager_id: '',
    notes: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await employeesRepository.findAll(currentTenantId);
        if (!cancelled) {
          setEmployees(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar funcionários',
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
  }, [currentTenantId, search, statusFilter, departmentFilter]);

  const openCreate = () => {
    setSelected(null);
    setForm({
      person_id: '',
      company_id: '',
      registration: '',
      job_title: '',
      department: '',
      cost_center: '',
      hire_date: '',
      termination_date: '',
      probation_end_date: '',
      employment_type: 'clt',
      work_mode: 'onsite',
      salary: '',
      salary_currency: 'BRL',
      salary_frequency: 'monthly',
      status: 'active',
      manager_id: '',
      notes: '',
    });
  };

  const openEdit = (employee: Employee) => {
    setSelected(employee);
    setForm({
      person_id: employee.person_id,
      company_id: employee.company_id || '',
      registration: employee.registration || '',
      job_title: employee.job_title || '',
      department: employee.department || '',
      cost_center: employee.cost_center || '',
      hire_date: employee.hire_date || '',
      termination_date: employee.termination_date || '',
      probation_end_date: employee.probation_end_date || '',
      employment_type: employee.employment_type || 'clt',
      work_mode: employee.work_mode || 'onsite',
      salary: employee.salary?.toString() || '',
      salary_currency: employee.salary_currency || 'BRL',
      salary_frequency: employee.salary_frequency || 'monthly',
      status: employee.status || 'active',
      manager_id: employee.manager_id || '',
      notes: employee.notes || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: EmployeeCreateInput | EmployeeUpdateInput = {
        person_id: form.person_id,
        company_id: form.company_id || null,
        registration: form.registration || null,
        job_title: form.job_title || null,
        department: form.department || null,
        cost_center: form.cost_center || null,
        hire_date: form.hire_date || null,
        termination_date: form.termination_date || null,
        probation_end_date: form.probation_end_date || null,
        employment_type: form.employment_type,
        work_mode: form.work_mode,
        salary: form.salary ? Number(form.salary) : null,
        salary_currency: form.salary_currency,
        salary_frequency: form.salary_frequency,
        status: form.status,
        manager_id: form.manager_id || null,
        notes: form.notes || null,
      };

      if (selected) {
        const updated = await employeesRepository.update(
          selected.id,
          currentTenantId,
          payload as EmployeeUpdateInput,
        );
        if (updated) {
          setEmployees((prev) =>
            prev.map((emp) => (emp.id === updated.id ? updated : emp)),
          );
        }
      } else {
        const created = await employeesRepository.create({
          ...payload,
          tenant_id: currentTenantId,
        } as EmployeeCreateInput);
        if (created) {
          setEmployees((prev) => [created, ...prev]);
        }
      }

      setSelected(null);
      setForm({
        person_id: '',
        company_id: '',
        registration: '',
        job_title: '',
        department: '',
        cost_center: '',
        hire_date: '',
        termination_date: '',
        probation_end_date: '',
        employment_type: 'clt',
        work_mode: 'onsite',
        salary: '',
        salary_currency: 'BRL',
        salary_frequency: 'monthly',
        status: 'active',
        manager_id: '',
        notes: '',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar funcionário',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await employeesRepository.remove(id, currentTenantId || '');
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao remover funcionário',
      );
    }
  };

  const filtered = employees.filter((employee) => {
    const matchesSearch =
      !search ||
      (employee.job_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (employee.registration || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (employee.department || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment =
      departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = Array.from(
    new Set(
      employees
        .map((emp) => emp.department)
        .filter((dept): dept is string => Boolean(dept)),
    ),
  );

  const statusLabel = (value: string) =>
    EMPLOYEE_STATUS.find((s) => s.value === value)?.label || value;

  return (
    <ModuleWorkspace
      title="Funcionários"
      description="Gestão de vínculos funcionais."
      icon={Users}
      breadcrumbItems={[{ label: 'Funcionários' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo funcionário
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
              placeholder="Buscar por cargo, matrícula ou departamento..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              {EMPLOYEE_STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-1.5 text-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">Todos os departamentos</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
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
            <p className="text-muted-foreground">Carregando funcionários...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Nenhum funcionário encontrado.
            </p>
          </Card>
        ) : (
          <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Matrícula
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nome
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Cargo
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Departamento
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
                {filtered.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {employee.registration || '—'}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {employee.person?.full_name || 'Sem nome'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {employee.job_title || '—'}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {employee.department || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          employee.status === 'active' &&
                            'bg-success/10 text-success',
                          employee.status === 'inactive' &&
                            'bg-warning/10 text-warning',
                          ['terminated', 'suspended', 'on_leave'].includes(
                            employee.status || '',
                          ) && 'bg-destructive/10 text-destructive',
                        )}
                      >
                        {statusLabel(employee.status || '')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(employee)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(employee.id)}
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
              {selected ? 'Editar funcionário' : 'Novo funcionário'}
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
                    Matrícula
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.registration}
                    onChange={(e) =>
                      setForm({ ...form, registration: e.target.value })
                    }
                    placeholder="Ex: 12345"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Cargo
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.job_title}
                    onChange={(e) =>
                      setForm({ ...form, job_title: e.target.value })
                    }
                    placeholder="Ex: Analista Administrativo"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Departamento
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    placeholder="Ex: RH"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Centro de Custo
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.cost_center}
                    onChange={(e) =>
                      setForm({ ...form, cost_center: e.target.value })
                    }
                    placeholder="Ex: CC-001"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Tipo de Contrato
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.employment_type}
                    onChange={(e) =>
                      setForm({ ...form, employment_type: e.target.value })
                    }
                  >
                    {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Modalidade
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.work_mode}
                    onChange={(e) =>
                      setForm({ ...form, work_mode: e.target.value })
                    }
                  >
                    {WORK_MODE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Data de Admissão
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.hire_date}
                    onChange={(e) =>
                      setForm({ ...form, hire_date: e.target.value })
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
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    {EMPLOYEE_STATUS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Salário
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.salary}
                    onChange={(e) =>
                      setForm({ ...form, salary: e.target.value })
                    }
                    placeholder="0,00"
                  />
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
                    placeholder="Notas internas"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  {selected ? 'Salvar alterações' : 'Criar funcionário'}
                </Button>
                {selected && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(null);
                      setForm({
                        person_id: '',
                        company_id: '',
                        registration: '',
                        job_title: '',
                        department: '',
                        cost_center: '',
                        hire_date: '',
                        termination_date: '',
                        probation_end_date: '',
                        employment_type: 'clt',
                        work_mode: 'onsite',
                        salary: '',
                        salary_currency: 'BRL',
                        salary_frequency: 'monthly',
                        status: 'active',
                        manager_id: '',
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

