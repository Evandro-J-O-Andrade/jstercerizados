import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Cpu,
  Database,
  Layers,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  DashboardCard,
  DashboardErrorState,
  DashboardMetricGrid,
  DashboardSection,
  DashboardSkeleton,
} from '@/components/dashboard';
import {
  filterDashboardMetrics,
  formatDashboardMetricValue,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';
import { EmptyState } from '@/components/fallback';
import { Card } from '@/components/ui/Card';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import type { CellContract } from '@/core/types';
import type {
  CellObservationSnapshot,
  CellOperationalState,
} from '@/core/observability';
import {
  deriveOperationalState,
  normalizeCellHealth,
} from '@/core/observability';
import { useGlobalDashboardStats } from '@/hooks/useGlobalDashboardStats';
import { cn } from '@/utils';
import { hasPermission } from '@/utils/rbac';

/**
 * Central de Comando CHECK BOULER 24H (observador/consolidador).
 * Arquitetura: CORE (governança/identidade/contexto) → Dispatcher Master (orquestração/encaminhamento)
 * → orquestradoras/dispatchers locais/executores → células independentes.
 * Tudo é célula/módulo com contrato próprio; a Central NÃO executa operações internas nem concede privilégios.
 * Dados reais/contratos reais apenas; fonte ausente => desconhecido/indisponível. Falha isolada não derruba o painel.
 * Observabilidade: probes locais por célula + heartbeat apenas com fonte real local/declaração explícita.
 */

type CellHealth = 'healthy' | 'degraded' | 'unavailable' | 'unknown';
type CellState = CellOperationalState;

interface CellObservation {
  cell: CellContract;
  enabledState: 'habilitada' | 'desabilitada';
  health: CellHealth;
  operationalState: CellState;
  homeRoute: string | null;
  notes: string[];
  probes: CellObservationSnapshot['probes'];
  heartbeat: CellObservationSnapshot['heartbeat'];
}

function snapshotToObservation(s: CellObservationSnapshot): CellObservation {
  return {
    cell: s.cell,
    enabledState: s.enabledState,
    health: s.health,
    operationalState: s.operationalState,
    homeRoute: s.cell.homeRoute ?? s.cell.routes[0]?.path ?? null,
    notes: s.notes,
    probes: s.probes,
    heartbeat: s.heartbeat,
  };
}

function observeCellFallback(cell: CellContract): CellObservation {
  const health = normalizeCellHealth(cell.lifecycle?.health);
  const enabledState: CellObservation['enabledState'] = cell.enabled
    ? 'habilitada'
    : 'desabilitada';
  const operationalState = deriveOperationalState(cell.enabled, health);
  const notes: string[] = ['Observação via fallback local (contrato).'];
  if (!cell.enabled) notes.push('Desabilitada no contrato.');
  if (health === 'unknown') notes.push('Saúde não instrumentada (unknown).');
  return {
    cell,
    enabledState,
    health,
    operationalState,
    homeRoute: cell.homeRoute ?? cell.routes[0]?.path ?? null,
    notes,
    probes: [],
    heartbeat: null,
  };
}

function healthLabel(h: CellHealth): string {
  return h === 'healthy'
    ? 'Saudável'
    : h === 'degraded'
      ? 'Degradada'
      : h === 'unavailable'
        ? 'Indisponível'
        : 'Desconhecida';
}
function stateLabel(s: CellState): string {
  if (s === 'operacional_saudavel') return 'Operacional e saudável';
  if (s === 'habilitada') return 'Habilitada';
  if (s === 'degradada') return 'Degradada';
  if (s === 'indisponivel') return 'Indisponível';
  if (s === 'desconhecida') return 'Desconhecida';
  return 'Registrada';
}
function stateTone(
  health: CellHealth,
  enabled: boolean,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (!enabled) return 'neutral';
  if (health === 'healthy') return 'success';
  if (health === 'degraded') return 'warning';
  if (health === 'unavailable') return 'danger';
  return 'neutral';
}
function badgeClass(tone: ReturnType<typeof stateTone>): string {
  if (tone === 'success')
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  if (tone === 'warning')
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
  if (tone === 'danger')
    return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
  return 'bg-muted text-muted-foreground border-border';
}
function canAccessCell(
  perms: ReturnType<typeof useAuth>['permissions'],
  cell: CellContract,
  isAdminMaster: boolean,
): boolean {
  if (isAdminMaster) return true;
  if (!cell.permissions?.length) return false;
  return cell.permissions.some((p) => hasPermission(perms, p));
}

interface CellKpiDef {
  key: keyof ReturnType<typeof useGlobalDashboardStats>;
  permission: string;
  label: string;
  href?: string;
}
const CELL_KPI_MAP: Record<string, CellKpiDef[]> = {
  recrutamento: [
    {
      key: 'jobs',
      permission: 'jobs.read',
      label: 'Vagas',
      href: '/dashboard/vagas',
    },
    {
      key: 'applications',
      permission: 'applications.read',
      label: 'Candidaturas',
      href: '/dashboard/candidaturas',
    },
  ],
  candidato: [
    {
      key: 'candidates',
      permission: 'candidates.read',
      label: 'Candidatos',
      href: '/dashboard/candidatos',
    },
  ],
  empresas: [
    {
      key: 'companies',
      permission: 'companies.read',
      label: 'Empresas',
      href: '/dashboard/empresas',
    },
  ],
  suporte: [
    {
      key: 'supportTickets',
      permission: 'support_tickets.read',
      label: 'Chamados',
      href: '/dashboard/suporte',
    },
  ],
  servicos: [
    {
      key: 'serviceOrders',
      permission: 'service_orders.read',
      label: 'Ordens de serviço',
      href: '/dashboard/servicos',
    },
  ],
  'admin-master': [
    {
      key: 'tenants',
      permission: 'tenants.read',
      label: 'Tenants',
      href: '/dashboard/tenants',
    },
    {
      key: 'people',
      permission: 'people.read',
      label: 'Pessoas',
      href: '/dashboard/pessoas',
    },
  ],
};

function cellKpisFor(
  o: CellObservation,
  stats: ReturnType<typeof useGlobalDashboardStats>,
  perms: ReturnType<typeof useAuth>['permissions'],
) {
  const defs = CELL_KPI_MAP[o.cell.id];
  if (!defs) return [];
  return defs.map((d) => {
    const allowed = hasPermission(perms, d.permission);
    const value = stats[d.key];
    const err = stats.kpiErrors?.[d.key as keyof typeof stats.kpiErrors];
    return {
      ...d,
      allowed,
      value: typeof value === 'number' ? value : null,
      error: err,
    };
  });
}

export default function GlobalCommandPage() {
  const { identity, activePermissions, availableModules } = useAccount();
  const { permissions, isAdminMaster } = useAuth();
  const stats = useGlobalDashboardStats();
  const canReadDomainEvents = hasPermission(permissions, 'domain_events.read');

  const [cellObservations, setCellObservations] = useState<
    CellObservation[] | null
  >(null);
  const [observationsError, setObservationsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    async function loadObservations() {
      try {
        const snapshots = await cellRegistry.observeAll();
        if (cancelled) return;
        setCellObservations(snapshots.map(snapshotToObservation));
        setObservationsError(null);
      } catch (e) {
        if (cancelled) return;
        try {
          setCellObservations(
            cellRegistry
              .getAll()
              .map((entry) => observeCellFallback(entry.cell)),
          );
        } catch {
          setCellObservations([]);
        }
        setObservationsError(
          e instanceof Error ? e.message : 'Falha isolada ao observar células.',
        );
      }
    }
    loadObservations();
    return () => {
      cancelled = true;
    };
  }, []);

  const observations = cellObservations ?? [];

  const visibleObservations = useMemo(
    () =>
      observations.filter((o) =>
        canAccessCell(permissions, o.cell, isAdminMaster),
      ),
    [observations, permissions, isAdminMaster],
  );

  const registryStats = useMemo(() => {
    const total = observations.length;
    const enabled = observations.filter((o) => o.cell.enabled).length;
    const healthy = observations.filter(
      (o) => o.cell.enabled && o.health === 'healthy',
    ).length;
    const degraded = observations.filter(
      (o) => o.cell.enabled && o.health === 'degraded',
    ).length;
    const unavailable = observations.filter(
      (o) => o.cell.enabled && o.health === 'unavailable',
    ).length;
    const unknown = observations.filter(
      (o) => o.cell.enabled && o.health === 'unknown',
    ).length;
    return { total, enabled, healthy, degraded, unavailable, unknown };
  }, [observations]);

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'cells-registered',
        label: 'Células registradas',
        value: registryStats.total,
        description: 'Catálogo CellRegistry (real)',
        icon: Layers,
        tone: 'primary',
        format: 'number',
      },
      {
        id: 'cells-enabled',
        label: 'Células habilitadas',
        value: registryStats.enabled,
        description: 'Contratos enabled=true',
        icon: Cpu,
        tone: registryStats.enabled > 0 ? 'success' : 'neutral',
        format: 'number',
      },
      {
        id: 'cells-healthy',
        label: 'Operacionais/saudáveis',
        value: registryStats.healthy,
        description: 'health=healthy no contrato',
        icon: ShieldCheck,
        tone: 'success',
        format: 'number',
      },
      {
        id: 'cells-degraded',
        label: 'Degradadas/indisponíveis',
        value: registryStats.degraded + registryStats.unavailable,
        description: 'lifecycle.health do contrato',
        icon: Activity,
        tone:
          registryStats.degraded + registryStats.unavailable > 0
            ? 'warning'
            : 'neutral',
        format: 'number',
      },
      {
        id: 'cells-unknown',
        label: 'Saúde desconhecida',
        value: registryStats.unknown,
        description: 'Sem instrumentação real (unknown)',
        icon: Database,
        tone: registryStats.unknown > 0 ? 'neutral' : 'success',
        format: 'number',
      },
    ],
    [registryStats],
  );
  const visibleMetrics = filterDashboardMetrics(metrics, activePermissions);

  const modules = availableModules.filter(
    (m) => m.id !== 'inicio' && m.route !== '/dashboard/global',
  );

  return (
    <div className="space-y-6">
      <section className="from-primary/10 via-card to-card border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
              <LayoutDashboard className="h-4 w-4" />
              Central de Comando · CHECK BOULER 24H
            </div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {identity.greeting}, {identity.firstName}.
            </h2>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
              Observador/consolidador da plataforma.{' '}
              <strong className="text-foreground/80">CORE</strong> governa
              identidade/contexto/segurança;{' '}
              <strong className="text-foreground/80">Dispatcher Master</strong>{' '}
              orquestra encaminhamento. Cada domínio é{' '}
              <strong className="text-foreground/80">
                célula independente
              </strong>{' '}
              com contrato próprio — a Central não cria módulos, não inventa
              permissões e não executa operações internas. Dados reais/contratos
              reais apenas; sem fonte = <em>desconhecido/indisponível</em>.
            </p>
          </div>
          <div className="text-muted-foreground text-sm lg:text-right">
            <p className="text-foreground font-medium">
              {identity.contextLabel}
            </p>
            <p>
              {new Date().toLocaleString('pt-BR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
            <p className="mt-1 flex items-center justify-end gap-1 text-xs">
              <RefreshCw
                className={cn('h-3.5 w-3.5', stats.loading && 'animate-spin')}
              />
              {stats.loading
                ? 'Carregando fontes autorizadas…'
                : 'Fontes carregadas (RLS/RBAC)'}
            </p>
          </div>
        </div>
      </section>

      {stats.error ? <DashboardErrorState message={stats.error} /> : null}

      {observationsError ? (
        <DashboardErrorState
          message={`Observabilidade local: ${observationsError}`}
        />
      ) : null}
      <DashboardSection
        title="Mosaico executivo"
        description="Estado real do catálogo de células (CellRegistry/contratos + probes locais). Sem valores fictícios."
        icon={BarChart3}
      >
        {stats.loading && visibleMetrics.length === 0 ? (
          <DashboardSkeleton count={5} />
        ) : visibleMetrics.length > 0 ? (
          <DashboardMetricGrid>
            {visibleMetrics.map((m) => (
              <DashboardCard key={m.id} metric={m} />
            ))}
          </DashboardMetricGrid>
        ) : (
          <EmptyState
            title="Nenhum indicador autorizado"
            description="Sem indicadores liberados para este contexto."
          />
        )}
      </DashboardSection>

      <DashboardSection
        title="Células — saúde, disponibilidade e indicadores autorizados"
        description="Cada célula expõe estado/KPIs por contrato/fonte autorizada. Registrada × habilitada × operacional/saudável. Falha isolada por célula."
        icon={Layers}
      >
        {observations.length === 0 ? (
          <EmptyState
            title="CellRegistry indisponível"
            description="Nenhuma célula registrada no catálogo."
          />
        ) : visibleObservations.length === 0 ? (
          <EmptyState
            title="Sem células visíveis"
            description="Nenhuma célula autorizada para o contexto."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleObservations.map((o) => {
              const tone = stateTone(o.health, o.cell.enabled);
              const kpis = cellKpisFor(o, stats, permissions);
              return (
                <Card
                  key={o.cell.id}
                  variant="outline"
                  padding="sm"
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-muted-foreground h-4 w-4 shrink-0" />
                        <p className="text-foreground truncate text-sm font-semibold">
                          {o.cell.name}
                        </p>
                      </div>
                      <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                        {o.cell.id}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        badgeClass(tone),
                      )}
                    >
                      {healthLabel(o.health)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="bg-muted rounded px-1.5 py-0.5">
                      {stateLabel(o.operationalState)}
                    </span>
                    <span className="bg-muted rounded px-1.5 py-0.5">
                      Escopo: {o.cell.scope ?? '—'}
                    </span>
                    <span className="bg-muted rounded px-1.5 py-0.5">
                      Domínio: {o.cell.domain ?? '—'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Probes: {o.probes.length} · Heartbeat:{' '}
                    {o.heartbeat
                      ? `${o.heartbeat.source}${o.heartbeat.healthy ? ' OK' : ' degradação'}`
                      : 'sem fonte real'}
                  </p>
                  {kpis.length > 0 ? (
                    <div className="border-border mt-1 grid grid-cols-2 gap-1.5 border-t pt-2">
                      {kpis.map((k) => (
                        <div
                          key={k.key}
                          className="bg-muted/40 rounded px-2 py-1 text-xs"
                        >
                          <div className="text-muted-foreground">{k.label}</div>
                          {!k.allowed ? (
                            <div className="text-muted-foreground">
                              sem permissão
                            </div>
                          ) : k.error ? (
                            <div className="text-amber-700 dark:text-amber-400">
                              indisponível
                            </div>
                          ) : k.href ? (
                            <Link
                              to={k.href}
                              className="text-primary font-semibold hover:underline"
                            >
                              {formatDashboardMetricValue({
                                value: k.value ?? 0,
                                format: 'number',
                              })}
                            </Link>
                          ) : (
                            <div className="text-foreground font-semibold">
                              {formatDashboardMetricValue({
                                value: k.value ?? 0,
                                format: 'number',
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground border-border mt-1 border-t pt-2 text-xs">
                      Sem KPI consolidado mapeado; observar pela célula.
                    </p>
                  )}
                  {o.notes.length > 0 ? (
                    <p className="text-muted-foreground text-xs">
                      {o.notes.join(' ')}
                    </p>
                  ) : null}
                  {o.homeRoute ? (
                    <Link
                      to={o.homeRoute}
                      className="text-primary mt-auto text-xs font-medium hover:underline"
                    >
                      Abrir célula →
                    </Link>
                  ) : (
                    <span className="text-muted-foreground mt-auto text-xs">
                      Sem rota home declarada.
                    </span>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardSection
          title="Operações e eventos (por fonte autorizada)"
          description="Consolidação de domain_events autorizados. Não executa operações internas das células."
          icon={Activity}
        >
          {!canReadDomainEvents ? (
            <EmptyState
              title="Não autorizado"
              description="domain_events.read necessário para eventos consolidados."
            />
          ) : stats.loading ? (
            <DashboardSkeleton count={2} />
          ) : stats.kpiErrors?.recentEvents ? (
            <DashboardErrorState message={stats.kpiErrors.recentEvents} />
          ) : stats.recentEvents.length === 0 ? (
            <EmptyState
              title="Nenhum evento recente"
              description="Fonte autorizada sem eventos retornados."
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-lg border">
              <table className="divide-border min-w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-semibold uppercase">
                      Evento
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-semibold uppercase">
                      Domínio
                    </th>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-semibold uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {stats.recentEvents.slice(0, 12).map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30">
                      <td className="text-foreground px-3 py-2 text-sm">
                        {e.event_type}
                      </td>
                      <td className="text-muted-foreground px-3 py-2 text-sm">
                        {e.aggregate_type || '—'}
                      </td>
                      <td className="text-muted-foreground px-3 py-2 text-sm whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          title="Governança, auditoria e segurança (CORE)"
          description="Superfícies autorizadas. Navegação não concede privilégio; RLS/RBAC soberanos."
          icon={ShieldCheck}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickLink
              to="/dashboard/seguranca"
              label="Segurança"
              desc="Eventos e controles"
              icon={ShieldCheck}
              show={hasPermission(permissions, 'security_events.read')}
            />
            <QuickLink
              to="/dashboard/auditoria"
              label="Auditoria"
              desc="Logs e rastreabilidade"
              icon={Wrench}
              show={hasPermission(permissions, 'audit.read')}
            />
            <QuickLink
              to="/dashboard/admin-master"
              label="Admin Master"
              desc="Governança privilegiada"
              icon={Cpu}
              show={isAdminMaster || hasPermission(permissions, 'tenants.read')}
            />
            <QuickLink
              to="/dashboard/usuarios"
              label="Pessoas/Usuários"
              desc="Gestão autorizada"
              icon={Database}
              show={hasPermission(permissions, 'people.read')}
            />
          </div>
          {!hasPermission(permissions, 'security_events.read') &&
          !hasPermission(permissions, 'audit.read') &&
          !isAdminMaster ? (
            <p className="text-muted-foreground mt-3 text-sm">
              Nenhuma superfície de auditoria/segurança autorizada.
            </p>
          ) : null}
        </DashboardSection>
      </div>

      {modules.length > 0 ? (
        <DashboardSection
          title="Navegação global — células/módulos autorizados"
          description="Catálogo disponível ao contexto. Navegação não concede privilégio."
          icon={Layers}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.slice(0, 12).map((module) => (
              <Link
                key={module.id}
                to={module.route}
                className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-start gap-3 rounded-xl border p-3 transition-colors"
              >
                <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-semibold">
                    {module.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {module.description || 'Acessar módulo'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </DashboardSection>
      ) : null}
    </div>
  );
}

function QuickLink({
  to,
  label,
  desc,
  icon: Icon,
  show,
}: {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <Link
      to={to}
      className="border-border bg-card hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-xl border p-3 transition-colors"
    >
      <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{desc}</p>
      </div>
    </Link>
  );
}
