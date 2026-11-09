import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount } from '@/contexts/AccountContext';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import { getPermissionKey } from '@/utils/rbac-normalize';
import {
  getCellNavigation,
  getCellSidebarEntries,
  resolveNavigationCell,
  type NavCell,
  type NavEntry,
} from './cell-navigation-model';

export interface CellNavigationSnapshot {
  cells: NavCell[];
  activeCell: NavCell | null;
  entries: NavEntry[];
  isMaster: boolean;
  masterHome: string;
}

export function useCellNavigation(): CellNavigationSnapshot {
  const { activePermissions, identity, effectiveScopes, activeTenantId } = useAccount();
  const { pathname } = useLocation();
  return useMemo(() => {
    const grants = new Set(activePermissions.map(getPermissionKey).filter(Boolean));
    const cells = getCellNavigation(
      cellRegistry.getEnabled().map((entry) => entry.cell),
      effectiveScopes,
      grants,
      identity.isAdminMaster,
      Boolean(activeTenantId),
    );
    const activeCell = resolveNavigationCell(pathname, cells);
    return {
      cells,
      activeCell,
      entries: activeCell ? getCellSidebarEntries(activeCell, grants) : [],
      isMaster: identity.isAdminMaster,
      masterHome: identity.isAdminMaster ? '/dashboard/admin-master' : '/dashboard/modulos',
    };
  }, [activePermissions, identity.isAdminMaster, effectiveScopes, activeTenantId, pathname]);
}
