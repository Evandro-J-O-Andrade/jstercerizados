import { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getAvailableModules,
  getAvailableFeatures,
  groupModulesByCategory,
  CATEGORY_META,
  type ModuleDefinition,
  type ModuleFeature,
  type ModuleCategory,
} from '@/components/portal/ModuleRegistry';
import { normalizeRoleScope } from '@/utils/rbac-normalize';
import type { Permission } from '@/types/auth';

export interface AccountIdentity {
  firstName: string;
  displayName: string;
  email: string;
  personId: string;
  roleName: string;
  roleScope: 'platform' | 'tenant';
  tenantName: string;
  contextLabel: string;
  greeting: string;
  isAdminMaster: boolean;
}

export interface AccountContextType {
  identity: AccountIdentity;
  activeRole: { id: string; name: string; scope: 'global' | 'tenant' } | null;
  activePermissions: Permission[];
  availableModules: ModuleDefinition[];
  availableFeatures: ModuleFeature[];
  modulesByCategory: Record<ModuleCategory, ModuleDefinition[]>;
  categoryMeta: typeof CATEGORY_META;
  activeTenantId: string | null;
  effectiveScopes: ('platform' | 'tenant')[];
  availableMemberships: {
    id: string;
    tenant_id: string;
    role_id: string;
    status: string;
  }[];
  switchAccount: (tenantId: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const {
    person,
    roles,
    currentTenantId,
    tenantMemberships,
    tenants,
    permissions,
    isAdminMaster,
    switchTenant,
  } = useAuth();

  const identity = useMemo<AccountIdentity>(() => {
    const fullName = person?.full_name?.trim() || 'Usuário';
    const firstName = fullName.split(/\s+/)[0] || 'Usuário';
    const email = person?.email || '';
    const personId = person?.id || '';
    const primaryRole = roles[0];
    const roleName = primaryRole
      ? primaryRole.name
          .split('_')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')
      : 'Usuário';
    const roleScope = primaryRole?.scope
      ? normalizeRoleScope(primaryRole.scope)
      : 'tenant';

    const activeTenant = tenants.find((t) => t.id === currentTenantId);
    const tenantName =
      activeTenant?.name || (currentTenantId ? 'Tenant' : 'Plataforma');

    const contextLabel =
      roleScope === 'platform' ? 'Gestão da Plataforma' : tenantName;

    const hour = new Date().getHours();
    let greeting = 'Boa noite';
    if (hour >= 5 && hour < 12) greeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';

    return {
      personId,
      firstName,
      displayName: fullName,
      email,
      roleName,
      roleScope,
      tenantName,
      contextLabel,
      greeting,
      isAdminMaster,
    };
  }, [person, roles, currentTenantId, tenants, isAdminMaster]);

  const effectiveScopes = useMemo<('platform' | 'tenant')[]>(() => {
    const roleScopes = new Set(roles.map((r) => r.scope));
    const scopes: ('platform' | 'tenant')[] = [];

    if (roleScopes.has('global')) {
      scopes.push('platform');
      const hasAdminMaster = roles.some(
        (r) => r.scope === 'global' && r.name === 'admin_master',
      );
      if (hasAdminMaster) {
        scopes.push('tenant');
      }
    }

    if (roleScopes.has('tenant')) scopes.push('tenant');
    return scopes;
  }, [roles]);

  const availableModules = useMemo<ModuleDefinition[]>(() => {
    return getAvailableModules(permissions, effectiveScopes);
  }, [permissions, effectiveScopes]);

  const availableFeatures = useMemo<ModuleFeature[]>(() => {
    return availableModules.flatMap((module) =>
      getAvailableFeatures(permissions, module, effectiveScopes),
    );
  }, [availableModules, permissions, effectiveScopes]);

  const modulesByCategory = useMemo(() => {
    return groupModulesByCategory(availableModules);
  }, [availableModules]);

  const handleSwitchAccount = useCallback(
    async (tenantId: string) => {
      await switchTenant(tenantId);
    },
    [switchTenant],
  );

  const activeRole = useMemo(() => {
    if (!roles.length) return null;
    const primaryRole = roles[0];
    return {
      id: primaryRole.id,
      name: primaryRole.name,
      scope: primaryRole.scope,
    };
  }, [roles]);

  const value = useMemo<AccountContextType>(
    () => ({
      identity,
      activeRole,
      activePermissions: permissions,
      availableModules,
      availableFeatures,
      modulesByCategory,
      categoryMeta: CATEGORY_META,
      activeTenantId: currentTenantId,
      effectiveScopes,
      availableMemberships: tenantMemberships.map((m) => ({
        id: m.id,
        tenant_id: m.tenant_id,
        role_id: m.role_id,
        status: m.status,
      })),
      switchAccount: handleSwitchAccount,
    }),
    [
      identity,
      activeRole,
      permissions,
      availableModules,
      availableFeatures,
      modulesByCategory,
      currentTenantId,
      effectiveScopes,
      tenantMemberships,
      handleSwitchAccount,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountContextType {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return ctx;
}
