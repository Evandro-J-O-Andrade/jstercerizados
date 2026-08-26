export function normalizeRoleScope(scope: string): 'platform' | 'tenant' {
  if (scope === 'global') return 'platform';
  if (scope === 'tenant') return 'tenant';
  return 'tenant';
}

export function isGlobalScope(scope: string): boolean {
  return scope === 'global';
}

export function isTenantScope(scope: string): boolean {
  return scope === 'tenant';
}

import type { Permission } from '@/types/auth';

export function normalizePermissionName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function parsePermissionName(
  name: string,
): { resource: string; action: string } | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const separatorIndex = trimmed.lastIndexOf('.');
  if (separatorIndex < 0) return null;

  const resource = trimmed.slice(0, separatorIndex);
  const action = trimmed.slice(separatorIndex + 1);

  if (!resource || !action) return null;

  return { resource, action };
}

export function getPermissionKey(permission: Permission): string {
  const name = normalizePermissionName(permission.name);
  if (name) return name;

  const parsed = parsePermissionName(permission.name);
  if (parsed) return `${parsed.resource}.${parsed.action}`;

  return '';
}

export function normalizePermission(
  raw: Record<string, unknown>,
): Permission | null {
  const id = raw.id as string | null;
  if (!id) return null;

  const rawResource = (raw.resource as string | null) || '';
  const rawAction = (raw.action as string | null) || '';
  const resource = rawResource.trim();
  const action = rawAction.trim();

  const nameFromRaw = normalizePermissionName(raw.name);
  const name =
    nameFromRaw || (resource && action ? `${resource}.${action}` : '');

  if (!name) return null;

  const module = (raw.module as string | null)?.trim() || '';
  const description = raw.description as string | null;
  const created_at =
    (raw.created_at as string | null) || new Date().toISOString();

  return {
    id,
    name,
    module,
    resource,
    action,
    description,
    created_at,
  };
}

export function normalizePermissions(
  raw: Record<string, unknown>[],
): Permission[] {
  const seen = new Set<string>();
  const result: Permission[] = [];

  for (const item of raw) {
    const permission = normalizePermission(item);
    if (!permission) continue;

    const key = getPermissionKey(permission);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(permission);
  }

  return result;
}
