import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
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

export default function Funcionarios() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const { addToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    employee_code: '',
    hire_date: '',
    termination_date: '',
    salary: '',
    status: 'active',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await employeesRepository.findAll(currentTenantId, {
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: search || undefined,
        });
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
  }, [currentTenantId, search, statusFilter]);

  const openCreate = () => {
    setSelected(null);
    setForm({
      employee_code: '',
      hire_date: '',
      termination_date: '',
      salary: '',
      status: 'active',
    });
  };

  const openEdit = (employee: Employee) => {
    setSelected(employee);
    setForm({
      employee_code: employee.employee_code,
      hire_date: employee.hire_date,
      termination_date: employee.termination_date || '',
      salary: employee.salary?.toString() || '',
      status: employee.status,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId) return;

    try {
      const payload: EmployeeCreateInput | EmployeeUpdateInput = {
        employee_code: form.employee_code,
        hire_date: form.hire_date,
        termination_date: form.termination_date || null,
        salary: form.salary ? Number(form.salary) : null,
        status: form.status,
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
        employee_code: '',
        hire_date: '',
        termination_date: '',
        salary: '',
        status: 'active',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar funcionário',
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm || !currentTenantId) return;
    try {
      await employeesRepository.remove(deleteConfirm, currentTenantId);
      setEmployees((prev) => prev.filter((emp) => emp.id !== deleteConfirm));
      if (selected?.id === deleteConfirm) {
        setSelected(null);
      }
      addToast({
        type: 'success',
        message: 'Funcionário removido com sucesso.',
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao remover funcionário',
      );
      addToast({
        type: 'error',
        message: err instanceof Error
          ? err.message
          : 'Erro ao remover funcionário',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = employees.filter((employee) => {
    const matchesSearch =
      !search ||
      (employee.employee_code || '').toLowerCase().includes(search.toLowerCase()) ||
      (employee.person?.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              placeholder="Buscar por matrícula ou nome..."
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
                      {employee.employee_code || '—'}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {employee.person?.full_name || 'Sem nome'}
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
                          onClick={() => setDeleteConfirm(employee.id)}
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
                    Matrícula
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.employee_code}
                    onChange={(e) =>
                      setForm({ ...form, employee_code: e.target.value })
                    }
                    placeholder="Ex: 12345"
                  />
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
                    Data de Desligamento
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.termination_date}
                    onChange={(e) =>
                      setForm({ ...form, termination_date: e.target.value })
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
                        employee_code: '',
                        hire_date: '',
                        termination_date: '',
                        salary: '',
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

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Remover funcionário?"
        message="Tem certeza que deseja remover este funcionário? Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </ModuleWorkspace>
  );
}

