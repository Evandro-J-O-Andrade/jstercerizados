import { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowLeft, BriefcaseBusiness, LayoutGrid, PanelLeftClose, PanelLeftOpen,
  ShieldCheck, type LucideIcon,
} from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleContext } from '@/contexts/ModuleContext';
import { usePlatformContext } from '@/platform/platform-context';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import { cn } from '@/utils';
import { getAvailableFeatures } from '@/platform/modules';
import { getPermissionKey } from '@/utils/rbac-normalize';
import { resolveIcon } from '@/utils/navigation-icons';
import type { ModuleFeature } from '@/core/contracts/module-contract';

interface NavItem { label: string; path: string; icon: LucideIcon; isActive: boolean; }
function isPathActive(pathname: string, route: string): boolean { return pathname === route || pathname.startsWith(`${route}/`); }
function isConcreteNavRoute(route: string): boolean {
  // Rotas com parâmetros não podem ser links diretos da sidebar sem um registro selecionado.
  return Boolean(route) && !/\/:[^/]+/.test(route) && !route.endsWith('/*') && !route.includes('*');
}

/**
 * Sidebar global autenticada — shell único (CHECK BOULER 24H).
 * Home do sistema: Central 24h (/dashboard/global). Catálogo vem do CellRegistry em runtime.
 * Visibilidade no hub preserva o catálogo; navegação/operação real exigem guards/RBAC/RLS.
 * Dentro de célula: recursos concretos do módulo (sem links :id) + Central 24h.
 */
export function AdminSidebar({ isOpen = false, onClose, onNavigate, className }: {
  isOpen?: boolean; onClose?: () => void; onNavigate?: () => void; className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { identity, activeTenantId, activePermissions } = useAccount();
  const { resolvePostLoginDestination } = useAuth();
  const { currentModule } = useModuleContext();
  const platform = usePlatformContext();
  const pathname = location.pathname;
  const permissionKeys = useMemo(() => new Set(activePermissions.map(getPermissionKey)), [activePermissions]);
  const canRead = useMemo(() => (required?: string[]) => !required?.length || required.some((p) => permissionKeys.has(p)), [permissionKeys]);
  const hasValidContext = Boolean(identity.personId) && (identity.isAdminMaster || Boolean(activeTenantId));
  const accountHome = hasValidContext ? resolvePostLoginDestination() : '/minha-conta';
  const systemHome = '/dashboard/global'; // Central 24h — home do sistema
  const isCentral = pathname === '/dashboard/global' || pathname.startsWith('/dashboard/global/');
  const globalHub = isCentral;

  const moduleItems = useMemo<NavItem[]>(() => {
    if (!currentModule || globalHub) return [];
    const features = getAvailableFeatures(activePermissions, currentModule, currentModule.scope)
      .filter((f) => f.route !== currentModule.route && canRead(f.requiredPermissions) && isConcreteNavRoute(f.route));
    const items: NavItem[] = [{ label: 'Início do módulo', path: currentModule.route, icon: resolveIcon(currentModule.icon) || LayoutGrid, isActive: pathname === currentModule.route }];
    features.forEach((f: ModuleFeature) => items.push({ label: f.title, path: f.route, icon: resolveIcon(f.icon) || LayoutGrid, isActive: isPathActive(pathname, f.route) }));
    return items;
  }, [currentModule, activePermissions, pathname, canRead, globalHub]);

  const globalCatalogItems = useMemo<NavItem[]>(() => {
    const scopes = platform?.effectiveScopes || [];
    const cells = cellRegistry.getEnabled()
      .filter((entry) => {
        const cell = entry.cell;
        if (!cell?.enabled) return false;
        if (cell.navigation && cell.navigation.sidebar === false) return false;
        if (cell.scope && scopes.length > 0 && !scopes.includes(cell.scope)) return false;
        if (cell.homeRoute === '/dashboard/global') return false;
        return true;
      })
      .map((entry) => {
        const cell = entry.cell;
        const path = cell.homeRoute || `/dashboard/${cell.id}`;
        return { label: cell.navigation?.label || cell.name, path, icon: resolveIcon(cell.navigation?.icon) || LayoutGrid, isActive: isPathActive(pathname, path) };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
    const head: NavItem[] = [
      { label: 'Central 24h', path: '/dashboard/global', icon: Activity, isActive: isPathActive(pathname, '/dashboard/global') },
    ];
    if (identity.isAdminMaster && !cells.some((c) => c.path === '/dashboard/admin-master')) {
      head.push({ label: 'Admin Master', path: '/dashboard/admin-master', icon: ShieldCheck, isActive: isPathActive(pathname, '/dashboard/admin-master') });
    }
    return [...head, ...cells];
  }, [pathname, platform?.effectiveScopes, identity.isAdminMaster]);

  const showContext = !globalHub && Boolean(currentModule) && moduleItems.length > 0;
  const items = showContext ? moduleItems : globalCatalogItems;
  const title = showContext ? (currentModule?.title || 'Módulo') : 'Central 24h';
  const TitleIcon = showContext ? (resolveIcon(currentModule?.icon) || BriefcaseBusiness) : Activity;
  const close = () => { onNavigate?.(); onClose?.(); };

  return (
    <>
      {isOpen && <button type="button" aria-label="Fechar menu" className="bg-background/60 fixed inset-0 z-30 lg:hidden" onClick={onClose} />}
      <aside className={cn('bg-card border-border fixed inset-y-0 left-0 z-40 flex h-dvh shrink-0 flex-col border-r transition-[width,transform] duration-200 lg:relative lg:translate-x-0', collapsed ? 'w-16' : 'w-[280px]', isOpen ? 'translate-x-0' : '-translate-x-full', className)}>
        <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-3">
          {!collapsed ? <div className="flex min-w-0 items-center gap-2"><TitleIcon className="text-primary h-5 w-5 shrink-0" aria-hidden="true" /><span className="text-foreground truncate text-sm font-semibold">{title}</span></div> : <TitleIcon className="text-primary mx-auto h-5 w-5 shrink-0" aria-hidden="true" />}
          <button type="button" className={cn('text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-2', collapsed && 'hidden')} aria-label="Recolher menu" onClick={() => setCollapsed(true)}><PanelLeftClose className="h-4 w-4" aria-hidden="true" /></button>
          {collapsed ? <button type="button" className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-2 top-4 rounded-md p-1" aria-label="Expandir menu" onClick={() => setCollapsed(false)}><PanelLeftOpen className="h-4 w-4" aria-hidden="true" /></button> : null}
        </div>

        {showContext ? (
          <div className="border-border shrink-0 border-b p-2">
            <NavLink to={systemHome} title={collapsed ? 'Central 24h' : undefined} onClick={close} className={cn('text-muted-foreground hover:bg-accent hover:text-accent-foreground flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors', collapsed && 'justify-center px-2')}>
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span>Central 24h</span>}
            </NavLink>
          </div>
        ) : null}

        <nav aria-label={showContext ? `Recursos de ${title}` : 'Módulos'} className="min-h-0 flex-1 overflow-y-auto p-2">
          {showContext && !collapsed ? <p className="text-muted-foreground px-3 pb-2 pt-1 text-[11px] font-semibold tracking-wider uppercase">Recursos do módulo</p> : null}
          <ul className="space-y-1">
            {items.map((item) => { const Icon = item.icon; return (
              <li key={item.path}><NavLink to={item.path} title={collapsed ? item.label : undefined} onClick={close}
                className={cn('text-muted-foreground hover:bg-accent hover:text-accent-foreground flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors', collapsed && 'justify-center px-2', item.isActive && 'bg-primary/10 text-primary font-medium')}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink></li>); })}
          </ul>
        </nav>

        <div className="border-border shrink-0 border-t p-3">
          <button type="button" onClick={() => { navigate(accountHome === pathname ? systemHome : accountHome); close(); }} className={cn('hover:bg-muted flex min-h-10 w-full items-center gap-2 rounded-md text-left transition-colors', collapsed && 'justify-center')}
            title={collapsed ? `${identity.displayName} — ${identity.roleLabel}` : undefined}>
            <span role="img" aria-label={`${identity.displayName}, ${identity.roleLabel}`} className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">{identity.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
            {!collapsed && <span className="min-w-0"><span className="text-foreground block truncate text-sm font-medium">{identity.displayName}</span><span className="text-muted-foreground block truncate text-xs">{identity.roleLabel}</span></span>}
          </button>
        </div>
      </aside>
    </>
  );
}
