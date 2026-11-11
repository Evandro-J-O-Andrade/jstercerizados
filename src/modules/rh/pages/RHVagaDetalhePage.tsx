/**
 * RHVagaDetalhePage — página própria de detalhes da vaga (contexto RH).
 * Consulta dados reais do tenant (jobs + candidaturas autorizadas). Não reutiliza
 * a página operacional do Recrutamento; não concede edição/publicação sem RBAC/RLS.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Globe2,
  RefreshCw,
  Users,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback/EmptyState';
import { ErrorState } from '@/components/fallback/ErrorState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { InlineLoader } from '@/components/feedback/InlineLoader';
import { useAuth } from '@/contexts/AuthContext';
import { jobsRepository } from '@/modules/recrutamento/repositories/jobs.repository';
import { applicationsRepository } from '@/modules/recrutamento/repositories/applications.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';
import { JOB_STATUS_LABELS } from '@/modules/recrutamento/constants/jobStatus';
import { CONTRACT_TYPE_LABELS } from '@/modules/recrutamento/constants/contractType';
import { WORK_MODE_LABELS } from '@/modules/recrutamento/constants/workMode';
import { SENIORITY_LABELS } from '@/modules/recrutamento/constants/seniority';
import type { ApplicationListItem, Job } from '@/modules/recrutamento/types';
import { classifyUuidRouteParam } from '@/utils/uuid';

function statusVariant(status: string) {
  if (status === 'published') return 'success' as const;
  if (status === 'filled') return 'default' as const;
  if (status === 'paused') return 'warning' as const;
  if (status === 'cancelled' || status === 'closed') return 'danger' as const;
  return 'secondary' as const;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR');
}

function formatMoney(value: number | null | undefined) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function canOpenPublic(job: Pick<Job, 'status' | 'slug' | 'published_at'>) {
  return (
    job.status === 'published' &&
    Boolean(job.slug?.trim()) &&
    Boolean(job.published_at)
  );
}

function Detail({ label, value }: { label: string; value: string }) {
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

export default function RHVagaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appsError, setAppsError] = useState<string | null>(null);

  const idParam = useMemo(() => classifyUuidRouteParam(id), [id]);
  const validId = idParam.kind === 'valid' ? idParam.value : null;
  const canReadJobs = hasAnyPermission([RH_PERMISSIONS.jobsRead]);
  const canReadApplications = hasAnyPermission([
    RH_PERMISSIONS.applicationsRead,
  ]);

  const load = useCallback(async () => {
    if (!validId) {
      setLoading(false);
      return;
    }
    if (!currentTenantId) {
      setError('Tenant ativo não identificado.');
      setLoading(false);
      return;
    }
    if (!canReadJobs) {
      setError('Permissão jobs.read ausente para consulta desta vaga.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await jobsRepository.getById(validId, currentTenantId);
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
  }, [validId, currentTenantId, canReadJobs]);

  const loadApplications = useCallback(async () => {
    if (!validId || !currentTenantId || !canReadApplications) return;
    setAppsLoading(true);
    setAppsError(null);
    try {
      const result = await applicationsRepository.list({
        tenant_id: currentTenantId,
        job_id: validId,
        sort_by: 'applied_at',
        sort_order: 'desc',
        limit: 25,
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
  }, [validId, currentTenantId, canReadApplications]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const salary = useMemo(() => {
    if (!job) return '—';
    if (job.salary_type === 'negotiate') return 'A combinar';
    if (job.salary_min != null || job.salary_max != null)
      return `${formatMoney(job.salary_min)} a ${formatMoney(job.salary_max)}`;
    return '—';
  }, [job]);

  if (idParam.kind === 'missing' || idParam.kind === 'invalid') {
    return (
      <ModuleWorkspace
        title="Vaga inválida"
        icon={BriefcaseBusiness}
        homeRoute="/dashboard/global"
        breadcrumbItems={[
          { label: 'RH', href: '/dashboard/rh' },
          { label: 'Vagas', href: '/dashboard/rh/vagas' },
          { label: 'Detalhes' },
        ]}
      >
        <Card className="p-2">
          <ErrorState message="Identificador da vaga inválido." />
        </Card>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title={job?.title || 'Detalhes da vaga'}
      description="Consulta RH autorizada: descrição, situação e indicadores reais. Operação de edição/publicação pertence ao Recrutamento."
      icon={BriefcaseBusiness}
      homeRoute="/dashboard/global"
      breadcrumbItems={[
        { label: 'RH', href: '/dashboard/rh' },
        { label: 'Vagas', href: '/dashboard/rh/vagas' },
        { label: job?.title || 'Detalhes' },
      ]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/rh/vagas">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar
            </Link>
          </Button>
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
          {job && canOpenPublic(job) ? (
            <Button asChild size="sm">
              <Link to={`/vagas/${encodeURIComponent(job.slug)}`}>
                <Globe2 className="mr-1.5 h-4 w-4" />
                Ver vaga no site
              </Link>
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <RouteLoadingFallback />
      ) : error ? (
        <Card className="p-2">
          <ErrorState message={error} onRetry={() => void load()} />
        </Card>
      ) : !job ? (
        <Card className="p-6">
          <EmptyState
            icon={BriefcaseBusiness}
            title="Vaga não encontrada"
            description="A vaga não foi localizada ou não está acessível com o escopo/autorização atual."
          />
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <Card className="border-border/70 space-y-5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(job.status)}>
                {JOB_STATUS_LABELS[job.status] ?? job.status}
              </Badge>
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
              <Detail
                label="Empresa (referência)"
                value={job.company_id || '—'}
              />
              <Detail label="Slug público" value={job.slug || '—'} />
              <Detail
                label="Local"
                value={[job.city, job.state, job.location_detail]
                  .filter(Boolean)
                  .join(' · ')}
              />
              <Detail label="Carga horária" value={job.work_hours || '—'} />
              <Detail label="Remuneração" value={salary} />
              <Detail
                label="Publicada em"
                value={formatDate(job.published_at)}
              />
              <Detail label="Criada em" value={formatDate(job.created_at)} />
              <Detail
                label="Atualizada em"
                value={formatDate(job.updated_at)}
              />
            </dl>
            <div className="border-border/60 space-y-4 border-t pt-4">
              <Detail label="Descrição" value={job.description || ''} />
              <Detail
                label="Responsabilidades"
                value={job.responsibilities || ''}
              />
              <Detail label="Requisitos" value={job.requirements || ''} />
              <Detail label="Benefícios" value={job.benefits || ''} />
            </div>
            {!canOpenPublic(job) ? (
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                CTA público indisponível: exibido apenas quando a vaga está
                publicada, com data de publicação e slug válido.
              </p>
            ) : null}
          </Card>

          <div className="space-y-4">
            <Card className="border-border/70 p-5">
              <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
                <Building2 className="text-primary h-4 w-4" />
                Acompanhamento RH
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Detail
                  label="Visualizações"
                  value={String(job.views_count ?? 0)}
                />
                <Detail
                  label="Candidaturas (contador)"
                  value={String(job.applications_count ?? 0)}
                />
              </dl>
              <p className="text-muted-foreground mt-3 text-xs">
                Indicadores derivados de campos reais da vaga. Edição/publicação
                não está disponível nesta página de RH.
              </p>
            </Card>
            <Card className="border-border/70 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
                  <Users className="text-primary h-4 w-4" />
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
                  Permissão applications.read ausente para listar candidaturas
                  desta vaga.
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
                  icon={Users}
                  title="Sem candidaturas"
                  description="Nenhuma candidatura vinculada a esta vaga foi encontrada."
                />
              ) : (
                <ul className="mt-3 space-y-2">
                  {applications.slice(0, 10).map((app) => (
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
            </Card>
          </div>
        </div>
      )}
    </ModuleWorkspace>
  );
}
