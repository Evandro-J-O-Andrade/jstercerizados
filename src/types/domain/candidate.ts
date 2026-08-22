import type { Database } from '@/types/database';

export type CandidateStatus = Database['public']['Enums']['candidate_status'];

export interface Candidate {
  id: string;
  person_id: string;
  tenant_id: string;
  status: CandidateStatus;
  created_at: string;
  updated_at: string;
  person?: Database['public']['Tables']['people']['Row'];
  experiences: Database['public']['Tables']['candidate_experiences']['Row'][];
  education: Database['public']['Tables']['candidate_education']['Row'][];
  courses: Database['public']['Tables']['candidate_courses']['Row'][];
  languages: Database['public']['Tables']['candidate_languages']['Row'][];
  skills: Database['public']['Tables']['candidate_skills']['Row'][];
  documents: Database['public']['Tables']['candidate_documents']['Row'][];
  profileViews: Database['public']['Tables']['candidate_profile_views']['Row'][];
}

export interface CandidateCreateInput {
  person_id: string;
  tenant_id: string;
  status?: CandidateStatus;
}

export interface CandidateUpdateInput {
  person_id?: string;
  tenant_id?: string;
  status?: CandidateStatus;
}

export type CandidateExperience =
  Database['public']['Tables']['candidate_experiences']['Row'];
export type CandidateEducation =
  Database['public']['Tables']['candidate_education']['Row'];
export type CandidateCourse =
  Database['public']['Tables']['candidate_courses']['Row'];
export type CandidateLanguage =
  Database['public']['Tables']['candidate_languages']['Row'];
export type CandidateDocument =
  Database['public']['Tables']['candidate_documents']['Row'];
export type CandidateSkill =
  Database['public']['Tables']['candidate_skills']['Row'];
export type CandidateProfileView =
  Database['public']['Tables']['candidate_profile_views']['Row'];
