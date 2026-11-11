import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Eye,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback/EmptyState';
import { ErrorState } from '@/components/fallback/ErrorState';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { useAuth } from '@/contexts/AuthContext';
import { jobsRepository } from '@/modules/recrutamento/repositories/jobs.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';
import { JOB_STATUS_LABELS } from '@/modules/recrutamento/constants/jobStatus';
import { CONTRACT_TYPE_LABELS } from '@/modules/recrutamento/constants/contractType';
import { WORK_MODE_LABELS } from '@/modules/recrutamento/constants/workMode';
import type {
  JobFilters,
  JobListItem,
  JobStatus,
} from '@/modules/recrutamento/types';

const PAGE_SIZE = 15;

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
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

function canOpenPublic(
  job: Pick<JobListItem, 'status' | 'slug' | 'published_at'>,
) {
  return (
    job.status === 'published' &&
    Boolean(job.slug?.trim()) &&
    Boolean(job.published_at)
  );
}

function totalPages(count: number, pageSize: number) {
  return Math.max(1, Math.ceil(count / pageSize));
}

export default function RHVagasConsultaPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [items, setItems] = useState<JobListItem[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JobStatus | ''>('');
  const [workMode, setWorkMode] = useState('');
  const [contractType, setContractType] = useState('');
  const requestSequence = useRef(0);
  const canRead = hasAnyPermission([RH_PERMISSIONS.jobsRead]);

  useEffect(() => {
    setPage(1);
  }, [search, status, workMode, contractType, currentTenantId]);

  const load = useCallback(async () => {
    if (!currentTenantId) {
      setItems([]);
      setCount(0);
      setLoading(false);
      return;
    }
    if (!canRead) {
      setError('Permissão jobs.read ausente para consulta de vagas.');
      setItems([]);
      setCount(0);
      setLoading(false);
      return;
    }
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError(null);
    try {
      const result = await jobsRepository.list({
        tenant_id: currentTenantId,
        search: search.trim() || undefined,
        status: status || undefined,
        work_mode: (workMode || undefined) as JobFilters['work_mode'],
        contract_type: (contractType ||
          undefined) as JobFilters['contract_type'],
        sort_by: 'created_at',
        sort_order: 'desc',
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      if (requestId !== requestSequence.current) return;
      if (result.error) throw result.error;
      setItems(result.data || []);
      setCount(result.count || 0);
    } catch (e) {
      if (requestId !== requestSequence.current) return;
      setError(e instanceof Error ? e.message : 'Erro ao consultar vagas.');
      setItems([]);
      setCount(0);
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [currentTenantId, canRead, search, status, workMode, contractType, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = totalPages(count, PAGE_SIZE);
  const showingFrom = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, count);

  const kpis = useMemo(() => {
    const published = items.filter((i) => i.status === 'published').length;
    const paused = items.filter((i) => i.status === 'paused').length;
    const filled = items.filter((i) => i.status === 'filled').length;
    return [
      {
        label: 'Total na consulta',
        value: count,
        icon: BriefcaseBusiness,
        tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
        hint: 'Filtros/tenant atuais',
      },
      {
        label: 'Publicadas (página)',
        value: published,
        icon: Globe2,
        tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        hint: 'Com acesso público quando houver slug',
      },
      {
        label: 'Pausadas (página)',
        value: paused,
        icon: Building2,
        tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        hint: 'Sem CTA público inválido',
      },
      {
        label: 'Preenchidas (página)',
        value: filled,
        icon: MapPin,
        tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
        hint: 'Situação operacional',
      },
    ];
  }, [count, items]);

  return (
    <ModuleWorkspace
      title="Vagas — Consulta RH"
      description="Catálogo autorizado de vagas para acompanhamento do RH. Operação de publicação/seleção permanece no Recrutamento; esta área mantém contexto próprio."
      icon={BriefcaseBusiness}
      breadcrumbItems={[
        { label: 'RH', href: '/dashboard/rh' },
        { label: 'Vagas' },
      ]}
      homeRoute="/dashboard/global"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Atualizar
        </Button>
      }
    >
      <div className="space-y-5" aria-busy={loading}>
        <section
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Indicadores da consulta"
        >
          {kpis.map(({ label, value, icon: Icon, tone, hint }) => (
            <Card
              key={label}
              padding="sm"
              className="border-border/70 bg-card/80 h-full min-h-[104px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {label}
                  </p>
                  <p className="text-foreground mt-2 text-2xl font-semibold tabular-nums">
                    {loading ? '—' : value.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {hint}
                  </p>
                </div>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          ))}
        </section>

        <Card className="border-border/70 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_auto]">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cargo, empresa ou código"
                className="h-11 pl-9"
                aria-label="Buscar vagas"
              />
            </div>
            <select
              className="border-input bg-surface h-11 rounded-lg border px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus | '')}
              aria-label="Situação"
            >
              <option value="">Todas situações</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicada</option>
              <option value="paused">Pausada</option>
              <option value="closed">Fechada</option>
              <option value="filled">Preenchida</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <select
              className="border-input bg-surface h-11 rounded-lg border px-3 text-sm"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              aria-label="Modalidade"
            >
              <option value="">Todas modalidades</option>
              <option value="onsite">Presencial</option>
              <option value="hybrid">Híbrido</option>
              <option value="remote">Remoto</option>
            </select>
            <select
              className="border-input bg-surface h-11 rounded-lg border px-3 text-sm"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              aria-label="Contrato"
            >
              <option value="">Todos contratos</option>
              <option value="clt">CLT</option>
              <option value="pj">PJ</option>
              <option value="temporary">Temporário</option>
              <option value="internship">Estágio</option>
              <option value="freelance">Freelance</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatus('');
                setWorkMode('');
                setContractType('');
              }}
            >
              Limpar
            </Button>
          </div>
        </Card>

        {!currentTenantId ? (
          <Card className="p-6">
            <EmptyState
              icon={BriefcaseBusiness}
              title="Tenant ativo não identificado"
              description="Selecione um tenant para consultar vagas."
            />
          </Card>
        ) : loading ? (
          <RouteLoadingFallback />
        ) : error ? (
          <Card className="p-2">
            <ErrorState message={error} onRetry={() => void load()} />
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon={BriefcaseBusiness}
              title="Nenhuma vaga encontrada"
              description="A consulta não retornou vagas para os filtros autorizados atuais. Nenhum dado fictício é exibido."
            />
          </Card>
        ) : (
          <Card className="border-border/70 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-muted/45 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Vaga</th>
                    <th className="px-5 py-3 font-medium">Empresa / local</th>
                    <th className="px-5 py-3 font-medium">Contrato</th>
                    <th className="px-5 py-3 font-medium">Situação</th>
                    <th className="px-5 py-3 font-medium">Publicada</th>
                    <th className="px-5 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/25 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          className="text-foreground hover:text-primary font-medium"
                          to={`/dashboard/rh/vagas/${item.id}`}
                        >
                          {item.title}
                        </Link>
                        <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                          {item.slug || item.id}
                        </p>
                      </td>
                      <td className="text-muted-foreground px-5 py-4">
                        <div>
                          {item.company_name || 'Empresa não informada'}
                        </div>
                        <div className="text-xs">
                          {[item.city, item.state]
                            .filter(Boolean)
                            .join(' / ') || 'Local não informado'}
                        </div>
                      </td>
                      <td className="text-muted-foreground px-5 py-4 text-xs">
                        <div>
                          {CONTRACT_TYPE_LABELS[item.contract_type] ??
                            item.contract_type}
                        </div>
                        <div>
                          {WORK_MODE_LABELS[item.work_mode] ?? item.work_mode}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant(item.status)}>
                          {JOB_STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground px-5 py-4 text-xs">
                        {formatDate(item.published_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/dashboard/rh/vagas/${item.id}`}>
                              <Eye className="mr-1.5 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </Button>
                          {canOpenPublic(item) ? (
                            <Button asChild size="sm" variant="secondary">
                              <Link
                                to={`/vagas/${encodeURIComponent(item.slug)}`}
                              >
                                <Globe2 className="mr-1.5 h-4 w-4" />
                                Ver no site
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs">
              <span className="text-muted-foreground">
                Exibindo {showingFrom.toLocaleString('pt-BR')}–
                {showingTo.toLocaleString('pt-BR')} de{' '}
                {count.toLocaleString('pt-BR')} vaga(s)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground min-w-[96px] text-center tabular-nums">
                  Página {page} de {pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages || loading}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-muted-foreground">
                Fonte: jobs · tenant ativo · RH consulta (sem operação de
                publicação)
              </span>
            </div>
          </Card>
        )}
      </div>
    </ModuleWorkspace>
  );
}
