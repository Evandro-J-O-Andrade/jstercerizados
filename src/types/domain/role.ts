export interface Role {
  id: string;
  name: string;
  description: string | null;
  scope: 'global' | 'tenant';
  created_at: string;
  updated_at: string;
}

export interface RoleCreateInput {
  name: string;
  description?: string | null;
  scope: 'global' | 'tenant';
}

export interface RoleUpdateInput {
  name?: string;
  description?: string | null;
  scope?: 'global' | 'tenant';
}
