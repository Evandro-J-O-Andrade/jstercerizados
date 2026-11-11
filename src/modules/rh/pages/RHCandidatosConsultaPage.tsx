/**
 * RHCandidatosConsultaPage — consulta RH de candidatos (dados reais, tenant, RBAC).
 * Página própria do RH: não reutiliza operação de seleção do Recrutamento.
 * CTA para Recrutamento é navegação operacional autorizada quando necessário; RH mantém consulta aqui.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  Search,
  UserRoundSearch,
  Users,
  UserCheck,
  UserMinus,
  ExternalLink,
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
import { candidatesRepository } from '@/modules/candidato/repositories/candidates.repository';
import { RH_PERMISSIONS } from '@/modules/rh/permissions';

type Row = {
  id: string;
  name: string;
  email: string;
  status: string;
  headline: string;
};

function statusVariant(s: string): 'default' | 'secondary' | 'danger' | 'success' {
  const x = (s || '').toLowerCase();
  if (['active', 'ativo'].includes(x)) return 'success';
  if (['inactive', 'inativo', 'archived', 'blacklisted'].includes(x))
    return 'danger';
  return 'secondary';
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    archived: 'Arquivado',
    blacklisted: 'Bloqueado',
  };
  return map[(s || '').toLowerCase()] || s || 'Não informado';
}

export default function RHCandidatosConsultaPage() {
  const { currentTenantId, hasAnyPermission } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const req = useRef(0);
  const canRead = hasAnyPermission([RH_PERMISSIONS.candidatesRead]);

  const load = useCallback(async () => {
    if (!currentTenantId) {
      setItems([]);
      setLoading(false);
      return;
    }
    if (!canRead) {
      setError('Você não tem permissão para consultar candidatos neste contexto.');
      setLoading(false);
      return;
    }
    const id = ++req.current;
    setLoading(true);
    setError(null);
    try {
      const data = await candidatesRepository.findAll(currentTenantId, {
        search: search.trim() || undefined,
        status: status || undefined,
      });
      if (id !== req.current) return;
      setItems(
        (
          data as Array<{
            id: string;
            status?: string;
            headline?: string | null;
            person?: { full_name?: string | null; email?: string | null } | null;
          }>
        ).map((c) => ({
          id: c.id,
          name: c.person?.full_name || c.headline || `Candidato ${c.id.slice(0, 8)}`,
          email: c.person?.email || '—',
          status: c.status || '',
          headline: c.headline || '—',
        })),
      );
    } catch (e) {
      if (id !== req.current) return;
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível carregar os candidatos agora.',
      );
      setItems([]);
    } finally {
      if (id === req.current) setLoading(false);
    }
  }, [currentTenantId, canRead, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(
    () => ({
      total: items.length,
      active: items.filter((i) => i.status === 'active').length,
      inactive: items.filter((i) =>
        ['inactive', 'archived', 'blacklisted'].includes(i.status),
      ).length,
    }),
    [items],
  );

  const metrics = [
    {
      label: 'Registros na consulta',
      value: summary.total,
      icon: Users,
      hint: 'Resultado atual com filtros aplicados',
      tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
      label: 'Ativos',
      value: summary.active,
      icon: UserCheck,
      hint: 'Situação ativa no conjunto exibido',
      tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Inativos/arquivados',
      value: summary.inactive,
      icon: UserMinus,
      hint: 'Inativo, arquivado ou bloqueado',
      tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
  ];

  return (
    <ModuleWorkspace
      title="Consulta de candidatos"
      description="Visão RH autorizada de candidatos do tenant. Esta página é consulta própria do RH; ações operacionais de seleção permanecem no domínio Recrutamento."
      icon={UserRoundSearch}
      breadcrumbItems={[
        { label: 'RH', href: '/dashboard/rh' },
        { label: 'Candidatos' },
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
        <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumo">
          {metrics.map(({ label, value, icon: Icon, hint, tone }) => (
            <Card
              key={label}
              padding="sm"
              className="border-border/70 bg-card/80 min-h-[104px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-foreground mt-2 text-2xl font-semibold tabular-nums">
                    {loading ? '—' : value.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px]">{hint}</p>
                </div>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          ))}
        </section>

        <Card className="border-border/70 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, título profissional ou origem"
                className="h-11 pl-9"
                aria-label="Buscar candidatos"
              />
            </div>
            <select
              className="border-input bg-surface text-foreground h-11 rounded-lg border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filtrar por situação"
            >
              <option value="">Todas as situações</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="archived">Arquivado</option>
              <option value="blacklisted">Bloqueado</option>
            </select>
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
              icon={UserRoundSearch}
              title="Tenant ativo não identificado"
              description="Selecione um tenant para consultar candidatos."
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
              icon={UserRoundSearch}
              title="Nenhum candidato encontrado"
              description={
                search || status
                  ? 'Ajuste os filtros para ampliar a consulta.'
                  : 'Não há candidatos visíveis para o tenant/filtros autorizados no momento.'
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
              Exibindo {items.length.toLocaleString('pt-BR')} registro(s) do tenant
              ativo. Fonte: candidates/people (consulta autorizada).
            </p>
            {items.map((item) => (
              <Card
                key={item.id}
                className="border-border/70 flex flex-col gap-3 p-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-foreground font-medium">{item.name}</div>
                  <div className="text-muted-foreground text-sm">{item.email}</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Título profissional: {item.headline}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(item.status)}>
                    {statusLabel(item.status)}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/dashboard/recrutamento/candidatos/${item.id}`}>
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Operar no Recrutamento
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
            <p className="text-muted-foreground text-xs">
              O RH mantém consulta própria. A abertura operacional usa a rota do
              Recrutamento apenas quando essa ação for necessária e autorizada.
            </p>
          </div>
        )}
      </div>
    </ModuleWorkspace>
  );
}
