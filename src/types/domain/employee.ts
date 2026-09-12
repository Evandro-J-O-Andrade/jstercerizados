import type { Database } from '@/types/database';

export type EmployeeStatus =
  Database['public']['Tables']['employees']['Row']['status'];

export interface Employee {
  id: string;
  tenant_id: string;
  employee_code: string;
  hire_date: string;
  termination_date: string | null;
  salary: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  person?: Database['public']['Tables']['people']['Row'];
  documents?: Database['public']['Tables']['employee_documents']['Row'][];
  positions?: Database['public']['Tables']['employee_positions']['Row'][];
  contracts?: Database['public']['Tables']['employee_contracts']['Row'][];
  status_history?: Database['public']['Tables']['employee_status_history']['Row'][];
}

export interface EmployeeCreateInput {
  tenant_id: string;
  employee_code: string;
  hire_date: string;
  termination_date?: string | null;
  salary?: number | null;
  status?: string;
}

export interface EmployeeUpdateInput {
  employee_code?: string;
  hire_date?: string;
  termination_date?: string | null;
  salary?: number | null;
  status?: string;
}
