import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { employeesRepository } from '@/repositories/employees.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';
import { RHColaboradorForm } from './RHColaboradorForm';
import {
  emptyRHColaboradorForm,
  type RHColaboradorFormValues,
} from './RHColaboradorForm.values';
import type { EmployeePersonOption } from '@/types/domain/employee';

/** RH-03: cadastro real de colaborador. Contrato: employees.id = people.id (sem person_id inventado). */
export default function RHColaboradorNovoPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<EmployeePersonOption[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const canCreate = hasAnyPermission([RH_PERMISSIONS.peopleCreate]);

  useEffect(() => {
    let active = true;
    if (!currentTenantId || !canCreate) {
      setPeople([]);
      setPeopleLoading(false);
      return () => { active = false; };
    }
    setPeopleLoading(true);
    setError(null);
    employeesRepository
      .findEligiblePeople(currentTenantId)
      .then((data) => { if (active) setPeople(data); })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Erro ao carregar pessoas elegíveis.');
      })
      .finally(() => { if (active) setPeopleLoading(false); });
    return () => { active = false; };
  }, [currentTenantId, canCreate]);

  const handleSubmit = async (values: RHColaboradorFormValues) => {
    if (!currentTenantId) { setError('Tenant ativo não identificado.'); return; }
    if (!canCreate) { setError('Permissão people.create ausente para cadastrar colaborador.'); return; }
    if (!values.person_id) { setError('Selecione uma pessoa elegível do tenant.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const created = await employeesRepository.create({
        id: values.person_id,
        tenant_id: currentTenantId,
        employee_code: values.employee_code.trim(),
        hire_date: values.hire_date,
        termination_date: values.termination_date || null,
        salary: values.salary.trim() ? Number(values.salary.replace(',', '.')) : null,
        status: values.status || 'active',
      });
      if (!created?.id) throw new Error('Colaborador criado sem identificador retornado.');
      navigate(`/dashboard/rh/colaboradores/${created.id}`, { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao criar colaborador.';
      if (/duplicate|unique|already exists|23505|já existe/i.test(message)) {
        setError('Esta pessoa já possui vínculo de colaborador ou o código informado já está em uso no tenant.');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const workspace = (children: React.ReactNode) => (
    <ModuleWorkspace
      title="Novo colaborador"
      description="Cadastro real autorizado. Contrato: employees.id = people.id (sem person_id inventado)."
      icon={UserPlus}
      breadcrumbItems={[
        { label: 'RH', href: '/dashboard/rh' },
        { label: 'Colaboradores', href: '/dashboard/rh/colaboradores' },
        { label: 'Novo' },
      ]}
      homeRoute="/dashboard/global"
    >
      {children}
    </ModuleWorkspace>
  );

  if (!currentTenantId) return workspace(<Card className="p-6"><EmptyState icon={UserPlus} title="Tenant ativo não identificado" description="Selecione um tenant para cadastrar colaborador." /></Card>);
  if (!canCreate) return workspace(<Card className="p-6"><ErrorState message="Permissão people.create ausente para cadastrar colaborador." /></Card>);
  if (peopleLoading) return workspace(<RouteLoadingFallback />);
  if (!error && people.length === 0) return workspace(<Card className="p-6"><EmptyState icon={UserPlus} title="Nenhuma pessoa elegível" description="Não há pessoas ativas do tenant sem vínculo de colaborador, ou a consulta não retornou registros autorizados. Cadastre/ative a pessoa primeiro pelo fluxo autorizado." actionLabel="Voltar à listagem" onAction={() => navigate('/dashboard/rh/colaboradores')} /></Card>);

  return workspace(
    <RHColaboradorForm
      mode="create"
      initialValues={emptyRHColaboradorForm()}
      submitLabel="Criar colaborador"
      submitting={submitting}
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/dashboard/rh/colaboradores')}
      people={people}
      peopleLoading={false}
    />
  );
}
