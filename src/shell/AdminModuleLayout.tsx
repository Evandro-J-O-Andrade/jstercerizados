import { type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Clock, LayoutDashboard } from 'lucide-react';
import { cn } from '@/utils';
import { getAvailableFeatures } from '@/platform/modules';
import { useAccount } from '@/platform/context';
import type { Permission } from '@/types/auth';
import type { ModuleDefinition } from '@/platform/modules';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminModuleLayoutProps {
  module: ModuleDefinition;
  children: ReactNode;
  className?: string;
}

function AdminModuleBreadcrumb({
  breadcrumbItems,
  homeRoute = '/dashboard',
}: {
  breadcrumbItems: BreadcrumbItem[];
  homeRoute?: string;
}) {
  if (breadcrumbItems.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="text-muted-foreground flex items-center gap-2 text-sm">
        <li>
          <NavLink
            to={homeRoute}
            className="hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </NavLink>
        </li>
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {item.href ? (
              <NavLink
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </NavLink>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function AdminModuleSidebar({
  module,
  permissions,
}: {
  module: ModuleDefinition;
  permissions: Permission[];
}) {
  const location = useLocation();
  const features = getAvailableFeatures(permissions, module, module.scope);

  if (!features.length) return null;

  return (
    <aside className="bg-card border-border w-64 shrink-0 border-r">
      <nav className="p-3" aria-label={`${module.title} navigation`}>
        <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
          {module.title}
        </p>
        <div className="space-y-0.5">
          {features.map((feature) => {
            const isActive =
              location.pathname === feature.route ||
              location.pathname.startsWith(`${feature.route}/`);
            const isComingSoon = feature.implementationStatus === 'coming_soon';

            return (
              <NavLink
                key={feature.id}
                to={feature.route}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isComingSoon
                    ? 'text-muted-foreground'
                    : isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className="flex-1">{feature.title}</span>
                {isComingSoon ? (
                  <Clock className="text-muted-foreground h-3.5 w-3.5" />
                ) : isActive ? (
                  <ChevronRight className="ml-auto h-4 w-4" />
                ) : null}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

export function AdminModuleLayout({
  module,
  children,
  className,
}: AdminModuleLayoutProps) {
  const { activePermissions } = useAccount();
  const features = getAvailableFeatures(
    activePermissions,
    module,
    module.scope,
  );

  const showSidebar = features.some((f) => f.route !== module.route);

  return (
    <div className={cn('flex flex-col', className)}>
      <AdminModuleBreadcrumb breadcrumbItems={[{ label: module.title }]} />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              {module.title}
            </h1>
            {module.description && (
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {module.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        {showSidebar && (
          <AdminModuleSidebar module={module} permissions={activePermissions} />
        )}
        <div className="min-w-0 flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
