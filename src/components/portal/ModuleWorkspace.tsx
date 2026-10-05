import { type ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils';

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
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
  homeRoute?: string;
}

/**
 * ModuleWorkspace — cabeçalho de módulo + área de conteúdo.
 *
 * NÃO carrega container de largura/padding. O shell (PortalShell para
 * /dashboard, CandidateContent para /candidato) já é dono desse container.
 * Carregá-lo aqui duplicava o padding em todas as páginas de dashboard.
 */
export function ModuleWorkspace({
  title,
  description,
  icon: Icon,
  breadcrumbItems = [],
  actions,
  sidebar,
  children,
  className,
  homeRoute = '/dashboard',
}: ModuleWorkspaceProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {breadcrumbItems.length > 0 && (
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
                  <span className="text-foreground font-medium">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

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

      <div className="flex min-h-0 flex-1 gap-6">
        {sidebar}
        {children}
      </div>
    </div>
  );
}
