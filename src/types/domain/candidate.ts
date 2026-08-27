import type { Database } from '@/types/database';

export type CandidateStatus =
  'active' | 'inactive' | 'archived' | 'blacklisted';

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

export interface CandidateExperienceCreateInput {
  candidate_id: string;
  company: string;
  position: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export interface CandidateExperienceUpdateInput {
  company?: string;
  position?: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export type CandidateEducation =
  Database['public']['Tables']['candidate_education']['Row'];
export type CandidateCourse =
  Database['public']['Tables']['candidate_courses']['Row'];
export type CandidateLanguage =
  Database['public']['Tables']['candidate_languages']['Row'];

export interface CandidateLanguageCreateInput {
  candidate_id: string;
  language: string;
  level: string;
}

export interface CandidateLanguageUpdateInput {
  language?: string;
  level?: string;
}

export type CandidateDocument =
  Database['public']['Tables']['candidate_documents']['Row'];

export interface CandidateDocumentCreateInput {
  candidate_id: string;
  type: string;
  url: string;
  name?: string | null;
}

export interface CandidateDocumentUpdateInput {
  type?: string;
  url?: string;
  name?: string | null;
}

export type CandidateSkill =
  Database['public']['Tables']['candidate_skills']['Row'];

export interface CandidateSkillCreateInput {
  candidate_id: string;
  skill_id: string;
  proficiency?: string | null;
  years_experience?: number | null;
  last_used_at?: string | null;
}

export interface CandidateSkillUpdateInput {
  skill_id?: string;
  proficiency?: string | null;
  years_experience?: number | null;
  last_used_at?: string | null;
}

export interface CandidateEducationCreateInput {
  candidate_id: string;
  institution: string;
  course: string;
  degree?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface CandidateEducationUpdateInput {
  institution?: string;
  course?: string;
  degree?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export type CandidateProfileView =
  Database['public']['Tables']['candidate_profile_views']['Row'];

export type TalentPoolStatus =
  Database['public']['Enums']['talent_pool_status'];
export type TalentPoolSource =
  Database['public']['Enums']['talent_pool_source'];
export type ConsentStatus = Database['public']['Enums']['consent_status'];

export interface TalentPoolMembership {
  id: string;
  candidate_id: string;
  tenant_id: string;
  status: TalentPoolStatus;
  source: TalentPoolSource;
  consent_status: ConsentStatus;
  consented_at: string;
  consent_source: string | null;
  consent_version: string | null;
  joined_at: string;
  removed_at: string | null;
  removal_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface TalentPoolMembershipCreateInput {
  candidate_id: string;
  tenant_id: string;
  status?: TalentPoolStatus;
  source: TalentPoolSource;
  consent_status?: ConsentStatus;
  consent_source?: string | null;
  consent_version?: string | null;
  metadata?: Record<string, unknown>;
  created_by?: string | null;
}

export interface TalentPoolMembershipUpdateInput {
  status?: TalentPoolStatus;
  source?: TalentPoolSource;
  consent_status?: ConsentStatus;
  consent_source?: string | null;
  consent_version?: string | null;
  removed_at?: string | null;
  removal_reason?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CandidatePreference {
  id: string;
  candidate_id: string;
  desired_roles: string[] | null;
  desired_locations: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  contract_types: string[] | null;
  shifts: string[] | null;
  work_modes: string[] | null;
  max_distance_km: number | null;
  available_from: string | null;
  matching_enabled: boolean;
  receive_match_alerts: boolean;
  last_match_at: string | null;
  last_match_version: string | null;
  preferences_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidatePreferenceCreateInput {
  candidate_id: string;
  desired_roles?: string[] | null;
  desired_locations?: string[] | null;
  salary_min?: number | null;
  salary_max?: number | null;
  contract_types?: string[] | null;
  shifts?: string[] | null;
  work_modes?: string[] | null;
  max_distance_km?: number | null;
  available_from?: string | null;
  matching_enabled?: boolean;
  receive_match_alerts?: boolean;
}

export interface CandidatePreferenceUpdateInput {
  desired_roles?: string[] | null;
  desired_locations?: string[] | null;
  salary_min?: number | null;
  salary_max?: number | null;
  contract_types?: string[] | null;
  shifts?: string[] | null;
  work_modes?: string[] | null;
  max_distance_km?: number | null;
  available_from?: string | null;
  matching_enabled?: boolean;
  receive_match_alerts?: boolean;
}

export interface JobMatch {
  id: string;
  candidate_id: string;
  job_id: string;
  tenant_id: string;
  score: number;
  reasons: Record<string, unknown>;
  algorithm_version: string | null;
  is_eligible: boolean;
  sent_notification: boolean;
  invalidated_at: string | null;
  invalidated_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobMatchCreateInput {
  candidate_id: string;
  job_id: string;
  tenant_id: string;
  score: number;
  reasons?: Record<string, unknown>;
  algorithm_version?: string | null;
  is_eligible?: boolean;
  sent_notification?: boolean;
}

export interface JobMatchUpdateInput {
  score?: number;
  reasons?: Record<string, unknown>;
  algorithm_version?: string | null;
  is_eligible?: boolean;
  sent_notification?: boolean;
  invalidated_at?: string | null;
  invalidated_reason?: string | null;
}
