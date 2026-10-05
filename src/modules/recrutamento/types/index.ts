/**
 * Recrutamento Domain Types
 *
 * These types mirror the database schema exactly for the recruitment domain.
 * They are used by repositories, services, and components to ensure type safety.
 *
 * Tables covered:
 * - jobs (vagas de emprego)
 * - candidates (currículos de candidatos)
 * - applications (candidaturas a vagas)
 * - recruitment_processes (processos seletivos)
 * - recruitment_stages (etapas do processo)
 * - recruitment_demands (demandas de recrutamento)
 * - job_matches (score de compatibilidade)
 * - talent_pool_memberships (banco de talentos)
 * - candidate_preferences (preferências de matching)
 * - candidate_skills (habilidades do candidato)
 * - company_relationships (relacionamento comercial)
 * - people (pessoas físicas)
 * - tenants (tenants/empresas)
 */

import type {
  Candidate,
  CandidateStatus,
} from '@/modules/candidato/types/candidate';

// ============================================================
// Enums (matching database CHECK constraints and ENUM types)
// ============================================================

export type JobStatus =
  'draft' | 'published' | 'paused' | 'closed' | 'filled' | 'cancelled';

export type SalaryType = 'range' | 'monthly' | 'negotiate';

export type ContractType =
  'clt' | 'internship' | 'temporary' | 'freelance' | 'contracted' | 'cd';

export type Seniority =
  'internship' | 'junior' | 'mid' | 'senior' | 'master' | 'leadership';

export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview_scheduled'
  | 'interviewed'
  | 'offer_sent'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type ProcessStatus =
  'planning' | 'open' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export type StageType =
  | 'screening'
  | 'technical_test'
  | 'interview'
  | 'final_interview'
  | 'offer'
  | 'hiring'
  | 'custom';

export type DemandStatus =
  'open' | 'in_progress' | 'fulfilled' | 'cancelled' | 'on_hold';

export type DemandPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TalentPoolStatus = 'active' | 'paused' | 'removed';

export type TalentPoolSource =
  | 'direct_signup'
  | 'application_rejected'
  | 'recruiter_invitation'
  | 'import'
  | 'campaign';

export type ConsentStatus = 'granted' | 'revoked' | 'expired';

export type MatchAlgorithmVersion = '1.0';

// ============================================================
// Core Entity Types
// ============================================================

/**
 * jobs - Vagas de emprego (tenant-scoped)
 */
export interface Job {
  id: string;
  tenant_id: string;
  company_relationship_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: SalaryType;
  contract_type: ContractType;
  seniority: Seniority | null;
  work_hours: string | null;
  work_mode: WorkMode;
  city: string | null;
  state: string | null;
  location_detail: string | null;
  status: JobStatus;
  published_at: string | null;
  closed_at: string | null;
  filled_at: string | null;
  views_count: number;
  applications_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * Job with related data for list views
 */
export interface JobListItem extends Job {
  company_name?: string;
  company_logo_url?: string;
  stage_name?: string;
  process_id?: string;
}

/**
 * candidates - Currículos de candidatos (tenant-scoped)
 * Referenced by talent_pool_memberships, applications, job_matches
 *
 * Fonte única da verdade: o tipo do módulo Candidato, que por sua vez deriva
 * de `Database['public']['Tables']['candidates']`. Não redeclare aqui — uma
 * segunda declaração diverge e passa a escrever colunas inexistentes.
 */
export type { Candidate, CandidateStatus };

/**
 * Candidate with person data for list views
 */
export interface CandidateListItem extends Candidate {
  latest_application?: ApplicationListItem;
}

/**
 * applications - Candidaturas a vagas
 */
export interface Application {
  id: string;
  tenant_id: string;
  job_id: string;
  candidate_id: string;
  person_id: string;
  process_id: string | null;
  current_stage_id: string | null;
  status: ApplicationStatus;
  applied_at: string;
  source: string | null;
  cover_letter: string | null;
  referral_source: string | null;
  referred_by: string | null;
  screening_score: number | null;
  screening_notes: string | null;
  recruiter_notes: string | null;
  last_activity_at: string;
  rejected_at: string | null;
  rejection_reason: string | null;
  hired_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * Application with related data for list views
 */
export interface ApplicationListItem extends Application {
  job_title: string;
  job_slug: string;
  candidate_name: string;
  candidate_email: string;
  candidate_avatar_url: string | null;
  process_name: string | null;
  stage_name: string | null;
  days_in_current_stage: number;
}

/**
 * recruitment_processes - Processos seletivos
 */
export interface RecruitmentProcess {
  id: string;
  tenant_id: string;
  job_id: string | null;
  name: string;
  description: string | null;
  status: ProcessStatus;
  started_at: string | null;
  completed_at: string | null;
  target_hires: number;
  hired_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * Process with related data for list views
 */
export interface RecruitmentProcessListItem extends RecruitmentProcess {
  job_title: string | null;
  job_slug: string | null;
  stages_count: number;
  applications_count: number;
  current_stage_name: string | null;
}

/**
 * recruitment_stages - Etapas do processo seletivo
 */
export interface RecruitmentStage {
  id: string;
  tenant_id: string;
  process_id: string;
  name: string;
  description: string | null;
  type: StageType;
  sort_order: number;
  is_required: boolean;
  estimated_duration_days: number | null;
  evaluators: string[]; // person_ids
  evaluation_criteria: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * recruitment_demands - Demandas de recrutamento
 */
export interface RecruitmentDemand {
  id: string;
  tenant_id: string;
  company_relationship_id: string | null;
  title: string;
  description: string | null;
  quantity: number;
  filled_quantity: number;
  status: DemandStatus;
  priority: DemandPriority;
  required_skills: string[];
  desired_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  contract_type: ContractType | null;
  work_mode: WorkMode | null;
  city: string | null;
  state: string | null;
  start_date: string | null;
  deadline: string | null;
  assigned_recruiter_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * job_matches - Score de compatibilidade candidato ↔ vaga
 */
export interface JobMatch {
  id: string;
  candidate_id: string;
  job_id: string;
  tenant_id: string;
  score: number; // 0-100
  reasons: Record<string, unknown>;
  algorithm_version: MatchAlgorithmVersion;
  is_eligible: boolean;
  sent_notification: boolean;
  invalidated_at: string | null;
  invalidated_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * talent_pool_memberships - Estado de disponibilidade do candidato
 */
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

/**
 * candidate_preferences - Preferências para matching
 */
export interface CandidatePreferences {
  id: string;
  candidate_id: string;
  desired_roles: string[];
  desired_locations: string[];
  salary_min: number | null;
  salary_max: number | null;
  contract_types: ContractType[];
  shifts: string[];
  work_modes: WorkMode[];
  max_distance_km: number | null;
  available_from: string | null;
  matching_enabled: boolean;
  receive_match_alerts: boolean;
  last_match_at: string | null;
  last_match_version: MatchAlgorithmVersion | null;
  preferences_version: '1.0';
  created_at: string;
  updated_at: string;
}

/**
 * candidate_skills - Habilidades do candidato
 */
export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_id: string;
  proficiency_level: number; // 1-5
  years_experience: number | null;
  is_primary: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * CandidateSkill with skill name for display
 */
export interface CandidateSkillWithName extends CandidateSkill {
  skill_name: string;
  skill_category: string | null;
}

/**
 * company_relationships - Relacionamento comercial com empresa
 */
export interface CompanyRelationship {
  id: string;
  tenant_id: string;
  company_id: string;
  relationship_type: string;
  is_active: boolean;
  contract_start: string | null;
  contract_end: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * company_relationships with company name for display
 */
export interface CompanyRelationshipWithName extends CompanyRelationship {
  company_name: string;
  company_trade_name: string | null;
  company_logo_url: string | null;
}

/**
 * people - Pessoas físicas (from core)
 */
export interface Person {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  document: string | null;
  document_type: string | null;
  birth_date: string | null;
  gender: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * tenants - Tenants/Empresas (from core)
 */
export interface Tenant {
  id: string;
  name: string;
  trade_name: string | null;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

// ============================================================
// Query/Filter Types
// ============================================================

export interface JobFilters {
  tenant_id?: string;
  company_relationship_id?: string;
  status?: JobStatus | JobStatus[];
  contract_type?: ContractType | ContractType[];
  work_mode?: WorkMode | WorkMode[];
  seniority?: Seniority | Seniority[];
  city?: string;
  state?: string;
  search?: string; // searches title, description, requirements
  date_from?: string;
  date_to?: string;
  sort_by?:
    | 'created_at'
    | 'published_at'
    | 'title'
    | 'applications_count'
    | 'views_count';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Filtros de `candidates`. Apenas colunas que existem em `public.candidates`:
 * `tenant_id`, `status`, `headline` (via search), `created_at`.
 * `is_open_to_work`, `is_visible_in_pool`, `min_experience_years` e
 * `profile_completeness` saíram — essas colunas não existem no schema.
 */
export interface CandidateFilters {
  tenant_id?: string;
  status?: CandidateStatus;
  search?: string; // busca em headline e source
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
}

/**
 * Estatísticas de candidatos derivadas de colunas reais (`status`, `created_at`).
 */
export interface CandidateStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  blacklisted: number;
  new_this_month: number;
}

export interface ApplicationFilters {
  tenant_id?: string;
  job_id?: string;
  candidate_id?: string;
  process_id?: string;
  stage_id?: string;
  status?: ApplicationStatus | ApplicationStatus[];
  source?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'applied_at' | 'last_activity_at' | 'status';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ProcessFilters {
  tenant_id?: string;
  job_id?: string;
  status?: ProcessStatus | ProcessStatus[];
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'started_at' | 'name';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DemandFilters {
  tenant_id?: string;
  company_relationship_id?: string;
  status?: DemandStatus | DemandStatus[];
  priority?: DemandPriority | DemandPriority[];
  assigned_recruiter_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'deadline' | 'priority' | 'status';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MatchFilters {
  tenant_id?: string;
  job_id?: string;
  candidate_id?: string;
  min_score?: number;
  max_score?: number;
  is_eligible?: boolean;
  sent_notification?: boolean;
  sort_by?: 'score' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============================================================
// Aggregated/Computed Types for Dashboard
// ============================================================

export interface RecruitmentDashboardStats {
  jobs: {
    total: number;
    draft: number;
    published: number;
    paused: number;
    closed: number;
    filled: number;
  };
  candidates: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    blacklisted: number;
    new_this_month: number;
  };
  applications: {
    total: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
    new_today: number;
  };
  processes: {
    total: number;
    planning: number;
    open: number;
    in_progress: number;
    completed: number;
  };
  demands: {
    total: number;
    open: number;
    in_progress: number;
    fulfilled: number;
  };
  matches: {
    total: number;
    high_score: number; // >= 80
    eligible_not_notified: number;
  };
}

export interface PipelineMetrics {
  stage_id: string;
  stage_name: string;
  stage_type: StageType;
  applications_count: number;
  avg_days_in_stage: number;
  conversion_rate: number; // to next stage
}

export interface RecruiterWorkload {
  recruiter_id: string;
  recruiter_name: string;
  active_processes: number;
  active_demands: number;
  applications_assigned: number;
  interviews_scheduled: number;
}

// ============================================================
// Repository Return Types
// ============================================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RepositoryResult<T> {
  data: T | null;
  error: Error | null;
}

export interface RepositoryListResult<T> {
  data: T[];
  error: Error | null;
  count?: number;
}

// ============================================================
// Form/Input Types
// ============================================================

export interface CreateJobInput {
  tenant_id: string;
  company_relationship_id: string;
  title: string;
  slug: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: SalaryType;
  contract_type?: ContractType;
  seniority?: Seniority;
  work_hours?: string;
  work_mode?: WorkMode;
  city?: string;
  state?: string;
  location_detail?: string;
  status?: JobStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  id: string;
}

/**
 * Inputs de escrita em `candidates`. Reexportados do módulo Candidato para que
 * exista uma única definição, atrelada ao schema real de `public.candidates`.
 */
export type { CandidateCreateInput as CreateCandidateInput } from '@/modules/candidato/types/candidate';
export type { CandidateUpdateInput as UpdateCandidateInput } from '@/modules/candidato/types/candidate';

export interface CreateApplicationInput {
  tenant_id: string;
  job_id: string;
  candidate_id: string;
  person_id: string;
  process_id?: string;
  source?: string;
  cover_letter?: string;
  referral_source?: string;
  referred_by?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateApplicationInput {
  id: string;
  current_stage_id?: string;
  status?: ApplicationStatus;
  screening_score?: number;
  screening_notes?: string;
  recruiter_notes?: string;
  rejection_reason?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateProcessInput {
  tenant_id: string;
  job_id?: string;
  name: string;
  description?: string;
  status?: ProcessStatus;
  target_hires?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateProcessInput extends Partial<CreateProcessInput> {
  id: string;
}

export interface CreateStageInput {
  tenant_id: string;
  process_id: string;
  name: string;
  description?: string;
  type: StageType;
  sort_order: number;
  is_required?: boolean;
  estimated_duration_days?: number;
  evaluators?: string[];
  evaluation_criteria?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateStageInput extends Partial<CreateStageInput> {
  id: string;
}

export interface CreateDemandInput {
  tenant_id: string;
  company_relationship_id?: string;
  title: string;
  description?: string;
  quantity: number;
  status?: DemandStatus;
  priority?: DemandPriority;
  required_skills?: string[];
  desired_skills?: string[];
  salary_min?: number;
  salary_max?: number;
  contract_type?: ContractType;
  work_mode?: WorkMode;
  city?: string;
  state?: string;
  start_date?: string;
  deadline?: string;
  assigned_recruiter_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateDemandInput extends Partial<CreateDemandInput> {
  id: string;
}

// ============================================================
// Navigation/Menu Types (from database-driven navigation)
// ============================================================

export interface RecrutamentoNavItem {
  id: string;
  label: string;
  icon: string; // lucide icon name
  route: string;
  permission_key: string;
  children?: RecrutamentoNavItem[];
  sort_order: number;
  is_active?: boolean;
}

// ============================================================
// Type Guards
// ============================================================

export function isJobStatus(value: string): value is JobStatus {
  return [
    'draft',
    'published',
    'paused',
    'closed',
    'filled',
    'cancelled',
  ].includes(value);
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return [
    'applied',
    'screening',
    'interview_scheduled',
    'interviewed',
    'offer_sent',
    'hired',
    'rejected',
    'withdrawn',
  ].includes(value);
}

export function isProcessStatus(value: string): value is ProcessStatus {
  return [
    'planning',
    'open',
    'in_progress',
    'paused',
    'completed',
    'cancelled',
  ].includes(value);
}

export function isDemandStatus(value: string): value is DemandStatus {
  return ['open', 'in_progress', 'fulfilled', 'cancelled', 'on_hold'].includes(
    value,
  );
}

export function isTalentPoolStatus(value: string): value is TalentPoolStatus {
  return ['active', 'paused', 'removed'].includes(value);
}
