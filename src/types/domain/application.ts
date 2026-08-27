import type { Database } from '@/types/database';

export type ApplicationStatus =
  Database['public']['Enums']['application_status'];

export interface Application {
  id: string;
  tenant_id: string;
  job_id: string;
  candidate_id: string;
  profile_snapshot: Record<string, unknown> | null;
  match_score: number | null;
  match_details: Record<string, unknown> | null;
  source: string | null;
  current_stage: ApplicationStatus;
  notes: string | null;
  applied_at: string;
  updated_at: string;
  created_by: string | null;
  job?: Database['public']['Tables']['jobs']['Row'];
  candidate?: Database['public']['Tables']['candidates']['Row'];
  history?: Database['public']['Tables']['application_status_history']['Row'][];
  snapshot?:
    Database['public']['Tables']['application_profile_snapshots']['Row'] | null;
}

export interface ApplicationCreateInput {
  tenant_id: string;
  job_id: string;
  candidate_id: string;
  profile_snapshot?: Record<string, unknown> | null;
  match_score?: number | null;
  match_details?: Record<string, unknown> | null;
  source?: string | null;
  current_stage?: ApplicationStatus;
  notes?: string | null;
  created_by?: string | null;
}

export interface ApplicationUpdateInput {
  tenant_id?: string;
  job_id?: string;
  candidate_id?: string;
  profile_snapshot?: Record<string, unknown> | null;
  match_score?: number | null;
  match_details?: Record<string, unknown> | null;
  source?: string | null;
  current_stage?: ApplicationStatus;
  notes?: string | null;
  created_by?: string | null;
}

export type ApplicationStatusHistory =
  Database['public']['Tables']['application_status_history']['Row'];
