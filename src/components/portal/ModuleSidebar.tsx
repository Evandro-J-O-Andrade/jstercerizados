import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils';
import { type ModuleDefinition, getAvailableFeatures } from './ModuleRegistry';
import type { Permission } from '@/types/auth';

interface ModuleSidebarProps {
  module: ModuleDefinition;
  permissions: Permission[];
  onNavigate?: (href: string) => void;
}

export function ModuleSidebar({
  module,
  permissions,
  onNavigate,
}: ModuleSidebarProps) {
  const location = useLocation();
  const features = getAvailableFeatures(permissions, module, 'tenant');

  if (!features.length) {
    return null;
  }

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

            return (
              <NavLink
                key={feature.id}
                to={feature.route}
                onClick={() => onNavigate?.(feature.route)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className="flex-1">{feature.title}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
