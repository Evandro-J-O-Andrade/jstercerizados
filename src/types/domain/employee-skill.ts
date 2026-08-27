export interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_name: string;
  proficiency_level: string | null;
  years_experience: number | null;
  is_certified: boolean;
  certification_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeSkillCreateInput {
  employee_id: string;
  skill_name: string;
  proficiency_level?: string | null;
  years_experience?: number | null;
  is_certified?: boolean;
  certification_name?: string | null;
}

export interface EmployeeSkillUpdateInput {
  employee_id?: string;
  skill_name?: string;
  proficiency_level?: string | null;
  years_experience?: number | null;
  is_certified?: boolean;
  certification_name?: string | null;
}
