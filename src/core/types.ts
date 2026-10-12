/**
 * Core types — shared contracts for the J&S nucleus.
 * These types are the canonical interface between cells and the core.
 */

/** UUID string used for identity references */
export type UUID = string;

/** A permission is a resource.action pair */
export interface Permission {
  resource: string;
  action: string;
  granted: boolean;
  scope: 'global' | 'tenant';
}

/** A role in the system */
export interface Role {
  id: UUID;
  name: string;
  scope: 'global' | 'tenant';
  level: number;
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
  role_id: UUID;
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
export interface RouteEntry {
  path: string;
  element: string; // component name or lazy import path
  requiredPermissions?: string[];
}

/** Cell contract — what every cell must declare */
export interface CellContract {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  routes: RouteEntry[];
  requiredPermissions: string[];
  dependencies: string[];
  tables: string[];
}

/** Execution context for an operation */
export interface ExecutionContext {
  tenantId: UUID;
  userId: UUID;
  routeId: string;
  moduleId: string;
  action: string;
  resourceId?: string;
  correlationId: string;
}

/** Result of route resolution */
export interface RouteResolution {
  matched: boolean;
  cellId?: string;
  reason?: string;
}

/** Identity context — authenticated user + person + tenant */
export interface IdentityContext {
  authUser: AuthUser | null;
  person: Person | null;
  memberships: TenantMembership[];
  currentTenantId: UUID | null;
  availableTenants: { id: UUID; name: string }[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

/** Authorization context — effective permissions */
export interface AuthorizationContext {
  roles: Role[];
  effectivePermissions: Permission[];
  roleAssignments: { role_id: UUID; tenant_id: UUID | null }[];
  isAdminMaster: boolean;
}

/** Core error with structured fields for observability */
export interface CoreError {
  code: string;
  message: string;
  correlationId: string;
  timestamp: string;
  context?: Record<string, unknown>;
}