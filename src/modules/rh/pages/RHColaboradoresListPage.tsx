import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserMinus,
  Users,
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
import { employeesRepository } from '@/repositories/employees.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';
import type { Employee } from '@/types/domain/employee';

const PAGE_SIZE = 20;

type EmployeeStatus = '' | 'active' | 'inactive' | 'terminated' | 'on_leave';

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'danger' | 'success' {
  const normalized = (status || '').toLowerCase();
  if (['active', 'ativo'].includes(normalized)) return 'success';
  if (['inactive', 'inativo', 'terminated', 'desligado'].includes(normalized))
    return 'danger';
  return 'secondary';
}

function statusLabel(status: string) {
  return (
    (
      {
        active: 'Ativo',
        inactive: 'Inativo',
        terminated: 'Desligado',
        on_leave: 'Afastado',
      } as Record<string, string>
    )[status] ||
    status ||
    'Não informado'
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}

function totalPages(count: number, pageSize: number) {
  return Math.max(1, Math.ceil(count / pageSize));
}

export default function RHColaboradoresListPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Employee[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('');
  const requestSequence = useRef(0);
  const canCreate = hasAnyPermission([RH_PERMISSIONS.peopleCreate]);
  const canEdit = hasAnyPermission([RH_PERMISSIONS.peopleUpdate]);

  useEffect(() => {
    setPage(1);
  }, [search, status, currentTenantId]);

  const load = useCallback(async () => {
    if (!currentTenantId) {
      setItems([]);
      setCount(0);
      setLoading(false);
      return;
    }
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError(null);
    try {
      const result = await employeesRepository.findPage(
        currentTenantId,
        {
          search: search.trim() || undefined,
          status: status || undefined,
        },
        { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
      );
      if (requestId !== requestSequence.current) return;
      if (result.error) throw result.error;
      setItems(result.data);
      setCount(result.count);
    } catch (cause) {
      if (requestId !== requestSequence.current) return;
      setError(
        cause instanceof Error
          ? cause.message
          : 'Erro ao carregar colaboradores.',
      );
      setItems([]);
      setCount(0);
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [currentTenantId, page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = totalPages(count, PAGE_SIZE);
  const showingFrom = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, count);

  const summary = useMemo(
    () => ({
      total: count,
      active: items.filter((item) => item.status === 'active').length,
      leave: items.filter((item) => item.status === 'on_leave').length,
      recent: items.filter(
        (item) =>
          item.hire_date &&
          new Date(item.hire_date) >= new Date(Date.now() - 30 * 86400000),
      ).length,
    }),
    [count, items],
  );

  const metrics = [
    {
      label: 'Total na consulta',
      value: summary.total,
      icon: Users,
      hint: 'Registros filtrados no tenant',
      tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
    },
    {
      label: 'Ativos (página)',
      value: summary.active,
      icon: UserCheck,
      hint: 'Situação active nesta página',
      tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    },
    {
      label: 'Afastados (página)',
      value: summary.leave,
      icon: UserMinus,
      hint: 'Situação on_leave nesta página',
      tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: 'Admitidos 30 dias (página)',
      value: summary.recent,
      icon: CalendarCheck2,
      hint: 'Por data de admissão',
      tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
    },
  ];

  return (
    <ModuleWorkspace
      title="Gerenciar colaboradores"
      description="Listagem operacional premium com filtros reais, paginação por consulta e ações autorizadas. Fonte: employees, tenant ativo."
      icon={Users}
      breadcrumbItems={[
        { label: 'RH', href: '/dashboard/rh' },
        { label: 'Colaboradores' },
      ]}
      homeRoute="/dashboard/global"
      actions={
        <div className="flex flex-wrap items-center gap-2">
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
              onClick={() => navigate('/dashboard/rh/colaboradores/novo')}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Novo colaborador
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-5" aria-busy={loading}>
        <section
          aria-label="Resumo da listagem"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map(({ label, value, icon: Icon, hint, tone }) => (
            <Card
              key={label}
              padding="sm"
              className="h-full min-h-[108px] border-border/70 bg-card/80 backdrop-blur-sm transition-colors hover:border-primary/25"
            >
              <div className="flex h-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {label}
                  </p>
                  <p className="text-foreground mt-2 text-2xl font-semibold tabular-nums">
                    {loading ? '—' : value.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px]">{hint}</p>
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
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou código"
                className="h-11 pl-9"
                aria-label="Buscar colaboradores"
              />
            </div>
            <select
              className="border-input bg-surface text-foreground h-11 rounded-lg border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              value={status}
              onChange={(event) => setStatus(event.target.value as EmployeeStatus)}
              aria-label="Filtrar por status"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="terminated">Desligado</option>
              <option value="on_leave">Afastado</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              Aplicar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatus('');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </Card>

        {!currentTenantId ? (
          <Card className="p-6">
            <EmptyState
              icon={Users}
              title="Tenant ativo não identificado"
              description="Selecione um tenant para consultar colaboradores."
            />
          </Card>
        ) : loading ? (
          <RouteLoadingFallback message="Carregando colaboradores..." />
        ) : error ? (
          <Card className="p-2">
            <ErrorState message={error} onRetry={() => void load()} />
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              title="Nenhum colaborador encontrado"
              description={
                search || status
                  ? 'Ajuste os filtros para ampliar a consulta.'
                  : 'Cadastre um colaborador elegível para iniciar a base de RH. Nenhum dado fictício é exibido.'
              }
              icon={Users}
              action={
                canCreate && !search && !status ? (
                  <Button
                    size="sm"
                    onClick={() => navigate('/dashboard/rh/colaboradores/novo')}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Novo colaborador
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden p-0 border-border/70">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-muted/45 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Colaborador</th>
                    <th className="px-5 py-3 font-medium">Código</th>
                    <th className="px-5 py-3 font-medium">Admissão</th>
                    <th className="px-5 py-3 font-medium">Situação</th>
                    <th className="px-5 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {items.map((item) => {
                    const name =
                      item.person?.full_name ||
                      item.employee_code ||
                      `Colaborador ${item.id.slice(0, 8)}`;
                    return (
                      <tr key={item.id} className="hover:bg-muted/25 transition-colors">
                        <td className="px-5 py-4">
                          <Link
                            className="text-foreground hover:text-primary font-medium"
                            to={`/dashboard/rh/colaboradores/${item.id}`}
                          >
                            {name}
                          </Link>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {item.person?.email ||
                              'Identidade não vinculada na consulta atual'}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs">
                          {item.employee_code || '—'}
                        </td>
                        <td className="px-5 py-4">{formatDate(item.hire_date)}</td>
                        <td className="px-5 py-4">
                          <Badge variant={statusVariant(item.status)}>
                            {statusLabel(item.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/dashboard/rh/colaboradores/${item.id}`}>
                                Detalhes
                              </Link>
                            </Button>
                            {canEdit ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Editar ${name}`}
                                onClick={() =>
                                  navigate(
                                    `/dashboard/rh/colaboradores/${item.id}/editar`,
                                  )
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs">
              <span className="text-muted-foreground">
                Exibindo {showingFrom.toLocaleString('pt-BR')}–
                {showingTo.toLocaleString('pt-BR')} de{' '}
                {count.toLocaleString('pt-BR')} registro(s)
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
                Fonte: employees · tenant ativo · paginação real
              </span>
            </div>
          </Card>
        )}
      </div>
    </ModuleWorkspace>
  );
}
