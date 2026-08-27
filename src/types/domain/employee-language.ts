export interface EmployeeLanguage {
  id: string;
  employee_id: string;
  language: string;
  proficiency: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLanguageCreateInput {
  employee_id: string;
  language: string;
  proficiency?: string | null;
  is_primary?: boolean;
}

export interface EmployeeLanguageUpdateInput {
  employee_id?: string;
  language?: string;
  proficiency?: string | null;
  is_primary?: boolean;
}
