import type { Database } from '@/types/database';

export type RecruitmentStageStatus =
  Database['public']['Tables']['recruitment_stages']['Row']['status'];

export interface RecruitmentStage {
  id: string;
  tenant_id: string;
  recruitment_process_id: string;
  name: string;
  description: string | null;
  status: RecruitmentStageStatus;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface RecruitmentStageCreateInput {
  tenant_id: string;
  recruitment_process_id: string;
  name: string;
  description?: string | null;
  status?: RecruitmentStageStatus;
  order?: number;
}

export interface RecruitmentStageUpdateInput {
  tenant_id?: string;
  recruitment_process_id?: string;
  name?: string;
  description?: string | null;
  status?: RecruitmentStageStatus;
  order?: number;
}
