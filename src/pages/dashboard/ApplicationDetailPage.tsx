import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { FileText, ArrowLeft } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ApplicationDetail {
  id: string;
  tenant_id: string;
  job_id: string;
  candidate_id: string;
  current_stage: string;
  applied_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  jobs: any;
  candidates: any;
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [application, setApplication] = useState<ApplicationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !id) return;

    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(
            `
            id,
            tenant_id,
            job_id,
            candidate_id,
            current_stage,
            applied_at,
            notes,
            created_at,
            updated_at,
            jobs (
              id,
              title,
              status
            ),
            candidates (
              id,
              headline,
              people (
                id,
                full_name,
                email
              )
            )
          `,
          )
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
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
  }, [id, isAdminMaster, currentTenantId, tenantMemberships]);

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

  const job = Array.isArray(application.jobs)
    ? application.jobs[0]
    : application.jobs;
  const candidate = Array.isArray(application.candidates)
    ? application.candidates[0]
    : application.candidates;
  const person = candidate?.people;

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
      <div className="bg-card border-border space-y-6 rounded-xl border p-6 shadow-sm">
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

