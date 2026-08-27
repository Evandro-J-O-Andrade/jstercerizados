export interface EmployeeCourse {
  id: string;
  employee_id: string;
  course_name: string;
  institution: string | null;
  completion_date: string | null;
  expiry_date: string | null;
  certificate_url: string | null;
  hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCourseCreateInput {
  employee_id: string;
  course_name: string;
  institution?: string | null;
  completion_date?: string | null;
  expiry_date?: string | null;
  certificate_url?: string | null;
  hours?: number | null;
}

export interface EmployeeCourseUpdateInput {
  employee_id?: string;
  course_name?: string;
  institution?: string | null;
  completion_date?: string | null;
  expiry_date?: string | null;
  certificate_url?: string | null;
  hours?: number | null;
}
