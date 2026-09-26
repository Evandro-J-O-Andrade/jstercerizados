import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { FileText, ArrowLeft } from 'lucide-react';
import { applicationsRepository } from '@/repositories/applications.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Application } from '@/types/domain/application';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentTenantId } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !currentTenantId) return;

    const fetchApplication = async () => {
      try {
        const data = await applicationsRepository.findById(id, currentTenantId);
        setApplication(data || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar candidatura',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, currentTenantId]);

  if (loading) {
    return (
      <ModuleWorkspace
        title="Candidatura"
        description="Detalhes da candidatura"
        icon={FileText}
        breadcrumbItems={[
          { label: 'Candidaturas', href: '/dashboard/processos-seletivos' },
          { label: 'Detalhes' },
        ]}
      >
        <div className="text-muted-foreground text-sm">
          Carregando detalhes...
        </div>
      </ModuleWorkspace>
    );
  }

  if (error || !application) {
    return (
      <ModuleWorkspace
        title="Candidatura"
        description="Detalhes da candidatura"
        icon={FileText}
        breadcrumbItems={[
          { label: 'Candidaturas', href: '/dashboard/processos-seletivos' },
          { label: 'Detalhes' },
        ]}
      >
        <div className="text-destructive text-sm">
          {error || 'Candidatura não encontrada'}
        </div>
      </ModuleWorkspace>
    );
  }

  const job = application.job;
  const candidate = application.candidate;
  const person = (
    candidate as { person?: { full_name?: string; email?: string } }
  )?.person;

  return (
    <ModuleWorkspace
      title="Detalhes da Candidatura"
      description={job?.title || 'Candidatura'}
      icon={FileText}
      breadcrumbItems={[
        { label: 'Candidaturas', href: '/dashboard/processos-seletivos' },
        { label: 'Detalhes' },
      ]}
      actions={
        <Button variant="secondary" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <div className="card-base space-y-6 p-6">
        <div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            Candidato
          </h3>
          <p className="text-foreground text-sm">
            {person?.full_name || 'Sem nome'}
          </p>
          <p className="text-muted-foreground text-sm">{person?.email}</p>
          {candidate?.headline && (
            <p className="text-muted-foreground mt-1 text-sm">
              {candidate.headline}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">Vaga</h3>
          <p className="text-foreground text-sm">
            {job?.title || 'Sem título'}
          </p>
          <p className="text-muted-foreground text-sm">Status: {job?.status}</p>
        </div>

        <div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            Status atual
          </h3>
          <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
            {application.current_stage}
          </span>
        </div>

        <div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">Datas</h3>
          <p className="text-muted-foreground text-sm">
            Candidatura enviada em:{' '}
            {application.applied_at
              ? new Date(application.applied_at).toLocaleDateString('pt-BR')
              : '-'}
          </p>
          <p className="text-muted-foreground text-sm">
            Atualizado em:{' '}
            {new Date(application.updated_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {application.notes && (
          <div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              Observações
            </h3>
            <p className="text-muted-foreground text-sm">{application.notes}</p>
          </div>
        )}
      </div>
    </ModuleWorkspace>
  );
}
