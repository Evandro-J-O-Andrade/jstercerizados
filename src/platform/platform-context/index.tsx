import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useLocation } from 'react-router-dom';
import { resolveModuleFromPathname } from '@/core/cells/cell-to-module-definition';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import type { PlatformUserContext } from '@/core/platform-context';

const PlatformContext = createContext<PlatformUserContext | undefined>(undefined);

export function PlatformContextProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const account = useAccount();
  const location = useLocation();

  const resolved = useMemo(() => resolveModuleFromPathname(location.pathname), [location.pathname]);
  const availableCells = useMemo(() => {
    const scopes = (account.effectiveScopes && account.effectiveScopes.length > 0) ? account.effectiveScopes : (account.identity.roleScope === 'global' ? ['global'] : ['tenant']);
    const cells = cellRegistry.getEnabled();
    return cells
      .filter((entry: any) => {
        const cell = entry.cell;
        if (!cell?.enabled) return false;
        if (cell.scope && !scopes.includes(cell.scope)) {
          // allow global cells for global scope users, tenant for tenant
          if (!(cell.scope === 'tenant' && scopes.includes('tenant'))) return false;
        }
        const required = cell.permissions || [];
        if (required.length === 0) return true;
        // authorization is enforced by guards/routes; we don't grant here
        // but we can still list cells the context is allowed to see by scope
        return true;
      })
      .map((entry: any) => entry.cell.id);
  }, [account.effectiveScopes, account.identity.roleScope]);

  const ctx: PlatformUserContext = useMemo(() => {
    const personId = account.identity.personId || auth.person?.id || '';
    const userId = auth.user?.id || account.identity.email || '';
    const fullName = account.identity.displayName || account.identity.firstName || auth.person?.full_name || '';
    const email = account.identity.email || auth.user?.email || '';
    const fullRole = account.identity.roleLabel || account.identity.roleName || '';
    const roleId = account.activeRole?.id || '';
    const roleScope = account.identity.roleScope || (auth.isAdminMaster ? 'global' : 'tenant');
    const tenantId = account.activeTenantId || auth.currentTenantId || null;
    const tenantName = account.identity.tenantName || account.identity.tenantLabel || null;
    const membershipId = (auth.tenantMemberships || []).find((m: any) => m.tenant_id === tenantId)?.id || null;

    const permissions = ((account.permissions as any[]) || (auth.permissions as any[]) || []).map((p: any) => {
      if (typeof p === 'string') return p;
      return p.name || p.permission_name || '';
    }).filter(Boolean);

    const authenticated = !!(auth.isAuthenticated && auth.user);
    const identityResolved = authenticated && !!personId;
    const tenantSelected = roleScope === 'global' ? true : !!tenantId;

    return {
      identity: { userId, personId, fullName, email, avatarUrl: null },
      role: { roleId, fullRole, roleScope: roleScope === 'global' ? 'global' : 'tenant' },
      tenant: { tenantId, tenantName, membershipId },
      effectiveScopes: account.effectiveScopes || (roleScope === 'global' ? ['global'] : ['tenant']),
      permissions,
      availableCells,
      activeCell: resolved.module?.id || null,
      activeModule: resolved.module?.id || null,
      context: { authenticated, tenantSelected, identityResolved },
    };
  }, [auth, account, resolved, availableCells]);

  return <PlatformContext.Provider value={ctx}>{children}</PlatformContext.Provider>;
}

export function usePlatformContext(): PlatformUserContext {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatformContext must be used within PlatformContextProvider');
  return ctx;
}

export * from '@/core/platform-context';

