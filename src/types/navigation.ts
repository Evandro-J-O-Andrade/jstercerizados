import type { Permission } from '@/types/auth';

export interface CandidatePortalModule {
  id: string;
  key: string;
  label: string;
  route: string;
  icon: string;
  permission_key: string | null;
  show_in_sidebar: boolean;
  show_in_bottom_nav: boolean;
  sort_order: number;
  is_active: boolean;
  target_audience: string[];
}

export type GlobalNavAction =
  'link' | 'accessibility' | 'chat' | 'logout' | 'site_home';

export interface GlobalNavigationLink {
  id: string;
  key: string;
  label: string;
  href: string;
  icon: string;
  action: GlobalNavAction;
  permission_key: string | null;
  show_in_sidebar: boolean;
  show_in_bottom_nav: boolean;
  show_in_footer: boolean;
  sort_order: number;
  is_active: boolean;
  target_audience: string[];
}

export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon: string;
  permission_key: string | null;
  sort_order: number;
  source: 'module' | 'global';
  action?: GlobalNavAction;
}

export interface FilteredNavigation {
  sidebarItems: NavigationItem[];
  bottomNavItems: NavigationItem[];
  footerItems: NavigationItem[];
}

export function filterNavigation(
  modules: CandidatePortalModule[],
  globals: GlobalNavigationLink[],
  permissions: Permission[],
  roleNames: string[],
): FilteredNavigation {
  const permSet = new Set(permissions.map((p) => `${p.resource}.${p.action}`));
  const isAdminMaster = roleNames.includes('admin_master');

  const passesPermission = (key: string | null): boolean => {
    if (!key) return true;
    if (isAdminMaster) return true;
    return permSet.has(key);
  };

  const passesAudience = (audience: string[]): boolean => {
    if (!audience || audience.length === 0) return true; // global = todos
    if (isAdminMaster) return true; // admin master vê tudo
    return audience.some((r) => roleNames.includes(r));
  };

  const toItem = (
    src: 'module' | 'global',
    m: CandidatePortalModule | GlobalNavigationLink,
  ): NavigationItem => ({
    key: m.key,
    label: m.label,
    href:
      (m as GlobalNavigationLink).href ?? (m as CandidatePortalModule).route,
    icon: m.icon,
    permission_key: m.permission_key,
    sort_order: m.sort_order,
    source: src,
    action: (m as GlobalNavigationLink).action,
  });

  const sidebarItems: NavigationItem[] = [];
  const bottomNavItems: NavigationItem[] = [];
  const footerItems: NavigationItem[] = [];

  for (const m of modules) {
    if (!m.is_active) continue;
    if (!passesAudience(m.target_audience)) continue;
    if (!passesPermission(m.permission_key)) continue;
    const item = toItem('module', m);
    if (m.show_in_sidebar) sidebarItems.push(item);
    if (m.show_in_bottom_nav) bottomNavItems.push(item);
  }

  for (const g of globals) {
    if (!g.is_active) continue;
    if (!passesAudience(g.target_audience)) continue;
    if (!passesPermission(g.permission_key)) continue;
    const item = toItem('global', g);
    if (g.show_in_sidebar) sidebarItems.push(item);
    if (g.show_in_bottom_nav) bottomNavItems.push(item);
    if (g.show_in_footer) footerItems.push(item);
  }

  const byOrder = (a: NavigationItem, b: NavigationItem) =>
    a.sort_order - b.sort_order || a.label.localeCompare(b.label);

  sidebarItems.sort(byOrder);
  bottomNavItems.sort(byOrder);
  footerItems.sort(byOrder);

  return { sidebarItems, bottomNavItems, footerItems };
}
