export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: string;
  file_url: string;
  issue_date: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDocumentCreateInput {
  employee_id: string;
  document_type: string;
  file_url: string;
  issue_date?: string | null;
  expiry_date?: string | null;
}

export interface EmployeeDocumentUpdateInput {
  employee_id?: string;
  document_type?: string;
  file_url?: string;
  issue_date?: string | null;
  expiry_date?: string | null;
}
