export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleCreateInput {
  name: string;
  description?: string | null;
  is_global: boolean;
}

export interface RoleUpdateInput {
  name?: string;
  description?: string | null;
  is_global?: boolean;
}
