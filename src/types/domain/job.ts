import type { Database } from '@/types/database';

export type JobStatus = Database['public']['Enums']['job_status'];
export type EmploymentType =
  'CLT' | 'ESTAGIO' | 'TEMPORARIO' | 'FREELA' | 'TERCEIRIZADO' | 'CD';
export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export interface JobRow {
  id: string;
  tenant_id: string;
  company_relationship_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  contract_type: string | null;
  seniority: string | null;
  work_hours: string | null;
  work_mode: string | null;
  city: string | null;
  state: string | null;
  location_detail: string | null;
  status: JobStatus;
  views_count: number;
  applications_count: number;
  published_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  tenant_id: string;
  slug: string;
  company_id: string | null;
  title: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  employment_type: string | null;
  location: string | null;
  salary: string | null;
  work_mode: WorkMode | null;
  status: JobStatus;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  area?: string | null;
  workSchedule?: string | null;
  workload?: string | null;
  company?: Database['public']['Tables']['companies']['Row'];
  applicationsCount?: number;
}

export interface JobCreateInput {
  tenant_id: string;
  company_id: string | null;
  title: string;
  description: string;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  employment_type?: string | null;
  location?: string | null;
  salary?: string | null;
  work_mode?: WorkMode | null;
  status?: JobStatus;
  published_at?: string | null;
  closed_at?: string | null;
}

export interface JobUpdateInput {
  tenant_id?: string;
  company_id?: string | null;
  title?: string;
  description?: string;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  employment_type?: string | null;
  location?: string | null;
  salary?: string | null;
  work_mode?: WorkMode | null;
  status?: JobStatus;
  published_at?: string | null;
  closed_at?: string | null;
}
