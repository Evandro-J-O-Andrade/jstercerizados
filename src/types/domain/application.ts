import type { Database } from '@/types/database';

export type ApplicationStatus =
  Database['public']['Enums']['application_status'];

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
  job?: Database['public']['Tables']['jobs']['Row'];
  candidate?: Database['public']['Tables']['candidates']['Row'];
}

export interface ApplicationCreateInput {
  candidate_id: string;
  job_id: string;
  status?: ApplicationStatus;
  cover_letter?: string | null;
}

export interface ApplicationUpdateInput {
  candidate_id?: string;
  job_id?: string;
  status?: ApplicationStatus;
  cover_letter?: string | null;
}
