-- J&S Empregos LTDA - Production Backup
-- Generated: 2026-08-20T09:02:18.111Z
-- Project: okxqfyoqbhcmflpurfrw
-- Method: supabase db query via Management API

-- Table: application_profile_snapshots
CREATE TABLE IF NOT EXISTS application_profile_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  snapshot_data jsonb,
  captured_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX application_profile_snapshots_pkey ON public.application_profile_snapshots USING btree (id);
CREATE INDEX idx_app_snapshots_application ON public.application_profile_snapshots USING btree (application_id);

-- Table: application_status_history
CREATE TABLE IF NOT EXISTS application_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  stage character varying(50) NOT NULL,
  previous_stage character varying(50),
  next_stage character varying(50),
  changed_by uuid,
  reason text,
  changed_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX application_status_history_pkey ON public.application_status_history USING btree (id);
CREATE INDEX idx_app_history_application ON public.application_status_history USING btree (application_id);
CREATE INDEX idx_app_history_changed_at ON public.application_status_history USING btree (changed_at DESC);
CREATE INDEX idx_app_history_stage ON public.application_status_history USING btree (stage);

-- Table: applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  job_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  profile_snapshot jsonb,
  match_score numeric(5,2),
  match_details jsonb,
  source character varying(50),
  current_stage character varying(50) NOT NULL DEFAULT 'submitted'::character varying,
  notes text,
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE UNIQUE INDEX applications_candidate_id_job_id_key ON public.applications USING btree (candidate_id, job_id);
CREATE UNIQUE INDEX applications_pkey ON public.applications USING btree (id);
CREATE INDEX idx_applications_applied_at ON public.applications USING btree (applied_at DESC);
CREATE INDEX idx_applications_candidate ON public.applications USING btree (candidate_id);
CREATE INDEX idx_applications_job ON public.applications USING btree (job_id);
CREATE INDEX idx_applications_status ON public.applications USING btree (current_stage);
CREATE INDEX idx_applications_tenant ON public.applications USING btree (tenant_id);

-- Table: candidate_preferences
CREATE TABLE IF NOT EXISTS candidate_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  desired_roles ARRAY,
  desired_locations ARRAY,
  salary_min numeric(10,2),
  salary_max numeric(10,2),
  contract_types ARRAY,
  shifts ARRAY,
  work_modes ARRAY,
  max_distance_km integer(32),
  available_from date,
  matching_enabled boolean NOT NULL DEFAULT true,
  receive_match_alerts boolean NOT NULL DEFAULT true,
  last_match_at timestamp with time zone,
  last_match_version character varying(20),
  preferences_version character varying(20),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX candidate_preferences_pkey ON public.candidate_preferences USING btree (id);
CREATE INDEX idx_candidate_prefs_candidate ON public.candidate_preferences USING btree (candidate_id);
CREATE INDEX idx_candidate_prefs_matching ON public.candidate_preferences USING btree (matching_enabled, receive_match_alerts);
CREATE UNIQUE INDEX uk_candidate_prefs_candidate ON public.candidate_preferences USING btree (candidate_id);

-- Table: candidate_profile_views
CREATE TABLE IF NOT EXISTS candidate_profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  viewer_person_id uuid,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  source character varying(50),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX candidate_profile_views_pkey ON public.candidate_profile_views USING btree (id);
CREATE INDEX idx_profile_views_at ON public.candidate_profile_views USING btree (viewed_at DESC);
CREATE INDEX idx_profile_views_candidate ON public.candidate_profile_views USING btree (candidate_id);
CREATE INDEX idx_profile_views_tenant ON public.candidate_profile_views USING btree (tenant_id);
CREATE INDEX idx_profile_views_viewer ON public.candidate_profile_views USING btree (viewer_person_id);

-- Table: candidate_skills
CREATE TABLE IF NOT EXISTS candidate_skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  proficiency character varying(20),
  years_experience numeric(3,1),
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX candidate_skills_candidate_id_skill_id_key ON public.candidate_skills USING btree (candidate_id, skill_id);
CREATE UNIQUE INDEX candidate_skills_pkey ON public.candidate_skills USING btree (id);
CREATE INDEX idx_candidate_skills_candidate ON public.candidate_skills USING btree (candidate_id);
CREATE INDEX idx_candidate_skills_skill ON public.candidate_skills USING btree (skill_id);

-- Table: candidates
CREATE TABLE IF NOT EXISTS candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  headline character varying(150),
  salary_expectation_min numeric(10,2),
  salary_expectation_max numeric(10,2),
  salary_type character varying(20) DEFAULT 'negotiate'::character varying,
  availability jsonb DEFAULT '{"type": "immediate", "notice_period_days": 0}'::jsonb,
  source character varying(50),
  status character varying(20) NOT NULL DEFAULT 'active'::character varying,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX candidates_person_id_tenant_id_key ON public.candidates USING btree (person_id, tenant_id);
CREATE UNIQUE INDEX candidates_pkey ON public.candidates USING btree (id);
CREATE INDEX idx_candidates_availability ON public.candidates USING gin (availability);
CREATE INDEX idx_candidates_created_by ON public.candidates USING btree (created_by);
CREATE INDEX idx_candidates_person ON public.candidates USING btree (person_id);
CREATE INDEX idx_candidates_status ON public.candidates USING btree (status);
CREATE INDEX idx_candidates_tenant ON public.candidates USING btree (tenant_id);

-- Table: companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  legal_name character varying(200) NOT NULL,
  trading_name character varying(100),
  cnpj character varying(18),
  cnpj_root character varying(15),
  state_registration character varying(20),
  municipal_registration character varying(20),
  company_type_id uuid,
  industry character varying(100),
  phone character varying(20),
  email character varying(255),
  website character varying(255),
  linkedin_url character varying(255),
  logo_url text,
  address jsonb,
  size character varying(20),
  status character varying(20) NOT NULL DEFAULT 'active'::character varying,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE UNIQUE INDEX companies_cnpj_key ON public.companies USING btree (cnpj);
CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);
CREATE INDEX idx_companies_cnpj ON public.companies USING btree (cnpj);
CREATE INDEX idx_companies_created_by ON public.companies USING btree (created_by);
CREATE INDEX idx_companies_status ON public.companies USING btree (status);
CREATE INDEX idx_companies_type ON public.companies USING btree (company_type_id);

-- Table: company_contacts
CREATE TABLE IF NOT EXISTS company_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  person_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  role character varying(100),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX company_contacts_company_id_person_id_tenant_id_key ON public.company_contacts USING btree (company_id, person_id, tenant_id);
CREATE UNIQUE INDEX company_contacts_pkey ON public.company_contacts USING btree (id);
CREATE INDEX idx_company_contacts_company ON public.company_contacts USING btree (company_id);
CREATE INDEX idx_company_contacts_person ON public.company_contacts USING btree (person_id);
CREATE INDEX idx_company_contacts_tenant ON public.company_contacts USING btree (tenant_id);

-- Table: company_relationship_types
CREATE TABLE IF NOT EXISTS company_relationship_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying(20) NOT NULL,
  name character varying(100) NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX company_relationship_types_code_key ON public.company_relationship_types USING btree (code);
CREATE UNIQUE INDEX company_relationship_types_pkey ON public.company_relationship_types USING btree (id);

-- Table: company_relationships
CREATE TABLE IF NOT EXISTS company_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  relationship_type_id uuid NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'active'::character varying,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX company_relationships_company_id_tenant_id_relationship_typ_key ON public.company_relationships USING btree (company_id, tenant_id, relationship_type_id);
CREATE UNIQUE INDEX company_relationships_pkey ON public.company_relationships USING btree (id);
CREATE INDEX idx_company_relationships_company ON public.company_relationships USING btree (company_id);
CREATE INDEX idx_company_relationships_status ON public.company_relationships USING btree (status);
CREATE INDEX idx_company_relationships_tenant ON public.company_relationships USING btree (tenant_id);
CREATE INDEX idx_company_relationships_type ON public.company_relationships USING btree (relationship_type_id);

-- Table: company_types
CREATE TABLE IF NOT EXISTS company_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying(30) NOT NULL,
  name character varying(100) NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX company_types_code_key ON public.company_types USING btree (code);
CREATE UNIQUE INDEX company_types_pkey ON public.company_types USING btree (id);

-- Table: domain_events
CREATE TABLE IF NOT EXISTS domain_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  event_name character varying(100) NOT NULL,
  event_version character varying(20) NOT NULL DEFAULT '1.0'::character varying,
  aggregate_type character varying(50),
  aggregate_id uuid,
  actor_person_id uuid,
  correlation_id uuid,
  causation_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  published_at timestamp with time zone,
  delivery_attempts integer(32) NOT NULL DEFAULT 0,
  last_error text,
  idempotency_key uuid
);

CREATE UNIQUE INDEX domain_events_pkey ON public.domain_events USING btree (id);
CREATE INDEX idx_domain_events_actor ON public.domain_events USING btree (actor_person_id);
CREATE INDEX idx_domain_events_aggregate ON public.domain_events USING btree (aggregate_type, aggregate_id);
CREATE INDEX idx_domain_events_correlation ON public.domain_events USING btree (correlation_id);
CREATE INDEX idx_domain_events_idempotency ON public.domain_events USING btree (idempotency_key);
CREATE INDEX idx_domain_events_name ON public.domain_events USING btree (event_name);
CREATE INDEX idx_domain_events_occurred_at ON public.domain_events USING btree (occurred_at DESC);
CREATE INDEX idx_domain_events_pending ON public.domain_events USING btree (published_at) WHERE (published_at IS NULL);
CREATE INDEX idx_domain_events_tenant ON public.domain_events USING btree (tenant_id);

-- Table: file_access_logs
CREATE TABLE IF NOT EXISTS file_access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL,
  person_id uuid,
  access_type character varying(20) NOT NULL,
  ip_address inet,
  user_agent text,
  status character varying(20) NOT NULL DEFAULT 'success'::character varying,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX file_access_logs_pkey ON public.file_access_logs USING btree (id);
CREATE INDEX idx_file_access_logs_created_at ON public.file_access_logs USING btree (created_at DESC);
CREATE INDEX idx_file_access_logs_file ON public.file_access_logs USING btree (file_id);
CREATE INDEX idx_file_access_logs_person ON public.file_access_logs USING btree (person_id);
CREATE INDEX idx_file_access_logs_status ON public.file_access_logs USING btree (status);

-- Table: files
CREATE TABLE IF NOT EXISTS files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  owner_person_id uuid,
  provider character varying(20) NOT NULL,
  bucket character varying(100) NOT NULL,
  object_key character varying(500) NOT NULL,
  original_name character varying(255),
  mime_type character varying(100),
  size_bytes bigint(64),
  checksum character varying(64),
  visibility character varying(20) NOT NULL DEFAULT 'private'::character varying,
  status character varying(20) NOT NULL DEFAULT 'active'::character varying,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX files_pkey ON public.files USING btree (id);
CREATE UNIQUE INDEX files_provider_bucket_object_key_key ON public.files USING btree (provider, bucket, object_key);
CREATE INDEX idx_files_bucket ON public.files USING btree (bucket);
CREATE INDEX idx_files_checksum ON public.files USING btree (checksum);
CREATE INDEX idx_files_object_key ON public.files USING btree (object_key);
CREATE INDEX idx_files_original_name ON public.files USING btree (original_name);
CREATE INDEX idx_files_owner ON public.files USING btree (owner_person_id);
CREATE INDEX idx_files_provider ON public.files USING btree (provider);
CREATE INDEX idx_files_status ON public.files USING btree (status);
CREATE INDEX idx_files_tenant ON public.files USING btree (tenant_id);
CREATE INDEX idx_files_visibility ON public.files USING btree (visibility);

-- Table: job_matches
CREATE TABLE IF NOT EXISTS job_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  job_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  score numeric(5,2) NOT NULL,
  reasons jsonb NOT NULL DEFAULT '{}'::jsonb,
  algorithm_version character varying(20),
  is_eligible boolean NOT NULL DEFAULT true,
  sent_notification boolean NOT NULL DEFAULT false,
  invalidated_at timestamp with time zone,
  invalidated_reason character varying(100),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_matches_candidate ON public.job_matches USING btree (candidate_id);
CREATE INDEX idx_job_matches_eligible ON public.job_matches USING btree (is_eligible, sent_notification) WHERE ((is_eligible = true) AND (sent_notification = false));
CREATE INDEX idx_job_matches_invalidated ON public.job_matches USING btree (invalidated_at) WHERE (invalidated_at IS NOT NULL);
CREATE INDEX idx_job_matches_job ON public.job_matches USING btree (job_id);
CREATE INDEX idx_job_matches_score ON public.job_matches USING btree (score DESC);
CREATE INDEX idx_job_matches_tenant ON public.job_matches USING btree (tenant_id);
CREATE UNIQUE INDEX job_matches_pkey ON public.job_matches USING btree (id);
CREATE UNIQUE INDEX uk_job_matches_candidate_job ON public.job_matches USING btree (candidate_id, job_id);

-- Table: job_skills
CREATE TABLE IF NOT EXISTS job_skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  required_level character varying(20),
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_skills_job ON public.job_skills USING btree (job_id);
CREATE INDEX idx_job_skills_skill ON public.job_skills USING btree (skill_id);
CREATE UNIQUE INDEX job_skills_job_id_skill_id_key ON public.job_skills USING btree (job_id, skill_id);
CREATE UNIQUE INDEX job_skills_pkey ON public.job_skills USING btree (id);

-- Table: jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  company_relationship_id uuid,
  title character varying(200) NOT NULL,
  slug character varying(200) NOT NULL,
  description text,
  responsibilities text,
  requirements text,
  benefits text,
  salary_min numeric(10,2),
  salary_max numeric(10,2),
  salary_type character varying(20) DEFAULT 'negotiate'::character varying,
  contract_type character varying(20) DEFAULT 'clt'::character varying,
  seniority character varying(20),
  work_hours character varying(50),
  work_mode character varying(20) DEFAULT 'onsite'::character varying,
  city character varying(100),
  state character varying(2),
  location_detail character varying(255),
  status character varying(20) NOT NULL DEFAULT 'draft'::character varying,
  views_count integer(32) NOT NULL DEFAULT 0,
  applications_count integer(32) NOT NULL DEFAULT 0,
  published_at timestamp with time zone,
  expires_at timestamp with time zone,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_company_relationship ON public.jobs USING btree (company_relationship_id);
CREATE INDEX idx_jobs_contract_type ON public.jobs USING btree (contract_type);
CREATE INDEX idx_jobs_published ON public.jobs USING btree (published_at DESC);
CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);
CREATE INDEX idx_jobs_tenant ON public.jobs USING btree (tenant_id);
CREATE INDEX idx_jobs_work_mode ON public.jobs USING btree (work_mode);
CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id);
CREATE UNIQUE INDEX jobs_tenant_id_slug_key ON public.jobs USING btree (tenant_id, slug);

-- Table: notification_deliveries
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL,
  channel USER-DEFINED NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::notification_delivery_status,
  provider character varying(50),
  provider_message_id character varying(255),
  attempts integer(32) NOT NULL DEFAULT 0,
  max_attempts integer(32) NOT NULL DEFAULT 5,
  last_error text,
  next_attempt_at timestamp with time zone,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  failed_at timestamp with time zone,
  skipped_at timestamp with time zone,
  skip_reason character varying(100),
  provider_response jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_deliveries_channel ON public.notification_deliveries USING btree (channel);
CREATE INDEX idx_deliveries_notification ON public.notification_deliveries USING btree (notification_id);
CREATE INDEX idx_deliveries_pending ON public.notification_deliveries USING btree (next_attempt_at) WHERE ((next_attempt_at IS NOT NULL) AND (status = 'pending'::notification_delivery_status));
CREATE INDEX idx_deliveries_provider ON public.notification_deliveries USING btree (provider);
CREATE INDEX idx_deliveries_status ON public.notification_deliveries USING btree (status);
CREATE INDEX idx_deliveries_unique ON public.notification_deliveries USING btree (notification_id, channel);
CREATE UNIQUE INDEX notification_deliveries_pkey ON public.notification_deliveries USING btree (id);

-- Table: notification_preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL,
  notification_type character varying(100) NOT NULL,
  channel USER-DEFINED NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  consented_at timestamp with time zone NOT NULL DEFAULT now(),
  disabled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_prefs_enabled ON public.notification_preferences USING btree (enabled);
CREATE INDEX idx_prefs_person ON public.notification_preferences USING btree (person_id);
CREATE INDEX idx_prefs_type ON public.notification_preferences USING btree (notification_type);
CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (id);
CREATE UNIQUE INDEX uk_preference_person_type_channel ON public.notification_preferences USING btree (person_id, notification_type, channel);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  recipient_person_id uuid NOT NULL,
  notification_type character varying(100) NOT NULL,
  category USER-DEFINED NOT NULL DEFAULT 'transactional'::notification_category,
  priority USER-DEFINED NOT NULL DEFAULT 'normal'::notification_priority,
  title character varying(255) NOT NULL,
  body text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::notification_status,
  source_event_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  scheduled_at timestamp with time zone,
  expires_at timestamp with time zone,
  read_at timestamp with time zone,
  idempotency_key uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_notifications_category ON public.notifications USING btree (category);
CREATE INDEX idx_notifications_expires ON public.notifications USING btree (expires_at);
CREATE INDEX idx_notifications_idempotency ON public.notifications USING btree (idempotency_key);
CREATE INDEX idx_notifications_priority ON public.notifications USING btree (priority);
CREATE INDEX idx_notifications_recipient ON public.notifications USING btree (recipient_person_id);
CREATE INDEX idx_notifications_scheduled ON public.notifications USING btree (scheduled_at) WHERE (scheduled_at IS NOT NULL);
CREATE INDEX idx_notifications_source_event ON public.notifications USING btree (source_event_id);
CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);
CREATE INDEX idx_notifications_tenant ON public.notifications USING btree (tenant_id);
CREATE INDEX idx_notifications_type ON public.notifications USING btree (notification_type);
CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

-- Table: people
CREATE TABLE IF NOT EXISTS people (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid,
  full_name character varying(150) NOT NULL,
  email character varying(255),
  social_name character varying(150),
  cpf character varying(14),
  birth_date date,
  gender character varying(20),
  status character varying(20) NOT NULL DEFAULT 'active'::character varying,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_people_auth_user_id ON public.people USING btree (auth_user_id);
CREATE INDEX idx_people_cpf ON public.people USING btree (cpf);
CREATE UNIQUE INDEX people_auth_user_id_key ON public.people USING btree (auth_user_id);
CREATE UNIQUE INDEX people_cpf_key ON public.people USING btree (cpf);
CREATE UNIQUE INDEX people_email_key ON public.people USING btree (email);
CREATE UNIQUE INDEX people_pkey ON public.people USING btree (id);

-- Table: permissions
CREATE TABLE IF NOT EXISTS permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  description text,
  module character varying(50),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_permissions_module ON public.permissions USING btree (module);
CREATE INDEX idx_permissions_name ON public.permissions USING btree (name);
CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);
CREATE UNIQUE INDEX permissions_pkey ON public.permissions USING btree (id);

-- Table: role_assignments
CREATE TABLE IF NOT EXISTS role_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL,
  role_id uuid NOT NULL,
  tenant_id uuid,
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

CREATE INDEX idx_role_assignments_person ON public.role_assignments USING btree (person_id);
CREATE INDEX idx_role_assignments_role ON public.role_assignments USING btree (role_id);
CREATE INDEX idx_role_assignments_tenant ON public.role_assignments USING btree (tenant_id);
CREATE UNIQUE INDEX role_assignments_pkey ON public.role_assignments USING btree (id);
CREATE UNIQUE INDEX uq_role_assignments_global ON public.role_assignments USING btree (person_id, role_id) WHERE (tenant_id IS NULL);
CREATE UNIQUE INDEX uq_role_assignments_tenant ON public.role_assignments USING btree (person_id, role_id, tenant_id) WHERE (tenant_id IS NOT NULL);

-- Table: role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid
);

CREATE INDEX idx_role_permissions_permission ON public.role_permissions USING btree (permission_id);
CREATE INDEX idx_role_permissions_role ON public.role_permissions USING btree (role_id);
CREATE UNIQUE INDEX role_permissions_pkey ON public.role_permissions USING btree (id);
CREATE UNIQUE INDEX role_permissions_role_id_permission_id_key ON public.role_permissions USING btree (role_id, permission_id);

-- Table: role_resource_permissions
CREATE TABLE IF NOT EXISTS role_resource_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  resource character varying(100) NOT NULL,
  action character varying(20) NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_role_resource_permission_resource ON public.role_resource_permissions USING btree (resource);
CREATE INDEX idx_role_resource_permission_role ON public.role_resource_permissions USING btree (role_id);
CREATE UNIQUE INDEX role_resource_permissions_pkey ON public.role_resource_permissions USING btree (id);
CREATE UNIQUE INDEX uk_role_resource_action ON public.role_resource_permissions USING btree (role_id, resource, action);

-- Table: roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(50) NOT NULL,
  is_global boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_roles_is_global ON public.roles USING btree (is_global);
CREATE INDEX idx_roles_name ON public.roles USING btree (name);
CREATE UNIQUE INDEX roles_is_global_name_key ON public.roles USING btree (is_global, name);
CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

-- Table: skills
CREATE TABLE IF NOT EXISTS skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying(50),
  name character varying(150) NOT NULL,
  slug character varying(150),
  category character varying(50),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_skills_category ON public.skills USING btree (category);
CREATE INDEX idx_skills_slug ON public.skills USING btree (slug);
CREATE UNIQUE INDEX skills_code_key ON public.skills USING btree (code);
CREATE UNIQUE INDEX skills_pkey ON public.skills USING btree (id);
CREATE UNIQUE INDEX skills_slug_key ON public.skills USING btree (slug);

-- Table: talent_pool_memberships
CREATE TABLE IF NOT EXISTS talent_pool_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'active'::talent_pool_status,
  source USER-DEFINED NOT NULL,
  consent_status USER-DEFINED NOT NULL DEFAULT 'granted'::consent_status,
  consented_at timestamp with time zone NOT NULL DEFAULT now(),
  consent_source character varying(50),
  consent_version character varying(20),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  removed_at timestamp with time zone,
  removal_reason character varying(100),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_talent_pool_active ON public.talent_pool_memberships USING btree (status, consent_status) WHERE ((status = 'active'::talent_pool_status) AND (consent_status = 'granted'::consent_status));
CREATE INDEX idx_talent_pool_candidate ON public.talent_pool_memberships USING btree (candidate_id);
CREATE INDEX idx_talent_pool_consent ON public.talent_pool_memberships USING btree (consent_status);
CREATE INDEX idx_talent_pool_joined ON public.talent_pool_memberships USING btree (joined_at DESC);
CREATE INDEX idx_talent_pool_source ON public.talent_pool_memberships USING btree (source);
CREATE INDEX idx_talent_pool_status ON public.talent_pool_memberships USING btree (status);
CREATE INDEX idx_talent_pool_tenant ON public.talent_pool_memberships USING btree (tenant_id);
CREATE UNIQUE INDEX talent_pool_memberships_pkey ON public.talent_pool_memberships USING btree (id);
CREATE UNIQUE INDEX uk_talent_pool_candidate_tenant ON public.talent_pool_memberships USING btree (candidate_id, tenant_id);

-- Table: tenant_memberships
CREATE TABLE IF NOT EXISTS tenant_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  person_id uuid NOT NULL,
  membership_role character varying(20) NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  status character varying(20) NOT NULL DEFAULT 'active'::character varying,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  left_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_memberships_person ON public.tenant_memberships USING btree (person_id);
CREATE INDEX idx_tenant_memberships_role ON public.tenant_memberships USING btree (membership_role);
CREATE INDEX idx_tenant_memberships_tenant ON public.tenant_memberships USING btree (tenant_id);
CREATE UNIQUE INDEX tenant_memberships_pkey ON public.tenant_memberships USING btree (id);
CREATE UNIQUE INDEX tenant_memberships_tenant_id_person_id_key ON public.tenant_memberships USING btree (tenant_id, person_id);

-- Table: tenants
CREATE TABLE IF NOT EXISTS tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(200) NOT NULL,
  slug character varying(100) NOT NULL,
  plan character varying(20) NOT NULL DEFAULT 'free'::character varying,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  status character varying(20) NOT NULL DEFAULT 'active'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_slug ON public.tenants USING btree (slug);
CREATE INDEX idx_tenants_status ON public.tenants USING btree (status);
CREATE UNIQUE INDEX tenants_pkey ON public.tenants USING btree (id);
CREATE UNIQUE INDEX tenants_slug_key ON public.tenants USING btree (slug);

-- Functions
-- can_access_tenant (FUNCTION)

  select exists (
    select 1
    from public.tenant_memberships tm
    join public.people p on tm.person_id = p.id
    where p.auth_user_id = auth.uid()
      and tm.tenant_id = p_tenant_id
      and tm.status = 'active'
  )
  or public.user_has_permission(auth.uid(), 'tenants', 'read', null)


-- can_manage_role_assignment (FUNCTION)

  select exists (
    select 1 from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = auth.uid()
      and r.name = 'admin_master'
      and r.is_global = true
    union all
    select 1 from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = auth.uid()
      and r.name = 'tenant_admin'
      and r.is_global = false
      and ra.tenant_id = can_manage_role_assignment.target_tenant_id
  )


-- capture_application_profile_snapshot (FUNCTION)

declare
  v_candidate jsonb;
begin
  -- Se já foi fornecido um snapshot, não sobrescrever
  if new.profile_snapshot is not null then
    return new;
  end if;

  -- Captura o perfil do candidato no momento da candidatura
  select
    jsonb_build_object(
      'candidate_id', c.id,
      'headline', c.headline,
      'skills', (
        select jsonb_agg(
          jsonb_build_object(
            'name', s.name,
            'proficiency', cs.proficiency,
            'years_experience', cs.years_experience
          )
        )
        from public.candidate_skills cs
        join public.skills s on s.id = cs.skill_id
        where cs.candidate_id = c.id
      ),
      'experience_count', (
        select count(*) from public.candidate_experiences
        where candidate_id = c.id
      ),
      'education_count', (
        select count(*) from public.candidate_education
        where candidate_id = c.id
      )
    )
  into v_candidate
  from public.candidates c
  where c.id = new.candidate_id;

  new.profile_snapshot := v_candidate;
  return new;
end;


-- create_default_notification_preferences (FUNCTION)

begin
  -- Transactional defaults
  insert into public.notification_preferences (person_id, notification_type, channel, enabled)
  values
    -- Application process (transacional)
    (p_person_id, 'application.received', 'in_app', true),
    (p_person_id, 'application.received', 'email', true),
    (p_person_id, 'application.received', 'whatsapp', false),

    -- Status changes
    (p_person_id, 'application.status_changed', 'in_app', true),
    (p_person_id, 'application.status_changed', 'email', true),
    (p_person_id, 'application.status_changed', 'whatsapp', false),

    -- Interview scheduling
    (p_person_id, 'interview.scheduled', 'in_app', true),
    (p_person_id, 'interview.scheduled', 'email', true),
    (p_person_id, 'interview.scheduled', 'whatsapp', true),

    -- Job matching
    (p_person_id, 'job.matched', 'in_app', true),
    (p_person_id, 'job.matched', 'email', false),
    (p_person_id, 'job.matched', 'whatsapp', false),

    -- System notifications
    (p_person_id, 'system', 'in_app', true),
    (p_person_id, 'system', 'email', true),
    (p_person_id, 'system', 'whatsapp', false),

    -- Marketing (opt-out by default)
    (p_person_id, 'marketing', 'in_app', false),
    (p_person_id, 'marketing', 'email', false),
    (p_person_id, 'marketing', 'whatsapp', false)
  on conflict (person_id, notification_type, channel) do nothing;
end;


-- create_notification (FUNCTION)

declare
  v_notification_id uuid;
  v_idempotency_key uuid;
begin
  -- Generate idempotency key: hash of (type, recipient, scheduled_date)
  v_idempotency_key := md5(p_notification_type || p_recipient_person_id::text || coalesce(p_scheduled_at::text, 'now'))::uuid;

  -- Check if notification already exists (idempotent creation)
  select id into v_notification_id
  from public.notifications
  where idempotency_key = v_idempotency_key;

  if v_notification_id is not null then
    return v_notification_id;
  end if;

  insert into public.notifications (
    tenant_id,
    recipient_person_id,
    notification_type,
    category,
    priority,
    title,
    body,
    data,
    source_event_id,
    created_by,
    scheduled_at,
    expires_at,
    idempotency_key
  ) values (
    p_tenant_id,
    p_recipient_person_id,
    p_notification_type,
    p_category,
    p_priority,
    p_title,
    p_body,
    p_data,
    p_source_event_id,
    p_created_by,
    p_scheduled_at,
    p_expires_at,
    v_idempotency_key
  ) returning id into v_notification_id;

  return v_notification_id;
end;


-- create_notification_delivery (FUNCTION)

declare
  v_delivery_id uuid;
begin
  -- Check if delivery already exists for this notification+channel
  select id into v_delivery_id
  from public.notification_deliveries
  where notification_id = p_notification_id
    and channel = p_channel;

  if v_delivery_id is not null then
    return v_delivery_id;
  end if;

  insert into public.notification_deliveries (
    notification_id,
    channel,
    status,
    provider,
    provider_message_id,
    metadata
  ) values (
    p_notification_id,
    p_channel,
    'pending',
    p_provider,
    p_provider_message_id,
    p_metadata
  ) returning id into v_delivery_id;

  return v_delivery_id;
end;


-- emit_application_created_event (FUNCTION)

begin
  perform public.emit_domain_event(
    new.tenant_id,
    'application.created',
    'application',
    new.id,
    jsonb_build_object(
      'application_id', new.id,
      'candidate_id', new.candidate_id,
      'job_id', new.job_id,
      'source', new.source,
      'match_score', new.match_score,
      'applied_at', new.applied_at
    ),
    new.created_by
  );

  return new;
end;


-- emit_application_status_changed_event (FUNCTION)

begin
  perform public.emit_domain_event(
    (SELECT tenant_id FROM public.applications WHERE id = new.application_id),
    'application.status_changed',
    'application',
    new.application_id,
    jsonb_build_object(
      'application_id', new.application_id,
      'previous_stage', new.previous_stage,
      'stage', new.stage,
      'reason', new.reason,
      'changed_by', new.changed_by,
      'changed_at', new.changed_at
    ),
    new.changed_by
  );

  return new;
end;


-- emit_candidate_created_event (FUNCTION)

begin
  perform public.emit_domain_event(
    new.tenant_id,
    'candidate.created',
    'candidate',
    new.id,
    jsonb_build_object(
      'candidate_id', new.id,
      'person_id', new.person_id,
      'tenant_id', new.tenant_id,
      'source', new.source,
      'created_at', new.created_at
    ),
    new.created_by
  );

  return new;
end;


-- emit_domain_event (FUNCTION)

declare
  v_event_id uuid;
  v_correlation_id uuid;
begin
  -- Generate correlation_id if not exists (for tracing)
  v_correlation_id := gen_random_uuid();

  insert into public.domain_events (
    tenant_id,
    event_name,
    event_version,
    aggregate_type,
    aggregate_id,
    actor_person_id,
    correlation_id,
    payload,
    occurred_at
  ) values (
    p_tenant_id,
    p_event_name,
    '1.0',
    p_aggregate_type,
    p_aggregate_id,
    p_actor_person_id,
    v_correlation_id,
    p_payload,
    now()
  ) returning id into v_event_id;

  return v_event_id;
end;


-- emit_job_match_found_event (FUNCTION)

begin
  -- Only emit on high match or new eligible match
  if new.score >= 80 and new.sent_notification = false and new.invalidated_at is null then
    perform public.emit_domain_event(
      new.tenant_id,
      'job.match_found',
      'job_match',
      new.id,
      jsonb_build_object(
        'job_match_id', new.id,
        'candidate_id', new.candidate_id,
        'job_id', new.job_id,
        'score', new.score,
        'reasons', new.reasons
      ),
      null  -- system-generated
    );
  end if;

  return new;
end;


-- emit_job_published_event (FUNCTION)

begin
  -- Only emit when status transitions to 'published'
  if new.status = 'published' and (old.status is null or old.status != 'published') then
    perform public.emit_domain_event(
      new.tenant_id,
      'job.published',
      'job',
      new.id,
      jsonb_build_object(
        'job_id', new.id,
        'title', new.title,
        'company_relationship_id', new.company_relationship_id,
        'published_at', new.published_at,
        'match_skills', (
          select jsonb_agg(s.name)
          from public.job_skills js
          join public.skills s on s.id = js.skill_id
          where js.job_id = new.id
        )
      ),
      new.created_by
    );
  end if;

  return new;
end;


-- emit_talent_pool_joined_event (FUNCTION)

begin
  perform public.emit_domain_event(
    new.tenant_id,
    'talent_pool.joined',
    'talent_pool_membership',
    new.id,
    jsonb_build_object(
      'membership_id', new.id,
      'candidate_id', new.candidate_id,
      'source', new.source,
      'joined_at', new.joined_at
    ),
    new.created_by
  );

  return new;
end;


-- get_active_candidates_for_matching (FUNCTION)

  select
    tpm.candidate_id,
    tpm.id as membership_id,
    jm.score as match_score,
    c.person_id,
    cp.desired_roles,
    (select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name))
     from public.candidate_skills cs
     join public.skills s on s.id = cs.skill_id
     where cs.candidate_id = tpm.candidate_id) as skills
  from public.talent_pool_memberships tpm
  join public.candidates c on c.id = tpm.candidate_id
  left join public.job_matches jm on jm.candidate_id = tpm.candidate_id and jm.job_id = p_job_id
  left join public.candidate_preferences cp on cp.candidate_id = tpm.candidate_id
  where tpm.tenant_id = p_tenant_id
    and tpm.status = 'active'
    and tpm.consent_status = 'granted'
    and (jm.is_eligible is null or jm.is_eligible = true)
  order by jm.score desc nulls last, tpm.joined_at desc
  limit p_limit


-- get_due_deliveries (FUNCTION)

  select
    d.id as delivery_id,
    n.id as notification_id,
    n.tenant_id,
    n.recipient_person_id,
    d.channel,
    n.notification_type,
    n.title,
    n.body,
    n.data,
    n.category,
    n.priority,
    d.attempts,
    d.max_attempts
  from public.notification_deliveries d
  join public.notifications n on n.id = d.notification_id
  where d.status = 'pending'
    and (d.next_attempt_at is null or d.next_attempt_at <= now())
    and (n.expires_at is null or n.expires_at > now())
    and n.status = 'pending'
  order by n.priority desc, n.created_at asc
  limit p_limit


-- get_pending_deliveries (FUNCTION)

  select
    d.id as delivery_id,
    n.id as notification_id,
    n.tenant_id,
    n.recipient_person_id,
    n.notification_type,
    n.title,
    n.body,
    n.data,
    n.category,
    n.priority,
    d.provider,
    d.attempts,
    d.max_attempts,
    d.last_error
  from public.notification_deliveries d
  join public.notifications n on n.id = d.notification_id
  where d.channel = p_channel
    and d.status = 'pending'
    and (d.next_attempt_at is null or d.next_attempt_at <= now())
    and (n.expires_at is null or n.expires_at > now())
    and n.status = 'pending'
  order by n.priority desc, n.created_at asc
  limit p_limit


-- get_pending_domain_events (FUNCTION)

  select
    id, event_name, tenant_id, aggregate_type, aggregate_id,
    payload, occurred_at, idempotency_key
  from public.domain_events
  where published_at is null
  order by occurred_at asc
  limit p_limit


-- handle_auth_user_deleted (FUNCTION)

begin
  -- Clear auth_user_id so person becomes unlinked (not deleted)
  -- This preserves business data if auth user is removed
  update public.people
  set auth_user_id = null
  where auth_user_id = old.id;

  return old;
end;


-- handle_auth_user_updated (FUNCTION)

begin
  -- Only sync email; preserve business-controlled fields
  if new.email is distinct from old.email then
    update public.people
    set email = new.email
    where auth_user_id = new.id;
  end if;

  return new;
end;


-- handle_new_auth_user (FUNCTION)

declare
  v_meta jsonb;
  v_full_name text;
  v_email text;
begin
  -- Extract metadata from auth.users (raw_user_meta / raw_app_meta)
  v_meta := coalesce(new.raw_user_meta, '{}'::jsonb);
  v_email := new.email;

  -- Determine name: prefer full_name from metadata, fallback to email prefix
  v_full_name := v_meta ->> 'full_name';
  if v_full_name is null or v_full_name = '' then
    v_full_name := v_meta ->> 'name';
  end if;
  if v_full_name is null or v_full_name = '' then
    v_full_name := split_part(v_email, '@', 1);
  end if;

  -- Idempotent: check if people already exists for this auth.uid
  -- This prevents duplicates if trigger fires multiple times
  if exists (select 1 from public.people where auth_user_id = new.id) then
    -- Person exists — update email/name if changed (controlled sync)
    update public.people
    set email = v_email,
        full_name = v_full_name
    where auth_user_id = new.id
      and (email is distinct from v_email
           or full_name is distinct from v_full_name);
  else
    -- Person does not exist — create new business entity
    insert into public.people (id, auth_user_id, full_name, email, status)
    values (
      gen_random_uuid(),
      new.id,
      v_full_name,
      v_email,
      'active'
    );
  end if;

  return new;
end;


-- is_admin_master (FUNCTION)

  select exists (
    select 1
    from public.people p
    join public.role_assignments ra on ra.person_id = p.id
    join public.roles r on r.id = ra.role_id
    where p.auth_user_id = $1
      and r.name = 'admin_master'
      and r.is_global = true
  )


-- is_channel_enabled (FUNCTION)

  select enabled
  from public.notification_preferences
  where person_id = p_person_id
    and notification_type = p_notification_type
    and channel = p_channel


-- is_frontend_safe_role (FUNCTION)

  select auth.role() = 'authenticated'


-- join_talent_pool (FUNCTION)

declare
  v_membership_id uuid;
  v_existing_id uuid;
begin
  -- Check if already in pool for this tenant
  select id into v_existing_id
  from public.talent_pool_memberships
  where candidate_id = p_candidate_id
    and tenant_id = p_tenant_id;

  if v_existing_id is not null then
    -- Check if it was removed/paused — restore it
    update public.talent_pool_memberships
    set status = 'active',
        consent_status = 'granted',
        consented_at = now(),
        consent_source = p_consent_source,
        consent_version = p_consent_version,
        source = p_source,
        joined_at = now(),
        removed_at = null,
        removal_reason = null,
        updated_at = now()
    where id = v_existing_id
    returning id into v_membership_id;

    return v_membership_id;
  end if;

  -- Validate tenant match with candidate
  if (select tenant_id from public.candidates where id = p_candidate_id) != p_tenant_id then
    raise exception 'Candidate tenant mismatch';
  end if;

  insert into public.talent_pool_memberships (
    candidate_id,
    tenant_id,
    status,
    source,
    consent_status,
    consented_at,
    consent_source,
    consent_version,
    joined_at,
    created_by
  ) values (
    p_candidate_id,
    p_tenant_id,
    'active',
    p_source,
    'granted',
    now(),
    p_consent_source,
    p_consent_version,
    now(),
    p_created_by
  ) returning id into v_membership_id;

  return v_membership_id;
end;


-- mark_delivery_delivered (FUNCTION)

begin
  update public.notification_deliveries
  set status = 'delivered',
      delivered_at = now()
  where id = p_delivery_id;
end;


-- mark_delivery_failed (FUNCTION)

begin
  update public.notification_deliveries
  set status = 'failed',
      last_error = p_error,
      failed_at = now(),
      attempts = attempts + 1,
      next_attempt_at = p_next_attempt
  where id = p_delivery_id;
end;


-- mark_delivery_sent (FUNCTION)

begin
  update public.notification_deliveries
  set status = 'sent',
      sent_at = now(),
      provider_message_id = coalesce(p_provider_message_id, provider_message_id)
  where id = p_delivery_id;
end;


-- mark_event_failed (FUNCTION)

begin
  update public.domain_events
  set last_error = p_error,
      delivery_attempts = delivery_attempts + 1
  where id = p_event_id;
end;


-- mark_event_published (FUNCTION)

begin
  update public.domain_events
  set published_at = now(),
      delivery_attempts = delivery_attempts + 1
  where id = p_event_id
    and published_at is null;
end;


-- mark_notification_read (FUNCTION)

begin
  update public.notifications
  set status = 'sent',
      read_at = now()
  where id = p_notification_id
    and status in ('pending', 'sent');
end;


-- pause_talent_pool (FUNCTION)

begin
  update public.talent_pool_memberships
  set status = 'paused',
      updated_at = now()
  where id = p_membership_id
    and status = 'active';

  perform public.emit_domain_event(
    (select tenant_id from public.talent_pool_memberships where id = p_membership_id),
    'talent_pool.paused',
    'talent_pool_membership',
    p_membership_id,
    jsonb_build_object('reason', p_reason),
    null
  );
end;


-- prevent_event_modification (FUNCTION)

begin
  -- Only allow updating published_at, delivery_attempts, last_error
  if old.payload is distinct from new.payload then
    raise exception 'domain_events payload is immutable';
  end if;
  if old.event_name is distinct from new.event_name then
    raise exception 'domain_events event_name is immutable';
  end if;
  if old.tenant_id is distinct from new.tenant_id then
    raise exception 'domain_events tenant_id is immutable';
  end if;
  if old.event_version is distinct from new.event_version then
    raise exception 'domain_events event_version is immutable';
  end if;
  if old.occurred_at is distinct from new.occurred_at then
    raise exception 'domain_events occurred_at is immutable';
  end if;

  return new;
end;


-- prevent_history_modification (FUNCTION)

begin
  raise exception 'application_status_history is immutable — use INSERT to add new status';
  return null;
end;


-- remove_from_talent_pool (FUNCTION)

begin
  update public.talent_pool_memberships
  set status = 'removed',
      consent_status = 'revoked',
      removed_at = now(),
      removal_reason = p_reason
  where id = p_membership_id;

  -- Emit talent_pool.removed event
  perform public.emit_domain_event(
    (select tenant_id from public.talent_pool_memberships where id = p_membership_id),
    'talent_pool.removed',
    'talent_pool_membership',
    p_membership_id,
    jsonb_build_object(
      'membership_id', p_membership_id,
      'removal_reason', p_reason,
      'removed_at', now()
    ),
    null  -- system-generated
  );
end;


-- skip_expired_notification_deliveries (FUNCTION)

begin
  if new.expires_at is not null and now() >= new.expires_at then
    if new.status = 'sent' then
      new.status := 'expired';
    end if;
  end if;
  return new;
end;


-- sync_application_current_stage (FUNCTION)

begin
  update public.applications
  set current_stage = new.stage,
      updated_at = now()
  where id = new.application_id;

  return new;
end;


-- update_updated_at (FUNCTION)

begin
  new.updated_at = now();
  return new;
end;


-- user_has_permission (FUNCTION)

declare
  v_person_id uuid;
  v_has_perm boolean;
begin
  -- Get person from auth uid
  select id into v_person_id
  from public.people
  where auth_user_id = p_user_auth_uid;

  if v_person_id is null then
    return false;
  end if;

  -- Check global role (admin_master bypasses tenant)
  if exists (
    select 1
    from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    join public.role_resource_permissions rrp on rrp.role_id = r.id
    where ra.person_id = v_person_id
      and r.is_global = true
      and r.is_active = true
      and rrp.resource = p_resource
      and rrp.action = p_action
      and rrp.allowed = true
      and (ra.expires_at is null or ra.expires_at > now())
  ) then
    return true;
  end if;

  -- Check tenant-scoped role
  if p_tenant_id is not null then
    if exists (
      select 1
      from public.role_assignments ra
      join public.roles r on r.id = ra.role_id
      join public.role_resource_permissions rrp on rrp.role_id = r.id
      join public.tenant_memberships tm on tm.tenant_id = ra.tenant_id
      where ra.person_id = v_person_id
        and r.is_global = false
        and r.is_active = true
        and rrp.resource = p_resource
        and rrp.action = p_action
        and rrp.allowed = true
        and tm.tenant_id = p_tenant_id
        and (ra.expires_at is null or ra.expires_at > now())
    ) then
      return true;
    end if;
  end if;

  return false;
end;


-- validate_candidate_preferences_update (FUNCTION)

begin
  -- Ensure tenant ownership is consistent
  if (select tenant_id from public.candidates where id = new.candidate_id) is null then
    raise exception 'Invalid candidate_id';
  end if;

  return new;
end;


-- validate_talent_pool_consent (FUNCTION)

begin
  if new.status = 'active' and new.consent_status != 'granted' then
    raise exception 'Active talent_pool_membership requires consent_status = granted';
  end if;
  if new.status = 'removed' and new.removed_at is null then
    new.removed_at := now();
  end if;
  if new.status = 'active' and new.consent_status = 'revoked' then
    raise exception 'Cannot set active with revoked consent';
  end if;
  return new;
end;


-- Triggers
-- Trigger: application_status_changed_event on application_status_history
-- AFTER INSERT
EXECUTE FUNCTION emit_application_status_changed_event()

-- Trigger: prevent_history_delete on application_status_history
-- BEFORE DELETE
EXECUTE FUNCTION prevent_history_modification()

-- Trigger: prevent_history_update on application_status_history
-- BEFORE UPDATE
EXECUTE FUNCTION prevent_history_modification()

-- Trigger: sync_application_current_stage on application_status_history
-- AFTER INSERT
EXECUTE FUNCTION sync_application_current_stage()

-- Trigger: application_created_event on applications
-- AFTER INSERT
EXECUTE FUNCTION emit_application_created_event()

-- Trigger: capture_profile_snapshot on applications
-- BEFORE INSERT
EXECUTE FUNCTION capture_application_profile_snapshot()

-- Trigger: update_applications_updated_at on applications
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_candidate_prefs_updated_at on candidate_preferences
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: validate_candidate_preferences_update on candidate_preferences
-- BEFORE UPDATE
EXECUTE FUNCTION validate_candidate_preferences_update()

-- Trigger: candidate_created_event on candidates
-- AFTER INSERT
EXECUTE FUNCTION emit_candidate_created_event()

-- Trigger: update_candidates_updated_at on candidates
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_companies_updated_at on companies
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_company_contacts_updated_at on company_contacts
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_company_relationship_types_updated_at on company_relationship_types
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_company_relationships_updated_at on company_relationships
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_company_types_updated_at on company_types
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: prevent_event_delete on domain_events
-- BEFORE DELETE
EXECUTE FUNCTION prevent_history_modification()

-- Trigger: prevent_event_update on domain_events
-- BEFORE UPDATE
EXECUTE FUNCTION prevent_event_modification()

-- Trigger: update_domain_events_updated_at on domain_events
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: log_file_access_insert on file_access_logs
-- AFTER INSERT
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_files_updated_at on files
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: job_match_found_event on job_matches
-- AFTER INSERT
EXECUTE FUNCTION emit_job_match_found_event()

-- Trigger: update_job_matches_updated_at on job_matches
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_job_skills_updated_at on job_skills
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: job_published_event on jobs
-- AFTER UPDATE
EXECUTE FUNCTION emit_job_published_event()

-- Trigger: update_jobs_updated_at on jobs
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_notification_deliveries_updated_at on notification_deliveries
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_notification_preferences_updated_at on notification_preferences
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_people_updated_at on people
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_permissions_updated_at on permissions
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_roles_updated_at on roles
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_skills_updated_at on skills
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: talent_pool_joined_event on talent_pool_memberships
-- AFTER INSERT
EXECUTE FUNCTION emit_talent_pool_joined_event()

-- Trigger: update_talent_pool_updated_at on talent_pool_memberships
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: validate_talent_pool_consent on talent_pool_memberships
-- BEFORE UPDATE
EXECUTE FUNCTION validate_talent_pool_consent()

-- Trigger: validate_talent_pool_consent on talent_pool_memberships
-- BEFORE INSERT
EXECUTE FUNCTION validate_talent_pool_consent()

-- Trigger: update_tenant_memberships_updated_at on tenant_memberships
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- Trigger: update_tenants_updated_at on tenants
-- BEFORE UPDATE
EXECUTE FUNCTION update_updated_at()

-- RLS Policies
-- Policy: Application snapshots manageable by tenant recruiters on application_profile_snapshots
-- Command: ALL, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((applications a
     JOIN tenant_memberships tm ON ((tm.tenant_id = a.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (a.id = application_profile_snapshots.application_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((EXISTS ( SELECT 1
   FROM ((applications a
     JOIN tenant_memberships tm ON ((tm.tenant_id = a.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (a.id = application_profile_snapshots.application_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Application snapshots visible to tenant members on application_profile_snapshots
-- Command: SELECT, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((applications a
     JOIN tenant_memberships tm ON ((tm.tenant_id = a.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (a.id = application_profile_snapshots.application_id)))) OR (auth.role() = 'service_role'::text))

-- Policy: Profile snapshots: tenant members can see on application_profile_snapshots
-- Command: SELECT, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((applications a
     JOIN tenant_memberships tm ON ((tm.tenant_id = a.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((a.id = application_profile_snapshots.application_id) AND (p.auth_user_id = auth.uid())))) OR (auth.role() = 'service_role'::text))

-- Policy: Application history manageable by tenant recruiters on application_status_history
-- Command: ALL, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((applications a
     JOIN tenant_memberships tm ON ((tm.tenant_id = a.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (a.id = application_status_history.application_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((EXISTS ( SELECT 1
   FROM ((applications a
     JOIN tenant_memberships tm ON ((tm.tenant_id = a.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (a.id = application_status_history.application_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Application history visible to tenant members on application_status_history
-- Command: SELECT, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((applications a
     JOIN tenant_memberships tm ON ((tm.tenant_id = a.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (a.id = application_status_history.application_id)))) OR (auth.role() = 'service_role'::text))

-- Policy: Status history: tenant members can see on application_status_history
-- Command: SELECT, Roles: {public}
-- USING: ((( SELECT c.tenant_id
   FROM (candidates c
     JOIN applications a ON ((a.candidate_id = c.id)))
  WHERE (a.id = application_status_history.application_id)) IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Applications manageable by tenant recruiters on applications
-- Command: ALL, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Applications visible to tenant members on applications
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Applications: candidate sees own on applications
-- Command: SELECT, Roles: {public}
-- USING: ((candidate_id IN ( SELECT c.id
   FROM (candidates c
     JOIN people p ON ((c.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Applications: visible to tenant members on applications
-- Command: SELECT, Roles: {public}
-- USING: ((( SELECT c.tenant_id
   FROM candidates c
  WHERE (c.id = applications.candidate_id)) IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'applications'::character varying, 'read'::character varying, NULL::uuid))

-- Policy: Candidate preferences visible to owner/service on candidate_preferences
-- Command: ALL, Roles: {public}
-- USING: ((candidate_id IN ( SELECT c.id
   FROM ((candidates c
     JOIN people p ON ((p.id = c.person_id)))
     JOIN tenant_memberships tm ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((candidate_id IN ( SELECT c.id
   FROM ((candidates c
     JOIN people p ON ((p.id = c.person_id)))
     JOIN tenant_memberships tm ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Profile views visible to tenant members on candidate_profile_views
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Candidate skills manageable by tenant admins on candidate_skills
-- Command: ALL, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((candidates c
     JOIN tenant_memberships tm ON ((tm.tenant_id = c.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (c.id = candidate_skills.candidate_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((EXISTS ( SELECT 1
   FROM ((candidates c
     JOIN tenant_memberships tm ON ((tm.tenant_id = c.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (c.id = candidate_skills.candidate_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Candidate skills visible to tenant members on candidate_skills
-- Command: SELECT, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((candidates c
     JOIN tenant_memberships tm ON ((tm.tenant_id = c.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (c.id = candidate_skills.candidate_id)))) OR (auth.role() = 'service_role'::text))

-- Policy: Candidates manageable by tenant admins on candidates
-- Command: ALL, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Candidates visible to tenant members on candidates
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Candidates: candidate sees own on candidates
-- Command: SELECT, Roles: {public}
-- USING: ((person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Candidates: tenant members can create/update on candidates
-- Command: INSERT, Roles: {public}
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'candidates'::character varying, 'create'::character varying, NULL::uuid))

-- Policy: Candidates: tenant members can update on candidates
-- Command: UPDATE, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'candidates'::character varying, 'update'::character varying, NULL::uuid))

-- Policy: Candidates: visible to tenant members on candidates
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'candidates'::character varying, 'read'::character varying, NULL::uuid))

-- Policy: Companies manageable by tenant members on companies
-- Command: ALL, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((company_relationships cr
     JOIN people p ON ((p.auth_user_id = auth.uid())))
     JOIN tenant_memberships tm ON (((tm.tenant_id = cr.tenant_id) AND (tm.person_id = p.id))))
  WHERE ((cr.company_id = companies.id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((EXISTS ( SELECT 1
   FROM ((company_relationships cr
     JOIN people p ON ((p.auth_user_id = auth.uid())))
     JOIN tenant_memberships tm ON (((tm.tenant_id = cr.tenant_id) AND (tm.person_id = p.id))))
  WHERE ((cr.company_id = companies.id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Companies visible to authenticated on companies
-- Command: SELECT, Roles: {public}
-- USING: (auth.role() = 'authenticated'::text)

-- Policy: Companies: tenant_admin can create on companies
-- Command: INSERT, Roles: {public}
-- WITH CHECK: user_has_permission(auth.uid(), 'companies'::character varying, 'create'::character varying, ( SELECT tenants.id
   FROM tenants
  WHERE (tenants.id IN ( SELECT tm.tenant_id
           FROM (tenant_memberships tm
             JOIN people p ON ((p.id = tm.person_id)))
          WHERE (p.auth_user_id = auth.uid())))))

-- Policy: Companies: visible to tenant members on companies
-- Command: SELECT, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM (tenant_memberships tm
     JOIN company_relationships cr ON ((cr.tenant_id = tm.tenant_id)))
  WHERE ((cr.company_id = companies.id) AND (tm.person_id = ( SELECT people.id
           FROM people
          WHERE (people.auth_user_id = auth.uid())))))) OR user_has_permission(auth.uid(), 'companies'::character varying, 'read'::character varying, NULL::uuid))

-- Policy: Company contacts manageable by tenant admins on company_contacts
-- Command: ALL, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Company contacts visible to tenant members on company_contacts
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Company relationship types manageable by admins on company_relationship_types
-- Command: ALL, Roles: {public}
-- USING: (auth.role() = 'service_role'::text)
-- WITH CHECK: (auth.role() = 'service_role'::text)

-- Policy: Company relationship types visible to authenticated on company_relationship_types
-- Command: SELECT, Roles: {public}
-- USING: (auth.role() = 'authenticated'::text)

-- Policy: Company relationships manageable by tenant admins on company_relationships
-- Command: ALL, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Company relationships visible to tenant members on company_relationships
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Company types manageable by admins on company_types
-- Command: ALL, Roles: {public}
-- USING: (auth.role() = 'service_role'::text)
-- WITH CHECK: (auth.role() = 'service_role'::text)

-- Policy: Company types visible to authenticated on company_types
-- Command: SELECT, Roles: {public}
-- USING: (auth.role() = 'authenticated'::text)

-- Policy: Domain events insertable by trigger (service) on domain_events
-- Command: INSERT, Roles: {public}
-- WITH CHECK: true

-- Policy: Domain events visible to tenant members on domain_events
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Events: tenant members can read on domain_events
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'domain_events'::character varying, 'read'::character varying, NULL::uuid))

-- Policy: File access logs insert only on file_access_logs
-- Command: INSERT, Roles: {public}
-- WITH CHECK: ((EXISTS ( SELECT 1
   FROM people p
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: File access logs visible to owner or admin on file_access_logs
-- Command: SELECT, Roles: {public}
-- USING: ((person_id IN ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM ((files f
     JOIN tenant_memberships tm ON ((tm.tenant_id = f.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying])::text[])) AND (f.id = file_access_logs.file_id)))) OR (auth.role() = 'service_role'::text))

-- Policy: Files manageable by tenant admins on files
-- Command: ALL, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Files visible to tenant members on files
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (owner_person_id IN ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Files: tenant members can upload on files
-- Command: INSERT, Roles: {public}
-- WITH CHECK: (((visibility)::text = 'public'::text) OR (tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (owner_person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Files: visible to tenant members on files
-- Command: SELECT, Roles: {public}
-- USING: (((visibility)::text = 'public'::text) OR (tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (owner_person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Job matches insertable by service on job_matches
-- Command: INSERT, Roles: {public}
-- WITH CHECK: true

-- Policy: Job matches visible to tenant members on job_matches
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Job matches: tenant members can see on job_matches
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (candidate_id IN ( SELECT c.id
   FROM (candidates c
     JOIN people p ON ((c.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Job skills manageable by tenant admins on job_skills
-- Command: ALL, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((jobs j
     JOIN tenant_memberships tm ON ((tm.tenant_id = j.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (j.id = job_skills.job_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((EXISTS ( SELECT 1
   FROM ((jobs j
     JOIN tenant_memberships tm ON ((tm.tenant_id = j.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (j.id = job_skills.job_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Job skills visible to tenant members on job_skills
-- Command: SELECT, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((jobs j
     JOIN tenant_memberships tm ON ((tm.tenant_id = j.tenant_id)))
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (j.id = job_skills.job_id)))) OR (auth.role() = 'service_role'::text))

-- Policy: Jobs manageable by tenant admins on jobs
-- Command: ALL, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying, 'recruiter'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Jobs visible to tenant members on jobs
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Jobs: tenant members can create on jobs
-- Command: INSERT, Roles: {public}
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'jobs'::character varying, 'create'::character varying, NULL::uuid))

-- Policy: Jobs: tenant members can update on jobs
-- Command: UPDATE, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'jobs'::character varying, 'update'::character varying, NULL::uuid))

-- Policy: Jobs: visible to tenant members on jobs
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'jobs'::character varying, 'read'::character varying, NULL::uuid))

-- Policy: Deliveries visible to notification owner on notification_deliveries
-- Command: SELECT, Roles: {public}
-- USING: ((notification_id IN ( SELECT n.id
   FROM notifications n
  WHERE ((n.tenant_id IN ( SELECT tm.tenant_id
           FROM (tenant_memberships tm
             JOIN people p ON ((tm.person_id = p.id)))
          WHERE (p.auth_user_id = auth.uid()))) OR (n.recipient_person_id = ( SELECT people.id
           FROM people
          WHERE (people.auth_user_id = auth.uid())))))) OR (auth.role() = 'service_role'::text))

-- Policy: Preferences editable by person on notification_preferences
-- Command: ALL, Roles: {public}
-- USING: ((person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Preferences: user manages own on notification_preferences
-- Command: ALL, Roles: {public}
-- USING: ((person_id = ( SELECT c.person_id
   FROM candidates c
  WHERE (c.id = ( SELECT talent_pool_memberships.candidate_id
           FROM talent_pool_memberships
          WHERE (talent_pool_memberships.id = notification_preferences.person_id))))) OR (person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Notifications visible to tenant members on notifications
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Notifications: recipient sees own on notifications
-- Command: SELECT, Roles: {public}
-- USING: ((recipient_person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Users see own notifications on notifications
-- Command: SELECT, Roles: {public}
-- USING: ((recipient_person_id = ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: People insert (self-registration) on people
-- Command: INSERT, Roles: {public}
-- WITH CHECK: ((auth_user_id = auth.uid()) OR (auth.role() = 'service_role'::text))

-- Policy: People update own record on people
-- Command: UPDATE, Roles: {public}
-- USING: ((auth_user_id = auth.uid()) OR (auth.role() = 'service_role'::text))

-- Policy: People view own record on people
-- Command: SELECT, Roles: {public}
-- USING: ((auth_user_id = auth.uid()) OR (auth.role() = 'service_role'::text))

-- Policy: People: admin can update on people
-- Command: UPDATE, Roles: {public}
-- USING: user_has_permission(auth.uid(), 'people'::character varying, 'update'::character varying, NULL::uuid)

-- Policy: People: admin_master sees all on people
-- Command: SELECT, Roles: {public}
-- USING: user_has_permission(auth.uid(), 'people'::character varying, 'read'::character varying, NULL::uuid)

-- Policy: People: tenant_admin can manage within tenant on people
-- Command: UPDATE, Roles: {public}
-- USING: ((auth.uid() IS NOT NULL) AND (( SELECT p.id
   FROM people p
  WHERE (p.auth_user_id = auth.uid())) IN ( SELECT ra.person_id
   FROM (role_assignments ra
     JOIN roles r ON ((r.id = ra.role_id)))
  WHERE (((r.name)::text = 'tenant_admin'::text) AND (r.is_global = false) AND (ra.tenant_id IN ( SELECT tm.tenant_id
           FROM (tenant_memberships tm
             JOIN people p ON ((p.id = tm.person_id)))
          WHERE (p.auth_user_id = auth.uid()))) AND ((ra.expires_at IS NULL) OR (ra.expires_at > now()))))))

-- Policy: People: users see own record on people
-- Command: SELECT, Roles: {public}
-- USING: ((auth_user_id = auth.uid()) OR (auth.role() = 'service_role'::text))

-- Policy: Permissions manageable by global admin on permissions
-- Command: ALL, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((role_assignments ra
     JOIN people p ON ((ra.person_id = p.id)))
     JOIN roles r ON ((ra.role_id = r.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((r.name)::text = 'admin_master'::text) AND (ra.tenant_id IS NULL)))) OR (auth.role() = 'service_role'::text))

-- Policy: Permissions visible to authenticated on permissions
-- Command: SELECT, Roles: {public}
-- USING: ((auth.role() = 'authenticated'::text) OR (auth.role() = 'service_role'::text))

-- Policy: role_assignments_manage on role_assignments
-- Command: ALL, Roles: {public}
-- USING: (is_admin_master() OR can_manage_role_assignment(tenant_id) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: (is_admin_master() OR can_manage_role_assignment(NULL::uuid) OR (auth.role() = 'service_role'::text))

-- Policy: role_assignments_select on role_assignments
-- Command: SELECT, Roles: {public}
-- USING: ((person_id IN ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR is_admin_master() OR (auth.role() = 'service_role'::text))

-- Policy: Role permissions manageable by global admin on role_permissions
-- Command: ALL, Roles: {public}
-- USING: ((EXISTS ( SELECT 1
   FROM ((role_assignments ra
     JOIN people p ON ((ra.person_id = p.id)))
     JOIN roles r ON ((ra.role_id = r.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND ((r.name)::text = 'admin_master'::text) AND (ra.tenant_id IS NULL)))) OR (auth.role() = 'service_role'::text))

-- Policy: Role permissions visible to authenticated on role_permissions
-- Command: SELECT, Roles: {public}
-- USING: ((auth.role() = 'authenticated'::text) OR (auth.role() = 'service_role'::text))

-- Policy: Role resource permissions: admin_master only on role_resource_permissions
-- Command: ALL, Roles: {public}
-- USING: ((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (role_assignments ra
     JOIN roles r ON ((r.id = ra.role_id)))
  WHERE ((ra.person_id = ( SELECT people.id
           FROM people
          WHERE (people.auth_user_id = auth.uid()))) AND ((r.name)::text = 'admin_master'::text) AND (r.is_global = true) AND ((ra.expires_at IS NULL) OR (ra.expires_at > now()))))))
-- WITH CHECK: ((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (role_assignments ra
     JOIN roles r ON ((r.id = ra.role_id)))
  WHERE ((ra.person_id = ( SELECT people.id
           FROM people
          WHERE (people.auth_user_id = auth.uid()))) AND ((r.name)::text = 'admin_master'::text) AND (r.is_global = true) AND ((ra.expires_at IS NULL) OR (ra.expires_at > now()))))))

-- Policy: roles_manage on roles
-- Command: ALL, Roles: {public}
-- USING: (is_admin_master() OR (auth.role() = 'service_role'::text))
-- WITH CHECK: (is_admin_master() OR (auth.role() = 'service_role'::text))

-- Policy: roles_select on roles
-- Command: SELECT, Roles: {public}
-- USING: ((auth.role() = 'authenticated'::text) OR (auth.role() = 'service_role'::text))

-- Policy: skills manageable by admins on skills
-- Command: ALL, Roles: {public}
-- USING: (auth.role() = 'service_role'::text)
-- WITH CHECK: (auth.role() = 'service_role'::text)

-- Policy: skills visible to authenticated on skills
-- Command: SELECT, Roles: {public}
-- USING: (auth.role() = 'authenticated'::text)

-- Policy: Talent pool insertable by service on talent_pool_memberships
-- Command: INSERT, Roles: {public}
-- WITH CHECK: true

-- Policy: Talent pool updatable by owner/service on talent_pool_memberships
-- Command: UPDATE, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))
-- WITH CHECK: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Talent pool visible to tenant members on talent_pool_memberships
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Talent pool: tenant members can see on talent_pool_memberships
-- Command: SELECT, Roles: {public}
-- USING: ((tenant_id IN ( SELECT tm.tenant_id
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE (p.auth_user_id = auth.uid()))) OR user_has_permission(auth.uid(), 'talent_pool_memberships'::character varying, 'read'::character varying, NULL::uuid))

-- Policy: Members insert within tenant on tenant_memberships
-- Command: INSERT, Roles: {public}
-- WITH CHECK: ((EXISTS ( SELECT 1
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (tm.tenant_id = tenant_memberships.tenant_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'manager'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Members update own membership role on tenant_memberships
-- Command: UPDATE, Roles: {public}
-- USING: ((person_id IN ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (tm.tenant_id = tenant_memberships.tenant_id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[]))))) OR (auth.role() = 'service_role'::text))

-- Policy: Members view own membership on tenant_memberships
-- Command: SELECT, Roles: {public}
-- USING: ((person_id IN ( SELECT people.id
   FROM people
  WHERE (people.auth_user_id = auth.uid()))) OR (auth.role() = 'service_role'::text))

-- Policy: Tenants manageable by tenant admins on tenants
-- Command: ALL, Roles: {public}
-- USING: (EXISTS ( SELECT 1
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (tm.tenant_id = tenants.id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[])))))
-- WITH CHECK: (EXISTS ( SELECT 1
   FROM (tenant_memberships tm
     JOIN people p ON ((tm.person_id = p.id)))
  WHERE ((p.auth_user_id = auth.uid()) AND (tm.tenant_id = tenants.id) AND ((tm.membership_role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[])))))

-- Policy: Tenants visible to authenticated on tenants
-- Command: SELECT, Roles: {public}
-- USING: (auth.role() = 'authenticated'::text)

