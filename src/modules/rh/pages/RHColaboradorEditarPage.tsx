import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/fallback/ErrorState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { useAuth } from '@/contexts/AuthContext';
import { employeesRepository } from '@/repositories/employees.repository';
import { classifyUuidRouteParam } from '@/utils/uuid';
import { RHColaboradorForm } from './RHColaboradorForm';
import type { RHColaboradorFormValues } from './RHColaboradorForm.values';
import type { Employee } from '@/types/domain/employee';

function toForm(employee: Employee): RHColaboradorFormValues {
  return {
    person_id: employee.id,
    employee_code: employee.employee_code ?? '',
    hire_date: employee.hire_date ?? '',
    termination_date: employee.termination_date ?? '',
    salary: employee.salary != null ? String(employee.salary) : '',
    status: employee.status ?? 'active',
  };
}

export default function RHColaboradorEditarPage() {
  const { id } = useParams<{ id: string }>();
  const { currentTenantId } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const param = classifyUuidRouteParam(id);
  const validId = param.kind === 'valid' ? param.value : null;

  const load = useCallback(async () => {
    if (!id || param.kind === 'missing') {
      setError('Identificador do colaborador nÃƒÂ£o informado.');
      setItem(null);
      setLoading(false);
      return;
    }
    if (param.kind === 'invalid' || !validId) {
      setError('Identificador do colaborador inválido.');
      setItem(null);
      setLoading(false);
      return;
    }
    if (!currentTenantId) {
      setError('Tenant ativo não identificado.');
      setItem(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await employeesRepository.findById(validId, currentTenantId);
      if (!data) throw new Error('Colaborador nÃƒÂ£o encontrado ou sem acesso autorizado.');
      setItem(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao carregar colaborador.');
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id, param.kind, validId, currentTenantId]);

  useEffect(() => { void load(); }, [load]);

  const handleSubmit = async (values: RHColaboradorFormValues) => {
    if (!item || !currentTenantId) return;
    setSubmitting(true);
    setError(null);
    try {
      const employeeCode = values.employee_code.trim();
      await employeesRepository.update(item.id, currentTenantId, {
        ...(employeeCode ? { employee_code: employeeCode } : {}),
        ...(values.hire_date ? { hire_date: values.hire_date } : {}),
        termination_date: values.termination_date || null,
        salary: values.salary.trim() ? Number(values.salary.replace(',', '.')) : null,
        status: (values.status as Employee['status']) || item.status,
      });
      navigate(`/dashboard/rh/colaboradores/${item.id}`, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao atualizar colaborador.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModuleWorkspace
      title={item?.person?.full_name ? `Editar: ${item.person.full_name}` : 'Editar colaborador'}
      description="Atualize os dados funcionais suportados pelo schema atual do domÃƒÂ­nio RH."
      icon={Pencil}
      breadcrumbItems={[
        { label: 'RH', href: '/dashboard/rh' },
        { label: 'Colaboradores', href: '/dashboard/rh/colaboradores' },
        ...(item ? [{ label: item.person?.full_name || 'Colaborador', href: `/dashboard/rh/colaboradores/${item.id}` }] : []),
        { label: 'Editar' },
      ]}
      homeRoute="/dashboard/global"
    >
      {loading ? (
        <RouteLoadingFallback />
      ) : error && !item ? (
        <Card className="p-2">
          <ErrorState
            message={error}
            onRetry={() => void load()}
            onBack={() => navigate('/dashboard/rh/colaboradores')}
          />
        </Card>
      ) : item ? (
        <RHColaboradorForm
          mode="edit"
          initialValues={toForm(item)}
          submitLabel="Salvar alteraÃƒÂ§ÃƒÂµes"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/dashboard/rh/colaboradores/${item.id}`)}
          people={[]}
          peopleLoading={false}
        />
      ) : null}
    </ModuleWorkspace>
  );
}
