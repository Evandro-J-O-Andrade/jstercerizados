import type { Database } from '@/types/database';

export type CandidateStatus = Database['public']['Enums']['candidate_status'];

export interface Candidate {
  id: string;
  person_id: string;
  tenant_id: string;
  headline: string | null;
  salary_expectation_min: number | null;
  salary_expectation_max: number | null;
  salary_type: 'range' | 'monthly' | 'negotiate' | null;
  availability: Record<string, unknown> | null;
  source: string | null;
  status: CandidateStatus;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  person?: Database['public']['Tables']['people']['Row'];
  skills: Database['public']['Tables']['candidate_skills']['Row'][];
  experiences: Database['public']['Tables']['candidate_experiences']['Row'][];
  education: Database['public']['Tables']['candidate_education']['Row'][];
  courses: Database['public']['Tables']['candidate_courses']['Row'][];
  languages: Database['public']['Tables']['candidate_languages']['Row'][];
  documents: Database['public']['Tables']['candidate_documents']['Row'][];
  profileViews: Database['public']['Tables']['candidate_profile_views']['Row'][];
}

export interface CandidateCreateInput {
  person_id: string;
  tenant_id: string;
  headline?: string | null;
  salary_expectation_min?: number | null;
  salary_expectation_max?: number | null;
  salary_type?: 'range' | 'monthly' | 'negotiate' | null;
  availability?: Record<string, unknown> | null;
  source?: string | null;
  status?: CandidateStatus;
  metadata?: Record<string, unknown>;
  created_by?: string | null;
}

export interface CandidateUpdateInput {
  person_id?: string;
  tenant_id?: string;
  headline?: string | null;
  salary_expectation_min?: number | null;
  salary_expectation_max?: number | null;
  salary_type?: 'range' | 'monthly' | 'negotiate' | null;
  availability?: Record<string, unknown> | null;
  source?: string | null;
  status?: CandidateStatus;
  metadata?: Record<string, unknown>;
  created_by?: string | null;
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
