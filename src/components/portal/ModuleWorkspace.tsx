import { type ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils';
import type { Permission } from '@/types/auth';
import type { ModuleDefinition } from './ModuleRegistry';
import { ModuleSidebar } from './ModuleSidebar';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ModuleWorkspaceProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  module?: ModuleDefinition;
  permissions?: Permission[];
}

export function ModuleWorkspace({
  title,
  description,
  icon: Icon,
  breadcrumbItems = [],
  actions,
  children,
  className,
  module,
  permissions = [],
}: ModuleWorkspaceProps) {
  return (
    <div
      className={cn('mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}
    >
      {breadcrumbItems.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="text-muted-foreground flex items-center gap-2 text-sm">
            <li>
              <NavLink
                to="/dashboard"
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
                  <span className="text-foreground font-medium">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex gap-6">
        {module && permissions.length > 0 && (
          <ModuleSidebar module={module} permissions={permissions} />
        )}

        <div className="flex-1">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {Icon && (
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="h-6 w-6" />
                </div>
              )}
              <div>
                <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            )}
          </div>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
