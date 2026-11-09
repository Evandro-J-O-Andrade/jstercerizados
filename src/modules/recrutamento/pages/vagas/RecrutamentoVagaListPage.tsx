/**
 * Listagem de Vagas — rota dedicada /dashboard/recrutamento/vagas.
 * Usa dados reais do tenant via jobsRepository. Formulários ficam em páginas separadas.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/fallback/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { jobsRepository } from '@/modules/recrutamento/repositories';
import { RECRUTAMENTO_PERMISSIONS } from '@/modules/recrutamento/permissions';
import { JOB_STATUS_LABELS } from '@/modules/recrutamento/constants/jobStatus';
import { CONTRACT_TYPE_LABELS } from '@/modules/recrutamento/constants/contractType';
import { WORK_MODE_LABELS } from '@/modules/recrutamento/constants/workMode';
import type { JobListItem } from '@/modules/recrutamento/types';
import {
  isJobStatus,
  jobStatsCards,
  totalPages,
  type JobStats,
} from './vaga-list.utils';

const PAGE_SIZE = 20;

function statusVariant(status: string) {
  if (status === 'published') return 'success' as const;
  if (status === 'filled') return 'default' as const;
  if (status === 'cancelled' || status === 'closed') return 'danger' as const;
  return 'secondary' as const;
}

export default function RecrutamentoVagasListPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<JobListItem[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const requestSequence = useRef(0);

  const canCreate = hasAnyPermission([RECRUTAMENTO_PERMISSIONS.vagasCriar]);
  const canEdit = hasAnyPermission([RECRUTAMENTO_PERMISSIONS.vagasEditar]);
  const canArchive = hasAnyPermission([RECRUTAMENTO_PERMISSIONS.vagasExcluir]);

  const load = useCallback(async () => {
    if (!currentTenantId) {
      setItems([]);
      setStats(null);
      setCount(0);
      setLoading(false);
      return;
    }
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError(null);
    try {
      const [result, statsResult] = await Promise.all([
        jobsRepository.list({
          tenant_id: currentTenantId,
          search: search.trim() || undefined,
          status: isJobStatus(status) ? status : undefined,
          sort_by: 'created_at',
          sort_order: 'desc',
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        }),
        jobsRepository.getStats(currentTenantId),
      ]);
      if (requestId !== requestSequence.current) return;
      if (result.error) throw result.error;
      if (statsResult.error) throw statsResult.error;
      setItems(result.data || []);
      setCount(result.count || 0);
      setStats(statsResult.data);
    } catch (e) {
      if (requestId !== requestSequence.current) return;
      setError(e instanceof Error ? e.message : 'Erro ao carregar vagas.');
      setItems([]);
      setStats(null);
      setCount(0);
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [currentTenantId, page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status, currentTenantId]);

  const pages = totalPages(count, PAGE_SIZE);

  const handleArchive = async (item: JobListItem) => {
    if (!canArchive) return;
    const ok = window.confirm(
      `Arquivar/cancelar a vaga "${item.title}"? Esta ação usa o fluxo atual de remoção lógica (status cancelado).`,
    );
    if (!ok) return;
    setError(null);
    const result = await jobsRepository.delete(item.id);
    if (result.error) {
      setError(result.error.message || 'Não foi possível arquivar a vaga.');
      return;
    }
    await load();
  };

  return (
    <ModuleWorkspace
      title="Vagas"
      description="Gerencie vagas do tenant com dados reais autorizados."
      icon={Briefcase}
      breadcrumbItems={[
        { label: 'Recrutamento', href: '/dashboard/recrutamento' },
        { label: 'Vagas' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Atualizar
          </Button>
          {canCreate ? (
            <Button
              size="sm"
              onClick={() => navigate('/dashboard/recrutamento/vagas/novo')}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Nova vaga
            </Button>
          ) : null}
        </div>
      }
    >
      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, empresa, cidade ou slug"
              className="pl-9"
              aria-label="Buscar vagas"
            />
          </div>
          <select
            className="border-input bg-surface h-11 rounded-lg border px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {stats ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {jobStatsCards(stats).map((item) => (
            <Card key={item.id} className="p-4">
              <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {item.label}
              </div>
              <div className="text-foreground mt-2 text-2xl font-semibold tabular-nums">
                {item.value.toLocaleString('pt-BR')}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {loading ? (
        <Card className="text-muted-foreground p-6 text-sm">
          Carregando vagas…
        </Card>
      ) : error ? (
        <Card className="space-y-3 p-6">
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Tentar novamente
          </Button>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-2">
          <EmptyState
            title="Nenhuma vaga encontrada"
            description={
              search || status
                ? 'Ajuste os filtros para ver resultados.'
                : 'Crie uma vaga para iniciar o fluxo de recrutamento.'
            }
            icon={Briefcase}
          />
        </Card>
      ) : (
        <div className="border-border bg-card overflow-x-auto rounded-xl border">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                  Vaga
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                  Empresa
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                  Contrato
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                  Modalidade
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">
                  Local
                </th>
                <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/recrutamento/vagas/${item.id}`}
                      className="text-foreground font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {item.slug}
                    </div>
                  </td>
                  <td className="text-foreground px-4 py-3 text-sm">
                    {item.company_name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(item.status)}>
                      {JOB_STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {CONTRACT_TYPE_LABELS[item.contract_type] ??
                      item.contract_type}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {WORK_MODE_LABELS[item.work_mode] ?? item.work_mode}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-sm">
                    {[item.city, item.state].filter(Boolean).join('/') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigate(`/dashboard/recrutamento/vagas/${item.id}`)
                        }
                        aria-label={`Ver detalhes de ${item.title}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {canEdit ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate(
                              `/dashboard/recrutamento/vagas/${item.id}/editar`,
                            )
                          }
                          aria-label={`Editar ${item.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {canArchive ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleArchive(item)}
                          aria-label={`Arquivar ${item.title}`}
                        >
                          Arquivar
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <span className="text-muted-foreground text-xs">
              Página {page} de {pages} · {count} vaga(s) encontrada(s)
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pages || loading}
                onClick={() =>
                  setPage((current) => Math.min(pages, current + 1))
                }
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModuleWorkspace>
  );
}
