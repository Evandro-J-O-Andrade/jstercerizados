export interface EmployeeEducation {
  id: string;
  employee_id: string;
  institution: string;
  course: string;
  degree_level: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeEducationCreateInput {
  employee_id: string;
  institution: string;
  course: string;
  degree_level?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_completed?: boolean;
  notes?: string | null;
}

export interface EmployeeEducationUpdateInput {
  employee_id?: string;
  institution?: string;
  course?: string;
  degree_level?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_completed?: boolean;
  notes?: string | null;
}
