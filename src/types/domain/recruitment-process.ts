import type { Database } from '@/types/database';

export type RecruitmentProcessStatus =
  Database['public']['Tables']['recruitment_processes']['Row']['status'];

export interface RecruitmentProcess {
  id: string;
  tenant_id: string;
  job_id: string | null;
  title: string;
  description: string | null;
  status: RecruitmentProcessStatus;
  created_at: string;
  updated_at: string;
  job?: Database['public']['Tables']['jobs']['Row'];
}

export interface RecruitmentProcessCreateInput {
  tenant_id: string;
  job_id?: string | null;
  title: string;
  description?: string | null;
  status?: RecruitmentProcessStatus;
}

export interface RecruitmentProcessUpdateInput {
  job_id?: string | null;
  title?: string;
  description?: string | null;
  status?: RecruitmentProcessStatus;
}
