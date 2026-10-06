import { Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Routes, Route, Outlet, Navigate, Link } from 'react-router-dom';
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
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { EmptyState } from '@/components/fallback';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { Clock, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils';
import type { ModuleRoute } from './types';

interface ModuleRouterProps {
  moduleRegistries: Record<string, ModuleRoute[]>;
  moduleIds?: string[];
  moduleRouteBase?: string;
  skipLayout?: boolean;
}

function ModuleAccessDenied({ label }: { label: string }) {
  return (
    <div
      role="alert"
      data-testid="module-access-denied"
      className="flex min-h-[40dvh] items-center justify-center p-6"
    >
      <div className="max-w-md text-center">
        <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <ShieldAlert className="text-destructive h-8 w-8" />
        </div>
        <h2 className="text-foreground text-xl font-bold">
          Acesso não autorizado
        </h2>
        <p className="text-muted-foreground mt-2">
          Você não tem permissão para acessar esta área de {label}.
        </p>
      </div>
    </div>
  );
}

function renderModuleRoute(
  route: ModuleRoute,
  module: ModuleDefinition,
  activePermissions: ReturnType<typeof useAccount>['activePermissions'],
): ReactNode {
  const hasPermission =
    !route.requiredPermissions ||
    route.requiredPermissions.length === 0 ||
    route.requiredPermissions.some((perm) =>
      activePermissions.some((p) => `${p.resource}.${p.action}` === perm),
    );

  const path = route.path.startsWith('/') ? route.path.slice(1) : route.path;
  const Element = route.element as ComponentType;

  if (!hasPermission) {
    return (
      <Route
        key={route.path}
        path={path}
        element={<ModuleAccessDenied label={module.title} />}
      />
    );
  }

  return (
    <Route key={route.path} path={path} element={<Element />}>
      {route.children?.map((child) =>
        renderModuleRoute(child, module, activePermissions),
      )}
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
    return <Outlet />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features
        .filter((f) => f.route !== module.route)
        .map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      <Outlet />
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
    <Link
      to={feature.route}
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
    </Link>
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
      <div className="min-w-0 flex-1 p-6">
        <Outlet />
        {children}
      </div>
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

/**
 * Converte uma rota absoluta legada (`/dashboard/vagas`) no path relativo usado
 * pelas rotas deste router, trocando segmentos de parâmetro (`:id`) pelo
 * curinga `*` para que o valor seja preservado no redirect.
 */
function toRouterPath(absoluteRoute: string, base: string): string | null {
  if (!absoluteRoute.startsWith(`${base}/`)) return null;
  return absoluteRoute
    .slice(base.length + 1)
    .split('/')
    .map((segment) => (segment.startsWith(':') ? '*' : segment))
    .join('/');
}

/**
 * Redirecionamentos das URLs antigas para as canônicas do módulo.
 *
 * Páginas versionadas (`VisaoGeral`, `GlobalDashboardPage`, `GestaoPage`,
 * `DashboardRh`) ainda navegam para `/dashboard/vagas`,
 * `/dashboard/candidatos`, etc. Sem estes redirects elas caem no
 * `ModulePlaceholder` e o usuário vê "Em breve" numafeature que existe.
 *
 * A lista vem de `feature.legacyRoutes` — fonte única, a mesma que o
 * `ModuleContext` usa para resolver o módulo. Remova a entrada do registry
 * quando a URL antiga sair de uso.
 */
function buildLegacyRedirects(
  modules: ModuleDefinition[],
  base: string,
): Array<{ key: string; path: string; to: string }> {
  const redirects: Array<{ key: string; path: string; to: string }> = [];
  const seen = new Set<string>();

  for (const module of modules) {
    for (const feature of module.features ?? []) {
      for (const legacy of feature.legacyRoutes ?? []) {
        const path = toRouterPath(legacy, base);
        if (!path || seen.has(path)) continue;
        seen.add(path);
        redirects.push({
          key: `legacy-${module.id}-${path}`,
          path,
          to: feature.route
            .split('/')
            .map((segment) => (segment.startsWith(':') ? '*' : segment))
            .join('/'),
        });
      }
    }
  }

  // Rotas mais específicas primeiro: React Router resolve pela ordem.
  return redirects.sort((a, b) => b.path.length - a.path.length);
}

export function ModuleRouter({
  moduleRegistries,
  moduleIds,
  moduleRouteBase,
  skipLayout,
}: ModuleRouterProps) {
  const { activePermissions, effectiveScopes } = useAccount();

  const base = moduleRouteBase || '/dashboard';

  const availableModules = getAvailableModules(
    activePermissions,
    effectiveScopes,
  );

  const launcherRoutes = (
    moduleIds
      ? availableModules.filter((m) => moduleIds.includes(m.id))
      : availableModules.filter(
          (module) =>
            module.route !== base &&
            (MODULE_PERMISSION_MAP[module.id] ||
              !module.requiredPermissions?.length),
        )
  ).filter((module) => moduleIds || module.route !== base);

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {buildLegacyRedirects(availableModules, base).map((redirect) => (
          <Route
            key={redirect.key}
            path={redirect.path}
            element={<Navigate to={redirect.to} replace />}
          />
        ))}
        {launcherRoutes.map((module) => {
          const modulePath =
            base === '/dashboard'
              ? module.route.replace('/dashboard/', '')
              : module.route === base
                ? ''
                : module.route.replace(`${base}/`, '');
          const registry = moduleRegistries[module.id];

          const routeElement = (
            <PermissionGuard
              permission={MODULE_PERMISSION_MAP[module.id] || ''}
            >
              {skipLayout ? (
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ModuleFeatureRenderer module={module} />
                </Suspense>
              ) : (
                <ModuleLayout module={module}>
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ModuleFeatureRenderer module={module} />
                  </Suspense>
                </ModuleLayout>
              )}
            </PermissionGuard>
          );

          return (
            <Route
              key={module.id}
              path={modulePath}
              element={<ErrorBoundary>{routeElement}</ErrorBoundary>}
            >
              {registry?.map((route) =>
                renderModuleRoute(route, module, activePermissions),
              )}
              <Route path="*" element={<ModulePlaceholder />} />
            </Route>
          );
        })}
      </Routes>
    </Suspense>
  );
}

export type { ModuleRoute, ModuleRoutes } from './types';
