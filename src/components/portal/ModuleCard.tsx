import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import { cn } from '@/utils';
import type { ModuleDefinition } from './ModuleRegistry';
import type { Permission } from '@/types/auth';
import { ICON_MAP } from './PortalSidebar';
import { Card } from '@/components/ui/Card';

interface ModuleCardLegacyProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
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
  let Icon: React.ComponentType<{ className?: string }> = Home;

  if (isLegacyProps(props)) {
    const legacy = props;
    disabled = legacy.disabled ?? false;
    route = legacy.route;
    title = legacy.title;
    description = legacy.description;
    Icon = legacy.icon;
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
    Icon = ICON_MAP[module.icon] || Home;
  }

  const cardContent = (
    <Card
      variant={disabled ? 'default' : 'interactive'}
      hover={!disabled}
      className="h-full"
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
    </Card>
  );

  if (disabled) {
    return cardContent;
  }

  return (
    <NavLink to={route}>
      {({ isActive }) => (
        <div className={cn('relative', isActive && 'ring-primary/50 ring-2')}>
          {cardContent}
        </div>
      )}
    </NavLink>
  );
}
