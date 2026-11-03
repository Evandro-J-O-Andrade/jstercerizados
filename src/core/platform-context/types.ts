/**
 * PlatformUserContext — Contrato único de identidade/contexto para o CHECK BOULER 24H
 */
export interface PlatformUserContextIdentity {
  userId: string;
  personId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface PlatformUserContextRole {
  roleId: string;
  fullRole: string;
  roleScope: 'global' | 'tenant';
}

export interface PlatformUserContextTenant {
  tenantId: string | null;
  tenantName: string | null;
  membershipId: string | null;
}

export interface PlatformUserContextFlags {
  authenticated: boolean;
  tenantSelected: boolean;
  identityResolved: boolean;
}

export interface PlatformUserContext {
  identity: PlatformUserContextIdentity;
  role: PlatformUserContextRole;
  tenant: PlatformUserContextTenant;
  effectiveScopes: string[];
  permissions: string[];
  availableCells: string[];
  activeCell: string | null;
  activeModule: string | null;
  context: PlatformUserContextFlags;
}

export type PlatformUserContextVars = {
  fullnameuser: string;
  emailuser: string;
  fullrole: string;
  roleid: string;
  rolescope: 'global' | 'tenant';
  tenantid: string | null;
  tenantname: string | null;
  personid: string;
  permissions: string[];
  activecell: string | null;
  activecontext: PlatformUserContextFlags;
};

export function resolvePlatformContextVars(
  ctx: PlatformUserContext,
): PlatformUserContextVars {
  return {
    fullnameuser: ctx.identity.fullName,
    emailuser: ctx.identity.email,
    fullrole: ctx.role.fullRole,
    roleid: ctx.role.roleId,
    rolescope: ctx.role.roleScope,
    tenantid: ctx.tenant.tenantId,
    tenantname: ctx.tenant.tenantName,
    personid: ctx.identity.personId,
    permissions: ctx.permissions,
    activecell: ctx.activeCell,
    activecontext: ctx.context,
  };
}

