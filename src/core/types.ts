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
}

/** Cell contract for the registry */
export interface CellContract {
  id: string;
  name: string;
  routes: CellRoute[];
  permissions: string[];
  enabled: boolean;
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
