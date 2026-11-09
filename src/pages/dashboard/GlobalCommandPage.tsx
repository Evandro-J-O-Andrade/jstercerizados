import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Cpu,
  Database,
  Filter,
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
 * Central de Inteligência Operacional 24H — CHECK BOULER 24H (J&S Empregos LTDA).
 * Observador/consolidador: CORE → Dispatcher Master → orquestradoras/executores → células.
 * A Central NÃO cria módulos, não inventa permissões, não executa operações internas e não concede privilégios.
 * Evidência honesta: registradas/habilitadas, estado declarado no contrato, probes locais, heartbeat funcional real
 * (apenas fonte explícita), telemetria remota/KPIs autorizados quando existentes, ou sem instrumentação.
 * Registro em memória NÃO é heartbeat funcional de serviço. Falha isolada não derruba o painel.
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

type EvidenceFilter =
  | 'all'
  | 'declared_healthy'
  | 'degraded'
  | 'unavailable'
  | 'unknown'
  | 'uninstrumented';

const EVIDENCE_FILTERS: { id: EvidenceFilter; label: string }[] = [
  { id: 'all', label: 'Todas registradas' },
  { id: 'declared_healthy', label: 'Sem falha (evidência local)' },
  { id: 'degraded', label: 'Degradadas' },
  { id: 'unavailable', label: 'Indisponíveis' },
  { id: 'unknown', label: 'Desconhecidas' },
  { id: 'uninstrumented', label: 'Sem instrumentação funcional' },
];

const REGISTRATION_MEMORY_SOURCE = 'registry.registered_in_memory';

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
  const notes: string[] = [
    'Observação via fallback local (contrato). Probes/heartbeat funcionais: não executados nesta carga.',
  ];
  if (!cell.enabled) notes.push('Desabilitada no contrato.');
  if (health === 'unknown') notes.push('Estado declarado: desconhecido/sem instrumentação.');
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
    ? 'Sem falha em evidência local'
    : h === 'degraded'
      ? 'Degradada (evidência local)'
      : h === 'unavailable'
        ? 'Indisponível (evidência local)'
        : 'Desconhecida / sem evidência suficiente';
}

function stateLabel(s: CellState): string {
  if (s === 'operacional_saudavel') return 'Habilitada · sem falha em evidência local';
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

function declaredHealth(cell: CellContract): CellHealth {
  return normalizeCellHealth(cell.lifecycle?.health);
}

function isFunctionalHeartbeat(heartbeat: CellObservation['heartbeat']): boolean {
  return Boolean(heartbeat && heartbeat.source !== REGISTRATION_MEMORY_SOURCE);
}

function heartbeatLabel(heartbeat: CellObservation['heartbeat']): string {
  if (!heartbeat) return 'sem fonte (não executado)';
  if (heartbeat.source === REGISTRATION_MEMORY_SOURCE) {
    return `registro em memória (${new Date(heartbeat.at).toLocaleString('pt-BR')}) — NÃO é heartbeat funcional/serviço`;
  }
  return `${heartbeat.source}${heartbeat.healthy ? ' (OK declarado)' : ' (degradação declarada)'}`;
}

function cellMatchesFilter(o: CellObservation, filter: EvidenceFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'declared_healthy') return o.cell.enabled && o.health === 'healthy';
  if (filter === 'degraded') return o.cell.enabled && o.health === 'degraded';
  if (filter === 'unavailable') return !o.cell.enabled || o.health === 'unavailable';
  if (filter === 'unknown') return o.cell.enabled && o.health === 'unknown';
  return !isFunctionalHeartbeat(o.heartbeat);
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
      href: '/dashboard/recrutamento/candidatos',
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

  const [cellObservations, setCellObservations] = useState<CellObservation[] | null>(null);
  const [observationsError, setObservationsError] = useState<string | null>(null);
  const [observationsLoading, setObservationsLoading] = useState(true);
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>('all');
  const [expandedCellId, setExpandedCellId] = useState<string | null>(null);

  const loadObservations = useCallback(async () => {
    setObservationsLoading(true);
    try {
      const snapshots = await cellRegistry.observeAll();
      setCellObservations(snapshots.map(snapshotToObservation));
      setObservationsError(null);
    } catch (e) {
      try {
        setCellObservations(
          cellRegistry.getAll().map((entry) => observeCellFallback(entry.cell)),
        );
      } catch {
        setCellObservations([]);
      }
      setObservationsError(
        e instanceof Error ? e.message : 'Falha isolada ao observar células.',
      );
    } finally {
      setObservationsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setObservationsLoading(true);
      try {
        const snapshots = await cellRegistry.observeAll();
        if (cancelled) return;
        setCellObservations(snapshots.map(snapshotToObservation));
        setObservationsError(null);
      } catch (e) {
        if (cancelled) return;
        try {
          setCellObservations(
            cellRegistry.getAll().map((entry) => observeCellFallback(entry.cell)),
          );
        } catch {
          setCellObservations([]);
        }
        setObservationsError(
          e instanceof Error ? e.message : 'Falha isolada ao observar células.',
        );
      } finally {
        if (!cancelled) setObservationsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const observations = useMemo(
    () => cellObservations ?? [],
    [cellObservations],
  );

  const visibleObservations = useMemo(
    () => observations.filter((o) => canAccessCell(permissions, o.cell, isAdminMaster)),
    [observations, permissions, isAdminMaster],
  );

  const filteredObservations = useMemo(
    () => visibleObservations.filter((o) => cellMatchesFilter(o, evidenceFilter)),
    [visibleObservations, evidenceFilter],
  );

  const registryStats = useMemo(() => {
    const total = observations.length;
    const enabled = observations.filter((o) => o.cell.enabled).length;
    const healthy = observations.filter((o) => o.cell.enabled && o.health === 'healthy').length;
    const degraded = observations.filter((o) => o.cell.enabled && o.health === 'degraded').length;
    const unavailable = observations.filter(
      (o) => !o.cell.enabled || o.health === 'unavailable',
    ).length;
    const unknown = observations.filter((o) => o.cell.enabled && o.health === 'unknown').length;
    const uninstrumented = observations.filter((o) => !isFunctionalHeartbeat(o.heartbeat)).length;
    return { total, enabled, healthy, degraded, unavailable, unknown, uninstrumented };
  }, [observations]);

  const metrics = useMemo<DashboardMetric[]>(
    () => [
      {
        id: 'cells-registered',
        label: 'Células registradas',
        value: registryStats.total,
        description: 'Catálogo CellRegistry (memória local desta execução).',
        icon: Layers,
        tone: 'primary',
        format: 'number',
      },
      {
        id: 'cells-enabled',
        label: 'Células habilitadas',
        value: registryStats.enabled,
        description: 'Contratos com enabled=true (declaração).',
        icon: Cpu,
        tone: registryStats.enabled > 0 ? 'neutral' : 'warning',
        format: 'number',
      },
      {
        id: 'cells-healthy',
        label: 'Sem falha (evidência local)',
        value: registryStats.healthy,
        description: 'Probes locais + estado declarado sem falha conhecida. Não comprova serviço remoto.',
        icon: ShieldCheck,
        tone: 'success',
        format: 'number',
      },
      {
        id: 'cells-attention',
        label: 'Degradadas/indisponíveis',
        value: registryStats.degraded + registryStats.unavailable,
        description: 'Evidência local/probes/fallback indicam atenção. Verificar detalhes por célula.',
        icon: Activity,
        tone: registryStats.degraded + registryStats.unavailable > 0 ? 'warning' : 'neutral',
        format: 'number',
      },
      {
        id: 'cells-unknown',
        label: 'Desconhecidas / sem evidência',
        value: registryStats.unknown,
        description: 'Estado não comprovado por evidência suficiente.',
        icon: Database,
        tone: registryStats.unknown > 0 ? 'neutral' : 'success',
        format: 'number',
      },
      {
        id: 'cells-uninstrumented',
        label: 'Sem heartbeat funcional',
        value: registryStats.uninstrumented,
        description: 'Sem heartbeat funcional/telemetria remota explícita; pode haver apenas registro em memória.',
        icon: Wrench,
        tone: registryStats.uninstrumented > 0 ? 'neutral' : 'success',
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
              CHECK BOULER 24H
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Central de Inteligência Operacional 24H
            </h1>
            <p className="text-foreground mt-2 text-sm font-medium">
              {identity.greeting}, {identity.firstName}.
            </p>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
              Monitoramento, análise, suporte e supervisão com evidência honesta.{' '}
              <strong className="text-foreground/80">CORE</strong> governa identidade/contexto/segurança;{' '}
              <strong className="text-foreground/80">Dispatcher Master</strong> orquestra encaminhamento.
              A Central não executa operações internas nem concede privilégios. Registro em memória ≠
              heartbeat funcional de serviço. Sem fonte real = desconhecido/sem instrumentação.
            </p>
          </div>
          <div className="text-muted-foreground flex flex-col items-start gap-2 text-sm lg:items-end lg:text-right">
            <p className="text-foreground font-medium">{identity.contextLabel}</p>
            <p>
              {new Date().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
            <div className="flex items-center gap-2">
              <p className="flex items-center gap-1 text-xs">
                <RefreshCw className={cn('h-3.5 w-3.5', (stats.loading || observationsLoading) && 'animate-spin')} />
                {stats.loading || observationsLoading
                  ? 'Carregando fontes autorizadas/evidências locais…'
                  : 'KPIs: consulta concluída (RLS/RBAC por KPI); observabilidade: local'}
              </p>
              <button
                type="button"
                onClick={() => void loadObservations()}
                disabled={observationsLoading}
                className="border-border bg-card hover:bg-accent rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50"
              >
                Atualizar diagnósticos
              </button>
            </div>
          </div>
        </div>
      </section>

      {stats.error ? <DashboardErrorState message={stats.error} /> : null}
      {observationsError ? (
        <DashboardErrorState message={`Observabilidade local: ${observationsError}`} />
      ) : null}

      <DashboardSection
        title="Mosaico executivo"
        description="Catálogo local (CellRegistry/contratos/probes locais) + KPIs autorizados quando disponíveis. Não usar como prova de disponibilidade remota."
        icon={BarChart3}
      >
        {stats.loading && visibleMetrics.length === 0 ? (
          <DashboardSkeleton count={6} />
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
        title="Células — diagnóstico por evidência"
        description="Separação: registrada/habilitada, estado declarado, probes locais, heartbeat funcional real (se existir), telemetria remota/KPIs autorizados ou sem instrumentação. Falha isolada por célula."
        icon={Layers}
        actions={
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5" />
            {visibleObservations.length}/{observations.length} visíveis
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {EVIDENCE_FILTERS.map((f) => {
            const active = evidenceFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setEvidenceFilter(f.id)}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {observations.length === 0 ? (
          <EmptyState
            title="CellRegistry indisponível"
            description="Nenhuma célula registrada no catálogo local desta execução."
          />
        ) : visibleObservations.length === 0 ? (
          <EmptyState
            title="Sem células visíveis"
            description="Nenhuma célula autorizada para o contexto atual (RBAC/escopo)."
          />
        ) : filteredObservations.length === 0 ? (
          <EmptyState
            title="Nenhuma célula neste filtro"
            description="Ajuste o filtro de evidência. Estados vazios são informativos, não incidentes fictícios."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredObservations.map((o) => {
              const tone = stateTone(o.health, o.cell.enabled);
              const kpis = cellKpisFor(o, stats, permissions);
              const expanded = expandedCellId === o.cell.id;
              const declared = declaredHealth(o.cell);
              return (
                <Card key={o.cell.id} variant="outline" padding="sm" className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-muted-foreground h-4 w-4 shrink-0" />
                        <p className="text-foreground truncate text-sm font-semibold">{o.cell.name}</p>
                      </div>
                      <p className="text-muted-foreground mt-0.5 font-mono text-xs">{o.cell.id}</p>
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
                    <span className="bg-muted rounded px-1.5 py-0.5">Registro: CellRegistry</span>
                    <span className="bg-muted rounded px-1.5 py-0.5">Habilitação: {o.enabledState}</span>
                    <span className="bg-muted rounded px-1.5 py-0.5">Saúde declarada: {declared}</span>
                    <span className="bg-muted rounded px-1.5 py-0.5">Estado observado: {stateLabel(o.operationalState)}</span>
                    <span className="bg-muted rounded px-1.5 py-0.5">Escopo: {o.cell.scope ?? '—'}</span>
                    <span className="bg-muted rounded px-1.5 py-0.5">Domínio: {o.cell.domain ?? '—'}</span>
                  </div>

                  <p className="text-muted-foreground text-[11px]">
                    Probes locais: {o.probes.length} · Heartbeat funcional:{' '}
                    {isFunctionalHeartbeat(o.heartbeat) ? heartbeatLabel(o.heartbeat) : 'sem instrumentação'}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    Telemetria remota: sem instrumentação nesta Central. Registro local:{' '}
                    {o.heartbeat?.source === REGISTRATION_MEMORY_SOURCE ? 'presente (não funcional)' : '—'}
                  </p>

                  <button
                    type="button"
                    onClick={() => setExpandedCellId(expanded ? null : o.cell.id)}
                    className="text-primary mt-1 inline-flex items-center gap-1 self-start text-xs font-medium hover:underline"
                  >
                    {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    {expanded ? 'Ocultar evidências' : 'Ver evidências e probes'}
                  </button>

                  {expanded ? (
                    <div className="border-border bg-muted/20 space-y-2 rounded-md border p-2 text-[11px]">
                      <div>
                        <p className="text-foreground font-medium">Probes locais (evidência)</p>
                        {o.probes.length === 0 ? (
                          <p className="text-muted-foreground">Nenhum probe executado (fallback/indisponível).</p>
                        ) : (
                          <ul className="text-muted-foreground mt-1 space-y-1">
                            {o.probes.map((p, i) => (
                              <li key={`${o.cell.id}-probe-${i}`}>
                                <span className="text-foreground/80 font-mono">{p.name}</span>: {p.status} — {p.evidence}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Sinal de registro/heartbeat</p>
                        <p className="text-muted-foreground">{heartbeatLabel(o.heartbeat)}</p>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Notas</p>
                        <p className="text-muted-foreground">
                          {o.notes.length > 0 ? o.notes.join(' ') : 'Sem notas adicionais.'}
                        </p>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Dependências/rotas (contrato)</p>
                        <p className="text-muted-foreground">
                          Rotas declaradas: {o.cell.routes?.length ?? 0}. Dependências declaradas:{' '}
                          {o.cell.dependencies?.length ? o.cell.dependencies.map((d) => d.cellId).join(', ') : 'nenhuma declarada'}.
                          Montagem runtime: não comprovada por esta auditoria.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {kpis.length > 0 ? (
                    <div className="border-border mt-1 grid grid-cols-2 gap-1.5 border-t pt-2">
                      {kpis.map((k) => (
                        <div key={k.key} className="bg-muted/40 rounded px-2 py-1 text-xs">
                          <div className="text-muted-foreground">{k.label}</div>
                          {!k.allowed ? (
                            <div className="text-muted-foreground">sem permissão</div>
                          ) : k.error ? (
                            <div className="text-amber-700 dark:text-amber-400">fonte indisponível</div>
                          ) : k.href ? (
                            <Link to={k.href} className="text-primary font-semibold hover:underline">
                              {formatDashboardMetricValue({ value: k.value ?? 0, format: 'number' })}
                            </Link>
                          ) : (
                            <div className="text-foreground font-semibold">
                              {formatDashboardMetricValue({ value: k.value ?? 0, format: 'number' })}
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

                  {o.homeRoute ? (
                    <Link to={o.homeRoute} className="text-primary mt-auto text-xs font-medium hover:underline">
                      Abrir célula →
                    </Link>
                  ) : (
                    <span className="text-muted-foreground mt-auto text-xs">Sem rota home declarada.</span>
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
              title="Nenhum evento recente comprovado"
              description="Fonte autorizada sem eventos retornados. Estado vazio honesto; não indica incidente fictício."
            />
          ) : (
            <div className="border-border overflow-x-auto rounded-lg border">
              <table className="divide-border min-w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-semibold uppercase">Evento</th>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-semibold uppercase">Domínio</th>
                    <th className="text-muted-foreground px-3 py-2 text-left text-xs font-semibold uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {stats.recentEvents.slice(0, 12).map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30">
                      <td className="text-foreground px-3 py-2 text-sm">{e.event_type}</td>
                      <td className="text-muted-foreground px-3 py-2 text-sm">{e.aggregate_type || '—'}</td>
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
                  <p className="text-foreground text-sm font-semibold">{module.title}</p>
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
