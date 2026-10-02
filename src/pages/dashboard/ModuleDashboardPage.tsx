import { useMemo } from 'react';
import { LayoutDashboard, AlertCircle } from 'lucide-react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleSidebar } from '@/components/portal/ModuleSidebar';
import { EmptyState } from '@/components/fallback';
import { useAccount } from '@/contexts/AccountContext';
import { cn } from '@/utils';
import {
  PORTAL_MODULES,
  getAvailableFeatures,
} from '@/components/portal/ModuleRegistry';

interface ModuleDashboardPageProps {
  moduleId: string;
}

export function ModuleDashboardPage({ moduleId }: ModuleDashboardPageProps) {
  const { activePermissions } = useAccount();
  const location = useLocation();

  const module = useMemo(
    () => PORTAL_MODULES.find((m) => m.id === moduleId),
    [moduleId],
  );

  const features = useMemo(
    () =>
      module
        ? getAvailableFeatures(activePermissions, module, module.scope)
        : [],
    [activePermissions, module],
  );

  if (!module) {
    return (
      <ModuleWorkspace
        title="Módulo não encontrado"
        description="O módulo solicitado não existe."
        icon={AlertCircle}
      >
        <EmptyState title="Módulo não encontrado" />
      </ModuleWorkspace>
    );
  }

  const isOnDefaultRoute = location.pathname === module.route;

  return (
    <ModuleWorkspace
      title={module.title}
      description={module.description}
      icon={LayoutDashboard}
      breadcrumbItems={[{ label: module.title }]}
    >
      {!isOnDefaultRoute && (
        <ModuleSidebar
          module={module}
          permissions={activePermissions}
          onNavigate={() => {}}
        />
      )}

      <div className="min-w-0 flex-1">
        {!isOnDefaultRoute ? (
          <Outlet />
        ) : features.length > 1 ? (
          <div className="bg-muted/30 border-border/30 mb-6 rounded-xl border p-4">
            <h2 className="text-foreground mb-3 font-semibold">
              Funcionalidades disponíveis
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const isActive =
                  location.pathname === feature.route ||
                  location.pathname.startsWith(`${feature.route}/`);
                const isComingSoon =
                  feature.implementationStatus === 'coming_soon';

                return (
                  <NavLink
                    key={feature.id}
                    to={feature.route}
                    className={cn(
                      'rounded-lg border p-4 transition-all',
                      isComingSoon
                        ? 'border-border/30 bg-muted/50 opacity-60'
                        : isActive
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border hover:border-primary/30 hover:bg-primary/5',
                    )}
                    onClick={() => {}}
                  >
                    <h3
                      className={cn(
                        'font-medium',
                        isComingSoon
                          ? 'text-muted-foreground'
                          : 'text-foreground',
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        'mt-1 text-sm',
                        isComingSoon
                          ? 'text-muted-foreground/70'
                          : 'text-muted-foreground/60',
                      )}
                    >
                      {feature.description}
                    </p>
                    {isComingSoon && (
                      <span className="text-muted-foreground mt-2 inline-flex items-center gap-1 text-xs">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Em desenvolvimento
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Acesse as funcionalidades pelo menu lateral.
            </p>
          </div>
        )}
      </div>
    </ModuleWorkspace>
  );
}

export function createModuleDashboardPage(moduleId: string) {
  return function ModulePage() {
    return <ModuleDashboardPage moduleId={moduleId} />;
  };
}
