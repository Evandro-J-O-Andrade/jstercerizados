import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Bell,
  Building2,
  CreditCard,
  LayoutDashboard,
  Lock,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  PlugZap,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Share2,
  UserCircle,
} from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { usePlatformContext } from '@/platform/platform-context';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import { cn } from '@/utils';

interface AdminSidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar({
  isOpen = false,
  onClose,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { identity } = useAccount();
  const platform = usePlatformContext();

  const cellEntries = cellRegistry.getEnabled();
  const cellItems: AdminSidebarItem[] = cellEntries
    .filter((entry: any) => {
      const cell = entry.cell;
      if (!cell?.enabled) return false;
      if (cell.navigation && cell.navigation.sidebar === false) return false;
      const scopes = platform.effectiveScopes || [];
      if (cell.scope && scopes.length > 0) {
        if (!scopes.includes(cell.scope)) return false;
      }
      return true;
    })
    .map((entry: any) => {
      const cell = entry.cell;
      const home = cell.homeRoute || `/dashboard/${cell.id}`;
      return { label: cell.navigation?.label || cell.name, path: home, icon: <LayoutDashboard />, id: cell.id };
    })
    .sort((a: any, b: any) => {
      const aIsGlobal = a.id === 'admin-master' || a.path === '/dashboard/global';
      const bIsGlobal = b.id === 'admin-master' || b.path === '/dashboard/global';
      if (aIsGlobal && !bIsGlobal) return -1;
      if (!aIsGlobal && bIsGlobal) return 1;
      return a.label.localeCompare(b.label);
    })
    .map(({ id, ...rest }: any) => rest);

  const items: AdminSidebarItem[] = cellItems.length > 0 ? cellItems : [
    { label: 'Meu UsuÃ¡rio', path: '/minha-conta', icon: <UserCircle /> },
    {
      label: 'Dashboard',
      path: '/dashboard/admin',
      icon: <LayoutDashboard />,
    },
    { label: 'Tenants', path: '/dashboard/admin/tenants', icon: <Building2 /> },
    {
      label: 'Roles e PermissÃµes',
      path: '/dashboard/admin/roles-permissoes',
      icon: <ShieldCheck />,
    },
    {
      label: 'Auditoria',
      path: '/dashboard/admin/auditoria',
      icon: <Activity />,
    },
    { label: 'SeguranÃ§a', path: '/dashboard/admin/seguranca', icon: <Lock /> },
    { label: 'SessÃµes', path: '/dashboard/admin/sessoes', icon: <Monitor /> },
    {
      label: 'Assinaturas',
      path: '/dashboard/admin/assinaturas',
      icon: <CreditCard />,
    },
    {
      label: 'GestÃ£o SaaS',
      path: '/dashboard/admin/gestao-saas',
      icon: <Settings />,
    },
    {
      label: 'IntegraÃ§Ãµes',
      path: '/dashboard/admin/integracoes',
      icon: <PlugZap />,
    },
    {
      label: 'Auditoria RBAC',
      path: '/dashboard/admin/rbac-auditoria',
      icon: <ShieldAlert />,
    },
    {
      label: 'Relacionamentos',
      path: '/dashboard/admin/relacionamentos',
      icon: <Share2 />,
    },
    {
      label: 'NotificaÃ§Ãµes',
      path: '/dashboard/admin/notificacoes',
      icon: <Bell />,
    },
  ];

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="bg-background/60 fixed inset-0 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'bg-card border-border fixed inset-y-0 left-0 z-40 flex h-dvh shrink-0 flex-col border-r transition-[width,transform] duration-200 lg:relative lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-3">
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2">
              <ShieldCheck
                className="text-primary h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <span className="text-foreground truncate text-sm font-semibold">
                Navegação
              </span>
            </div>
          )}
          <button
            type="button"
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-2"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav
          aria-label="Módulos"
          className="min-h-0 flex-1 overflow-y-auto p-2"
        >
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  onClick={() => {
                    onNavigate?.();
                    onClose?.();
                  }}
                  className={({ isActive }) =>
                    cn(
                      'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      collapsed && 'justify-center px-2',
                      isActive && 'bg-primary/10 text-primary',
                    )
                  }
                >
                  <span className="h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4">
                    {item.icon}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-border shrink-0 border-t p-3">
          <div
            className={cn(
              'flex min-h-10 items-center gap-2',
              collapsed && 'justify-center',
            )}
            title={
              collapsed
                ? `${identity.displayName} — ${identity.roleLabel}`
                : undefined
            }
          >
            <span
              role="img"
              aria-label={`${identity.displayName}, ${identity.roleLabel}`}
              className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {identity.displayName.charAt(0).toUpperCase()}
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="text-foreground block truncate text-sm font-medium">
                  {identity.displayName}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {identity.roleLabel}
                </span>
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
