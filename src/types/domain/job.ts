import type { Database } from '@/types/database';

export type JobStatus = Database['public']['Enums']['job_status'];
export type EmploymentType =
  'CLT' | 'ESTAGIO' | 'TEMPORARIO' | 'FREELA' | 'TERCEIRIZADO' | 'CD';

export interface Job {
  id: string;
  tenant_id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  employment_type: string | null;
  location: string | null;
  salary: string | null;
  status: JobStatus;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  company?: Database['public']['Tables']['companies']['Row'];
  applicationsCount?: number;
}

export interface JobCreateInput {
  tenant_id: string;
  company_id: string;
  title: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  employment_type?: string | null;
  location?: string | null;
  salary?: string | null;
  status?: JobStatus;
  published_at?: string | null;
  closed_at?: string | null;
}

export interface JobUpdateInput {
  tenant_id?: string;
  company_id?: string;
  title?: string;
  description?: string;
  requirements?: string | null;
  benefits?: string | null;
  employment_type?: string | null;
  location?: string | null;
  salary?: string | null;
  status?: JobStatus;
  published_at?: string | null;
  closed_at?: string | null;
}
