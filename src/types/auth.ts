export interface Person {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  document?: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface TenantMembership {
  id: string;
  person_id: string;
  tenant_id: string;
  role_id: string;
  status: 'active' | 'inactive' | 'pending';
  invited_by?: string | null;
  joined_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  scope: 'global' | 'tenant';
  created_at: string;
  updated_at: string;
}

export type RoleName =
  | 'admin_master'
  | 'platform_admin'
  | 'support_engineer'
  | 'tenant_admin'
  | 'rh_manager'
  | 'recruiter'
  | 'finance_manager'
  | 'finance'
  | 'support'
  | 'commercial'
  | 'stock_manager'
  | 'security_manager'
  | 'facilities_manager'
  | 'lawyer'
  | 'it_admin'
  | 'viewer';

export interface Permission {
  id: string;
  name: string;
  module: string;
  resource: string;
  action: string;
  description?: string | null;
  created_at: string;
}

export interface RoleAssignment {
  id: string;
  role_id: string;
  person_id: string;
  tenant_id?: string | null;
  assigned_by?: string | null;
  expires_at?: string | null;
  created_at: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
}

export interface FirstLoginState {
  person_id: string;
  must_change_password: boolean;
  terms_version: string | null;
  privacy_version: string | null;
  lgpd_consent_version: string | null;
  first_login_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalAcceptance {
  id: string;
  person_id: string;
  tenant_id: string;
  document_type: string;
  document_version: string;
  accepted_at: string;
  ip: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
}

export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  person: Person | null;
  tenantMemberships: TenantMembership[];
  currentTenantId: string | null;
  roles: Role[];
  permissions: Permission[];
  roleAssignments: RoleAssignment[];
  isAdminMaster: boolean;
  isLoading: boolean;
  authError: string | null;
}
