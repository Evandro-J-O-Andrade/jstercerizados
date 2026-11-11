# Catálogo de banco (repo) — tabelas, campos, FKs e índices
Gerado a partir de `supabase/schema.sql` + `supabase/migrations/*.sql` (análise estática do repositório). **Não consulta o banco remoto** e **não altera schema/dados**.
- Tabelas detectadas: **95** | FKs: **123** | Índices: **250** | Arquivos analisados: **101**
> **Contagem de linhas (rows):** requer consulta read-only no banco real (ex.: Supabase SQL Editor ou CLI com credenciais autorizadas). Script sugerido ao final. O histórico de migrations indica drift/legado (`schema.sql` vs migrations); valide contra o banco alvo antes de CRUD/forms.

## `public.accounts_payable`
Fontes: `20260827001200_finance.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `company_id` | `uuid` |
| `references` | `public.companies(id)` |
| `on` | `delete set null` |
| `description` | `varchar(255) not null` |
| `amount` | `numeric(12,2) not null` |
| `due_date` | `date not null` |
| `paid_date` | `date` |
| `status` | `varchar(20) not null default 'open'` |
| `payment_method` | `varchar(50)` |
| `payment_reference` | `varchar(255)` |
| `notes` | `text` |
| `created_by` | `uuid references public.people(id) on delete set null` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (status in ('open','paid','overdue','cancelled','partially_paid'))`

**Foreign keys:**
- `(created_by)` → `public.people(id)` on delete set null

**Índices:**
- `idx_accounts_payable_tenant` (tenant_id)  *[`20260827001200_finance.sql`]*
- `idx_accounts_payable_company` (company_id)  *[`20260827001200_finance.sql`]*
- `idx_accounts_payable_status` (status)  *[`20260827001200_finance.sql`]*
- `idx_accounts_payable_due_date` (due_date)  *[`20260827001200_finance.sql`]*

## `public.accounts_receivable`
Fontes: `20260827001200_finance.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `company_id` | `uuid` |
| `references` | `public.companies(id)` |
| `on` | `delete set null` |
| `description` | `varchar(255) not null` |
| `amount` | `numeric(12,2) not null` |
| `due_date` | `date not null` |
| `received_date` | `date` |
| `status` | `varchar(20) not null default 'open'` |
| `payment_method` | `varchar(50)` |
| `payment_reference` | `varchar(255)` |
| `notes` | `text` |
| `created_by` | `uuid references public.people(id) on delete set null` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (status in ('open','received','overdue','cancelled','partially_received'))`

**Foreign keys:**
- `(created_by)` → `public.people(id)` on delete set null

**Índices:**
- `idx_accounts_receivable_tenant` (tenant_id)  *[`20260827001200_finance.sql`]*
- `idx_accounts_receivable_company` (company_id)  *[`20260827001200_finance.sql`]*
- `idx_accounts_receivable_status` (status)  *[`20260827001200_finance.sql`]*
- `idx_accounts_receivable_due_date` (due_date)  *[`20260827001200_finance.sql`]*

## `public.ai_conversations`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `session_id` | `text not null` |
| `channel` | `text check (channel in ('chat','whatsapp','website'))` |
| `company_id` | `uuid references public.companies(id) on delete set null` |
| `user_id` | `uuid references auth.users(id) on delete set null` |
| `user_message` | `text not null` |
| `assistant_reply` | `text` |
| `context` | `jsonb` |
| `model` | `text` |
| `tokens_used` | `integer not null default 0` |
| `created_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(company_id)` → `public.companies(id)` on delete set null
- `(user_id)` → `auth.users(id)` on delete set null

**Índices:**
- `idx_ai_conversations_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_ai_conversations_session` (session_id)  *[`schema.sql`]*
- `idx_ai_conversations_created` (created_at)  *[`schema.sql`]*

## `public.application_profile_snapshots`
Fontes: `20260816000600_applications.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `application_id` | `uuid not null` |
| `references` | `public.applications(id)` |
| `on` | `delete cascade` |
| `snapshot_data` | `jsonb` |
| `captured_at` | `timestamptz not null default now()` |

**Índices:**
- `idx_app_snapshots_application` (application_id)  *[`20260816000600_applications.sql`]*

## `public.application_status_history`
Fontes: `schema.sql`, `20260816000600_applications.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `application_id` | `uuid not null references public.applications(id) on delete cascade` |
| `from_status` | `text` |
| `to_status` | `text not null` |
| `changed_at` | `timestamptz not null default now()` |
| `changed_by` | `uuid references auth.users(id) on delete set null` |
| `metadata` | `jsonb` |
| `references` | `public.applications(id)` |
| `on` | `delete cascade` |
| `stage` | `varchar(50) not null` |
| `previous_stage` | `varchar(50)` |
| `next_stage` | `varchar(50)` |
| `reason` | `text` |

**Constraints (tabela):**
- `check (stage in (`

**Foreign keys:**
- `(application_id)` → `public.applications(id)` on delete cascade
- `(changed_by)` → `auth.users(id)` on delete set null

**Índices:**
- `idx_application_history_app` (application_id)  *[`schema.sql`]*
- `idx_application_history_changed` (changed_at desc)  *[`schema.sql`]*
- `idx_app_history_application` (application_id)  *[`20260816000600_applications.sql`]*
- `idx_app_history_changed_at` (changed_at desc)  *[`20260816000600_applications.sql`]*
- `idx_app_history_stage` (stage)  *[`20260816000600_applications.sql`]*

## `public.applications`
Fontes: `schema.sql`, `20260816000600_applications.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `job_id` | `uuid not null references public.jobs(id) on delete cascade` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `curriculum_id` | `uuid references public.curricula(id) on delete set null` |
| `current_status` | `text not null default 'submitted' check (current_status in ('submitted','in_analysis','interview','approved','rejected','withdrawn'))` |
| `applied_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `references` | `public.jobs(id)` |
| `on` | `delete cascade` |
| `references` | `public.candidates(id)` |
| `on` | `delete cascade` |
| `profile_snapshot` | `jsonb` |
| `match_score` | `numeric(5,2)` |
| `match_details` | `jsonb` |
| `source` | `varchar(50)` |
| `current_stage` | `varchar(50) not null default 'submitted'` |
| `notes` | `text` |
| `created_by` | `uuid references public.people(id)` |

**Constraints (tabela):**
- `check (source in ('website','whatsapp','email','indication','talent_pool','api','other'))`
- `check (current_stage in (`
- `unique (candidate_id, job_id)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(job_id)` → `public.jobs(id)` on delete cascade
- `(candidate_id)` → `public.candidates(id)` on delete cascade
- `(curriculum_id)` → `public.curricula(id)` on delete set null
- `(created_by)` → `public.people(id)` 

**Índices:**
- `idx_applications_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_applications_job` (job_id)  *[`schema.sql`]*
- `idx_applications_candidate` (candidate_id)  *[`schema.sql`]*
- `idx_applications_status` (current_status)  *[`schema.sql`]*
- UNIQUE `idx_applications_unique_job_candidate` (tenant_id, job_id, candidate_id)  *[`schema.sql`]*
- `idx_applications_applied_at` (applied_at desc)  *[`20260816000600_applications.sql`]*
- `idx_applications_tenant_id` (tenant_id)  *[`20260830000200_reconcile_applications.sql`]*

## `public.audit_logs`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `user_id` | `uuid references auth.users(id) on delete set null` |
| `action` | `text not null` |
| `table_name` | `text` |
| `record_id` | `uuid` |
| `details` | `jsonb` |
| `ip_address` | `text` |
| `user_agent` | `text` |
| `created_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(user_id)` → `auth.users(id)` on delete set null

**Índices:**
- `idx_audit_logs_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_audit_logs_user` (user_id)  *[`schema.sql`]*
- `idx_audit_logs_created` (created_at desc)  *[`schema.sql`]*

## `public.automation_queue`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `event` | `text not null` |
| `payload` | `jsonb not null` |
| `status` | `text not null default 'pending' check (status in ('pending','processing','success','error'))` |
| `attempts` | `integer not null default 0` |
| `max_attempts` | `integer not null default 5` |
| `last_error` | `text` |
| `scheduled_at` | `timestamptz` |
| `executed_at` | `timestamptz` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade

**Índices:**
- `idx_automation_queue_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_automation_queue_status` (status)  *[`schema.sql`]*
- `idx_automation_queue_event` (event)  *[`schema.sql`]*

## `public.bank_accounts`
Fontes: `20260827001200_finance.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `company_id` | `uuid` |
| `references` | `public.companies(id)` |
| `on` | `delete set null` |
| `bank` | `varchar(100) not null` |
| `agency` | `varchar(20)` |
| `account_number` | `varchar(30)` |
| `account_type` | `varchar(20)` |
| `current_balance` | `numeric(14,2) not null default 0` |
| `available_balance` | `numeric(14,2) not null default 0` |
| `status` | `varchar(20) not null default 'active'` |
| `notes` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (account_type in ('checking','savings','investment'))`
- `check (status in ('active','inactive','blocked'))`

**Índices:**
- `idx_bank_accounts_tenant` (tenant_id)  *[`20260827001200_finance.sql`]*
- `idx_bank_accounts_company` (company_id)  *[`20260827001200_finance.sql`]*

## `public.blog_posts`
Fontes: `20260902000001_01_schema_reconciliation.sql`

| Campo | Definição |
|---|---|
| `seo_title` | `varchar(70),
        ADD COLUMN IF NOT EXISTS seo_description varchar(160)
    '` *(add: `20260902000001_01_schema_reconciliation.sql`)* |

## `public.candidate_courses`
Fontes: `20260827001300_candidate_child_tables.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `name` | `varchar(150) not null` |
| `institution` | `varchar(150)` |
| `hours` | `numeric(6,1)` |
| `completed_at` | `date` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(candidate_id)` → `public.candidates(id)` on delete cascade

**Índices:**
- `idx_candidate_courses_candidate` (candidate_id)  *[`20260827001300_candidate_child_tables.sql`]*

## `public.candidate_documents`
Fontes: `schema.sql`, `20260827001300_candidate_child_tables.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `storage_path` | `text not null` |
| `file_name` | `text not null` |
| `mime_type` | `text` |
| `size_bytes` | `bigint` |
| `category` | `text check (category in ('cv','document','certificate','identity','other'))` |
| `created_at` | `timestamptz not null default now()` |
| `type` | `varchar(50) not null` |
| `url` | `text not null` |
| `name` | `varchar(150)` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(candidate_id)` → `public.candidates(id)` on delete cascade

**Índices:**
- `idx_candidate_documents_candidate` (candidate_id)  *[`20260827001300_candidate_child_tables.sql`]*

## `public.candidate_education`
Fontes: `20260827001300_candidate_child_tables.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `institution` | `varchar(150) not null` |
| `course` | `varchar(150) not null` |
| `degree` | `varchar(100)` |
| `start_date` | `date` |
| `end_date` | `date` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(candidate_id)` → `public.candidates(id)` on delete cascade

**Índices:**
- `idx_candidate_education_candidate` (candidate_id)  *[`20260827001300_candidate_child_tables.sql`]*

## `public.candidate_experiences`
Fontes: `20260827001300_candidate_child_tables.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `company` | `varchar(150) not null` |
| `position` | `varchar(150) not null` |
| `start_date` | `date` |
| `end_date` | `date` |
| `description` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(candidate_id)` → `public.candidates(id)` on delete cascade

**Índices:**
- `idx_candidate_experiences_candidate` (candidate_id)  *[`20260827001300_candidate_child_tables.sql`]*

## `public.candidate_job_alerts`
Fontes: `20260905000000_candidate_job_alerts.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `person_id` | `uuid not null` |
| `references` | `public.people(id)` |
| `on` | `delete cascade` |
| `name` | `text not null` |
| `keywords` | `text` |
| `city` | `text` |
| `state` | `text` |
| `contract_type` | `text` |
| `work_mode` | `text` |
| `salary_min` | `integer` |
| `salary_max` | `integer` |
| `frequency` | `text not null default 'daily'` |
| `is_active` | `boolean not null default true` |
| `last_sent_at` | `timestamptz` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (frequency in ('instant', 'daily', 'weekly'))`
- `constraint candidate_job_alerts_unique unique (person_id, name)`

**Índices:**
- `idx_candidate_job_alerts_person` (person_id)  *[`20260905000000_candidate_job_alerts.sql`]*
- `idx_candidate_job_alerts_tenant` (tenant_id)  *[`20260905000000_candidate_job_alerts.sql`]*
- `idx_candidate_job_alerts_active` (tenant_id, is_active)  *[`20260905000000_candidate_job_alerts.sql`]*

## `public.candidate_languages`
Fontes: `20260827001300_candidate_child_tables.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `language` | `varchar(80) not null` |
| `level` | `varchar(50) not null` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(candidate_id)` → `public.candidates(id)` on delete cascade

**Índices:**
- `idx_candidate_languages_candidate` (candidate_id)  *[`20260827001300_candidate_child_tables.sql`]*

## `public.candidate_portal_modules`
Fontes: `20260906000000_candidate_portal_navigation.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `key` | `text not null unique` |
| `label` | `text not null` |
| `route` | `text not null` |
| `icon` | `text not null` |
| `permission_key` | `text null` |
| `show_in_sidebar` | `boolean not null default true` |
| `show_in_bottom_nav` | `boolean not null default true` |
| `sort_order` | `integer not null default 0` |
| `is_active` | `boolean not null default true` |
| `target_audience` | `text[] not null default array['candidato']::text[]` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `constraint candidate_portal_modules_key_not_blank check (length(btrim(key)) > 0)`
- `constraint candidate_portal_modules_label_not_blank check (length(btrim(label)) > 0)`
- `constraint candidate_portal_modules_route_not_blank check (length(btrim(route)) > 0)`

**Índices:**
- `idx_cpm_active_sort` (is_active, sort_order) where is_active = true *[`20260906000000_candidate_portal_navigation.sql`]*

## `public.candidate_preferences`
Fontes: `20260816001100_talent_pool.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `candidate_id` | `uuid not null` |
| `references` | `public.candidates(id)` |
| `on` | `delete cascade` |
| `desired_roles` | `text[]` |
| `desired_locations` | `text[]` |
| `salary_min` | `numeric(10,2)` |
| `salary_max` | `numeric(10,2)` |
| `contract_types` | `text[]` |
| `shifts` | `text[]` |
| `work_modes` | `text[]` |
| `max_distance_km` | `integer` |
| `available_from` | `date` |
| `matching_enabled` | `boolean not null default true` |
| `receive_match_alerts` | `boolean not null default true` |
| `last_match_at` | `timestamptz` |
| `last_match_version` | `varchar(20)` |
| `preferences_version` | `varchar(20) check (preferences_version in ('1.0'))` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Índices:**
- `idx_candidate_prefs_candidate` (candidate_id)  *[`20260816001100_talent_pool.sql`]*
- UNIQUE `uk_candidate_prefs_candidate` (candidate_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_candidate_prefs_matching` (matching_enabled, receive_match_alerts)  *[`20260816001100_talent_pool.sql`]*

## `public.candidate_profile_views`
Fontes: `20260816001100_talent_pool.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `candidate_id` | `uuid not null` |
| `references` | `public.candidates(id)` |
| `on` | `delete cascade` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `viewer_person_id` | `uuid` |
| `references` | `public.people(id)` |
| `on` | `delete set null` |
| `viewed_at` | `timestamptz not null default now()` |
| `source` | `varchar(50),  -- 'job_detail', 'search', 'recommendation'` |
| `metadata` | `jsonb not null default '{}'::jsonb` |

**Índices:**
- `idx_profile_views_candidate` (candidate_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_profile_views_tenant` (tenant_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_profile_views_viewer` (viewer_person_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_profile_views_at` (viewed_at desc)  *[`20260816001100_talent_pool.sql`]*

## `public.candidate_skills`
Fontes: `schema.sql`, `20260816000400_candidates.sql`

| Campo | Definição |
|---|---|
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `skill_id` | `uuid not null references public.skills(id) on delete cascade` |
| `level` | `text check (level in ('basic','intermediate','advanced'))` |
| `months_used` | `integer default 0` |
| `last_used` | `date` |
| `created_at` | `timestamptz not null default now()` |
| `id` | `uuid primary key default gen_random_uuid()` |
| `proficiency` | `varchar(20)` |
| `years_experience` | `numeric(3,1)` |
| `last_used_at` | `timestamptz` |
| `name` | `varchar(150)` *(add: `20260904230000_candidate_skills_freeform_name_level.sql`)* |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` *(add: `20260904230000_candidate_skills_freeform_name_level.sql`)* |

**Constraints (tabela):**
- `primary key (candidate_id, skill_id)`
- `check (proficiency in ('basic','intermediate','advanced','expert'))`
- `unique (candidate_id, skill_id)`

**Foreign keys:**
- `(candidate_id)` → `public.candidates(id)` on delete cascade
- `(skill_id)` → `public.skills(id)` on delete cascade

**Índices:**
- `idx_candidate_skills_candidate` (candidate_id)  *[`20260816000400_candidates.sql`]*
- `idx_candidate_skills_skill` (skill_id)  *[`20260816000400_candidates.sql`]*
- `idx_candidate_skills_name` (name)  *[`20260904230000_candidate_skills_freeform_name_level.sql`]*

## `public.candidates`
Fontes: `schema.sql`, `20260816000400_candidates.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `profile_id` | `uuid references auth.users(id) on delete set null` |
| `name` | `text not null` |
| `cpf` | `text` |
| `rg` | `text` |
| `phone` | `text not null` |
| `email` | `text` |
| `birth_date` | `date` |
| `city` | `text` |
| `state` | `text` |
| `target_role` | `text` |
| `target_area` | `text` |
| `salary_min` | `numeric` |
| `salary_max` | `numeric` |
| `experience_summary` | `text` |
| `linkedin` | `text` |
| `portfolio_url` | `text` |
| `status` | `text not null default 'new' check (status in ('new','review','interview','approved','rejected','talent_pool','inactive'))` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `person_id` | `uuid not null` |
| `references` | `public.people(id)` |
| `on` | `delete restrict` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `headline` | `varchar(150)` |
| `salary_expectation_min` | `numeric(10,2)` |
| `salary_expectation_max` | `numeric(10,2)` |
| `salary_type` | `varchar(20)` |
| `default` | `'negotiate'` |
| `availability` | `jsonb` |
| `default` | `'{"type":"immediate","notice_period_days":0}'::jsonb` |
| `source` | `varchar(50)` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_by` | `uuid references public.people(id)` |

**Constraints (tabela):**
- `check (salary_type in ('range','monthly','negotiate'))`
- `check (status in ('active','inactive','archived','blacklisted'))`
- `unique (person_id, tenant_id)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(profile_id)` → `auth.users(id)` on delete set null
- `(created_by)` → `public.people(id)` 

**Índices:**
- `idx_candidates_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_candidates_status` (status)  *[`schema.sql`]*
- `idx_candidates_target_role` (target_role)  *[`schema.sql`]*
- `idx_candidates_target_area` (target_area)  *[`schema.sql`]*
- `idx_candidates_person` (person_id)  *[`20260816000400_candidates.sql`]*
- `idx_candidates_created_by` (created_by)  *[`20260816000400_candidates.sql`]*
- `idx_candidates_availability` (availability)  *[`20260816000400_candidates.sql`]*

## `public.cash_flows`
Fontes: `20260827001200_finance.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `company_id` | `uuid` |
| `references` | `public.companies(id)` |
| `on` | `delete set null` |
| `type` | `varchar(20) not null` |
| `amount` | `numeric(12,2) not null` |
| `date` | `date not null` |
| `category` | `varchar(100)` |
| `subcategory` | `varchar(100)` |
| `description` | `varchar(255)` |
| `reference` | `varchar(255)` |
| `related_account_payable_id` | `uuid` |
| `references` | `public.accounts_payable(id) on delete set null` |
| `related_account_receivable_id` | `uuid` |
| `references` | `public.accounts_receivable(id) on delete set null` |
| `notes` | `text` |
| `created_by` | `uuid references public.people(id) on delete set null` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (type in ('income','expense','transfer'))`

**Foreign keys:**
- `(created_by)` → `public.people(id)` on delete set null

**Índices:**
- `idx_cash_flows_tenant` (tenant_id)  *[`20260827001200_finance.sql`]*
- `idx_cash_flows_company` (company_id)  *[`20260827001200_finance.sql`]*
- `idx_cash_flows_type` (type)  *[`20260827001200_finance.sql`]*
- `idx_cash_flows_date` (date)  *[`20260827001200_finance.sql`]*

## `public.companies`
Fontes: `schema.sql`, `20260816000300_companies.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `name` | `text not null` |
| `trading_name` | `text` |
| `cnpj` | `text unique` |
| `phone` | `text` |
| `whatsapp` | `text` |
| `email` | `text` |
| `website` | `text` |
| `logo_url` | `text` |
| `address` | `jsonb` |
| `type` | `text not null check (type in ('client','partner','supplier','internal'))` |
| `status` | `text not null default 'active' check (status in ('active','inactive','pending','rejected'))` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `legal_name` | `varchar(200) not null` |
| `cnpj_root` | `varchar(15)` |
| `state_registration` | `varchar(20)` |
| `municipal_registration` | `varchar(20)` |
| `company_type_id` | `uuid references public.company_types(id)` |
| `industry` | `varchar(100)` |
| `linkedin_url` | `varchar(255)` |
| `size` | `varchar(20)` |
| `is_active` | `boolean not null default true` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_by` | `uuid references public.people(id)` |
| `description` | `TEXT,
  ADD COLUMN IF NOT EXISTS short_description VARCHAR(280),
  ADD COLUMN IF NOT EXISTS company_segment VARCHAR(100)` *(add: `20260901000001_media_storage_v1.sql`)* |

**Constraints (tabela):**
- `check (size in ('micro','small','medium','large','enterprise'))`
- `check (status in ('active','inactive','suspended','pending'))`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(company_type_id)` → `public.company_types(id)` 
- `(created_by)` → `public.people(id)` 

**Índices:**
- `idx_companies_cnpj` (cnpj)  *[`20260816000300_companies.sql`]*
- `idx_companies_type` (company_type_id)  *[`20260816000300_companies.sql`]*
- `idx_companies_status` (status)  *[`20260816000300_companies.sql`]*
- `idx_companies_created_by` (created_by)  *[`20260816000300_companies.sql`]*
- `idx_companies_website` (website) WHERE website IS NOT NULL *[`20260901000001_media_storage_v1.sql`]*
- UNIQUE `companies_pending_cnpj_unique_idx` (cnpj) where status='pending' and cnpj is not null *[`20260904204854_company_interest_registration_rpc.sql`]*

## `public.company_contacts`
Fontes: `20260816000300_companies.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `company_id` | `uuid not null references public.companies(id) on delete cascade` |
| `person_id` | `uuid not null references public.people(id) on delete cascade` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `role` | `varchar(100)` |
| `is_primary` | `boolean not null default false` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not NULL default now()` |

**Constraints (tabela):**
- `unique (company_id, person_id, tenant_id)`

**Foreign keys:**
- `(company_id)` → `public.companies(id)` on delete cascade
- `(person_id)` → `public.people(id)` on delete cascade
- `(tenant_id)` → `public.tenants(id)` on delete cascade

**Índices:**
- `idx_company_contacts_company` (company_id)  *[`20260816000300_companies.sql`]*
- `idx_company_contacts_person` (person_id)  *[`20260816000300_companies.sql`]*
- `idx_company_contacts_tenant` (tenant_id)  *[`20260816000300_companies.sql`]*

## `public.company_relationship_types`
Fontes: `20260816000300_companies.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `code` | `varchar(20) not null unique` |
| `name` | `varchar(100) not null` |
| `description` | `text` |
| `created_at` | `timestamptz not null default now()` |

## `public.company_relationships`
Fontes: `20260816000300_companies.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `company_id` | `uuid not null references public.companies(id) on delete cascade` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `relationship_type_id` | `uuid not null references public.company_relationship_types(id)` |
| `status` | `varchar(20) not null default 'active'` |
| `started_at` | `timestamptz` |
| `ended_at` | `timestamptz` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_by` | `uuid references public.people(id)` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (status in ('active','inactive','pending','suspended'))`
- `unique (company_id, tenant_id, relationship_type_id)`

**Foreign keys:**
- `(company_id)` → `public.companies(id)` on delete cascade
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(relationship_type_id)` → `public.company_relationship_types(id)` 
- `(created_by)` → `public.people(id)` 

**Índices:**
- `idx_company_relationships_company` (company_id)  *[`20260816000300_companies.sql`]*
- `idx_company_relationships_tenant` (tenant_id)  *[`20260816000300_companies.sql`]*
- `idx_company_relationships_type` (relationship_type_id)  *[`20260816000300_companies.sql`]*
- `idx_company_relationships_status` (status)  *[`20260816000300_companies.sql`]*

## `public.company_services`
Fontes: `20260830000800_company_services_link.sql`

| Campo | Definição |
|---|---|
| `service_id` | `uuid` *(add: `20260830000800_company_services_link.sql`)* |

**Foreign keys:**
- `company_services_service_id_fkey` `(service_id)` → `public.services(id)` ON DELETE SET NULL

**Índices:**
- `idx_company_services_service_id` (service_id) WHERE service_id IS NOT NULL *[`20260830000800_company_services_link.sql`]*
- `idx_company_services_company_id` (company_id)  *[`20260830000800_company_services_link.sql`]*

## `public.company_social_links`
Fontes: `20260831000001_company_social_links.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `tenant_id` | `uuid NOT NULL` |
| `company_id` | `uuid NOT NULL` |
| `platform` | `text NOT NULL` |
| `url` | `text NOT NULL` |
| `is_active` | `boolean NOT NULL DEFAULT true` |
| `display_order` | `integer NOT NULL DEFAULT 0` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` |

**Foreign keys:**
- `company_social_links_tenant_id_fkey` `(tenant_id)` → `public.tenants(id)` ON DELETE CASCADE
- `company_social_links_company_id_fkey` `(company_id)` → `public.companies(id)` ON DELETE CASCADE

**Índices:**
- `idx_company_social_links_tenant_id` (tenant_id)  *[`20260831000001_company_social_links.sql`]*
- `idx_company_social_links_company_id` (company_id)  *[`20260831000001_company_social_links.sql`]*

## `public.company_types`
Fontes: `20260816000300_companies.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `code` | `varchar(30) not null unique` |
| `name` | `varchar(100) not null` |
| `description` | `text` |
| `created_at` | `timestamptz not null default now()` |

## `public.consents`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `purpose` | `text not null` |
| `status` | `text not null check (status in ('granted','revoked','pending'))` |
| `version` | `text not null` |
| `granted_at` | `timestamptz` |
| `revoked_at` | `timestamptz` |
| `metadata` | `jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(candidate_id)` → `public.candidates(id)` on delete cascade

## `public.contact_requests`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `name` | `text not null` |
| `company` | `text` |
| `cnpj` | `text` |
| `phone` | `text not null` |
| `whatsapp` | `text not null` |
| `email` | `text not null` |
| `city` | `text` |
| `state` | `text` |
| `service` | `text not null` |
| `posts` | `integer not null default 1` |
| `message` | `text` |
| `status` | `text not null default 'new' check (status in ('new','contacted','proposal','won','lost'))` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade

## `public.cost_centers`
Fontes: `20260827001200_finance.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `company_id` | `uuid` |
| `references` | `public.companies(id)` |
| `on` | `delete set null` |
| `name` | `varchar(100) not null` |
| `code` | `varchar(50)` |
| `parent_id` | `uuid` |
| `references` | `public.cost_centers(id) on delete set null` |
| `status` | `varchar(20) not null default 'active'` |
| `notes` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (status in ('active','inactive'))`

**Índices:**
- `idx_cost_centers_tenant` (tenant_id)  *[`20260827001200_finance.sql`]*
- `idx_cost_centers_company` (company_id)  *[`20260827001200_finance.sql`]*

## `public.courses`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `curriculum_id` | `uuid not null references public.curricula(id) on delete cascade` |
| `name` | `text not null` |
| `institution` | `text` |
| `hours` | `text` |
| `completion_date` | `date` |
| `certificate_url` | `text` |
| `created_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(curriculum_id)` → `public.curricula(id)` on delete cascade

## `public.curricula`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `title` | `text` |
| `objective` | `text` |
| `salary_min` | `numeric` |
| `salary_max` | `numeric` |
| `salary_type` | `text check (salary_type in ('range','monthly','negotiable'))` |
| `availability` | `text check (availability in ('immediate','15_days','30_days','90_days'))` |
| `linkedin` | `text` |
| `portfolio_url` | `text` |
| `cv_storage_path` | `text` |
| `status` | `text not null default 'active' check (status in ('active','inactive','archived'))` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `unique (candidate_id)`

**Foreign keys:**
- `(candidate_id)` → `public.candidates(id)` on delete cascade
- `(tenant_id)` → `public.tenants(id)` on delete cascade

## `public.domain_events`
Fontes: `20260816000900_domain_events.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `event_name` | `varchar(100) not null` |
| `event_version` | `varchar(20) not null default '1.0'` |
| `aggregate_type` | `varchar(50)` |
| `aggregate_id` | `uuid` |
| `actor_person_id` | `uuid references public.people(id) on delete set null` |
| `correlation_id` | `uuid` |
| `causation_id` | `uuid` |
| `payload` | `jsonb not null default '{}'::jsonb` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `occurred_at` | `timestamptz not null default now()` |
| `created_at` | `timestamptz not null default now()` |
| `published_at` | `timestamptz` |
| `delivery_attempts` | `integer not null default 0` |
| `last_error` | `text` |
| `idempotency_key` | `uuid` |

**Foreign keys:**
- `(actor_person_id)` → `public.people(id)` on delete set null

**Índices:**
- `idx_domain_events_tenant` (tenant_id)  *[`20260816000900_domain_events.sql`]*
- `idx_domain_events_name` (event_name)  *[`20260816000900_domain_events.sql`]*
- `idx_domain_events_aggregate` (aggregate_type, aggregate_id)  *[`20260816000900_domain_events.sql`]*
- `idx_domain_events_correlation` (correlation_id)  *[`20260816000900_domain_events.sql`]*
- `idx_domain_events_occurred_at` (occurred_at desc)  *[`20260816000900_domain_events.sql`]*
- `idx_domain_events_pending` (published_at) where published_at is null *[`20260816000900_domain_events.sql`]*
- `idx_domain_events_actor` (actor_person_id)  *[`20260816000900_domain_events.sql`]*
- `idx_domain_events_idempotency` (idempotency_key)  *[`20260816000900_domain_events.sql`]*

## `public.education`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `curriculum_id` | `uuid not null references public.curricula(id) on delete cascade` |
| `institution` | `text not null` |
| `course` | `text not null` |
| `level` | `text check (level in ('elementary','high_school','technical','undergraduate','graduate','masters','doctorate'))` |
| `start_date` | `date` |
| `end_date` | `date` |
| `completed` | `boolean not null default true` |
| `created_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(curriculum_id)` → `public.curricula(id)` on delete cascade

## `public.emails`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `recipient` | `text not null` |
| `subject` | `text not null` |
| `body_html` | `text` |
| `body_text` | `text` |
| `status` | `text not null default 'sent' check (status in ('sent','error','opened','clicked'))` |
| `template_id` | `text` |
| `provider` | `text` |
| `external_id` | `text` |
| `created_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade

**Índices:**
- `idx_emails_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_emails_status` (status)  *[`schema.sql`]*

## `public.employee_courses`
Fontes: `20260827000100_employees.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `employee_id` | `uuid not null` |
| `references` | `public.employees(id)` |
| `on` | `delete cascade` |
| `course_name` | `varchar(255) not null` |
| `institution` | `varchar(255)` |
| `completion_date` | `date` |
| `expiry_date` | `date` |
| `certificate_url` | `text` |
| `hours` | `integer` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Índices:**
- `idx_employee_courses_employee` (employee_id)  *[`20260827000100_employees.sql`]*

## `public.employee_documents`
Fontes: `20260827000100_employees.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `employee_id` | `uuid not null` |
| `references` | `public.employees(id)` |
| `on` | `delete cascade` |
| `document_type` | `varchar(100) not null` |
| `document_name` | `varchar(255) not null` |
| `document_url` | `text not null` |
| `issue_date` | `date` |
| `expiry_date` | `date` |
| `is_verified` | `boolean not null default false` |
| `notes` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Índices:**
- `idx_employee_documents_employee` (employee_id)  *[`20260827000100_employees.sql`]*
- `idx_employee_documents_type` (document_type)  *[`20260827000100_employees.sql`]*

## `public.employee_education`
Fontes: `20260827000100_employees.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `employee_id` | `uuid not null` |
| `references` | `public.employees(id)` |
| `on` | `delete cascade` |
| `institution` | `varchar(255) not null` |
| `course` | `varchar(255) not null` |
| `degree_level` | `varchar(100)` |
| `field_of_study` | `varchar(255)` |
| `start_date` | `date` |
| `end_date` | `date` |
| `is_completed` | `boolean not null default false` |
| `notes` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Índices:**
- `idx_employee_education_employee` (employee_id)  *[`20260827000100_employees.sql`]*

## `public.employee_experiences`
Fontes: `20260827000100_employees.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `employee_id` | `uuid not null` |
| `references` | `public.employees(id)` |
| `on` | `delete cascade` |
| `company_name` | `varchar(255) not null` |
| `job_title` | `varchar(255) not null` |
| `start_date` | `date not null` |
| `end_date` | `date` |
| `is_current` | `boolean not null default false` |
| `description` | `text` |
| `achievements` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Índices:**
- `idx_employee_experiences_employee` (employee_id)  *[`20260827000100_employees.sql`]*

## `public.employee_languages`
Fontes: `20260827000100_employees.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `employee_id` | `uuid not null` |
| `references` | `public.employees(id)` |
| `on` | `delete cascade` |
| `language` | `varchar(100) not null` |
| `proficiency` | `varchar(50)` |
| `is_primary` | `boolean not null default false` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (proficiency in ('basic', 'intermediate', 'advanced', 'fluent', 'native'))`

**Índices:**
- `idx_employee_languages_employee` (employee_id)  *[`20260827000100_employees.sql`]*

## `public.employee_skills`
Fontes: `20260827000100_employees.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `employee_id` | `uuid not null` |
| `references` | `public.employees(id)` |
| `on` | `delete cascade` |
| `skill_name` | `varchar(255) not null` |
| `proficiency_level` | `varchar(50)` |
| `years_experience` | `numeric(4,1)` |
| `is_certified` | `boolean not null default false` |
| `certification_name` | `varchar(255)` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (proficiency_level in ('beginner', 'intermediate', 'advanced', 'expert'))`

**Índices:**
- `idx_employee_skills_employee` (employee_id)  *[`20260827000100_employees.sql`]*
- `idx_employee_skills_name` (skill_name)  *[`20260827000100_employees.sql`]*

## `public.employees`
Fontes: `20260827000100_employees.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `person_id` | `uuid not null` |
| `references` | `public.people(id)` |
| `on` | `delete cascade` |
| `company_id` | `uuid` |
| `references` | `public.companies(id)` |
| `on` | `delete set null` |
| `registration` | `varchar(120) unique` |
| `job_title` | `varchar(255)` |
| `department` | `varchar(255)` |
| `cost_center` | `varchar(255)` |
| `hire_date` | `date` |
| `termination_date` | `date` |
| `probation_end_date` | `date` |
| `employment_type` | `varchar(50)` |
| `work_mode` | `varchar(50)` |
| `salary` | `numeric(12,2)` |
| `salary_currency` | `varchar(3) default 'BRL'` |
| `salary_frequency` | `varchar(50)` |
| `status` | `varchar(50) not null default 'active'` |
| `manager_id` | `uuid` |
| `references` | `public.employees(id)` |
| `on` | `delete set null` |
| `notes` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (employment_type in ('clt', 'internship', 'temporary', 'freelance', 'contracted', 'cd'))`
- `check (work_mode in ('onsite', 'hybrid', 'remote'))`
- `check (salary_frequency in ('monthly', 'biweekly', 'weekly', 'hourly', 'project'))`
- `check (status in ('active', 'inactive', 'terminated', 'suspended', 'on_leave'))`

**Índices:**
- `idx_employees_tenant` (tenant_id)  *[`20260827000100_employees.sql`]*
- `idx_employees_person` (person_id)  *[`20260827000100_employees.sql`]*
- `idx_employees_company` (company_id)  *[`20260827000100_employees.sql`]*
- `idx_employees_status` (tenant_id, status)  *[`20260827000100_employees.sql`]*
- `idx_employees_registration` (registration)  *[`20260827000100_employees.sql`]*
- `idx_employees_manager` (manager_id)  *[`20260827000100_employees.sql`]*

## `public.evaluations`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `interview_id` | `uuid not null references public.interviews(id) on delete cascade` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `criteria` | `text not null` |
| `score` | `numeric(3,1)` |
| `notes` | `text` |
| `evaluator_id` | `uuid references auth.users(id) on delete set null` |
| `created_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(interview_id)` → `public.interviews(id)` on delete cascade
- `(candidate_id)` → `public.candidates(id)` on delete cascade
- `(evaluator_id)` → `auth.users(id)` on delete set null

## `public.experiences`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `curriculum_id` | `uuid not null references public.curricula(id) on delete cascade` |
| `company` | `text not null` |
| `role` | `text not null` |
| `start_date` | `date` |
| `end_date` | `date` |
| `is_current` | `boolean not null default false` |
| `description` | `text` |
| `created_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(curriculum_id)` → `public.curricula(id)` on delete cascade

## `public.favorite_jobs`
Fontes: `schema.sql`, `20260904220000_candidate_favorite_jobs.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `job_id` | `uuid not null references public.jobs(id) on delete cascade` |
| `created_at` | `timestamptz not null default now()` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `person_id` | `uuid not null` |
| `references` | `public.people(id)` |
| `on` | `delete cascade` |
| `references` | `public.jobs(id)` |
| `on` | `delete cascade` |

**Constraints (tabela):**
- `unique (tenant_id, candidate_id, job_id)`
- `constraint favorite_jobs_unique unique (person_id, job_id)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(candidate_id)` → `public.candidates(id)` on delete cascade
- `(job_id)` → `public.jobs(id)` on delete cascade

**Índices:**
- `idx_favorite_jobs_person` (person_id)  *[`20260904220000_candidate_favorite_jobs.sql`]*
- `idx_favorite_jobs_job` (job_id)  *[`20260904220000_candidate_favorite_jobs.sql`]*
- `idx_favorite_jobs_tenant` (tenant_id)  *[`20260904220000_candidate_favorite_jobs.sql`]*

## `public.file_access_logs`
Fontes: `20260816000800_storage.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `file_id` | `uuid not null` |
| `references` | `public.files(id)` |
| `on` | `delete cascade` |
| `person_id` | `uuid references public.people(id) on delete set null` |
| `access_type` | `varchar(20) not null` |
| `ip_address` | `inet` |
| `user_agent` | `text` |
| `status` | `varchar(20) not null default 'success'` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (access_type in ('view','download','upload','signed_url','delete'))`
- `check (status in ('success','denied','error'))`

**Foreign keys:**
- `(person_id)` → `public.people(id)` on delete set null

**Índices:**
- `idx_file_access_logs_file` (file_id)  *[`20260816000800_storage.sql`]*
- `idx_file_access_logs_person` (person_id)  *[`20260816000800_storage.sql`]*
- `idx_file_access_logs_created_at` (created_at desc)  *[`20260816000800_storage.sql`]*
- `idx_file_access_logs_status` (status)  *[`20260816000800_storage.sql`]*

## `public.files`
Fontes: `20260816000800_storage.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `owner_person_id` | `uuid references public.people(id) on delete set null` |
| `provider` | `varchar(20) not null` |
| `bucket` | `varchar(100) not null` |
| `object_key` | `varchar(500) not null` |
| `original_name` | `varchar(255)` |
| `mime_type` | `varchar(100)` |
| `size_bytes` | `bigint` |
| `checksum` | `varchar(64)` |
| `visibility` | `varchar(20) not null default 'private'` |
| `status` | `varchar(20) not null default 'active'` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_by` | `uuid references public.people(id)` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (provider in ('supabase','s3','r2','local'))`
- `check (visibility in ('public','private','tenant'))`
- `check (status in ('active','deleted','quarantined'))`
- `unique (provider, bucket, object_key)`

**Foreign keys:**
- `(owner_person_id)` → `public.people(id)` on delete set null
- `(created_by)` → `public.people(id)` 

**Índices:**
- `idx_files_tenant` (tenant_id)  *[`20260816000800_storage.sql`]*
- `idx_files_owner` (owner_person_id)  *[`20260816000800_storage.sql`]*
- `idx_files_provider` (provider)  *[`20260816000800_storage.sql`]*
- `idx_files_bucket` (bucket)  *[`20260816000800_storage.sql`]*
- `idx_files_object_key` (object_key)  *[`20260816000800_storage.sql`]*
- `idx_files_checksum` (checksum)  *[`20260816000800_storage.sql`]*
- `idx_files_status` (status)  *[`20260816000800_storage.sql`]*
- `idx_files_visibility` (visibility)  *[`20260816000800_storage.sql`]*
- `idx_files_original_name` (original_name)  *[`20260816000800_storage.sql`]*

## `public.first_login_state`
Fontes: `20260825000004_first_access_tables.sql`

| Campo | Definição |
|---|---|
| `person_id` | `uuid primary key references public.people(id)` |
| `must_change_password` | `boolean not null default true` |
| `terms_version` | `text` |
| `privacy_version` | `text` |
| `lgpd_consent_version` | `text` |
| `first_login_completed` | `boolean not null default false` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `welcome_completed_at` | `timestamptz` *(add: `20260825000006_auth_flow_welcome.sql`)* |
| `signup_origin` | `TEXT` *(add: `20260910000002_unify_first_login_state.sql`)* |

**Foreign keys:**
- `(person_id)` → `public.people(id)` 

**Índices:**
- `idx_first_login_state_person` (person_id)  *[`20260825000004_first_access_tables.sql`]*

## `public.footer_configs`
Fontes: `20260907000000_footer_configs.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `scope` | `text not null unique` |
| `links` | `jsonb not null default '[]'::jsonb` |
| `is_active` | `boolean not null default true` |
| `sort_order` | `integer not null default 0` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `scope` | `in (` |

**Constraints (tabela):**
- `constraint footer_configs_scope_valid check (`

**Índices:**
- `idx_footer_configs_active_scope` (scope) where is_active = true *[`20260907000000_footer_configs.sql`]*

## `public.global_navigation_links`
Fontes: `20260906000000_candidate_portal_navigation.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `key` | `text not null unique` |
| `label` | `text not null` |
| `href` | `text not null` |
| `icon` | `text not null` |
| `action` | `text not null default 'link', -- link \| accessibility \| chat \| logout \| site_home` |
| `permission_key` | `text null` |
| `show_in_sidebar` | `boolean not null default true` |
| `show_in_bottom_nav` | `boolean not null default false` |
| `show_in_footer` | `boolean not null default false` |
| `sort_order` | `integer not null default 0` |
| `is_active` | `boolean not null default true` |
| `target_audience` | `text[] not null default array[]::text[], -- vazio = todos` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `constraint global_nav_key_not_blank check (length(btrim(key)) > 0)`
- `constraint global_nav_label_not_blank check (length(btrim(label)) > 0)`
- `constraint global_nav_action_valid check (action in ('link','accessibility','chat','logout','site_home'))`

**Índices:**
- `idx_gnl_active_sort` (is_active, sort_order) where is_active = true *[`20260906000000_candidate_portal_navigation.sql`]*

## `public.hires`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `application_id` | `uuid not null references public.applications(id) on delete cascade` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `job_id` | `uuid not null references public.jobs(id) on delete cascade` |
| `company_id` | `uuid references public.companies(id) on delete set null` |
| `start_date` | `date` |
| `contract_type` | `text check (contract_type in ('temporary','effective','internship','apprentice','freelance','third_party'))` |
| `salary` | `numeric` |
| `notes` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(application_id)` → `public.applications(id)` on delete cascade
- `(candidate_id)` → `public.candidates(id)` on delete cascade
- `(job_id)` → `public.jobs(id)` on delete cascade
- `(company_id)` → `public.companies(id)` on delete set null

## `public.integration_connections`
Fontes: `20260902000004_04_integration_contracts.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `tenant_id` | `uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE` |
| `provider_code` | `text NOT NULL` |
| `display_name` | `text NOT NULL` |
| `status` | `text NOT NULL DEFAULT 'active'` |
| `external_account_id` | `text` |
| `config` | `jsonb NOT NULL DEFAULT '{}'::jsonb` |
| `last_synced_at` | `timestamptz` |
| `last_error_at` | `timestamptz` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` |

**Constraints (tabela):**
- `CHECK (status IN ('active','paused','error','revoked'))`
- `CONSTRAINT uq_integration_connections UNIQUE (tenant_id, provider_code)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` ON DELETE CASCADE

**Índices:**
- `idx_integration_connections_tenant` (tenant_id)  *[`20260902000004_04_integration_contracts.sql`]*
- `idx_integration_connections_provider` (provider_code)  *[`20260902000004_04_integration_contracts.sql`]*

## `public.integration_credentials`
Fontes: `20260902000004_04_integration_contracts.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `connection_id` | `uuid NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE` |
| `credential_type` | `text NOT NULL` |
| `ciphertext` | `text NOT NULL` |
| `key_uri` | `text NOT NULL` |
| `expires_at` | `timestamptz` |
| `rotated_at` | `timestamptz NOT NULL DEFAULT now()` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |

**Foreign keys:**
- `(connection_id)` → `public.integration_connections(id)` ON DELETE CASCADE

**Índices:**
- `idx_integration_credentials_connection` (connection_id)  *[`20260902000004_04_integration_contracts.sql`]*

## `public.integration_errors`
Fontes: `20260902000004_04_integration_contracts.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `connection_id` | `uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL` |
| `provider_code` | `text NOT NULL` |
| `error_code` | `text` |
| `error_message` | `text NOT NULL` |
| `context` | `jsonb NOT NULL DEFAULT '{}'::jsonb` |
| `occurred_at` | `timestamptz NOT NULL DEFAULT now()` |
| `resolved_at` | `timestamptz` |

**Foreign keys:**
- `(connection_id)` → `public.integration_connections(id)` ON DELETE SET NULL

**Índices:**
- `idx_integration_errors_occurred` (occurred_at DESC)  *[`20260902000004_04_integration_contracts.sql`]*
- `idx_integration_errors_unresolved` (occurred_at DESC) WHERE resolved_at IS NULL *[`20260902000004_04_integration_contracts.sql`]*

## `public.integration_events`
Fontes: `20260902000004_04_integration_contracts.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `connection_id` | `uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL` |
| `domain_event_id` | `uuid REFERENCES public.domain_events(id) ON DELETE SET NULL` |
| `provider_code` | `text NOT NULL` |
| `event_type` | `text NOT NULL` |
| `idempotency_key` | `text NOT NULL` |
| `status` | `text NOT NULL DEFAULT 'pending'` |
| `attempts` | `integer NOT NULL DEFAULT 0` |
| `last_error` | `text` |
| `sent_at` | `timestamptz` |
| `delivered_at` | `timestamptz` |
| `payload` | `jsonb NOT NULL DEFAULT '{}'::jsonb` |
| `response` | `jsonb` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` |

**Constraints (tabela):**
- `CHECK (status IN ('pending','sent','delivered','failed','retrying'))`
- `CONSTRAINT uq_integration_events_idempotency UNIQUE (provider_code, idempotency_key)`

**Foreign keys:**
- `(connection_id)` → `public.integration_connections(id)` ON DELETE SET NULL
- `(domain_event_id)` → `public.domain_events(id)` ON DELETE SET NULL

**Índices:**
- `idx_integration_events_status` (status, created_at)  *[`20260902000004_04_integration_contracts.sql`]*
- `idx_integration_events_connection` (connection_id)  *[`20260902000004_04_integration_contracts.sql`]*

## `public.integration_sync_runs`
Fontes: `20260902000004_04_integration_contracts.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `connection_id` | `uuid NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE` |
| `direction` | `text NOT NULL CHECK (direction IN ('inbound','outbound','bidirectional'))` |
| `started_at` | `timestamptz NOT NULL DEFAULT now()` |
| `finished_at` | `timestamptz` |
| `status` | `text NOT NULL DEFAULT 'running'` |
| `records_total` | `integer` |
| `records_ok` | `integer` |
| `records_failed` | `integer` |
| `error_summary` | `text` |
| `metadata` | `jsonb NOT NULL DEFAULT '{}'::jsonb` |

**Constraints (tabela):**
- `CHECK (status IN ('running','success','partial','failed'))`

**Foreign keys:**
- `(connection_id)` → `public.integration_connections(id)` ON DELETE CASCADE

**Índices:**
- `idx_integration_sync_runs_connection` (connection_id, started_at DESC)  *[`20260902000004_04_integration_contracts.sql`]*

## `public.integration_webhooks`
Fontes: `20260902000004_04_integration_contracts.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `connection_id` | `uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL` |
| `provider_code` | `text NOT NULL` |
| `external_id` | `text NOT NULL` |
| `event_type` | `text NOT NULL` |
| `payload` | `jsonb NOT NULL` |
| `signature_valid` | `boolean` |
| `processed` | `boolean NOT NULL DEFAULT false` |
| `received_at` | `timestamptz NOT NULL DEFAULT now()` |
| `processed_at` | `timestamptz` |

**Constraints (tabela):**
- `CONSTRAINT uq_integration_webhooks UNIQUE (provider_code, external_id, event_type)`

**Foreign keys:**
- `(connection_id)` → `public.integration_connections(id)` ON DELETE SET NULL

**Índices:**
- `idx_integration_webhooks_unprocessed` (received_at) WHERE processed = false *[`20260902000004_04_integration_contracts.sql`]*

## `public.interviews`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `process_id` | `uuid not null references public.recruitment_processes(id) on delete cascade` |
| `application_id` | `uuid references public.applications(id) on delete set null` |
| `candidate_id` | `uuid not null references public.candidates(id) on delete cascade` |
| `stage` | `text` |
| `scheduled_at` | `timestamptz` |
| `location` | `text` |
| `video_link` | `text` |
| `status` | `text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','rescheduled'))` |
| `notes` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(process_id)` → `public.recruitment_processes(id)` on delete cascade
- `(application_id)` → `public.applications(id)` on delete set null
- `(candidate_id)` → `public.candidates(id)` on delete cascade

**Índices:**
- `idx_interviews_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_interviews_process` (process_id)  *[`schema.sql`]*
- `idx_interviews_candidate` (candidate_id)  *[`schema.sql`]*

## `public.job_matches`
Fontes: `20260816001100_talent_pool.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `candidate_id` | `uuid not null` |
| `references` | `public.candidates(id)` |
| `on` | `delete cascade` |
| `job_id` | `uuid not null` |
| `references` | `public.jobs(id)` |
| `on` | `delete cascade` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `score` | `numeric(5,2) not null check (score >= 0 and score <= 100)` |
| `reasons` | `jsonb not null default '{}'::jsonb` |
| `algorithm_version` | `varchar(20) check (algorithm_version in ('1.0'))` |
| `is_eligible` | `boolean not null default true` |
| `sent_notification` | `boolean not null default false` |
| `invalidated_at` | `timestamptz` |
| `invalidated_reason` | `varchar(100)` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Índices:**
- `idx_job_matches_candidate` (candidate_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_job_matches_job` (job_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_job_matches_tenant` (tenant_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_job_matches_score` (score desc)  *[`20260816001100_talent_pool.sql`]*
- `idx_job_matches_eligible` (is_eligible, sent_notification) where is_eligible = true and sent_notification = false *[`20260816001100_talent_pool.sql`]*
- `idx_job_matches_invalidated` (invalidated_at) where invalidated_at is not null *[`20260816001100_talent_pool.sql`]*
- UNIQUE `uk_job_matches_candidate_job` (candidate_id, job_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_job_matches_job_id` (job_id) WHERE job_id IS NOT NULL *[`20260830000500_reconcile_job_matches.sql`]*

## `public.job_skills`
Fontes: `schema.sql`, `20260816000500_jobs.sql`

| Campo | Definição |
|---|---|
| `job_id` | `uuid not null references public.jobs(id) on delete cascade` |
| `skill_id` | `uuid not null references public.skills(id) on delete cascade` |
| `level_required` | `text check (level_required in ('basic','intermediate','advanced'))` |
| `required` | `boolean not null default true` |
| `created_at` | `timestamptz not null default now()` |
| `id` | `uuid primary key default gen_random_uuid()` |
| `references` | `public.jobs(id)` |
| `on` | `delete cascade` |
| `references` | `public.skills(id)` |
| `required_level` | `varchar(20)` |
| `is_required` | `boolean not null default true` |

**Constraints (tabela):**
- `primary key (job_id, skill_id)`
- `check (required_level in ('beginner','intermediate','advanced'))`
- `unique (job_id, skill_id)`

**Foreign keys:**
- `(job_id)` → `public.jobs(id)` on delete cascade
- `(skill_id)` → `public.skills(id)` on delete cascade

**Índices:**
- `idx_job_skills_job` (job_id)  *[`20260816000500_jobs.sql`]*
- `idx_job_skills_skill` (skill_id)  *[`20260816000500_jobs.sql`]*

## `public.job_slug_redirects`
Fontes: `20261030000001_p0_b1_job_slug_redirects.sql`

| Campo | Definição |
|---|---|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `tenant_id` | `UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE` |
| `job_id` | `UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE` |
| `old_slug` | `TEXT NOT NULL` |
| `new_slug` | `TEXT NOT NULL` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |

**Constraints (tabela):**
- `CONSTRAINT uq_job_slug_redirects_old_slug UNIQUE (tenant_id, old_slug)`
- `CONSTRAINT chk_job_slug_redirects_different CHECK (old_slug <> new_slug)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` ON DELETE CASCADE
- `(job_id)` → `public.jobs(id)` ON DELETE CASCADE

**Índices:**
- `idx_job_slug_redirects_tenant_job` (tenant_id, job_id)  *[`20261030000001_p0_b1_job_slug_redirects.sql`]*
- `idx_job_slug_redirects_old_slug` (tenant_id, old_slug)  *[`20261030000001_p0_b1_job_slug_redirects.sql`]*

## `public.jobs`
Fontes: `schema.sql`, `20260816000500_jobs.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `company_id` | `uuid references public.companies(id) on delete set null` |
| `title` | `text not null` |
| `slug` | `text not null` |
| `description` | `text` |
| `responsibilities` | `text` |
| `requirements` | `text` |
| `benefits` | `jsonb` |
| `salary_min` | `numeric` |
| `salary_max` | `numeric` |
| `salary_type` | `text check (salary_type in ('range','monthly','negotiable'))` |
| `employment_type` | `text not null check (employment_type in ('temporary','effective','internship','apprentice','freelance','third_party'))` |
| `job_source` | `text not null check (job_source in ('client','talent_pool'))` |
| `professional_area` | `text` |
| `workload` | `text` |
| `work_schedule` | `text` |
| `work_mode` | `text check (work_mode in ('presencial','hybrid','remote'))` |
| `location` | `jsonb` |
| `status` | `text not null default 'draft' check (status in ('draft','active','archived','filled'))` |
| `published_at` | `timestamptz` |
| `expires_at` | `timestamptz` |
| `views` | `integer not null default 0` |
| `applications_count` | `integer not null default 0` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `company_relationship_id` | `uuid` |
| `references` | `public.company_relationships(id)` |
| `on` | `delete set null` |
| `default` | `'negotiate'` |
| `contract_type` | `varchar(20)` |
| `default` | `'clt'` |
| `seniority` | `varchar(20)` |
| `work_hours` | `varchar(50)` |
| `default` | `'onsite'` |
| `city` | `varchar(100)` |
| `state` | `varchar(2)` |
| `location_detail` | `varchar(255)` |
| `views_count` | `integer not null default 0` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_by` | `uuid references public.people(id)` |

**Constraints (tabela):**
- `unique (tenant_id, slug)`
- `check (salary_type in ('range','monthly','negotiate'))`
- `check (contract_type in ('clt','internship','temporary','freelance','contracted','cd'))`
- `check (seniority in ('internship','junior','mid','senior','master','leadership'))`
- `check (work_mode in ('onsite','hybrid','remote'))`
- `check (status in ('draft','published','archived','hired','expired'))`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(company_id)` → `public.companies(id)` on delete set null
- `(created_by)` → `public.people(id)` 

**Índices:**
- `idx_jobs_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_jobs_status` (status)  *[`schema.sql`]*
- `idx_jobs_employment_type` (employment_type)  *[`schema.sql`]*
- `idx_jobs_job_source` (job_source)  *[`schema.sql`]*
- `idx_jobs_professional_area` (professional_area)  *[`schema.sql`]*
- `idx_jobs_published` (published_at desc)  *[`schema.sql`]*
- `idx_jobs_company_relationship` (company_relationship_id)  *[`20260816000500_jobs.sql`]*
- `idx_jobs_work_mode` (work_mode)  *[`20260816000500_jobs.sql`]*
- `idx_jobs_contract_type` (contract_type)  *[`20260816000500_jobs.sql`]*
- `idx_jobs_tenant_status_published` (tenant_id, status, published_at DESC) WHERE status = 'published' *[`20260902000001_01_schema_reconciliation.sql`]*

## `public.languages`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `curriculum_id` | `uuid not null references public.curricula(id) on delete cascade` |
| `language` | `text not null` |
| `proficiency` | `text check (proficiency in ('basic','intermediate','advanced','fluent','native'))` |
| `created_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `unique (curriculum_id, language)`

**Foreign keys:**
- `(curriculum_id)` → `public.curricula(id)` on delete cascade

## `public.leads`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `name` | `text not null` |
| `company` | `text` |
| `email` | `text` |
| `phone` | `text` |
| `origin` | `text check (origin in ('site','whatsapp','instagram','google','referral','event'))` |
| `lead_type` | `text check (lead_type in ('client','company','candidate','partner','supplier','press'))` |
| `message` | `text` |
| `utm_source` | `text` |
| `utm_campaign` | `text` |
| `ip_address` | `text` |
| `assigned_to` | `uuid references auth.users(id) on delete set null` |
| `status` | `text not null default 'new' check (status in ('new','contacted','qualified','proposal_sent','converted','discarded'))` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(assigned_to)` → `auth.users(id)` on delete set null

**Índices:**
- `idx_leads_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_leads_status` (status)  *[`schema.sql`]*
- `idx_leads_origin` (origin)  *[`schema.sql`]*
- `idx_leads_type` (lead_type)  *[`schema.sql`]*

## `public.legal_acceptances`
Fontes: `20260825000004_first_access_tables.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `person_id` | `uuid not null references public.people(id)` |
| `tenant_id` | `uuid not null references public.tenants(id)` |
| `document_type` | `text not null` |
| `document_version` | `text not null` |
| `accepted_at` | `timestamptz not null default now()` |
| `ip` | `text` |
| `user_agent` | `text` |
| `metadata` | `jsonb not null default '{}'::jsonb` |

**Foreign keys:**
- `(person_id)` → `public.people(id)` 
- `(tenant_id)` → `public.tenants(id)` 

**Índices:**
- `idx_legal_acceptances_person` (person_id)  *[`20260825000004_first_access_tables.sql`]*
- `idx_legal_acceptances_tenant` (tenant_id)  *[`20260825000004_first_access_tables.sql`]*

## `public.media_assets`
Fontes: `20260901000001_media_storage_v1.sql`

| Campo | Definição |
|---|---|
| `id` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| `tenant_id` | `UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE` |
| `bucket_id` | `TEXT NOT NULL` |
| `storage_path` | `TEXT NOT NULL` |
| `file_url` | `TEXT NOT NULL` |
| `file_name` | `TEXT NOT NULL` |
| `mime_type` | `TEXT NOT NULL` |
| `file_size_bytes` | `INTEGER` |
| `width` | `INTEGER` |
| `height` | `INTEGER` |
| `entity_type` | `TEXT NOT NULL,  -- 'service', 'company', 'job', 'blog_post', 'page', 'avatar', 'document'` |
| `entity_id` | `UUID,            -- nullable for general uploads` |
| `uploaded_by` | `UUID REFERENCES public.people(id)` |
| `alt_text` | `TEXT` |
| `title` | `TEXT` |
| `description` | `TEXT` |
| `metadata` | `JSONB NOT NULL DEFAULT '{}'::jsonb` |
| `is_primary` | `BOOLEAN NOT NULL DEFAULT false` |
| `sort_order` | `INTEGER NOT NULL DEFAULT 0` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` |
| `file_hash` | `TEXT` *(add: `20261026100000_p0_a1_media_assets_file_hash.sql`)* |

**Constraints (tabela):**
- `CONSTRAINT uq_media_assets_storage UNIQUE (bucket_id, storage_path)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` ON DELETE CASCADE
- `(uploaded_by)` → `public.people(id)` 

**Índices:**
- `idx_media_assets_tenant_id` (tenant_id)  *[`20260901000001_media_storage_v1.sql`]*
- `idx_media_assets_entity` (entity_type, entity_id)  *[`20260901000001_media_storage_v1.sql`]*
- `idx_media_assets_bucket` (bucket_id)  *[`20260901000001_media_storage_v1.sql`]*
- `idx_media_assets_uploaded_by` (uploaded_by)  *[`20260901000001_media_storage_v1.sql`]*

## `public.notification_deliveries`
Fontes: `20260816001000_notifications.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `notification_id` | `uuid not null` |
| `references` | `public.notifications(id)` |
| `on` | `delete cascade` |
| `channel` | `notification_channel not null` |
| `status` | `notification_delivery_status not null default 'pending'` |
| `provider` | `varchar(50)` |
| `provider_message_id` | `varchar(255)` |
| `attempts` | `integer not null default 0` |
| `max_attempts` | `integer not null default 5` |
| `last_error` | `text` |
| `next_attempt_at` | `timestamptz` |
| `sent_at` | `timestamptz` |
| `delivered_at` | `timestamptz` |
| `failed_at` | `timestamptz` |
| `skipped_at` | `timestamptz` |
| `skip_reason` | `varchar(100)` |
| `provider_response` | `jsonb` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Índices:**
- `idx_deliveries_notification` (notification_id)  *[`20260816001000_notifications.sql`]*
- `idx_deliveries_status` (status)  *[`20260816001000_notifications.sql`]*
- `idx_deliveries_pending` (next_attempt_at) where next_attempt_at is not null and status = 'pending' *[`20260816001000_notifications.sql`]*
- `idx_deliveries_provider` (provider)  *[`20260816001000_notifications.sql`]*
- `idx_deliveries_channel` (channel)  *[`20260816001000_notifications.sql`]*
- `idx_deliveries_unique` (notification_id, channel)  *[`20260816001000_notifications.sql`]*

## `public.notification_preferences`
Fontes: `20260816001000_notifications.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `person_id` | `uuid not null` |
| `references` | `public.people(id)` |
| `on` | `delete cascade` |
| `notification_type` | `varchar(100) not null` |
| `channel` | `notification_channel not null` |
| `enabled` | `boolean not null default true` |
| `consented_at` | `timestamptz not null default now()` |
| `disabled_at` | `timestamptz` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `constraint uk_preference_person_type_channel`
- `unique (person_id, notification_type, channel)`

**Índices:**
- `idx_prefs_person` (person_id)  *[`20260816001000_notifications.sql`]*
- `idx_prefs_type` (notification_type)  *[`20260816001000_notifications.sql`]*
- `idx_prefs_enabled` (enabled)  *[`20260816001000_notifications.sql`]*

## `public.notifications`
Fontes: `schema.sql`, `20260816001000_notifications.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `user_id` | `uuid not null references auth.users(id) on delete cascade` |
| `title` | `text not null` |
| `message` | `text not null` |
| `type` | `text check (type in ('email','whatsapp','system','push'))` |
| `read` | `boolean not null default false` |
| `link` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `recipient_person_id` | `uuid not null` |
| `references` | `public.people(id)` |
| `on` | `delete cascade` |
| `notification_type` | `varchar(100) not null` |
| `category` | `notification_category not null default 'transactional'` |
| `priority` | `notification_priority not null default 'normal'` |
| `body` | `text` |
| `data` | `jsonb not null default '{}'::jsonb` |
| `status` | `notification_status not null default 'pending'` |
| `source_event_id` | `uuid` |
| `references` | `public.domain_events(id)` |
| `created_by` | `uuid references public.people(id) on delete set null` |
| `scheduled_at` | `timestamptz` |
| `expires_at` | `timestamptz` |
| `read_at` | `timestamptz` |
| `idempotency_key` | `uuid` |
| `metadata` | `jsonb not null default '{}'::jsonb` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(user_id)` → `auth.users(id)` on delete cascade
- `(created_by)` → `public.people(id)` on delete set null

**Índices:**
- `idx_notifications_user` (user_id)  *[`schema.sql`]*
- `idx_notifications_read` (read)  *[`schema.sql`]*
- `idx_notifications_recipient` (recipient_person_id)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_tenant` (tenant_id)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_status` (status)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_type` (notification_type)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_category` (category)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_priority` (priority)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_scheduled` (scheduled_at) where scheduled_at is not null *[`20260816001000_notifications.sql`]*
- `idx_notifications_source_event` (source_event_id)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_idempotency` (idempotency_key)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_expires` (expires_at)  *[`20260816001000_notifications.sql`]*
- `idx_notifications_user_id` (user_id) WHERE user_id IS NOT NULL *[`20260830000600_reconcile_notifications.sql`]*
- `idx_notifications_read_at` (read_at)  *[`20260830000600_reconcile_notifications.sql`]*

## `public.page_templates`
Fontes: `20260908000000_page_templates.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `key` | `text not null unique` |
| `title` | `text not null` |
| `body` | `text not null` |
| `is_active` | `boolean not null default true` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `constraint page_templates_key_not_blank check (length(btrim(key)) > 0)`

**Índices:**
- `idx_page_templates_active` (key) where is_active = true *[`20260908000000_page_templates.sql`]*

## `public.payments`
Fontes: `20260827001200_finance.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `company_id` | `uuid` |
| `references` | `public.companies(id)` |
| `on` | `delete set null` |
| `account_payable_id` | `uuid` |
| `references` | `public.accounts_payable(id) on delete set null` |
| `amount` | `numeric(12,2) not null` |
| `payment_date` | `date not null` |
| `payment_method` | `varchar(50)` |
| `payment_reference` | `varchar(255)` |
| `notes` | `text` |
| `created_by` | `uuid references public.people(id) on delete set null` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(created_by)` → `public.people(id)` on delete set null

**Índices:**
- `idx_payments_tenant` (tenant_id)  *[`20260827001200_finance.sql`]*
- `idx_payments_account_payable` (account_payable_id)  *[`20260827001200_finance.sql`]*

## `public.people`
Fontes: `20260816000100_core_people_tenants.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `auth_user_id` | `uuid unique,    -- optional FK to auth.users (set when user registers)` |
| `full_name` | `varchar(150) not null` |
| `email` | `varchar(255) unique` |
| `social_name` | `varchar(150)` |
| `cpf` | `varchar(14) unique` |
| `birth_date` | `date` |
| `gender` | `varchar(20)` |
| `status` | `varchar(20) not null default 'active'` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (gender in ('male','female','other','prefer_not_to_say'))`
- `check (status in ('active','inactive','archived'))`

**Índices:**
- `idx_people_auth_user_id` (auth_user_id)  *[`20260816000100_core_people_tenants.sql`]*
- `idx_people_cpf` (cpf)  *[`20260816000100_core_people_tenants.sql`]*

## `public.permissions`
Fontes: `20260816000700_rbac.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `name` | `varchar(100) not null unique` |
| `description` | `text` |
| `module` | `varchar(50)` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `code` | `text` *(add: `20260902150001_backend_gate_final.sql`)* |

**Índices:**
- `idx_permissions_name` (name)  *[`20260816000700_rbac.sql`]*
- `idx_permissions_module` (module)  *[`20260816000700_rbac.sql`]*

## `public.profiles`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key references auth.users on delete cascade` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `email` | `text not null` |
| `full_name` | `text not null` |
| `role` | `text not null check (role in ('admin','candidato','empresa','rh','comercial','financeiro','atendimento'))` |
| `phone` | `text` |
| `company_name` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade

## `public.provider_configs`
Fontes: `20260902000005_05_providers.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `tenant_id` | `uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE` |
| `provider_id` | `uuid NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT` |
| `connection_id` | `uuid REFERENCES public.integration_connections(id) ON DELETE SET NULL` |
| `is_enabled` | `boolean NOT NULL DEFAULT true` |
| `settings` | `jsonb NOT NULL DEFAULT '{}'::jsonb` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` |

**Constraints (tabela):**
- `CONSTRAINT uq_provider_configs_tenant UNIQUE (tenant_id, provider_id)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` ON DELETE CASCADE
- `(provider_id)` → `public.providers(id)` ON DELETE RESTRICT
- `(connection_id)` → `public.integration_connections(id)` ON DELETE SET NULL

**Índices:**
- `idx_provider_configs_tenant` (tenant_id) WHERE is_enabled = true *[`20260902000005_05_providers.sql`]*

## `public.providers`
Fontes: `20260902000005_05_providers.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `code` | `text NOT NULL UNIQUE` |
| `category` | `text NOT NULL CHECK (category IN (` |
| `display_name` | `text NOT NULL` |
| `description` | `text` |
| `api_base_url` | `text` |
| `docs_url` | `text` |
| `is_active` | `boolean NOT NULL DEFAULT true` |
| `config_schema` | `jsonb NOT NULL DEFAULT '{}'::jsonb` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` |

**Índices:**
- `idx_providers_category` (category) WHERE is_active = true *[`20260902000005_05_providers.sql`]*

## `public.receipts`
Fontes: `20260827001200_finance.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `company_id` | `uuid` |
| `references` | `public.companies(id)` |
| `on` | `delete set null` |
| `account_receivable_id` | `uuid` |
| `references` | `public.accounts_receivable(id) on delete set null` |
| `amount` | `numeric(12,2) not null` |
| `received_date` | `date not null` |
| `payment_method` | `varchar(50)` |
| `payment_reference` | `varchar(255)` |
| `notes` | `text` |
| `created_by` | `uuid references public.people(id) on delete set null` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(created_by)` → `public.people(id)` on delete set null

**Índices:**
- `idx_receipts_tenant` (tenant_id)  *[`20260827001200_finance.sql`]*
- `idx_receipts_account_receivable` (account_receivable_id)  *[`20260827001200_finance.sql`]*

## `public.recruitment_demands`
Fontes: `20260830000300_reconcile_recruitment_demands.sql`

| Campo | Definição |
|---|---|
| `contact_name` | `text,
  ADD COLUMN IF NOT EXISTS contact_email      text,
  ADD COLUMN IF NOT EXISTS contact_phone      text,
  ADD COLUMN IF NOT EXISTS description        text,
  ADD COLUMN IF NOT EXISTS urgency            text,
  ADD COLUMN IF NOT EXISTS service_type       text,
  ADD COLUMN IF NOT EXISTS responsible_person_id uuid` *(add: `20260830000300_reconcile_recruitment_demands.sql`)* |
| `service_id` | `uuid` *(add: `20260830001000_recruitment_demands_service_link.sql`)* |

**Foreign keys:**
- `recruitment_demands_service_id_fkey` `(service_id)` → `public.services(id)` ON DELETE SET NULL

**Índices:**
- `idx_recruitment_demands_urgency` (urgency) WHERE urgency IS NOT NULL *[`20260830000300_reconcile_recruitment_demands.sql`]*
- `idx_recruitment_demands_service_id` (service_id) WHERE service_id IS NOT NULL *[`20260830001000_recruitment_demands_service_link.sql`]*

## `public.recruitment_processes`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `job_id` | `uuid not null references public.jobs(id) on delete cascade` |
| `company_id` | `uuid references public.companies(id) on delete set null` |
| `title` | `text` |
| `stages_config` | `jsonb not null default '[]'::jsonb` |
| `status` | `text not null default 'open' check (status in ('open','in_progress','paused','completed','cancelled'))` |
| `started_at` | `date` |
| `expected_end` | `date` |
| `ended_at` | `date` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(job_id)` → `public.jobs(id)` on delete cascade
- `(company_id)` → `public.companies(id)` on delete set null

**Índices:**
- `idx_processes_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_processes_job` (job_id)  *[`schema.sql`]*
- `idx_processes_status` (status)  *[`schema.sql`]*

## `public.recruitment_stages`
Fontes: `20260827000000_recruitment_stages.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `recruitment_process_id` | `uuid not null` |
| `references` | `public.recruitment_processes(id)` |
| `on` | `delete cascade` |
| `name` | `varchar(120) not null` |
| `description` | `text` |
| `status` | `varchar(50) not null default 'active'` |
| `order` | `integer not null default 0` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `check (status in ('active', 'inactive', 'completed', 'skipped'))`

**Índices:**
- `idx_recruitment_stages_tenant` (tenant_id)  *[`20260827000000_recruitment_stages.sql`]*
- `idx_recruitment_stages_process` (recruitment_process_id)  *[`20260827000000_recruitment_stages.sql`]*
- `idx_recruitment_stages_order` (recruitment_process_id, order)  *[`20260827000000_recruitment_stages.sql`]*

## `public.role_assignments`
Fontes: `20260816000700_rbac.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `person_id` | `uuid not null references public.people(id) on delete cascade` |
| `role_id` | `uuid not null references public.roles(id) on delete cascade` |
| `tenant_id` | `uuid references public.tenants(id) on delete cascade` |
| `assigned_by` | `uuid references public.people(id)` |
| `assigned_at` | `timestamptz not null default now()` |
| `expires_at` | `timestamptz` |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` *(add: `20260902150001_backend_gate_final.sql`)* |

**Foreign keys:**
- `(person_id)` → `public.people(id)` on delete cascade
- `(role_id)` → `public.roles(id)` on delete cascade
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(assigned_by)` → `public.people(id)` 

**Índices:**
- `idx_role_assignments_person` (person_id)  *[`20260816000700_rbac.sql`]*
- `idx_role_assignments_role` (role_id)  *[`20260816000700_rbac.sql`]*
- `idx_role_assignments_tenant` (tenant_id)  *[`20260816000700_rbac.sql`]*
- UNIQUE `uq_role_assignments_global` (person_id, role_id) where tenant_id is null *[`20260816000700_rbac.sql`]*
- UNIQUE `uq_role_assignments_tenant` (person_id, role_id, tenant_id) where tenant_id is not null *[`20260816000700_rbac.sql`]*

## `public.role_permissions`
Fontes: `20260816000700_rbac.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `role_id` | `uuid not null` |
| `references` | `public.roles(id)` |
| `on` | `delete cascade` |
| `permission_id` | `uuid not null` |
| `references` | `public.permissions(id)` |
| `on` | `delete cascade` |
| `granted_at` | `timestamptz not null default now()` |
| `granted_by` | `uuid references public.people(id)` |

**Constraints (tabela):**
- `unique (role_id, permission_id)`

**Foreign keys:**
- `(granted_by)` → `public.people(id)` 

**Índices:**
- `idx_role_permissions_role` (role_id)  *[`20260816000700_rbac.sql`]*
- `idx_role_permissions_permission` (permission_id)  *[`20260816000700_rbac.sql`]*

## `public.role_resource_permissions`
Fontes: `20260816001200_rls_consolidation.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `role_id` | `uuid not null` |
| `references` | `public.roles(id)` |
| `on` | `delete cascade` |
| `resource` | `varchar(100) not null` |
| `action` | `varchar(20) not null` |
| `allowed` | `boolean not null default true` |
| `created_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `constraint uk_role_resource_action`
- `unique (role_id, resource, action)`

**Índices:**
- `idx_role_resource_permission_role` (role_id)  *[`20260816001200_rls_consolidation.sql`]*
- `idx_role_resource_permission_resource` (resource)  *[`20260816001200_rls_consolidation.sql`]*

## `public.roles`
Fontes: `20260816000700_rbac.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `name` | `varchar(50) not null` |
| `is_global` | `boolean not null default false` |
| `description` | `text` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `status` | `text NOT NULL DEFAULT 'active',
      ADD COLUMN slug text,
      ADD COLUMN level integer,
      ADD COLUMN sector text,
      ADD COLUMN replacement_role_id uuid` *(add: `20260904000003_rbac03_canonical_roles.sql`)* |

**Constraints (tabela):**
- `unique (is_global, name)`

**Índices:**
- `idx_roles_name` (name)  *[`20260816000700_rbac.sql`]*
- `idx_roles_is_global` (is_global)  *[`20260816000700_rbac.sql`]*
- UNIQUE `roles_slug_unique` (slug)  *[`20260904000003_rbac03_canonical_roles.sql`]*
- `idx_roles_level_sector` (level, sector, scope)  *[`20260904000003_rbac03_canonical_roles.sql`]*

## `public.service_orders`
Fontes: `20260830000900_service_orders_relationship.sql`

| Campo | Definição |
|---|---|
| `company_relationship_id` | `uuid` *(add: `20260830000900_service_orders_relationship.sql`)* |

**Foreign keys:**
- `service_orders_company_relationship_id_fkey` `(company_relationship_id)` → `public.company_relationships(id)` ON DELETE SET NULL

**Índices:**
- `idx_service_orders_company_relationship_id` (company_relationship_id) WHERE company_relationship_id IS NOT NULL *[`20260830000900_service_orders_relationship.sql`]*

## `public.services`
Fontes: `schema.sql`, `20260829000001_services.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `name` | `text not null` |
| `description` | `text` |
| `short_description` | `text` |
| `benefits` | `text[]` |
| `image_url` | `text` |
| `icon` | `text` |
| `category` | `text not null check (category in ('rh','facilities','terceirizacao','candidate'))` |
| `active` | `boolean not null default true` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `slug` | `text NOT NULL` |
| `card_image_url` | `text` |
| `hero_image_url` | `text` |
| `hero_title` | `text` |
| `hero_subtitle` | `text` |
| `process_steps` | `jsonb NOT NULL DEFAULT '[]'::jsonb` |
| `cta_title` | `text` |
| `cta_description` | `text` |
| `cta_button_text` | `text` |
| `cta_button_url` | `text` |
| `seo_title` | `varchar(70)` |
| `seo_description` | `varchar(160)` |
| `seo_keywords` | `text[]` |
| `status` | `text NOT NULL DEFAULT 'draft'` |
| `published_at` | `timestamptz` |
| `display_order` | `integer NOT NULL DEFAULT 0` |
| `created_by` | `uuid REFERENCES public.people(id)` |

**Constraints (tabela):**
- `CHECK (status IN ('draft', 'published', 'archived'))`
- `CONSTRAINT uq_services_tenant_slug UNIQUE (tenant_id, slug)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(created_by)` → `public.people(id)` 

**Índices:**
- `idx_services_tenant_id` (tenant_id)  *[`20260829000001_services.sql`]*
- `idx_services_status` (status) WHERE status = 'published' *[`20260829000001_services.sql`]*
- `idx_services_display_order` (display_order)  *[`20260829000001_services.sql`]*
- `idx_services_category` (category) WHERE category IS NOT NULL *[`20260829000001_services.sql`]*

## `public.skills`
Fontes: `schema.sql`, `20260816000400_candidates.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid references public.tenants(id) on delete cascade` |
| `name` | `text not null` |
| `category` | `text` |
| `scope` | `text not null default 'global' check (scope in ('global','tenant'))` |
| `created_at` | `timestamptz not null default now()` |
| `code` | `varchar(50) unique` |
| `slug` | `varchar(150) unique` |
| `description` | `text` |
| `is_active` | `boolean not null default true` |
| `updated_at` | `timestamptz not null default now()` |

**Constraints (tabela):**
- `unique (tenant_id, name)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade

**Índices:**
- `idx_skills_slug` (slug)  *[`20260816000400_candidates.sql`]*
- `idx_skills_category` (category)  *[`20260816000400_candidates.sql`]*

## `public.talent_pool_memberships`
Fontes: `20260816001100_talent_pool.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default gen_random_uuid()` |
| `candidate_id` | `uuid not null` |
| `references` | `public.candidates(id)` |
| `on` | `delete cascade` |
| `tenant_id` | `uuid not null` |
| `references` | `public.tenants(id)` |
| `on` | `delete cascade` |
| `status` | `talent_pool_status not null default 'active'` |
| `source` | `talent_pool_source not null` |
| `consent_status` | `consent_status not null default 'granted'` |
| `consented_at` | `timestamptz not null default now()` |
| `consent_source` | `varchar(50),  -- 'website', 'email', 'app', 'admin'` |
| `consent_version` | `varchar(20),  -- versionamento do termo` |
| `joined_at` | `timestamptz not null default now(),  -- quando entrou no pool` |
| `removed_at` | `timestamptz,                          -- quando saiu` |
| `removal_reason` | `varchar(100),                        -- por que saiu` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `created_by` | `uuid references public.people(id) on delete set null` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(created_by)` → `public.people(id)` on delete set null

**Índices:**
- `idx_talent_pool_tenant` (tenant_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_talent_pool_candidate` (candidate_id)  *[`20260816001100_talent_pool.sql`]*
- `idx_talent_pool_status` (status)  *[`20260816001100_talent_pool.sql`]*
- `idx_talent_pool_source` (source)  *[`20260816001100_talent_pool.sql`]*
- `idx_talent_pool_consent` (consent_status)  *[`20260816001100_talent_pool.sql`]*
- `idx_talent_pool_joined` (joined_at desc)  *[`20260816001100_talent_pool.sql`]*
- `idx_talent_pool_active` (status, consent_status) where status = 'active' and consent_status = 'granted' *[`20260816001100_talent_pool.sql`]*
- UNIQUE `uk_talent_pool_candidate_tenant` (candidate_id, tenant_id)  *[`20260816001100_talent_pool.sql`]*

## `public.tenant_memberships`
Fontes: `schema.sql`, `20260816000100_core_people_tenants.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `user_id` | `uuid not null references auth.users(id) on delete cascade` |
| `membership_role` | `text not null check (membership_role in ('owner','admin','manager','member','viewer'))` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `person_id` | `uuid not null references public.people(id) on delete cascade` |
| `is_primary` | `boolean not null default false` |
| `status` | `varchar(20) not null default 'active'` |
| `joined_at` | `timestamptz not null default now()` |
| `left_at` | `timestamptz` |

**Constraints (tabela):**
- `unique (tenant_id, user_id)`
- `check (membership_role in ('owner','admin','manager','member','viewer'))`
- `check (status in ('active','invited','suspended','inactive'))`
- `unique (tenant_id, person_id)`

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(user_id)` → `auth.users(id)` on delete cascade
- `(person_id)` → `public.people(id)` on delete cascade

**Índices:**
- `idx_tenant_memberships_tenant` (tenant_id)  *[`20260816000100_core_people_tenants.sql`]*
- `idx_tenant_memberships_person` (person_id)  *[`20260816000100_core_people_tenants.sql`]*
- `idx_tenant_memberships_role` (membership_role)  *[`20260816000100_core_people_tenants.sql`]*

## `public.tenants`
Fontes: `schema.sql`, `20260816000100_core_people_tenants.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `name` | `text not null` |
| `slug` | `text not null unique` |
| `plan` | `text not null default 'free'` |
| `settings` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |
| `status` | `varchar(20) not null default 'active'` |

**Constraints (tabela):**
- `check (plan in ('free','starter','pro','enterprise'))`
- `check (status in ('active','inactive','suspended','trial'))`

**Índices:**
- `idx_tenants_slug` (slug)  *[`20260816000100_core_people_tenants.sql`]*
- `idx_tenants_status` (status)  *[`20260816000100_core_people_tenants.sql`]*

## `public.tickets`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `company_id` | `uuid references public.companies(id) on delete set null` |
| `user_id` | `uuid not null references auth.users(id) on delete cascade` |
| `category` | `text check (category in ('security','cleaning','access','maintenance','facilities','others'))` |
| `title` | `text not null` |
| `description` | `text` |
| `priority` | `text check (priority in ('low','medium','high','urgent')) default 'medium'` |
| `status` | `text check (status in ('open','in_analysis','resolved','closed')) default 'open'` |
| `assigned_to` | `uuid references auth.users(id) on delete set null` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade
- `(company_id)` → `public.companies(id)` on delete set null
- `(user_id)` → `auth.users(id)` on delete cascade
- `(assigned_to)` → `auth.users(id)` on delete set null

**Índices:**
- `idx_tickets_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_tickets_status` (status)  *[`schema.sql`]*
- `idx_tickets_priority` (priority)  *[`schema.sql`]*

## `public.webhooks`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `event` | `text not null` |
| `url` | `text not null` |
| `method` | `text not null default 'POST'` |
| `headers` | `jsonb` |
| `secret` | `text` |
| `active` | `boolean not null default true` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade

## `public.whatsapp_messages`
Fontes: `schema.sql`

| Campo | Definição |
|---|---|
| `id` | `uuid primary key default uuid_generate_v4()` |
| `tenant_id` | `uuid not null references public.tenants(id) on delete cascade` |
| `phone_number` | `text not null` |
| `direction` | `text not null default 'inbound' check (direction in ('inbound','outbound'))` |
| `message` | `text not null` |
| `status` | `text not null default 'sent' check (status in ('sent','delivered','read','error'))` |
| `provider` | `text` |
| `external_id` | `text` |
| `session_id` | `text` |
| `created_at` | `timestamptz not null default now()` |

**Foreign keys:**
- `(tenant_id)` → `public.tenants(id)` on delete cascade

**Índices:**
- `idx_whatsapp_tenant` (tenant_id)  *[`schema.sql`]*
- `idx_whatsapp_phone` (phone_number)  *[`schema.sql`]*
- `idx_whatsapp_created` (created_at)  *[`schema.sql`]*

## SQL read-only para contagem de linhas (executar com autorização)
```sql
SELECT schemaname, relname AS table_name, n_live_tup::bigint AS approx_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC, relname;
```
> `n_live_tup` é aproximado (estatísticas). Para contagem exata por tabela, use `SELECT count(*)` sob demanda (custo alto em tabelas grandes).
