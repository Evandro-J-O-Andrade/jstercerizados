import { Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAccount } from '@/platform/context';
import { PermissionGuard } from '@/platform/permissions';
import {
  getAvailableModules,
  getAvailableFeatures,
  type ModuleDefinition,
  type ModuleFeature,
  MODULE_PERMISSION_MAP,
} from '@/platform/modules';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleSidebar } from '@/components/portal/ModuleSidebar';
import { EmptyState } from '@/components/fallback';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { Clock, LayoutDashboard } from 'lucide-react';
import { cn } from '@/utils';
import type { ModuleRoute } from './types';

interface ModuleRouterProps {
  moduleRegistries: Record<string, ModuleRoute[]>;
}

function ModuleRouteRenderer({
  route,
  module,
}: {
  route: ModuleRoute;
  module: ModuleDefinition;
}) {
  const { activePermissions } = useAccount();

  const hasPermission =
    !route.requiredPermissions ||
    route.requiredPermissions.length === 0 ||
    route.requiredPermissions.some((perm) =>
      activePermissions.some((p) => `${p.resource}.${p.action}` === perm),
    );

  const path = route.path.startsWith('/') ? route.path.slice(1) : route.path;

  if (!hasPermission) {
    return null;
  }

  const Element = route.element as ComponentType;

  return (
    <Route key={route.path} path={path} element={<Element />}>
      {route.children?.map((child) => (
        <ModuleRouteRenderer key={child.path} route={child} module={module} />
      ))}
    </Route>
  );
}

function ModuleFeatureRenderer({ module }: { module: ModuleDefinition }) {
  const { activePermissions, effectiveScopes } = useAccount();
  const features = getAvailableFeatures(
    activePermissions,
    module,
    effectiveScopes,
  );

  if (
    features.length === 0 ||
    features.every((f) => f.route === module.route)
  ) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Acesse as funcionalidades pelo menu lateral.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features
        .filter((f) => f.route !== module.route)
        .map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
    </div>
  );
}

function FeatureCard({ feature }: { feature: ModuleFeature }) {
  const isActive =
    typeof window !== 'undefined' &&
    (window.location.pathname === feature.route ||
      window.location.pathname.startsWith(`${feature.route}/`));
  const isComingSoon = feature.implementationStatus === 'coming_soon';

  return (
    <a
      href={feature.route}
      className={cn(
        'block rounded-lg border p-4 transition-all',
        isComingSoon
          ? 'border-border/30 bg-muted/50 opacity-60'
          : isActive
            ? 'border-primary/30 bg-primary/5'
            : 'border-border hover:border-primary/30 hover:bg-primary/5',
      )}
    >
      <h3
        className={cn(
          'font-medium',
          isComingSoon ? 'text-muted-foreground' : 'text-foreground',
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
          <Clock className="h-3.5 w-3.5" />
          Em desenvolvimento
        </span>
      )}
    </a>
  );
}

function ModuleLayout({
  module,
  children,
}: {
  module: ModuleDefinition;
  children: ReactNode;
}) {
  const { activePermissions, effectiveScopes } = useAccount();
  const features = getAvailableFeatures(
    activePermissions,
    module,
    effectiveScopes,
  );

  const showSidebar = features.some((f) => f.route !== module.route);

  return (
    <ModuleWorkspace
      title={module.title}
      description={module.description}
      icon={LayoutDashboard}
      breadcrumbItems={[{ label: module.title }]}
    >
      {showSidebar && (
        <ModuleSidebar module={module} permissions={activePermissions} />
      )}
      <div className="min-w-0 flex-1 p-6">{children}</div>
    </ModuleWorkspace>
  );
}

function ModulePlaceholder() {
  return (
    <div className="min-w-0 flex-1 py-8">
      <EmptyState
        title="Em breve"
        description="Esta funcionalidade está em desenvolvimento e estará disponível em breve."
        icon={Clock}
      />
    </div>
  );
}

export function ModuleRouter({ moduleRegistries }: ModuleRouterProps) {
  const { activePermissions, effectiveScopes } = useAccount();

  const availableModules = getAvailableModules(
    activePermissions,
    effectiveScopes,
  );

  const launcherRoutes = availableModules.filter(
    (module) =>
      module.route !== '/dashboard' &&
      (MODULE_PERMISSION_MAP[module.id] || !module.requiredPermissions?.length),
  );

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {launcherRoutes.map((module) => {
          const modulePath = module.route.replace('/dashboard/', '');
          const registry = moduleRegistries[module.id];

          return (
            <Route
              key={module.id}
              path={modulePath}
              element={
                <PermissionGuard
                  permission={MODULE_PERMISSION_MAP[module.id] || ''}
                >
                  <ModuleLayout module={module}>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <ModuleFeatureRenderer module={module} />
                    </Suspense>
                  </ModuleLayout>
                </PermissionGuard>
              }
            >
              {registry?.map((route) => (
                <ModuleRouteRenderer
                  key={route.path}
                  route={route}
                  module={module}
                />
              ))}
              <Route path="*" element={<ModulePlaceholder />} />
            </Route>
          );
        })}
      </Routes>
    </Suspense>
  );
}

export type { ModuleRoute, ModuleRoutes } from './types';
