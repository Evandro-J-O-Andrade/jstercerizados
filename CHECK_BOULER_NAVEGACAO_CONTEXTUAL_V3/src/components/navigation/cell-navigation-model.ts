/**
 * Navegação canônica por célula: URL e CellRegistry definem o contexto.
 * Não cria permissões. Uma rota home só pode pertencer a uma célula.
 */
import type { CellContract, CellRoute } from '@/core/types';
import { MODULE_PERMISSION_MAP } from '@/core/permissions/modulePermissionMap';

export type NavCell = CellContract;
export type NavGroup = 'overview' | 'resource' | 'action';
export interface NavEntry {
  path: string;
  label: string;
  icon?: string;
  group: NavGroup;
  permissionKeys: string[];
}

const GLOBAL_ROUTES = new Set([
  '/dashboard',
  '/dashboard/modulos',
  '/dashboard/global',
  '/dashboard/admin-master',
]);

function normalizePath(pathname: string): string {
  const value = (pathname || '/').split(/[?#]/, 1)[0].replace(/\/+$/, '');
  return value || '/';
}

export function isPathInside(pathname: string, base: string): boolean {
  const current = normalizePath(pathname);
  const root = normalizePath(base);
  return current === root || current.startsWith(`${root}/`);
}

export function canAccess(keys: readonly string[] | undefined, grants: ReadonlySet<string>): boolean {
  return !keys?.length || keys.some((key) => grants.has(key));
}

function isEligibleRoute(route: CellRoute): boolean {
  const status = route.implementationStatus;
  if (status === 'coming_soon' || status === 'disabled' || status === 'deprecated') return false;
  if (!route.label || route.path.startsWith('/') || route.path.includes(':')) return false;
  if (/\bcompatibilidade\b/i.test(route.label)) return false;
  const segments = route.path.split('/');
  if (segments.some((part) => part === '.' || part === '..')) return false;
  return true;
}

export function getCellNavigation(
  cells: readonly CellContract[],
  scopes: readonly ('global' | 'tenant')[],
  grants: ReadonlySet<string>,
  isMaster: boolean,
  hasTenant: boolean,
): NavCell[] {
  const eligible = cells.filter((cell) => {
    if (!cell.enabled || cell.navigation?.sidebar === false || !cell.homeRoute) return false;
    if (!cell.homeRoute.startsWith('/dashboard/')) return false;
    if (cell.id === 'core' || cell.id === 'candidato') return false;
    if (cell.homeRoute === '/dashboard/global' || cell.homeRoute === '/dashboard/modulos') return false;
    if (cell.id === 'admin-master' && !isMaster) return false;
    if (cell.scope === 'tenant' && !hasTenant) return false;
    if (cell.scope && !scopes.includes(cell.scope) && !(isMaster && cell.scope === 'tenant' && hasTenant)) return false;
    // A mesma permissão do gate canônico do módulo, quando definida.
    const moduleGate = MODULE_PERMISSION_MAP[cell.id];
    if (moduleGate && !grants.has(moduleGate)) return false;
    // Uma permissão da célula abre sua entrada; cada ação tem guarda própria.
    if (cell.permissions?.length && !cell.permissions.some((key) => grants.has(key))) return false;
    return true;
  });
  // Colisão de ownership é calculada antes dos filtros de permissão.
  // Um módulo oculto não torna legítima a rota duplicada do módulo visível.
  const collisions = new Set(getConflictingHomeRoutes(cells));
  return eligible.filter((cell) => !collisions.has(normalizePath(cell.homeRoute!)));
}

export function getConflictingHomeRoutes(cells: readonly CellContract[]): string[] {
  const counts = new Map<string, number>();
  for (const cell of cells) {
    if (!cell.enabled || !cell.homeRoute) continue;
    const path = normalizePath(cell.homeRoute);
    counts.set(path, (counts.get(path) || 0) + 1);
  }
  return [...counts].filter(([, count]) => count > 1).map(([path]) => path);
}

/** A home do Master é global; as subrotas Admin Master podem ter contexto próprio. */
export function resolveNavigationCell(pathname: string, cells: readonly NavCell[]): NavCell | null {
  const pathnameNormalized = normalizePath(pathname);
  if (GLOBAL_ROUTES.has(pathnameNormalized)) return null;
  return cells
    .filter((cell) => cell.homeRoute && isPathInside(pathnameNormalized, cell.homeRoute))
    .sort((a, b) => (b.homeRoute?.length || 0) - (a.homeRoute?.length || 0))[0] ?? null;
}

export function getCellSidebarEntries(cell: NavCell, grants: ReadonlySet<string>): NavEntry[] {
  if (!cell.homeRoute) return [];
  const result: NavEntry[] = [{
    path: cell.homeRoute,
    label: 'Início do módulo',
    icon: 'layout-dashboard',
    group: 'overview',
    permissionKeys: [],
  }];
  const seen = new Set([cell.homeRoute]);
  for (const route of cell.routes) {
    if (!isEligibleRoute(route) || !route.path || !canAccess(route.requiredPermissions, grants)) continue;
    const path = `${cell.homeRoute}/${route.path}`;
    if (seen.has(path)) continue;
    const action = /\/(novo|criar)$/.test(`/${route.path}`);
    // Não exibir links de edição/detalhes por ID: entram pelo CRUD do recurso.
    if (/(^|\/)(editar|detalhes)$/.test(route.path)) continue;
    result.push({
      path,
      label: route.label,
      icon: route.icon || (action ? 'plus-circle' : 'folder-kanban'),
      group: action ? 'action' : 'resource',
      permissionKeys: route.requiredPermissions || [],
    });
    seen.add(path);
  }
  return result;
}

export function getModuleName(cell: NavCell): string {
  return cell.navigation?.label || cell.name;
}
