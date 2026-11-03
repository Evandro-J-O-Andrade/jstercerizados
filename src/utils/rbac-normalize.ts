export function normalizeRoleScope(
  roleOrScope:
    | {
        scope?: 'global' | 'tenant' | null;
        is_global?: boolean | null | string;
      }
    | boolean
    | string
    | null
    | undefined,
): 'global' | 'tenant' {
  if (typeof roleOrScope === 'boolean') {
    return roleOrScope ? 'global' : 'tenant';
  }
  if (roleOrScope && typeof roleOrScope === 'object') {
    if (roleOrScope.scope === 'global') return 'global';
    if (roleOrScope.scope === 'tenant') return 'tenant';
    if (typeof roleOrScope.is_global === 'boolean') {
      return roleOrScope.is_global ? 'global' : 'tenant';
    }
  }
  if (typeof roleOrScope === 'string') {
    if (roleOrScope === 'global') return 'global';
    if (roleOrScope === 'tenant') return 'tenant';
  }
  return 'tenant';
}

export function isGlobalScope(
  roleOrScope:
    | {
        scope?: 'global' | 'tenant' | null;
        is_global?: boolean | null | string;
      }
    | boolean
    | string
    | null
    | undefined,
): boolean {
  return normalizeRoleScope(roleOrScope) === 'global';
}

export function isTenantScope(
  roleOrScope:
    | {
        scope?: 'global' | 'tenant' | null;
        is_global?: boolean | null | string;
      }
    | boolean
    | string
    | null
    | undefined,
): boolean {
  return normalizeRoleScope(roleOrScope) === 'tenant';
}

import type { Permission } from '@/types/auth';

export function normalizePermissionName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function normalizeResourceAction(
  resource: string | null | undefined,
  action: string | null | undefined,
): string | null {
  if (!resource || typeof resource !== 'string') return null;
  if (!action || typeof action !== 'string') return null;
  const trimmedResource = resource.trim();
  const trimmedAction = action.trim();
  if (!trimmedResource || !trimmedAction) return null;
  return `${trimmedResource}.${trimmedAction}`;
}

type RawPermission = Record<string, unknown>;

function extractResourceAction(
  permission: Permission,
): { resource: string; action: string } | null {
  const raw = permission as unknown as RawPermission;
  const name = raw.name ?? raw.resource;
  if (typeof name === 'string') {
    const dotIndex = name.indexOf('.');
    if (dotIndex > 0) {
      return {
        resource: name.substring(0, dotIndex),
        action: name.substring(dotIndex + 1),
      };
    }
  }
  const resource = raw.resource ?? raw.name;
  const action = raw.action ?? raw.name;
  if (typeof resource !== 'string' || typeof action !== 'string') return null;
  return { resource, action };
}

export function getPermissionKey(permission: Permission): string {
  const extracted = extractResourceAction(permission);
  if (!extracted) return '';
  return normalizeResourceAction(extracted.resource, extracted.action) ?? '';
}

export function normalizePermission(
  raw: Record<string, unknown>,
): Permission | null {
  const id = raw.id as string | null;
  if (!id) return null;

  const extracted = extractResourceAction(raw as unknown as Permission);
  if (!extracted) return null;

  const resource = extracted.resource.trim();
  const action = extracted.action.trim();
  const description = raw.description as string | null;
  const created_at =
    (raw.created_at as string | null) || new Date().toISOString();

  return {
    id,
    name: `${resource}.${action}`,
    module: typeof raw.module === 'string' ? raw.module : resource,
    resource,
    action,
    description,
    created_at,
  } as unknown as Permission;
}
