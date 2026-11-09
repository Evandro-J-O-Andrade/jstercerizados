import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  House,
  MoreHorizontal,
  Radar,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils';
import { getPermissionKey } from '@/utils/rbac-normalize';
import { resolveIcon } from '@/utils/navigation-icons';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Navegação inferior exclusiva do sistema autenticado.
 *
 * O Home reutiliza a autoridade canônica de destino da sessão. Os atalhos
 * operacionais partem das células do contexto atual e passam novamente pelo
 * filtro de permissões efetivas; UUID de pessoa ou tenant nunca concede acesso.
 * O botão "Mais" reutiliza a sidebar do shell.
 */
export function PortalBottomNavigation({ onMore }: { onMore: () => void }) {
  const { pathname } = useLocation();
  const { resolvePostLoginDestination } = useAuth();
  const {
    identity,
    activeTenantId,
    activePermissions,
    availableModules,
  } = useAccount();

  const hasValidContext =
    Boolean(identity.personId) &&
    (identity.isAdminMaster || Boolean(activeTenantId));

  if (!hasValidContext) return null;

  const permissionKeys = new Set(activePermissions.map(getPermissionKey));
  const homeRoute = resolvePostLoginDestination();
  const contextualItems: NavItem[] = availableModules
    .filter((module) => {
      const required = module.requiredPermissions ?? [];
      return (
        module.route !== homeRoute &&
        (required.length === 0 ||
          required.some((permission) => permissionKeys.has(permission)))
      );
    })
    .sort((left, right) => {
      const leftIsCurrent = pathname.startsWith(left.route) ? 1 : 0;
      const rightIsCurrent = pathname.startsWith(right.route) ? 1 : 0;
      return rightIsCurrent - leftIsCurrent;
    })
    .slice(0, 2)
    .map((module) => ({
      label: module.title,
      href: module.route,
      icon: resolveIcon(module.icon),
    }));

  const adminMasterItems: NavItem[] = permissionKeys.has('tenants.read')
    ? [
        { label: 'CORE 24H', href: '/dashboard/global', icon: Radar },
        { label: 'Tenants', href: '/dashboard/tenants', icon: Building2 },
      ]
    : [];

  const candidates: NavItem[] = [
    { label: 'Home', href: homeRoute, icon: House },
    ...(identity.isAdminMaster ? adminMasterItems : contextualItems),
    { label: 'Conta', href: '/minha-conta', icon: UserRound },
  ];
  const seenRoutes = new Set<string>();
  const portalNavItems = candidates.filter((item) => {
    if (seenRoutes.has(item.href)) return false;
    seenRoutes.add(item.href);
    return true;
  });

  return (
    <nav
      aria-label="Navegação inferior do sistema"
      className="bg-card/95 border-border fixed right-0 bottom-0 left-0 z-40 border-t shadow-[0_-8px_24px_hsl(var(--foreground)/0.06)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
        {portalNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.label !== 'Home' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'text-muted-foreground hover:bg-muted/50 hover:text-foreground relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-200',
                isActive && 'text-primary',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="portalBottomNavIndicator"
                  className="bg-primary/20 absolute -top-1 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="h-6 w-6" />
              <span className="max-w-full truncate text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          aria-label="Mais opções"
          className="text-muted-foreground hover:bg-muted/50 hover:text-foreground relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-200"
        >
          <MoreHorizontal className="h-6 w-6" />
          <span className="text-[10px] font-medium tracking-tight">Mais</span>
        </button>
      </div>
    </nav>
  );
}
