/**
 * MediaAuthorizationContract — Contrato de autorização
 *
 * A Célula Media não cria permissões próprias fora do RBAC oficial.
 * A autorização considera identidade, vínculo com tenant, papéis,
 * escopo da entidade, classificação do arquivo, operação e políticas RLS.
 */

export type MediaResource =
  | 'companies.media'
  | 'services.media'
  | 'partners.media'
  | 'suppliers.media'
  | 'people.media'
  | 'jobs.media';

export type MediaAction = 'read' | 'write' | 'delete';

export interface MediaAuthorizationRequest {
  userId: string;
  personId: string;
  tenantId: string;
  resource: MediaResource;
  action: MediaAction;
  entityType: string;
  entityId: string;
  purpose?: string;
  visibility?: 'public' | 'private' | 'internal';
}

export interface MediaAuthorizationResult {
  allowed: boolean;
  reason?: string;
  permissionRequired?: string;
  grantedBy?: 'rbac' | 'rls' | 'owner' | 'admin_master';
}

export const MEDIA_RESOURCE_ACTION_MAP: Record<MediaResource, MediaAction[]> = {
  'companies.media': ['read', 'write', 'delete'],
  'services.media': ['read', 'write', 'delete'],
  'partners.media': ['read', 'write', 'delete'],
  'suppliers.media': ['read', 'write', 'delete'],
  'people.media': ['read', 'write', 'delete'],
  'jobs.media': ['read', 'write', 'delete'],
};

export function getPermissionCode(resource: MediaResource, action: MediaAction): string {
  return `${resource}.${action}`;
}

export function validateMediaAuthorization(
  input: MediaAuthorizationRequest,
  userPermissions: string[],
  isAdminMaster: boolean,
  isTenantAdmin: boolean,
  isOwner: boolean,
): MediaAuthorizationResult {
  const permissionCode = getPermissionCode(input.resource, input.action);

  if (isAdminMaster) {
    return { allowed: true, grantedBy: 'admin_master', permissionRequired: permissionCode };
  }

  if (isTenantAdmin) {
    return { allowed: true, grantedBy: 'admin_master', permissionRequired: permissionCode };
  }

  if (userPermissions.includes(permissionCode)) {
    return { allowed: true, grantedBy: 'rbac', permissionRequired: permissionCode };
  }

  if (isOwner && input.action === 'read') {
    return { allowed: true, grantedBy: 'owner', permissionRequired: permissionCode };
  }

  return {
    allowed: false,
    reason: `Permissão ${permissionCode} não concedida`,
    permissionRequired: permissionCode,
  };
}