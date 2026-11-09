import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { employeesRepository } from '@/repositories/employees.repository';
import { RHColaboradorForm } from './RHColaboradorForm';
import {
  emptyRHColaboradorForm,
  type RHColaboradorFormValues,
} from './RHColaboradorForm.values';
import type { EmployeePersonOption } from '@/types/domain/employee';

export default function RHColaboradorNovoPage() {
  const { currentTenantId } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<EmployeePersonOption[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!currentTenantId) {
      setPeople([]);
      setPeopleLoading(false);
      return () => {
        active = false;
      };
    }
    setPeopleLoading(true);
    employeesRepository
      .findEligiblePeople(currentTenantId)
      .then((data) => {
        if (active) setPeople(data);
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : 'Erro ao carregar pessoas elegíveis.',
          );
      })
      .finally(() => {
        if (active) setPeopleLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentTenantId]);
  const handleSubmit = async (values: RHColaboradorFormValues) => {
    if (!currentTenantId) {
      setError('Tenant ativo não identificado.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await employeesRepository.create({
        id: values.person_id,
        tenant_id: currentTenantId,
        employee_code: values.employee_code.trim(),
        hire_date: values.hire_date,
        termination_date: values.termination_date || null,
        salary: values.salary.trim()
          ? Number(values.salary.replace(',', '.'))
          : null,
        status: values.status || 'active',
      });
      if (!created?.id)
        throw new Error('Colaborador criado sem identificador retornado.');
      navigate(`/dashboard/rh/colaboradores/${created.id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar colaborador.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <ModuleWorkspace
      title="Novo colaborador"
      description="Cadastro de colaborador no domínio RH com persistência real autorizada (campos suportados pelo schema atual)."
      icon={UserPlus}
      breadcrumbItems={[
        { label: 'RH', href: '/dashboard/rh' },
        { label: 'Colaboradores', href: '/dashboard/rh/colaboradores' },
        { label: 'Novo' },
      ]}
      homeRoute="/dashboard/global"
    >
      {!currentTenantId ? (
        <Card className="text-muted-foreground p-6 text-sm">
          Selecione um tenant ativo.
        </Card>
      ) : (
        <RHColaboradorForm
          mode="create"
          initialValues={emptyRHColaboradorForm()}
          submitLabel="Criar colaborador"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/rh/colaboradores')}
          people={people}
          peopleLoading={peopleLoading}
        />
      )}
    </ModuleWorkspace>
  );
}
