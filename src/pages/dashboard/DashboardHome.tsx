import { useMemo, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleCardGrid } from '@/components/portal/ModuleCardGrid';
import { fetchAllModuleStats, type ModuleStats } from '@/lib/module-stats';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardHome() {
  const { isAdminMaster, isCandidate } = useAuth();
  const { availableModules, identity, userIdentity, activeTenantId } =
    useAccount();

  const allModules = useMemo(() => availableModules, [availableModules]);
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
        if (!cancelled) setModuleStats(stats);
      } catch (error) {
        console.warn('Failed to load module stats:', error);
        if (!cancelled) setModuleStats({});
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [allModules, tenantId]);

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
    >
      {/*
        O launcher nao cria container de scroll proprio.
        O scroll pertence ao ContentShell do PortalShell, que ja garante
        `min-h-0` na cadeia de altura. Aqui tudo fica em fluxo normal para
        que identidade e cards rolem juntos, sem sobreposicao.
      */}
      <div
        className="flex w-full min-w-0 flex-col gap-6"
        data-test-wrapper="true"
      >
        <section className="border-border bg-card relative shrink-0 rounded-2xl border p-5 shadow-sm">
          <span
            className="bg-primary/60 absolute inset-x-0 top-0 h-0.5 rounded-t-2xl"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="text-primary mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {isAdminMaster
                  ? 'Admin Master · Gestão Global'
                  : 'Portal · Módulos autorizados'}
              </div>
              <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                {identity.greeting}, {identity.firstName}.
              </h2>
            </div>
            <div className="text-muted-foreground shrink-0 text-sm lg:text-right">
              <p className="text-foreground font-medium">
                {identity.contextLabel}
              </p>
              <p className="text-xs">
                {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
              </p>
            </div>
          </div>
        </section>

        <ModuleCardGrid
          modules={allModules}
          moduleStats={moduleStats}
          statsLoading={statsLoading}
          userId={userIdentity.id}
          tenantId={tenantId}
        />
      </div>
    </ModuleWorkspace>
  );
}
