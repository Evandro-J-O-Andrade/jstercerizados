/**
 * Edição de Vaga — rota dedicada /dashboard/recrutamento/vagas/:id/editar.
 * Carrega dados reais do tenant e persiste via jobsRepository.update.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { useAuth } from '@/contexts/AuthContext';
import { jobsRepository } from '@/modules/recrutamento/repositories';
import { VagaForm } from './VagaForm';
import { VagaFormWorkspace } from './VagaFormWorkspace';
import {
  buildVagaPayload,
  vagaToForm,
  type VagaFormValues,
} from './vaga-form.utils';
import type { Job } from '@/modules/recrutamento/types';
import { isUuid } from '@/utils/uuid';

export default function RecrutamentoVagaEditarPage() {
  const { id } = useParams<{ id: string }>();
  const { currentTenantId } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || !isUuid(id) || !currentTenantId) {
      setError(
        !id
          ? 'Identificador da vaga não informado.'
          : !isUuid(id)
            ? 'Identificador da vaga inválido.'
            : 'Tenant ativo não identificado.',
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await jobsRepository.getById(id, currentTenantId);
      if (result.error) throw result.error;
      if (!result.data)
        throw new Error('Vaga não encontrada ou sem acesso autorizado.');
      setJob(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar vaga.');
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [id, currentTenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (values: VagaFormValues) => {
    if (!id || !isUuid(id)) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await jobsRepository.update({
        id,
        ...buildVagaPayload(values),
      } as Parameters<typeof jobsRepository.update>[0]);
      if (result.error) throw result.error;
      navigate(`/dashboard/recrutamento/vagas/${id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar vaga.');
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumb = [
    { label: 'Recrutamento', href: '/dashboard/recrutamento' },
    { label: 'Vagas', href: '/dashboard/recrutamento/vagas' },
    {
      label: job?.title || 'Vaga',
      href:
        id && isUuid(id)
          ? `/dashboard/recrutamento/vagas/${id}`
          : '/dashboard/recrutamento/vagas',
    },
    { label: 'Editar' },
  ];

  if (loading) {
    return (
      <ModuleWorkspace
        title="Editar vaga"
        description="Carregando dados autorizados."
        icon={Briefcase}
        breadcrumbItems={breadcrumb}
      >
        <RouteLoadingFallback />
      </ModuleWorkspace>
    );
  }

  if (error && !job) {
    return (
      <ModuleWorkspace
        title="Editar vaga"
        description="Não foi possível carregar a vaga."
        icon={Briefcase}
        breadcrumbItems={breadcrumb}
      >
        <Card className="space-y-3 p-6">
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Tentar novamente
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/recrutamento/vagas')}
            >
              Voltar
            </Button>
          </div>
        </Card>
      </ModuleWorkspace>
    );
  }

  if (!job || !currentTenantId) {
    return (
      <ModuleWorkspace
        title="Editar vaga"
        description="Contexto inválido."
        icon={Briefcase}
        breadcrumbItems={breadcrumb}
      >
        <Card className="text-muted-foreground p-6 text-sm">
          Vaga ou tenant indisponível para edição.
        </Card>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title={`Editar: ${job.title}`}
      description="Atualize os dados da vaga com persistência real."
      icon={Briefcase}
      breadcrumbItems={breadcrumb}
    >
      <VagaFormWorkspace>
        <VagaForm
          tenantId={currentTenantId}
          initialValues={vagaToForm(job)}
          submitLabel="Salvar alterações"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/dashboard/recrutamento/vagas/${job.id}`)}
        />
      </VagaFormWorkspace>
    </ModuleWorkspace>
  );
}
