export interface EmployeeExperience {
  id: string;
  employee_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  achievements: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeExperienceCreateInput {
  employee_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  achievements?: string | null;
}

export interface EmployeeExperienceUpdateInput {
  employee_id?: string;
  company_name?: string;
  job_title?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  achievements?: string | null;
}
