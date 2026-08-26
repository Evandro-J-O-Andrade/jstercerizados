export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
  created_at: string;
}

export interface PermissionCreateInput {
  resource: string;
  action: string;
  description?: string | null;
}
