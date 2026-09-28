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
import { deriveUserIdentity, type UserIdentity } from './UserIdentity';
import type { Permission } from '@/types/auth';

export interface AccountIdentity {
  firstName: string;
  displayName: string;
  email: string;
  personId: string;
  roleName: string;
  roleLabel: string;
  roleScope: 'global' | 'tenant';
  tenantName: string;
  tenantLabel: string;
  contextLabel: string;
  greeting: string;
  dateTime: string;
  isAdminMaster: boolean;
}

export interface AccountContextType {
  identity: AccountIdentity;
  userIdentity: UserIdentity;
  activeRole: { id: string; name: string; scope: 'global' | 'tenant' } | null;
  activePermissions: Permission[];
  availableModules: ModuleDefinition[];
  availableFeatures: ModuleFeature[];
  modulesByCategory: Record<ModuleCategory, ModuleDefinition[]>;
  categoryMeta: typeof CATEGORY_META;
  activeTenantId: string | null;
  effectiveScopes: ('global' | 'tenant')[];
  permissions: Permission[];
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
    isCandidate,
    isEmpresa,
    firstLoginState,
    legalAcceptances,
    switchTenant,
  } = useAuth();

  const identity = useMemo<UserIdentity>(() => {
    return deriveUserIdentity(
      person,
      roles,
      currentTenantId,
      tenants,
      tenantMemberships,
      permissions,
      isAdminMaster,
      isCandidate,
      isEmpresa,
      firstLoginState,
      legalAcceptances,
    );
  }, [
    person,
    roles,
    currentTenantId,
    tenants,
    tenantMemberships,
    permissions,
    isAdminMaster,
    isCandidate,
    isEmpresa,
    firstLoginState,
    legalAcceptances,
  ]);

  const effectiveScopes = useMemo<('global' | 'tenant')[]>(() => {
    return identity.effectiveScopes;
  }, [identity.effectiveScopes]);

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
      identity: {
        firstName: identity.firstName,
        displayName: identity.displayName,
        email: identity.email,
        personId: identity.id,
        roleName: identity.role?.name || 'Usuário',
        roleLabel: identity.roleLabel,
        roleScope: identity.role?.scope || 'tenant',
        tenantName: identity.tenant?.name || 'Plataforma',
        tenantLabel: identity.tenantLabel,
        contextLabel: identity.contextLabel,
        greeting: identity.greeting,
        dateTime: identity.dateTime,
        isAdminMaster: identity.isAdminMaster,
      },
      userIdentity: identity,
      activeRole,
      activePermissions: permissions,
      availableModules,
      availableFeatures,
      modulesByCategory,
      categoryMeta: CATEGORY_META,
      activeTenantId: currentTenantId,
      effectiveScopes,
      permissions,
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
