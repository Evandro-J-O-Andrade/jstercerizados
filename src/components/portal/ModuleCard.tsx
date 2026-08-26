import { NavLink } from 'react-router-dom';
import { type LucideIcon, Home } from 'lucide-react';
import { cn } from '@/utils';
import type { ModuleDefinition } from './ModuleRegistry';
import type { Permission } from '@/types/auth';

interface ModuleCardLegacyProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  badge?: string | number;
  disabled?: boolean;
  className?: string;
}

interface ModuleCardNewProps {
  module: ModuleDefinition;
  permissions: Permission[];
  className?: string;
}

type ModuleCardProps = ModuleCardLegacyProps | ModuleCardNewProps;

function isLegacyProps(props: ModuleCardProps): props is ModuleCardLegacyProps {
  return (
    'title' in props &&
    'description' in props &&
    'icon' in props &&
    'route' in props
  );
}

export function ModuleCard(props: ModuleCardProps) {
  let disabled = false;
  let route = '';
  let title = '';
  let description = '';
  let Icon: LucideIcon = Home;
  let className = '';

  if (isLegacyProps(props)) {
    const legacy = props;
    disabled = legacy.disabled ?? false;
    route = legacy.route;
    title = legacy.title;
    description = legacy.description;
    Icon = legacy.icon;
    className = legacy.className || '';
  } else {
    const next = props;
    const permissions = next.permissions;
    const module = next.module;
    disabled =
      !module.requiredPermissions || module.requiredPermissions.length === 0
        ? false
        : !module.requiredPermissions.some((perm) =>
            permissions.some((p) => `${p.resource}.${p.action}` === perm),
          );
    route = module.route;
    title = module.title;
    description = module.description;
    Icon = module.icon as unknown as LucideIcon;
    className = next.className || '';
  }

  const content = (
    <div
      className={cn(
        'bg-card border-border flex h-full flex-col rounded-xl border p-6 shadow-sm transition-all duration-200',
        disabled ? 'opacity-60' : 'hover:border-primary/30 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <div className="mt-auto pt-4">
        <span className="text-primary text-sm font-medium">
          {disabled ? 'Sem permissão' : 'Acessar módulo →'}
        </span>
      </div>
    </div>
  );

  if (disabled) {
    return content;
  }

  return (
    <NavLink to={route}>
      {({ isActive }) => (
        <div
          className={cn(
            'relative',
            isActive && 'ring-primary/50 rounded-xl ring-2',
          )}
        >
          {content}
        </div>
      )}
    </NavLink>
  );
}
