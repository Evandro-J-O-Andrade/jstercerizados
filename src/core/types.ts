/**
 * Core types — shared contracts for the J&S nucleus.
 * These types are the canonical interface between cells and the core.
 */

/** UUID string used for identity references */
export type UUID = string;

/** A permission is a resource.action pair */
export interface Permission {
  id: UUID;
  name: string;
  module: string;
  description?: string | null;
  created_at: string;
}

/** A role in the system */
export interface Role {
  id: UUID;
  name: string;
  slug: string;
  scope: 'global' | 'tenant';
  is_global: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

/** A role-to-permission assignment.
 * In the real schema (public.role_permissions), there is NO `granted` column.
 * The mere existence of a row IS the grant.
 * `granted` is kept optional for backward compatibility with test fixtures. */
export interface RolePermission {
  role_id: UUID;
  permission_id: string;
  granted?: boolean; // optional — not present in the real DB schema
}

/** A tenant membership linking a person to an organization */
export interface TenantMembership {
  id: UUID;
  tenant_id: UUID;
  person_id: UUID;
  membership_role: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

/** A person in the domain model */
export interface Person {
  id: UUID;
  auth_user_id: UUID;
  full_name: string;
  email: string;
  created_at: string;
}

/** Authenticated user from Supabase Auth */
export interface AuthUser {
  id: UUID;
  email: string;
}

/** Route entry for a cell */
export interface CellRoute {
  path: string;
  label: string;
  requiredPermissions?: string[];
  icon?: string;
  children?: CellRoute[];
  implementationStatus?: 'implemented' | 'coming_soon' | 'beta' | 'disabled' | 'deprecated';
}

/** Dependência de célula no contrato universal */
export interface CellDependency {
  cellId: string;
  required?: boolean;
  version?: string;
}

/** Declaração de layout da célula na experiência */
export interface CellLayoutContract {
  component?: string;
  skipLayout?: boolean;
  shared?: boolean;
}

/** Declaração de navegação da célula na experiência */
export interface CellNavigationContract {
  sidebar?: boolean;
  header?: boolean;
  footer?: boolean;
  label?: string;
  icon?: string;
}

/** Ciclo de vida da célula */
export interface CellLifecycle {
  status?: 'active' | 'inactive' | 'maintenance' | 'deprecated';
  health?: 'healthy' | 'degraded' | 'unavailable' | 'unknown';
  lastCheckedAt?: string;
}

/** Identidade da célula */
export interface CellIdentity {
  id: string;
  name: string;
  version?: string;
  description?: string;
  category?: string;
  domain?: string;
  scope?: 'tenant' | 'global';
}

/** Experiência da célula (rotas, layout, navegação) */
export interface CellExperience {
  homeRoute?: string;
  routes: CellRoute[];
  layout?: CellLayoutContract;
  navigation?: CellNavigationContract;
}

/** Capacidades da célula (permissões, operações, métricas, health checks) */
export interface CellCapabilities {
  permissions: string[];
  operations?: string[];
  metrics?: string[];
  healthChecks?: string[];
}

/** Administração da célula (configuração por tenant, exposição de recursos) */
export interface CellAdministration {
  tenantConfigurable?: boolean;
  exposesUserManagement?: boolean;
  exposesReports?: boolean;
  exposesAudit?: boolean;
}

/**
 * SaaSCellContract — contrato universal obrigatório para toda célula.
 * Define identidade, ciclo de vida, experiência, capacidades, dependências
 * e administração de forma padronizada, permitindo que o Admin Tenant
 * descubra e componha células sem conhecer suas implementações internas.
 *
 * Campos marcados como opcionais permitem migração gradual das 19 células
 * existentes. Novas células devem declarar todos os campos relevantes.
 */
export interface SaaSCellContract {
  id: string;
  name: string;
  version?: string;
  description?: string;
  category?: string;
  domain?: string;
  scope?: 'tenant' | 'global';
  lifecycle?: CellLifecycle;
  homeRoute?: string;
  routes: CellRoute[];
  layout?: CellLayoutContract;
  navigation?: CellNavigationContract;
  permissions: string[];
  operations?: string[];
  metrics?: string[];
  healthChecks?: string[];
  dependencies?: CellDependency[];
  administration?: CellAdministration;
  enabled: boolean;
}

/**
 * CellContract — contrato de célula compatível com versões anteriores.
 * Mantém os campos flat (id, name, routes, permissions, enabled) usados pelas
 * 19 células existentes. Novas células devem usar SaaSCellContract diretamente.
 * CellContract é um tipo compatível com SaaSCellContract durante a migração.
 */
export interface CellContract extends SaaSCellContract {
  id: string;
  name: string;
  routes: CellRoute[];
  permissions: string[];
  enabled: boolean;
}

/** Resultado da validação de um contrato de célula pelos gates arquiteturais */
export interface CellGateResult {
  passed: boolean;
  reason?: string;
}

/** Resultado completo de validação de uma célula no CellRegistry */
export interface CellValidationResult {
  valid: boolean;
  gates: Record<string, CellGateResult>;
  errors: string[];
  warnings: string[];
}

/** Dispatcher action */
export interface DispatcherAction {
  type: string;
  payload: unknown;
  metadata?: Record<string, unknown>;
}

/** Execution context for the dispatcher */
export interface ExecutionContext {
  personId: UUID;
  tenantId: UUID | null;
  roleIds: UUID[];
  permissions: string[];
}

/** Audit log entry */
export interface AuditLogEntry {
  id: UUID;
  person_id: UUID;
  action: string;
  resource: string;
  resource_id: UUID | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/** Identity context for the authenticated session */
export interface IdentityContext {
  authUser: AuthUser | null;
  person: Person | null;
  memberships: TenantMembership[];
  currentTenantId: UUID | null;
  availableTenants: { id: UUID; name: string }[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

/** Error codes for the core */
export type CoreErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'TENANT_ISOLATION_VIOLATION';

/** Core result wrapper */
export interface CoreResult<T> {
  data: T | null;
  error: { code: CoreErrorCode; message: string } | null;
}
