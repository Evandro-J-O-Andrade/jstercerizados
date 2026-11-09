/**
 * Criação de Vaga — rota dedicada /dashboard/recrutamento/vagas/novo.
 * Persistência real via jobsRepository.create com tenant explícito.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { jobsRepository } from '@/modules/recrutamento/repositories';
import { VagaForm } from './VagaForm';
import { VagaFormWorkspace } from './VagaFormWorkspace';
import {
  buildVagaPayload,
  emptyVagaForm,
  type VagaFormValues,
} from './vaga-form.utils';

export default function RecrutamentoVagaNovaPage() {
  const { currentTenantId } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: VagaFormValues) => {
    if (!currentTenantId) {
      setError(
        'Tenant ativo não identificado. Selecione um tenant antes de criar vagas.',
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await jobsRepository.create({
        tenant_id: currentTenantId,
        ...buildVagaPayload(values),
      } as Parameters<typeof jobsRepository.create>[0]);
      if (result.error) throw result.error;
      if (!result.data?.id)
        throw new Error('Vaga criada sem identificador retornado.');
      navigate(`/dashboard/recrutamento/vagas/${result.data.id}`, {
        replace: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar vaga.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentTenantId) {
    return (
      <ModuleWorkspace
        title="Nova vaga"
        description="Criação de vaga em contexto de tenant."
        icon={Briefcase}
        breadcrumbItems={[
          { label: 'Recrutamento', href: '/dashboard/recrutamento' },
          { label: 'Vagas', href: '/dashboard/recrutamento/vagas' },
          { label: 'Nova vaga' },
        ]}
      >
        <Card className="text-muted-foreground p-6 text-sm">
          Selecione um tenant ativo para criar vagas. Nenhuma operação foi
          executada.
        </Card>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title="Nova vaga"
      description="Cadastre uma vaga real no tenant atual."
      icon={Briefcase}
      breadcrumbItems={[
        { label: 'Recrutamento', href: '/dashboard/recrutamento' },
        { label: 'Vagas', href: '/dashboard/recrutamento/vagas' },
        { label: 'Nova vaga' },
      ]}
    >
      <VagaFormWorkspace>
        <VagaForm
          tenantId={currentTenantId}
          initialValues={emptyVagaForm()}
          submitLabel="Criar vaga"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/recrutamento/vagas')}
        />
      </VagaFormWorkspace>
    </ModuleWorkspace>
  );
}
