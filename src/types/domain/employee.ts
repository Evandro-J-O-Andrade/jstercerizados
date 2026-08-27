import type { Database } from '@/types/database';

export type EmployeeStatus =
  Database['public']['Tables']['employees']['Row']['status'];
export type EmploymentType =
  Database['public']['Tables']['employees']['Row']['employment_type'];
export type WorkMode =
  Database['public']['Tables']['employees']['Row']['work_mode'];
export type SalaryFrequency =
  Database['public']['Tables']['employees']['Row']['salary_frequency'];

export interface Employee {
  id: string;
  tenant_id: string;
  person_id: string;
  company_id: string | null;
  registration: string | null;
  job_title: string | null;
  department: string | null;
  cost_center: string | null;
  hire_date: string | null;
  termination_date: string | null;
  probation_end_date: string | null;
  employment_type: string | null;
  work_mode: string | null;
  salary: number | null;
  salary_currency: string | null;
  salary_frequency: string | null;
  status: string | null;
  manager_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  person?: Database['public']['Tables']['people']['Row'];
  company?: Database['public']['Tables']['companies']['Row'] | null;
  manager?: Database['public']['Tables']['employees']['Row'] | null;
  documents?: Database['public']['Tables']['employee_documents']['Row'][];
  education?: Database['public']['Tables']['employee_education']['Row'][];
  experiences?: Database['public']['Tables']['employee_experiences']['Row'][];
  skills?: Database['public']['Tables']['employee_skills']['Row'][];
  languages?: Database['public']['Tables']['employee_languages']['Row'][];
  courses?: Database['public']['Tables']['employee_courses']['Row'][];
}

export interface EmployeeCreateInput {
  tenant_id: string;
  person_id: string;
  company_id?: string | null;
  registration?: string | null;
  job_title?: string | null;
  department?: string | null;
  cost_center?: string | null;
  hire_date?: string | null;
  termination_date?: string | null;
  probation_end_date?: string | null;
  employment_type?: string | null;
  work_mode?: string | null;
  salary?: number | null;
  salary_currency?: string | null;
  salary_frequency?: string | null;
  status?: string | null;
  manager_id?: string | null;
  notes?: string | null;
}

export interface EmployeeUpdateInput {
  person_id?: string;
  company_id?: string | null;
  registration?: string | null;
  job_title?: string | null;
  department?: string | null;
  cost_center?: string | null;
  hire_date?: string | null;
  termination_date?: string | null;
  probation_end_date?: string | null;
  employment_type?: string | null;
  work_mode?: string | null;
  salary?: number | null;
  salary_currency?: string | null;
  salary_frequency?: string | null;
  status?: string | null;
  manager_id?: string | null;
  notes?: string | null;
}

export type EmployeeEducation =
  Database['public']['Tables']['employee_education']['Row'];

export type EmployeeExperience =
  Database['public']['Tables']['employee_experiences']['Row'];

export type EmployeeLanguage =
  Database['public']['Tables']['employee_languages']['Row'];

export type EmployeeCourse =
  Database['public']['Tables']['employee_courses']['Row'];
