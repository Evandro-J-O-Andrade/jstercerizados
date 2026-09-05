export type FooterScope =
  | 'global_public'
  | 'candidate'
  | 'company'
  | 'provider'
  | 'manager'
  | 'admin_master';

export interface FooterLink {
  label: string;
  href: string;
  target_blank?: boolean;
}

export interface FooterGroup {
  group: string;
  links: FooterLink[];
}

export interface FooterConfig {
  scope: FooterScope;
  links: FooterGroup[];
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export function normalizeRoleName(
  roleName: string | null | undefined,
): FooterScope {
  if (!roleName) return 'global_public';
  const r = roleName.toLowerCase();
  if (
    r === 'admin_master' ||
    r === 'platform_admin' ||
    r === 'support_engineer'
  )
    return 'admin_master';
  if (r === 'candidato') return 'candidate';
  if (
    r === 'tenant_admin' ||
    r === 'rh_manager' ||
    r === 'recruiter' ||
    r === 'finance_manager' ||
    r === 'fiscal' ||
    r === 'finance' ||
    r === 'it_admin' ||
    r === 'support' ||
    r === 'viewer' ||
    r === 'lawyer'
  )
    return 'manager';
  if (
    r === 'commercial' ||
    r === 'stock_manager' ||
    r === 'security_manager' ||
    r === 'facilities_manager'
  )
    return 'provider';
  if (r === 'operations_manager' || r === 'operator') return 'company';
  return 'manager';
}

export function pickFooterScope(
  isAuthenticated: boolean,
  roleName: string | null | undefined,
): FooterScope {
  if (!isAuthenticated) return 'global_public';
  return normalizeRoleName(roleName);
}

export function filterActiveLinks(groups: FooterGroup[]): FooterGroup[] {
  return groups
    .map((g) => ({
      group: g.group,
      links: g.links.filter((l) => l.label && l.href),
    }))
    .filter((g) => g.links.length > 0);
}
