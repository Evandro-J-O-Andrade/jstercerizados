export function normalizeRoleScope(isGlobal: boolean): 'global' | 'tenant' {
  return isGlobal ? 'global' : 'tenant';
}

export function isGlobalScope(isGlobal: boolean): boolean {
  return isGlobal;
}

export function isTenantScope(isGlobal: boolean): boolean {
  return !isGlobal;
}

import type { Permission } from '@/types/auth';

export function normalizePermissionName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function getPermissionKey(permission: Permission): string {
  return normalizePermissionName(permission.name) ?? '';
}

export function normalizePermission(
  raw: Record<string, unknown>,
): Permission | null {
  const id = raw.id as string | null;
  if (!id) return null;

  // O schema canônico do Supabase usa `permissions.code`; versões antigas
  // usavam `permissions.name`. Preserve compatibilidade sem inventar grants.
  const nameFromRaw =
    normalizePermissionName(raw.name) ??
    normalizePermissionName(raw.code) ??
    (() => {
      const resource = normalizePermissionName(raw.resource);
      const action = normalizePermissionName(raw.action);
      return resource && action ? `${resource}.${action}` : null;
    })();
  const name = nameFromRaw ?? '';

  if (!name) return null;

  const module = (raw.module as string | null)?.trim() || '';
  const description = raw.description as string | null;
  const created_at =
    (raw.created_at as string | null) || new Date().toISOString();

  return {
    id,
    name,
    module,
    description,
    created_at,
  };
}
