/**
 * AdminMasterCandidatosPage — Gestão administrativa de candidatos (ROOT/Admin Master).
 *
 * Página própria da célula admin-master em /dashboard/admin-master/candidatos.
 * Não reutiliza shell/fluxo operacional do Recrutamento nem portal /candidato.
 * Dados reais via Supabase; autorização efetiva por RBAC (rotas/UI) e RLS (banco).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Filter,
  RefreshCw,
  Search,
  UserRoundSearch,
  Users,
} from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DashboardMetricGrid } from '@/components/dashboard/DashboardMetricGrid';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import type { DashboardMetric } from '@/components/dashboard/dashboard-model';
import {
  createAdminCandidateService,
  type AdminCandidateService,
} from '../../services/candidates.service';
import type { AdminCandidateListItem } from '../../repositories/candidates.repository';

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
  blacklisted: 'Bloqueado',
};

function statusTone(status: string): 'success' | 'warning' | 'neutral' | 'danger' {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'warning';
  if (status === 'blacklisted') return 'danger';
  return 'neutral';
}

export default function AdminMasterCandidatosPage() {
  const service = useMemo<AdminCandidateService>(
    () => createAdminCandidateService(),
    [],
  );
  const [items, setItems] = useState<AdminCandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await service.listCandidates({
      search: search || undefined,
      status: statusFilter || undefined,
    });
    if (result.error) {
      setError(result.error);
      setItems([]);
    } else {
      setItems(result.items);
    }
    setLoading(false);
  }, [service, search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = useMemo<DashboardMetric[]>(() => {
    const active = items.filter((item) => item.status === 'active').length;
    const withApps = items.filter((item) => item.applications_count > 0).length;
    return [
      {
        id: 'candidates-total',
        label: 'Candidatos visíveis',
        value: items.length,
        icon: Users,
        tone: 'primary',
        permission: 'candidates.read',
      },
      {
        id: 'candidates-active',
        label: 'Ativos',
        value: active,
        icon: UserRoundSearch,
        tone: 'success',
        permission: 'candidates.read',
      },
      {
        id: 'candidates-with-applications',
        label: 'Com candidaturas',
        value: withApps,
        icon: BriefcaseBusiness,
        tone: 'neutral',
        permission: 'candidates.read',
      },
    ];
  }, [items]);

  return (
    <ModuleWorkspace
      title="Gestão de Candidatos"
      description="Consulta administrativa de candidatos com escopo autorizado por RBAC e RLS. Sem Kanban, sem decisões de seleção e sem dados fictícios."
      icon={UserRoundSearch}
      homeRoute="/dashboard/global"
      breadcrumbItems={[
        { label: 'Central 24H', href: '/dashboard/global' },
        { label: 'Admin Master', href: '/dashboard/admin-master' },
        { label: 'Gestão de Candidatos' },
      ]}
      actions={
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      }
    >
      <div className="space-y-6" aria-busy={loading}>
        <DashboardMetricGrid className="lg:grid-cols-3">
          {metrics.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} loading={loading} />
          ))}
        </DashboardMetricGrid>

        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, e-mail, título ou origem"
                className="border-0 px-0 shadow-none focus-visible:ring-0"
                aria-label="Buscar candidatos"
              />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full bg-transparent text-sm outline-none"
                aria-label="Filtrar por status"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="archived">Arquivado</option>
                <option value="blacklisted">Bloqueado</option>
              </select>
            </label>
            <Button variant="secondary" onClick={() => void load()} disabled={loading}>
              Aplicar
            </Button>
          </div>
        </Card>

        {loading ? (
          <RouteLoadingFallback />
        ) : error ? (
          <ErrorState
            title="Não foi possível carregar os candidatos"
            message={error}
            onRetry={() => void load()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum candidato encontrado"
            description="Não há candidatos visíveis com o escopo e filtros atuais. Verifique permissões/RLS ou ajuste a busca."
          />
        ) : (
          <div className="grid gap-3">
            {items.map((item) => {
              const name = item.person?.full_name || 'Candidato sem nome';
              const email = item.person?.email || 'Sem e-mail';
              const tone = statusTone(item.status);
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-foreground">
                          {name}
                        </h2>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            tone === 'success'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : tone === 'warning'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : tone === 'danger'
                                  ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {STATUS_LABELS[item.status] ?? item.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{email}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.headline || 'Sem título profissional informado.'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Origem: {item.source || 'não informada'} • Candidaturas:{' '}
                        {item.applications_count} • Atualizado:{' '}
                        {new Date(item.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button asChild variant="outline">
                        <Link to={`/dashboard/admin-master/candidatos/${item.id}`}>
                          Ver detalhes
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="secondary">
                        <Link to={`/dashboard/admin-master/candidatos/${item.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ModuleWorkspace>
  );
}
