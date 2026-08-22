import type { Database } from '@/types/database';

export type TenantStatus = Database['public']['Enums']['tenant_status'];

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  document: string | null;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
  memberCount?: number;
}

export interface TenantCreateInput {
  name: string;
  slug: string;
  document?: string | null;
  status?: TenantStatus;
}

export interface TenantUpdateInput {
  name?: string;
  slug?: string;
  document?: string | null;
  status?: TenantStatus;
}
