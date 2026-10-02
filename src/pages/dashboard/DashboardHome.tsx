import { useMemo, useState, useCallback, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import {
  MetroTileGrid,
  computePuzzleLayout,
} from '@/components/portal/MetroTiles';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import { fetchAllModuleStats, type ModuleStats } from '@/lib/module-stats';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardHome() {
  const { isAdminMaster, isCandidate } = useAuth();
  const { availableModules, identity, userIdentity, activeTenantId } =
    useAccount();

  const allModules = useMemo(() => availableModules, [availableModules]);
  const [tileLayout, setTileLayout] = useState<
    Record<string, { x: number; y: number; w: number; h: number }>
  >(() => computePuzzleLayout(allModules));
  const [moduleStats, setModuleStats] = useState<Record<string, ModuleStats>>(
    {},
  );
  const [statsLoading, setStatsLoading] = useState(true);

  const tenantId = userIdentity.tenant?.id || activeTenantId;

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      if (!tenantId || allModules.length === 0) {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      try {
        const stats = await fetchAllModuleStats(allModules, tenantId);
        if (!cancelled) {
          setModuleStats(stats);
        }
      } catch (error) {
        console.warn('Failed to load module stats:', error);
        if (!cancelled) {
          setModuleStats({});
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [allModules, tenantId]);

  const handleReorder = useCallback((modules: ModuleDefinition[]) => {
    const newLayout = computePuzzleLayout(modules);
    setTileLayout(newLayout);
  }, []);

  if (!isAdminMaster && isCandidate) {
    return <Navigate to="/candidato" replace />;
  }

  if (availableModules.length === 0) {
    return (
      <ModuleWorkspace
        title="Portal"
        description="Acesse os módulos disponíveis para sua conta."
        icon={LayoutDashboard}
        breadcrumbItems={[]}
      >
        <div className="border-border flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-12 text-center">
          <LayoutDashboard className="text-muted-foreground/50 h-12 w-12" />
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              Nenhum módulo disponível
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Sua conta não possui módulos liberados para acesso.
            </p>
          </div>
        </div>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title="Portal"
      description="Acesse os módulos disponíveis para sua conta."
      icon={LayoutDashboard}
      breadcrumbItems={[]}
      className="flex h-full flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col" data-test-wrapper="true">
        <section className="from-primary/10 via-card to-card border-border relative shrink-0 overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                <LayoutDashboard className="h-4 w-4" />
                {isAdminMaster
                  ? 'Admin Master · Gestão Global'
                  : 'Portal · Módulos autorizados'}
              </div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {identity.greeting}, {identity.firstName}.
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                Arraste os módulos para reorganizar seu workspace. Clique para
                acessar.
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

        <div className="flex min-h-0 flex-1 flex-col">
          <MetroTileGrid
            modules={allModules}
            onReorder={handleReorder}
            tileLayout={tileLayout}
            moduleStats={moduleStats}
            statsLoading={statsLoading}
            userId={userIdentity.id}
            tenantId={tenantId}
          />
        </div>
      </div>
    </ModuleWorkspace>
  );
}
