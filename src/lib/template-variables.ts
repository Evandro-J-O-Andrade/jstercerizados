import type { UserIdentity } from '@/contexts/UserIdentity';
import type { Permission } from '@/types/auth';

interface TemplateContext {
  username?: string;
  roles?: string;
  permissions?: string;
  'data/hora'?: string;
  contexto?: string;
  email?: string;
  firstName?: string;
  displayName?: string;
  roleLabel?: string;
  tenantLabel?: string;
  contextLabel?: string;
  dateTime?: string;
  [key: string]: string | undefined;
}

export function buildTemplateContext(
  userIdentity: UserIdentity | null,
  permissions: Permission[],
): TemplateContext {
  if (!userIdentity) {
    return {};
  }

  const now = new Date();
  const dateTime = now.toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const roleNames = userIdentity.role ? [userIdentity.role] : [];
  const rolesStr =
    roleNames
      .map((r: { name: string; scope: string }) => `${r.name} (${r.scope})`)
      .join(', ') || '';

  const permissionsStr =
    permissions.map((p) => `${p.resource}.${p.action}`).join(', ') || '';

  return {
    username: userIdentity.displayName || '',
    roles: rolesStr,
    permissions: permissionsStr,
    'data/hora': dateTime,
    contexto: userIdentity.contextLabel || '',
    email: userIdentity.email || '',
    firstName: userIdentity.firstName || '',
    displayName: userIdentity.displayName || '',
    roleLabel: userIdentity.roleLabel || '',
    tenantLabel: userIdentity.tenantLabel || '',
    contextLabel: userIdentity.contextLabel || '',
    dateTime,
  };
}

export function interpolateTemplate(
  template: string,
  context: TemplateContext,
): string {
  return template.replace(/%(\w+(?:\/\w+)?%)/g, (match, key) => {
    const value = context[key.toLowerCase()];
    return value !== undefined ? value : match;
  });
}

export function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/%(\w+(?:\/\w+)?%)/g);
  return matches
    ? [...new Set(matches.map((m) => m.slice(1, -1).toLowerCase()))]
    : [];
}

export function validateTemplate(
  template: string,
  context: TemplateContext,
): {
  valid: boolean;
  missing: string[];
  extra: string[];
} {
  const used = extractTemplateVariables(template);
  const available = Object.keys(context).map((k) => k.toLowerCase());
  const missing = used.filter((v) => !available.includes(v));
  const extra = available.filter((v) => !used.includes(v));
  return {
    valid: missing.length === 0,
    missing,
    extra,
  };
}
