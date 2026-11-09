/**
 * Detalhes da Vaga — rota dedicada /dashboard/recrutamento/vagas/:id.
 * Dados reais via jobsRepository + aplicações do tenant (RLS/RBAC).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Briefcase, Pencil, RefreshCw } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback/EmptyState';
import { InlineLoader } from '@/components/feedback/InlineLoader';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { useAuth } from '@/contexts/AuthContext';
import {
  jobsRepository,
  applicationsRepository,
} from '@/modules/recrutamento/repositories';
import { RECRUTAMENTO_PERMISSIONS } from '@/modules/recrutamento/permissions';
import { JOB_STATUS_LABELS } from '@/modules/recrutamento/constants/jobStatus';
import { CONTRACT_TYPE_LABELS } from '@/modules/recrutamento/constants/contractType';
import { WORK_MODE_LABELS } from '@/modules/recrutamento/constants/workMode';
import { SENIORITY_LABELS } from '@/modules/recrutamento/constants/seniority';
import type { ApplicationListItem, Job } from '@/modules/recrutamento/types';
import { isUuid } from '@/utils/uuid';

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR');
}

function formatMoney(value: number | null | undefined) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground mt-1 text-sm whitespace-pre-wrap">
        {value || '—'}
      </dd>
    </div>
  );
}

export default function RecrutamentoVagaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { currentTenantId, hasAnyPermission } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appsError, setAppsError] = useState<string | null>(null);

  const canEdit = hasAnyPermission([RECRUTAMENTO_PERMISSIONS.vagasEditar]);
  const canReadApplications = hasAnyPermission([
    RECRUTAMENTO_PERMISSIONS.candidaturas,
  ]);

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

  const loadApplications = useCallback(async () => {
    if (!id || !isUuid(id) || !currentTenantId || !canReadApplications) return;
    setAppsLoading(true);
    setAppsError(null);
    try {
      const result = await applicationsRepository.list({
        tenant_id: currentTenantId,
        job_id: id,
        sort_by: 'applied_at',
        sort_order: 'desc',
        limit: 50,
      });
      if (result.error) throw result.error;
      setApplications(result.data || []);
    } catch (e) {
      setAppsError(
        e instanceof Error ? e.message : 'Erro ao carregar candidaturas.',
      );
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  }, [id, currentTenantId, canReadApplications]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const salary = useMemo(() => {
    if (!job) return '—';
    if (job.salary_type === 'negotiate') return 'A combinar';
    if (job.salary_min != null || job.salary_max != null) {
      return `${formatMoney(job.salary_min)} a ${formatMoney(job.salary_max)} (${job.salary_type === 'monthly' ? 'mensal' : 'faixa'})`;
    }
    return '—';
  }, [job]);

  if (loading) {
    return (
      <ModuleWorkspace
        title="Detalhes da vaga"
        description="Carregando dados autorizados."
        icon={Briefcase}
        breadcrumbItems={[
          { label: 'Recrutamento', href: '/dashboard/recrutamento' },
          { label: 'Vagas', href: '/dashboard/recrutamento/vagas' },
          { label: 'Detalhes' },
        ]}
      >
        <RouteLoadingFallback />
      </ModuleWorkspace>
    );
  }

  if (error || !job) {
    return (
      <ModuleWorkspace
        title="Detalhes da vaga"
        description="Não foi possível exibir a vaga."
        icon={Briefcase}
        breadcrumbItems={[
          { label: 'Recrutamento', href: '/dashboard/recrutamento' },
          { label: 'Vagas', href: '/dashboard/recrutamento/vagas' },
          { label: 'Detalhes' },
        ]}
      >
        <Card className="space-y-3 p-6">
          <p className="text-destructive text-sm" role="alert">
            {error || 'Vaga não encontrada.'}
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
              Voltar à lista
            </Button>
          </div>
        </Card>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title={job.title}
      description="Detalhes operacionais da vaga no tenant atual."
      icon={Briefcase}
      breadcrumbItems={[
        { label: 'Recrutamento', href: '/dashboard/recrutamento' },
        { label: 'Vagas', href: '/dashboard/recrutamento/vagas' },
        { label: job.title },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void load();
              void loadApplications();
            }}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Atualizar
          </Button>
          {canEdit ? (
            <Button
              size="sm"
              onClick={() =>
                navigate(`/dashboard/recrutamento/vagas/${job.id}/editar`)
              }
              leftIcon={<Pencil className="h-4 w-4" />}
            >
              Editar
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="space-y-5 p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{JOB_STATUS_LABELS[job.status] ?? job.status}</Badge>
            <Badge variant="secondary">
              {CONTRACT_TYPE_LABELS[job.contract_type] ?? job.contract_type}
            </Badge>
            <Badge variant="secondary">
              {WORK_MODE_LABELS[job.work_mode] ?? job.work_mode}
            </Badge>
            {job.seniority ? (
              <Badge variant="secondary">
                {SENIORITY_LABELS[job.seniority] ?? job.seniority}
              </Badge>
            ) : null}
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Slug" value={job.slug} />
            <DetailItem label="Empresa (ID)" value={job.company_id || '—'} />
            <DetailItem
              label="Local"
              value={[job.city, job.state, job.location_detail]
                .filter(Boolean)
                .join(' · ')}
            />
            <DetailItem label="Carga horária" value={job.work_hours || '—'} />
            <DetailItem label="Remuneração" value={salary} />
            <DetailItem
              label="Publicada em"
              value={formatDate(job.published_at)}
            />
            <DetailItem label="Criada em" value={formatDate(job.created_at)} />
            <DetailItem
              label="Atualizada em"
              value={formatDate(job.updated_at)}
            />
          </dl>
          <div className="space-y-4">
            <DetailItem label="Descrição" value={job.description || ''} />
            <DetailItem
              label="Responsabilidades"
              value={job.responsibilities || ''}
            />
            <DetailItem label="Requisitos" value={job.requirements || ''} />
            <DetailItem label="Benefícios" value={job.benefits || ''} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-foreground text-base font-semibold">
              Métricas
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <DetailItem
                label="Visualizações"
                value={String(job.views_count ?? 0)}
              />
              <DetailItem
                label="Candidaturas (contador)"
                value={String(job.applications_count ?? 0)}
              />
            </dl>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-foreground text-base font-semibold">
                Candidaturas
              </h2>
              {canReadApplications ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadApplications()}
                >
                  Atualizar
                </Button>
              ) : null}
            </div>
            {!canReadApplications ? (
              <p className="text-muted-foreground mt-3 text-sm">
                Você não possui permissão para listar candidaturas desta vaga.
              </p>
            ) : appsLoading ? (
              <div className="mt-3">
                <InlineLoader message="Carregando candidaturas" />
              </div>
            ) : appsError ? (
              <p className="text-destructive mt-3 text-sm" role="alert">
                {appsError}
              </p>
            ) : applications.length === 0 ? (
              <EmptyState
                title="Sem candidaturas"
                description="Nenhuma candidatura vinculada a esta vaga foi encontrada."
                icon={Briefcase}
              />
            ) : (
              <ul className="mt-3 space-y-2">
                {applications.slice(0, 8).map((app) => (
                  <li
                    key={app.id}
                    className="border-border rounded-lg border p-3"
                  >
                    <div className="text-foreground text-sm font-medium">
                      {app.candidate_name || 'Candidato'}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {app.candidate_email || '—'} ·{' '}
                      {formatDate(app.applied_at)}
                    </div>
                    <div className="mt-1">
                      <Badge variant="secondary">{app.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {canReadApplications && applications.length > 0 ? (
              <div className="mt-3 text-right">
                <Link
                  to="/dashboard/recrutamento/candidaturas"
                  className="text-primary text-sm hover:underline"
                >
                  Ver todas candidaturas
                </Link>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </ModuleWorkspace>
  );
}
