import type {
  Person,
  Role,
  TenantMembership,
  Permission,
  RoleAssignment,
  FirstLoginState,
  LegalAcceptance,
} from '@/types/auth';
import { normalizeRoleScope } from '@/utils/rbac-normalize';

export interface UserIdentity {
  id: string;
  authUserId: string;
  email: string;
  username?: string;
  firstName: string;
  displayName: string;
  avatarUrl?: string;
  role: { id: string; name: string; scope: 'global' | 'tenant' } | null;
  roleLabel: string;
  tenant: { id: string; name: string } | null;
  tenantLabel: string;
  memberships: TenantMembership[];
  permissions: Permission[];
  effectiveScopes: ('global' | 'tenant')[];
  isAdminMaster: boolean;
  isCandidate: boolean;
  isEmpresa: boolean;
  firstLoginState: Pick<
    FirstLoginState,
    'must_change_password' | 'welcome_completed_at' | 'terms_version'
  > | null;
  legalAcceptances: Pick<
    LegalAcceptance,
    'document_type' | 'document_version' | 'accepted_at'
  >[];
  contextLabel: string;
  greeting: string;
  dateTime: string;
}

const ROLE_LABEL_MAP: Record<string, string> = {
  admin_master: 'Administrador Master',
  platform_admin: 'Administrador da Plataforma',
  support_engineer: 'Engenheiro de Suporte',
  tenant_admin: 'Administrador do Tenant',
  rh_manager: 'Gestor de RH',
  recruiter: 'Recrutador',
  finance_manager: 'Gestor Financeiro',
  finance: 'Financeiro',
  support_agent: 'Agente de Suporte',
  commercial: 'Comercial',
  candidato: 'Candidato',
  stock_manager: 'Gestor de Estoque',
  security_manager: 'Gestor de Segurança',
  facilities_manager: 'Gestor de Instalações',
  lawyer: 'Jurídico',
  it_operator: 'Operador de TI',
  operations_operator: 'Operador de Operações',
  viewer: 'Visualizador',
  admin: 'Administrador',
  administrador: 'Administrador',
  gestor: 'Gestor',
  manager: 'Gestor',
  recrutador: 'Recrutador',
  candidate: 'Candidato',
  financial: 'Financeiro',
  cliente: 'Cliente',
  empresa: 'Empresa',
  fornecedor: 'Fornecedor',
  prestador: 'Prestador de Serviços',
  rh: 'Recursos Humanos',
  analista_rh: 'Analista de RH',
  supervisor: 'Supervisor',
  operador: 'Operador',
  atendente: 'Atendente',
};

export function formatRoleLabel(technicalName: string): string {
  const normalized = technicalName.toLowerCase().trim();
  if (ROLE_LABEL_MAP[normalized]) {
    return ROLE_LABEL_MAP[normalized];
  }
  return technicalName
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function computeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function computeDateTime(): string {
  return new Date().toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

function computeContextLabel(
  roleScope: 'global' | 'tenant',
  tenantName: string,
): string {
  return roleScope === 'global' ? 'Gestão da Plataforma' : tenantName;
}

function resolveActiveRole(
  roleAssignments: RoleAssignment[],
  roleById: Map<string, Role>,
  currentTenantId: string | null,
): Role | null {
  if (!roleAssignments.length) {
    return null;
  }

  const activeAssignments = roleAssignments.filter((ra) => {
    if (ra.expires_at && new Date(ra.expires_at) < new Date()) {
      return false;
    }
    return true;
  });

  if (currentTenantId) {
    const tenantRoles = activeAssignments.filter(
      (ra) => ra.tenant_id === currentTenantId,
    );
    if (tenantRoles.length > 1) {
      const globalRole = tenantRoles.find(
        (ra) => roleById.get(ra.role_id)?.scope === 'global',
      );
      if (globalRole) return roleById.get(globalRole.role_id) ?? null;
    }
    if (tenantRoles.length > 0) {
      return roleById.get(tenantRoles[0].role_id) ?? null;
    }
  }

  const globalRole = activeAssignments.find(
    (ra) => ra.tenant_id === null || ra.tenant_id === undefined,
  );
  if (globalRole) {
    return roleById.get(globalRole.role_id) ?? null;
  }

  if (activeAssignments.length > 0) {
    return roleById.get(activeAssignments[0].role_id) ?? null;
  }

  const adminMasterRole = Array.from(roleById.values()).find(
    (r) => r.name === 'admin_master' && r.scope === 'global',
  );
  if (adminMasterRole) {
    return adminMasterRole;
  }

  return null;
}

export function deriveUserIdentity(
  person: Person | null,
  roles: Role[],
  currentTenantId: string | null,
  tenants: { id: string; name: string }[],
  memberships: TenantMembership[],
  roleAssignments: RoleAssignment[],
  permissions: Permission[],
  isAdminMaster: boolean,
  isCandidate: boolean,
  isEmpresa: boolean,
  firstLoginState: Pick<
    FirstLoginState,
    'must_change_password' | 'welcome_completed_at' | 'terms_version'
  > | null,
  legalAcceptances: Pick<
    LegalAcceptance,
    'document_type' | 'document_version' | 'accepted_at'
  >[],
): UserIdentity {
  const fullName = person?.full_name?.trim() || 'Usuário';
  const firstName = fullName.split(/\s+/)[0] || 'Usuário';
  const email = person?.email || '';
  const personId = person?.id || '';
  const authUserId = person?.auth_user_id || '';

  const roleById = new Map<string, Role>((roles || []).map((r) => [r.id, r]));

  const resolvedRole = resolveActiveRole(
    roleAssignments,
    roleById,
    currentTenantId,
  );

  const role = resolvedRole
    ? {
        id: resolvedRole.id,
        name: resolvedRole.name,
        scope: normalizeRoleScope(resolvedRole.scope) as 'global' | 'tenant',
      }
    : null;

  const activeTenant = tenants.find((t) => t.id === currentTenantId);
  const tenant = activeTenant
    ? { id: activeTenant.id, name: activeTenant.name }
    : null;

  const roleScope = role?.scope || 'tenant';
  const tenantName =
    tenant?.name || (currentTenantId ? 'Tenant' : 'Plataforma');
  const contextLabel = computeContextLabel(roleScope, tenantName);
  const greeting = computeGreeting();
  const dateTime = computeDateTime();

  const roleLabel = role ? formatRoleLabel(role.name) : 'Usuário';
  const tenantLabel = tenant?.name || 'Plataforma';

  const roleScopes = new Set(roles.map((r) => r.scope));
  const hasTenantMembership = memberships.some((m) => m.status === 'active');
  const scopes: ('global' | 'tenant')[] = [];
  if (roleScopes.has('global')) {
    scopes.push('global');
    const hasAdminMaster = roles.some(
      (r) => r.scope === 'global' && r.name === 'admin_master',
    );
    if (hasAdminMaster) {
      scopes.push('tenant');
    }
  }
  if (roleScopes.has('tenant') || hasTenantMembership) scopes.push('tenant');

  return {
    id: personId,
    authUserId,
    email,
    username: undefined,
    firstName,
    displayName: fullName,
    avatarUrl: undefined,
    role,
    roleLabel,
    tenant,
    tenantLabel,
    memberships,
    permissions,
    effectiveScopes: scopes,
    isAdminMaster,
    isCandidate,
    isEmpresa,
    firstLoginState: firstLoginState
      ? {
          must_change_password: firstLoginState.must_change_password,
          welcome_completed_at: firstLoginState.welcome_completed_at ?? null,
          terms_version: firstLoginState.terms_version ?? null,
        }
      : null,
    legalAcceptances: legalAcceptances.map((la) => ({
      document_type: la.document_type,
      document_version: la.document_version,
      accepted_at: la.accepted_at,
    })),
    contextLabel,
    greeting,
    dateTime,
  };
}

export function formatRoleName(name: string): string {
  return name
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
