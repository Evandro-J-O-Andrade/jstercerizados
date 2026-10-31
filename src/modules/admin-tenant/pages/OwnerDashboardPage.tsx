/**
 * OwnerDashboardPage — Dashboard do SaaS Control Center (proprietário).
 *
 * Visão central do ambiente J&S para o perfil de proprietário.
 * Lê contratos de células dinamicamente do CellRegistry, sem conhecer
 * a implementação interna de cada célula. Exibe:
 *  - Visão executiva: indicadores consolidados do registry.
 *  - Mosaico de módulos: contêineres gerados a partir dos contratos.
 *  - Saúde do sistema: DispatcherMaster, CellRegistry, contratos e versões.
 *
 * Cada célula aparece como um contêiner próprio, com suas rotas e
 * permissões declaradas no contrato. O Admin Tenant não importa
 * implementação privada de nenhuma célula.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import {
  DashboardCard,
  DashboardMetricGrid,
  DashboardSection,
} from '@/components/dashboard';
import { filterDashboardMetrics, type DashboardMetricTone } from '@/components/dashboard/dashboard-model';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import type { CellContract } from '@/core/types';

interface CellTileProps {
  cell: CellContract;
  permissions: { name: string }[];
}

function CellTile({ cell, permissions }: CellTileProps) {
  const hasPermission = (perm: string) =>
    permissions.some((p) => p.name === perm);

  const firstRoute = cell.routes[0];
  const routePath = firstRoute?.path
    ? firstRoute.path.startsWith('/')
      ? firstRoute.path
      : `/dashboard/${cell.id}${firstRoute.path ? `/${firstRoute.path}` : ''}`
    : `/dashboard/${cell.id}`;

  const routePerm = firstRoute?.requiredPermissions?.[0];

  const canAccess = !routePerm || hasPermission(routePerm);

  return canAccess ? (
    <Link
      to={routePath}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <LayoutDashboard className="h-5 w-5" />
      </div>
      <h3 className="text-foreground text-sm font-semibold group-hover:text-primary-foreground transition-colors">
        {cell.name}
      </h3>
      <p className="text-muted-foreground text-xs line-clamp-2">
        {cell.description ?? 'Sem descrição declarada no contrato.'}
      </p>
      <div className="mt-auto flex items-center gap-1 text-xs">
        <span
          className={`rounded px-1.5 py-0.5 ${
            cell.enabled
              ? 'bg-green/10 text-green-foreground border border-green/20'
              : 'bg-muted/50 text-muted-foreground border border-border'
          }`}
        >
          {cell.enabled ? 'Ativo' : 'Inativo'}
        </span>
        {cell.version && (
          <span className="text-muted-foreground/70">v{cell.version}</span>
        )}
      </div>
    </Link>
  ) : (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border/30 bg-muted/50 p-4 text-left opacity-60"
    >
      <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-lg">
        <LayoutDashboard className="h-5 w-5" />
      </div>
      <h3 className="text-foreground text-sm font-semibold">
        {cell.name}
      </h3>
      <p className="text-muted-foreground text-xs line-clamp-2">
        {cell.description ?? 'Sem descrição declarada no contrato.'}
      </p>
      <div className="mt-auto flex items-center gap-1 text-xs">
        <span
          className={`rounded px-1.5 py-0.5 ${
            cell.enabled
              ? 'bg-green/10 text-green-foreground border border-green/20'
              : 'bg-muted/50 text-muted-foreground border border-border'
          }`}
        >
          {cell.enabled ? 'Ativo' : 'Inativo'}
        </span>
        {cell.version && (
          <span className="text-muted-foreground/70">v{cell.version}</span>
        )}
      </div>
      <span className="text-destructive text-xs">Sem permissão</span>
    </div>
  );
}

interface SystemHealthProps {
  stats: ReturnType<typeof cellRegistry.stats>;
  allCells: CellContract[];
}

function SystemHealth({ stats, allCells }: SystemHealthProps) {
  const healthyCells = allCells.filter(
    (c) => c.lifecycle?.health === 'healthy',
  ).length;
  const degradedCells = allCells.filter(
    (c) => c.lifecycle?.health === 'degraded',
  ).length;
  const unavailableCells = allCells.filter(
    (c) => c.lifecycle?.health === 'unavailable',
  ).length;

  return (
    <DashboardSection
      title="Saúde do sistema"
      description="Espinha dorsal: DispatcherMaster, CellRegistry e contratos de células."
      icon={Activity}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          metric={{
            id: 'cells-registered',
            label: 'Células registradas',
            value: stats.total,
            description: 'Contratos descobertos pelo CellRegistry',
            icon: Building2,
            tone: 'primary',
            format: 'number',
          }}
        />
        <DashboardCard
          metric={{
            id: 'cells-enabled',
            label: 'Células ativas',
            value: stats.enabled,
            description: 'Células habilitadas para acesso',
            icon: ShieldCheck,
            tone: 'success',
            format: 'number',
          }}
        />
        <DashboardCard
          metric={{
            id: 'cells-disabled',
            label: 'Células inativas',
            value: stats.disabled,
            description: 'Células desabilitadas',
            icon: Lock,
            tone: 'neutral',
            format: 'number',
          }}
        />
        <DashboardCard
          metric={{
            id: 'system-health',
            label: 'Saúde do sistema',
            value:
              unavailableCells > 0
                ? 'Indisponível'
                : degradedCells > 0
                  ? 'Degradado'
                  : healthyCells === stats.total && stats.total > 0
                    ? 'Saudável'
                    : 'Desconhecido',
            description: 'Com base nos contratos de ciclo de vida',
            icon: Activity,
            tone:
              (unavailableCells > 0
                ? 'danger'
                : degradedCells > 0
                  ? 'warning'
                  : healthyCells === stats.total && stats.total > 0
                    ? 'success'
                    : 'neutral') as DashboardMetricTone,
            format: undefined,
          }}
        />
      </div>

      {Object.keys(stats.byModule).length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Object.entries(stats.byModule).map(([module, count]) => (
            <div
              key={module}
              className="border border-border rounded-lg p-3 text-sm"
            >
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">{module}</span>
                <span className="text-foreground font-medium">{count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

export default function OwnerDashboardPage() {
  const { identity, permissions, availableModules } = useAccount();
  const { isAdminMaster } = useAuth();

  const allCells = useMemo(
    () => cellRegistry.getAll().map((entry) => entry.cell),
    [],
  );
  const enabledCells = useMemo(
    () => cellRegistry.getEnabled().map((entry) => entry.cell),
    [],
  );
  const stats = useMemo(() => cellRegistry.stats(), []);

  const modules = useMemo(
    () =>
      availableModules.filter(
        (module) => module.id !== 'inicio' && module.id !== 'core',
      ),
    [availableModules],
  );

  const metrics = useMemo(
    () => [
      {
        id: 'tenants',
        label: 'Tenants',
        value: stats.total,
        description: 'Células registradas no CellRegistry',
        icon: Building2,
        tone: 'primary' as const,
        href: '/dashboard/admin-tenant/tenants',
        permission: 'owner.tenants.read',
        format: 'number' as const,
      },
      {
        id: 'sistemas',
        label: 'Sistemas ativos',
        value: stats.enabled,
        description: 'Células habilitadas para acesso',
        icon: ShieldCheck,
        tone: 'success' as const,
        href: '/dashboard/admin-tenant/sistemas',
        permission: 'owner.systems.read',
        format: 'number' as const,
      },
      {
        id: 'unidades',
        label: 'Módulos disponíveis',
        value: modules.length,
        description: 'Módulos operacionais para o seu perfil',
        icon: LayoutDashboard,
        tone: 'neutral' as const,
        href: '/dashboard/admin-tenant/gestao',
        permission: 'owner.management.read',
        format: 'number' as const,
      },
    ],
    [stats, modules.length],
  );

  const visibleMetrics = filterDashboardMetrics(
    metrics,
    permissions,
    isAdminMaster,
  );

  return (
    <div className="space-y-6">
      <section className="from-primary/10 via-card to-card border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
              <ShieldCheck className="h-4 w-4" />
              SaaS Control Center — Proprietário
            </div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {identity.greeting}, {identity.firstName}.
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              Central de comando e gestão do ambiente. Indicadores consolidados,
              mosaico de módulos e visão da espinha dorsal do sistema.
            </p>
          </div>
          <div className="text-muted-foreground text-sm lg:text-right">
            <p className="text-foreground font-medium">
              {identity.contextLabel}
            </p>
            <p>
              {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
            </p>
          </div>
        </div>
      </section>

      {visibleMetrics.length > 0 ? (
        <DashboardMetricGrid>
          {visibleMetrics.map((metric) => (
            <DashboardCard key={metric.id} metric={metric} />
          ))}
        </DashboardMetricGrid>
      ) : (
        <EmptyState
          title="Nenhum indicador disponível"
          description="Seu perfil não possui indicadores liberados para visualização."
        />
      )}

      <DashboardSection
        title="Saúde do sistema"
        description="Espinha dorsal: DispatcherMaster, CellRegistry e contratos de células."
        icon={Activity}
      >
        <SystemHealth stats={stats} allCells={allCells} />
      </DashboardSection>

      <DashboardSection
        title="Mosaico de módulos"
        description="Contêineres gerados a partir dos contratos de células registradas."
        icon={BarChart3}
      >
        {enabledCells.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enabledCells.map((cell) => (
              <CellTile key={cell.id} cell={cell} permissions={permissions} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma célula ativa"
            description="Não há células habilitadas no CellRegistry para este tenant."
          />
        )}
      </DashboardSection>

      {modules.length > 0 && (
        <DashboardSection
          title="Módulos do Portal"
          description="Acesse as áreas operacionais disponíveis para o seu perfil."
          icon={BriefcaseBusiness}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.slice(0, 6).map((module) => (
              <Link
                key={module.id}
                to={module.route}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="text-foreground text-sm font-semibold group-hover:text-primary-foreground transition-colors">
                  {module.title}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {module.description || 'Acesse o módulo'}
                </p>
              </Link>
            ))}
          </div>
        </DashboardSection>
      )}
    </div>
  );
}
