# C1.7-B — Schema Reconciliation Inventory

## Scope

- Somente leitura do schema canônico.
- Sem alterações de UI, sem mock, sem criação de tabelas/permissões.
- Fonte: migrations em `supabase/migrations/`.

## Resumo executivo

- Tabelas confirmadas até o momento: **32+** no schema `public`.
- Domínios identificados: **core, identity, crm, recruitment, rbac, storage, audit, notifications, talent_pool, first_access, finance/fiscal/accounting**.
- Enum types confirmados: **vários** (ver seção abaixo).
- RLS habilitado na maioria das tabelas operacionais.
- Policies confirmadas por tabela.

---

## 1. ENUM TYPES

| Enum                    | Values                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `plan` (tenants)        | free, starter, pro, enterprise                                                                                                  |
| `tenant_status`         | active, inactive, suspended, trial                                                                                              |
| `gender` (people)       | male, female, other, prefer_not_to_say                                                                                          |
| `people_status`         | active, inactive, archived                                                                                                      |
| `membership_role`       | owner, admin, manager, member, viewer                                                                                           |
| `membership_status`     | active, invited, suspended, inactive                                                                                            |
| `company_size`          | micro, small, medium, large, enterprise                                                                                         |
| `company_status`        | active, inactive, suspended, pending                                                                                            |
| `relationship_status`   | active, inactive, pending, suspended                                                                                            |
| `salary_type`           | range, monthly, negotiate                                                                                                       |
| `job_status`            | draft, published, archived, hired, expired                                                                                      |
| `work_mode`             | onsite, hybrid, remote                                                                                                          |
| `seniority`             | internship, junior, mid, senior, master, leadership                                                                             |
| `contract_type`         | clt, internship, temporary, freelance, contracted, cd                                                                           |
| `candidate_status`      | active, inactive, archived, blacklisted                                                                                         |
| `proficiency`           | basic, intermediate, advanced, expert                                                                                           |
| `application_stage`     | submitted, screening, interview, technical_interview, presentation, reference_check, offer, hired, rejected, withdrawn, on_hold |
| `notification_channel`  | email, sms, whatsapp, push                                                                                                      |
| `notification_category` | transactional, marketing, system                                                                                                |
| `notification_priority` | low, normal, high, urgent                                                                                                       |
| `notification_status`   | pending, sent, delivered, read, failed, expired, skipped                                                                        |
| `talent_pool_status`    | active, inactive, withdrawn                                                                                                     |
| `consent_status`        | granted, revoked, expired                                                                                                       |
| `file_status`           | active, inactive, deleted                                                                                                       |
| `file_access_type`      | download, view, upload, delete, share                                                                                           |
| `event_type`            | application.created, application.status_changed, candidate.created, job.published, talent_pool.joined, job.match_found          |

---

## 2. TABELAS POR DOMÍNIO

### 2.1 CORE / IDENTIDADE

#### tenants

- Schema: public
- Tenant scoped: global (não tem tenant_id)
- PK: id (uuid, gen_random_uuid)
- Colunas principais: name, slug, plan, settings (jsonb), status, created_at, updated_at
- Unique: slug
- Check: plan, status
- RLS: habilitado
- Policies:
  - SELECT: authenticated
  - ALL: tenant admins (owner/admin) via tenant_memberships
- Indexes: slug, status
- Triggers: updated_at

#### people

- Schema: public
- Tenant scoped: global (não tem tenant_id)
- PK: id (uuid, gen_random_uuid)
- Colunas principais: auth_user_id (unique), full_name, email (unique), social_name, cpf (unique), birth_date, gender, status, metadata (jsonb), created_at, updated_at
- Check: gender, status
- RLS: habilitado
- Policies:
  - SELECT: own record (auth_user_id = auth.uid) ou service_role
  - UPDATE: own record ou service_role
  - INSERT: self-registration (auth_user_id = auth.uid) ou service_role
- Indexes: auth_user_id, cpf
- Triggers: updated_at
- Dependências: auth.users (trigger)

#### tenant_memberships

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: tenant_id → tenants(id), person_id → people(id)
- Colunas principais: membership_role, is_primary, status, joined_at, left_at, created_at, updated_at
- Check: membership_role, status
- Unique: (tenant_id, person_id)
- RLS: habilitado
- Policies:
  - SELECT: own membership ou service_role
  - INSERT: tenant owner/admin/manager ou service_role
  - UPDATE: own membership ou owner/admin ou service_role
- Indexes: tenant_id, person_id, membership_role
- Triggers: updated_at

### 2.2 CRM / EMPRESAS

#### company_types

- Schema: public
- Tenant scoped: global
- PK: id (uuid, gen_random_uuid)
- Colunas principais: code (unique), name, description, created_at
- RLS: habilitado
- Policies:
  - SELECT: authenticated
  - ALL: service_role apenas
- Seed: corporation, limited_company, epp, mei, nonprofit, government

#### companies

- Schema: public
- Tenant scoped: global (empresa jurídica global)
- PK: id (uuid, gen_random_uuid)
- FKs: company_type_id → company_types(id), created_by → people(id)
- Colunas principais: legal_name, trading_name, cnpj (unique), cnpj_root, state_registration, municipal_registration, industry, phone, email, website, linkedin_url, logo_url, address (jsonb), size, status, is_active, metadata (jsonb), created_at, updated_at
- Check: size, status
- RLS: habilitado
- Policies:
  - SELECT: authenticated
  - ALL: tenant members via company_relationships (owner/admin/manager) ou service_role
- Indexes: cnpj, company_type_id, status, created_by
- Triggers: updated_at

#### company_relationship_types

- Schema: public
- Tenant scoped: global
- PK: id (uuid, gen_random_uuid)
- Colunas principais: code (unique), name, description, created_at
- RLS: habilitado
- Policies:
  - SELECT: authenticated
  - ALL: service_role apenas
- Seed: client, partner, supplier

#### company_relationships

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: company_id → companies(id), tenant_id → tenants(id), relationship_type_id → company_relationship_types(id), created_by → people(id)
- Colunas principais: status, started_at, ended_at, metadata (jsonb), created_at, updated_at
- Check: status
- Unique: (company_id, tenant_id, relationship_type_id)
- RLS: habilitado
- Policies:
  - SELECT: tenant members via tenant_memberships ou service_role
  - ALL: tenant admins (owner/admin/manager) via tenant_memberships ou service_role
- Indexes: company_id, tenant_id, relationship_type_id, status
- Triggers: updated_at

#### company_contacts

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: company_id → companies(id), person_id → people(id), tenant_id → tenants(id)
- Colunas principais: role, is_primary, created_at, updated_at
- Unique: (company_id, person_id, tenant_id)
- RLS: habilitado
- Policies:
  - SELECT: tenant members via tenant_memberships ou service_role
  - ALL: tenant admins (owner/admin/manager) via tenant_memberships ou service_role
- Indexes: company_id, person_id, tenant_id
- Triggers: updated_at

### 2.3 RECRUTAMENTO / RH

#### skills

- Schema: public
- Tenant scoped: global
- PK: id (uuid, gen_random_uuid)
- Colunas principais: code (unique), name, slug (unique), category, description, is_active, created_at, updated_at
- RLS: habilitado
- Policies:
  - SELECT: authenticated
  - ALL: service_role apenas
- Indexes: slug, category
- Triggers: updated_at
- Seed: office-excel, office-word, portaria, limpeza, lideranca, javascript, react, comunicacao

#### candidates

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: person_id → people(id), tenant_id → tenants(id), created_by → people(id)
- Colunas principais: headline, salary_expectation_min, salary_expectation_max, salary_type, availability (jsonb), source, status, metadata (jsonb), created_at, updated_at
- Check: salary_type, status
- Unique: (person_id, tenant_id)
- RLS: habilitado
- Policies:
  - SELECT: tenant members via tenant_memberships ou service_role
  - ALL: tenant admins (owner/admin/manager/recruiter) via tenant_memberships ou service_role
- Indexes: person_id, tenant_id, status, created_by, availability (GIN)
- Triggers: updated_at

#### candidate_skills

- Schema: public
- Tenant scoped: tenant (via candidates)
- PK: id (uuid, gen_random_uuid)
- FKs: candidate_id → candidates(id), skill_id → skills(id)
- Colunas principais: proficiency, years_experience, last_used_at, created_at
- Check: proficiency
- Unique: (candidate_id, skill_id)
- RLS: habilitado
- Policies:
  - SELECT: via candidates → tenant_memberships ou service_role
  - ALL: via candidates tenant admins (owner/admin/manager/recruiter) ou service_role
- Indexes: candidate_id, skill_id

#### jobs

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: tenant_id → tenants(id), company_relationship_id → company_relationships(id), created_by → people(id)
- Colunas principais: title, slug, description, responsibilities, requirements, benefits, salary_min, salary_max, salary_type, contract_type, seniority, work_hours, work_mode, city, state, location_detail, status, views_count, applications_count, published_at, expires_at, metadata (jsonb), created_at, updated_at
- Check: salary_type, contract_type, seniority, work_mode, status
- Unique: (tenant_id, slug)
- RLS: habilitado
- Policies:
  - SELECT: tenant members via tenant_memberships ou service_role
  - ALL: tenant admins (owner/admin/manager/recruiter) via tenant_memberships ou service_role
- Indexes: tenant_id, company_relationship_id, status, published_at, work_mode, contract_type
- Triggers: updated_at

#### job_skills

- Schema: public
- Tenant scoped: tenant (via jobs)
- PK: id (uuid, gen_random_uuid)
- FKs: job_id → jobs(id), skill_id → skills(id)
- Colunas principais: required_level, is_required, created_at
- Check: required_level
- Unique: (job_id, skill_id)
- RLS: habilitado
- Policies:
  - SELECT: via jobs → tenant_memberships ou service_role
  - ALL: via jobs tenant admins (owner/admin/manager/recruiter) ou service_role
- Indexes: job_id, skill_id
- Triggers: updated_at

#### applications

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: tenant_id → tenants(id), job_id → jobs(id), candidate_id → candidates(id), created_by → people(id)
- Colunas principais: profile_snapshot (jsonb), match_score, match_details (jsonb), source, current_stage, notes, applied_at, updated_at, created_at
- Check: source, current_stage
- Unique: (candidate_id, job_id)
- RLS: habilitado
- Policies:
  - SELECT: tenant members via tenant_memberships ou service_role
  - ALL: tenant admins (owner/admin/manager/recruiter) via tenant_memberships ou service_role
- Indexes: tenant_id, job_id, candidate_id, current_stage, applied_at
- Triggers: updated_at, sync current_stage from history

#### application_status_history

- Schema: public
- Tenant scoped: tenant (via applications)
- PK: id (uuid, gen_random_uuid)
- FKs: application_id → applications(id) ON DELETE CASCADE, changed_by → people(id)
- Colunas principais: stage, previous_stage, next_stage, reason, changed_at
- Check: stage
- RLS: habilitado
- Policies:
  - SELECT: via applications → tenant_memberships ou service_role
  - INSERT: via applications tenant admins ou service_role
  - UPDATE/DELETE: none (append-only)
- Indexes: application_id, changed_at desc, stage
- Triggers: emit status_changed event

#### application_profile_snapshots

- Schema: public
- Tenant scoped: tenant (via applications)
- PK: id (uuid, gen_random_uuid)
- FKs: application_id → applications(id) ON DELETE CASCADE
- Colunas principais: snapshot_data (jsonb), captured_at
- RLS: habilitado
- Policies: herdam de applications via application_id
- Indexes: application_id

### 2.4 RBAC / SEGURANÇA

#### roles

- Schema: public
- Tenant scoped: global + tenant
- PK: id (uuid, gen_random_uuid)
- Colunas principais: name, is_global, description, created_at, updated_at
- Unique: (is_global, name)
- RLS: habilitado
- Policies:
  - SELECT: authenticated
  - ALL: global admin via role_assignments + admin_master role ou service_role
- Indexes: name, is_global
- Triggers: updated_at
- Seed global: admin_master, platform_admin, support_engineer
- Seed tenant: tenant_admin, rh_manager, recruiter, finance, support, content_manager, viewer

#### permissions

- Schema: public
- Tenant scoped: global
- PK: id (uuid, gen_random_uuid)
- Colunas principais: name (unique), description, module, created_at, updated_at
- RLS: habilitado
- Policies:
  - SELECT: authenticated
  - ALL: global admin via role_assignments + admin_master role ou service_role
- Indexes: name, module
- Triggers: updated_at
- Seed: people.read/create/update/disable, candidates.read/create/update, jobs.read/create/update/publish/delete, applications.read/update/reject/approve, companies.read/create/update, finance.read/create/update, audit.read, roles.manage, tenant.manage, integrations.manage

#### role_permissions

- Schema: public
- Tenant scoped: global
- PK: id (uuid, gen_random_uuid)
- FKs: role_id → roles(id), permission_id → permissions(id)
- Colunas principais: granted_at, granted_by (people.id)
- Unique: (role_id, permission_id)
- RLS: habilitado
- Policies:
  - SELECT: authenticated
  - ALL: global admin via role_assignments + admin_master role ou service_role
- Indexes: role_id, permission_id

#### role_assignments

- Schema: public
- Tenant scoped: global + tenant
- PK: id (uuid, gen_random_uuid)
- FKs: person_id → people(id), role_id → roles(id), tenant_id → tenants(id) nullable, assigned_by → people(id)
- Colunas principais: assigned_at, expires_at
- Unique parcial: (person_id, role_id) WHERE tenant_id IS NULL; (person_id, role_id, tenant_id) WHERE tenant_id IS NOT NULL
- RLS: habilitado
- Policies:
  - SELECT: self, global admin, tenant admin ou service_role
  - ALL: global admin ou tenant admin (mesmo tenant) ou service_role
- Indexes: person_id, role_id, tenant_id

#### role_resource_permissions

- Schema: public
- Tenant scoped: global + tenant
- PK: id (uuid, gen_random_uuid)
- FKs: role_id → roles(id)
- Colunas principais: resource, action, allowed, created_at, updated_at
- RLS: habilitado
- Policies: habilitadas via migration 014

### 2.5 STORAGE / DOCUMENTOS

#### files

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: tenant_id → tenants(id), owner_person_id → people(id)
- Colunas principais: provider, bucket, object_key, mime_type, size_bytes, filename, status, metadata (jsonb), created_at, updated_at
- RLS: habilitado
- Policies:
  - SELECT: tenant members via tenant_memberships ou owner_person_id = auth.uid ou service_role
  - ALL: tenant admins (owner/admin/manager/recruiter) ou service_role
- Indexes: tenant_id, owner_person_id, provider, bucket, object_key, status

#### file_access_logs

- Schema: public
- Tenant scoped: tenant (via files)
- PK: id (uuid, gen_random_uuid)
- FKs: file_id → files(id), person_id → people(id)
- Colunas principais: access_type, ip_address, user_agent, status, metadata (jsonb), created_at
- RLS: habilitado
- Policies:
  - SELECT: owner (person_id = auth.uid) ou tenant admin via files + tenant_memberships ou service_role
  - INSERT: authenticated via people ou service_role

### 2.6 EVENTOS / AUDITORIA

#### domain_events

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: tenant_id → tenants(id), actor_person_id → people(id)
- Colunas principais: event_name, event_version, aggregate_type, aggregate_id, correlation_id, payload (jsonb), occurred_at, created_at
- RLS: habilitado
- Policies:
  - SELECT: tenant members via tenant_memberships ou service_role
  - INSERT: service_role apenas (outbox)
- Indexes: tenant_id, aggregate_type, aggregate_id, occurred_at desc, event_name
- Triggers: emit events from applications, candidates, jobs, talent_pool

### 2.7 NOTIFICAÇÕES

#### notifications

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: tenant_id → tenants(id), recipient_person_id → people(id), source_event_id → domain_events(id) nullable, created_by → people(id) nullable
- Colunas principais: notification_type, category, priority, title, body, data (jsonb), scheduled_at, expires_at, idempotency_key, status, read_at, created_at, updated_at
- Check: notification_type, category, priority, status
- Unique: idempotency_key
- RLS: habilitado
- Policies:
  - SELECT: recipient (person_id = auth.uid) ou tenant admin via tenant_memberships ou service_role
  - ALL: tenant admins (owner/admin/manager) ou service_role
- Indexes: tenant_id, recipient_person_id, notification_type, category, priority, status, scheduled_at, expires_at, idempotency_key

#### notification_deliveries

- Schema: public
- Tenant scoped: tenant (via notifications)
- PK: id (uuid, gen_random_uuid)
- FKs: notification_id → notifications(id)
- Colunas principais: channel, provider, provider_message_id, status, next_attempt_at, metadata (jsonb), created_at, updated_at
- Check: channel, status
- Unique: (notification_id, channel)
- RLS: habilitado
- Policies:
  - SELECT: via notifications → recipient/tenant admin ou service_role
  - INSERT/UPDATE: service_role ou tenant admin
- Indexes: notification_id, status, next_attempt_at, provider, channel

#### notification_preferences

- Schema: public
- Tenant scoped: tenant (via people)
- PK: id (uuid, gen_random_uuid)
- FKs: person_id → people(id)
- Colunas principais: notification_type, channel, enabled, consented_at, disabled_at, created_at, updated_at
- Check: channel, enabled
- Unique: (person_id, notification_type, channel)
- RLS: habilitado
- Policies:
  - SELECT: self (person_id = auth.uid) ou service_role
  - ALL: self ou service_role
- Indexes: person_id, notification_type, enabled

### 2.8 TALENT POOL

#### candidate_preferences

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: candidate_id → candidates(id)
- Colunas principais: desired_roles, salary_min, salary_max, work_modes, locations, available_from, matching_enabled, receive_match_alerts, last_match_at, last_match_version, preferences_version, created_at, updated_at
- Check: preferences_version
- Unique: candidate_id
- RLS: habilitado
- Policies: herdam de candidates via candidate_id
- Indexes: candidate_id, matching_enabled

#### candidate_profile_views

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: candidate_id → candidates(id), tenant_id → tenants(id), viewer_person_id → people(id) nullable
- Colunas principais: source, metadata (jsonb), viewed_at
- RLS: habilitado
- Policies: via candidates → tenant_memberships
- Indexes: candidate_id, tenant_id, viewer_person_id, viewed_at desc

#### job_matches

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: candidate_id → candidates(id), job_id → jobs(id), tenant_id → tenants(id)
- Colunas principais: score, reasons (jsonb), algorithm_version, is_eligible, sent_notification, invalidated_at, invalidated_reason, created_at, updated_at
- Check: score (0-100), algorithm_version
- Unique: (candidate_id, job_id)
- RLS: habilitado
- Policies: via tenant_memberships
- Indexes: candidate_id, job_id, tenant_id, score desc, is_eligible/sent_notification, invalidated_at

#### talent_pool_memberships

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: candidate_id → candidates(id), tenant_id → tenants(id), created_by → people(id)
- Colunas principais: status, source, consent_status, matched_at, notes, created_at, updated_at
- Check: status, consent_status
- RLS: habilitado
- Policies: via tenant_memberships
- Indexes: candidate_id, tenant_id, status, source, consent_status
- Triggers: emit talent_pool.joined event

### 2.9 FIRST ACCESS / LEGAL

#### first_login_state

- Schema: public
- Tenant scoped: tenant (via person_id)
- PK: person_id (uuid) — 1:1 com people
- FKs: person_id → people(id)
- Colunas principais: must_change_password, terms_version, privacy_version, lgpd_consent_version, welcome_completed_at, first_login_completed, created_at, updated_at
- RLS: habilitado
- Policies:
  - SELECT: self (person_id via people.auth_user_id = auth.uid) ou service_role
  - ALL: self ou service_role
- Upsert usado para created_at/updated_at

#### legal_acceptances

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, gen_random_uuid)
- FKs: person_id → people(id), tenant_id → tenants(id)
- Colunas principais: document_type, document_version, ip, user_agent, metadata (jsonb), accepted_at, created_at, updated_at
- RLS: habilitado
- Policies:
  - SELECT: self (person_id via people.auth_user_id = auth.uid) ou tenant admin via tenant_memberships ou service_role
  - INSERT: self ou service_role
- Indexes: person_id, tenant_id, document_type, accepted_at

### 2.10 CHAT (LEGACY)

#### chat_rooms

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, uuid_generate_v4)
- FKs: tenant_id → tenants(id), assigned_to → auth.users(id) nullable
- Colunas principais: visitor_id, subject, status, area, created_at, updated_at
- Check: status, area
- RLS: habilitado
- Policies: via tenant_memberships (owner/admin/manager)
- Indexes: tenant_id, visitor_id, status, area

#### chat_messages

- Schema: public
- Tenant scoped: tenant
- PK: id (uuid, uuid_generate_v4)
- FKs: tenant_id → tenants(id), room_id → chat_rooms(id)
- Colunas principais: role, content, created_at
- Check: role
- RLS: habilitado
- Policies: via tenant_memberships
- Indexes: tenant_id, room_id, created_at

---

## 3. FUNCTIONS / TRIGGERS

### Functions

- `update_updated_at()` — trigger genérico para updated_at
- `handle_new_auth_user()` — sync auth.users → people
- `handle_auth_user_updated()` — sync email auth.users → people
- `handle_auth_user_deleted()` — limpa auth_user_id ao deletar auth.user
- `emit_domain_event()` — emissor genérico de domain_events
- `emit_application_created_event()` — trigger após INSERT em applications
- `emit_application_status_changed_event()` — trigger após INSERT em application_status_history
- `emit_candidate_created_event()` — trigger após INSERT em candidates
- `emit_job_published_event()` — trigger após UPDATE em jobs (published)
- `sync_application_current_stage()` — trigger após INSERT em application_status_history
- `capture_application_profile_snapshot()` — trigger BEFORE INSERT em applications
- `emit_talent_pool_joined_event()` — trigger após INSERT em talent_pool_memberships
- `emit_job_match_found_event()` — trigger após INSERT/UPDATE em job_matches
- `skip_expired_notification_deliveries()` — trigger BEFORE UPDATE em notification_deliveries
- `create_notification()` — helper security definer para criar notifications
- `create_notification_delivery()` — helper para criar deliveries
- `update_chat_updated_at()` — trigger updated_at para chat

### Triggers

- updated_at em: tenants, people, tenant_memberships, company_types, companies, company_relationship_types, company_relationships, company_contacts, skills, candidates, jobs, job_skills, roles, permissions, notifications, notification_deliveries, notification_preferences, candidate_preferences, job_matches
- auth sync: on_auth_user_created, on_auth_user_updated, on_auth_user_deleted
- domain events: application_created_event, application_status_changed_event, candidate_created_event, job_published_event, talent_pool_joined_event, job_match_found_event
- application sync: sync_application_current_stage, capture_profile_snapshot
- notification expiry: skip_expired_notification_deliveries

---

## 4. SEED DATA CONFIRMADO

### tenants

- J&S Empregos LTDA (slug: js-empregos, plan: enterprise, status: active)

### company_types

- corporation, limited_company, epp, mei, nonprofit, government

### company_relationship_types

- client, partner, supplier

### skills

- office-excel, office-word, portaria, limpeza, lideranca, javascript, react, comunicacao

### roles (global)

- admin_master, platform_admin, support_engineer

### roles (tenant)

- tenant_admin, rh_manager, recruiter, finance, support, content_manager, viewer

### permissions (canonical)

- people.read, people.create, people.update, people.disable
- candidates.read, candidates.create, candidates.update
- jobs.read, jobs.create, jobs.update, jobs.publish, jobs.delete
- applications.read, applications.update, applications.reject, applications.approve
- companies.read, companies.create, companies.update
- finance.read, finance.create, finance.update
- audit.read
- roles.manage, tenant.manage, integrations.manage

---

## 5. MATRIZ DE RECONCILIAÇÃO PARCIAL

| Tabela                        | Domínio       | Tenant Scoped | PK        | UUID             | FK Principal                                                | RLS | Status UI    | Repository                                 | Permission         |
| ----------------------------- | ------------- | ------------- | --------- | ---------------- | ----------------------------------------------------------- | --- | ------------ | ------------------------------------------ | ------------------ |
| tenants                       | core          | global        | id        | gen_random_uuid  | —                                                           | sim | CONNECTED    | —                                          | tenants.read       |
| people                        | core          | global        | id        | gen_random_uuid  | auth_user_id                                                | sim | CONNECTED    | users.repository                           | people.read        |
| tenant_memberships            | core          | tenant        | id        | gen_random_uuid  | tenant_id, person_id                                        | sim | CONNECTED    | —                                          | tenant.read        |
| company_types                 | crm           | global        | id        | gen_random_uuid  | —                                                           | sim | MISSING_PAGE | —                                          | —                  |
| companies                     | crm           | global        | id        | gen_random_uuid  | company_type_id, created_by                                 | sim | CONNECTED    | companies.repository                       | companies.read     |
| company_relationship_types    | crm           | global        | id        | gen_random_uuid  | —                                                           | sim | MISSING_PAGE | —                                          | —                  |
| company_relationships         | crm           | tenant        | id        | gen_random_uuid  | company_id, tenant_id, relationship_type_id                 | sim | CONNECTED    | companies.repository (parcial)             | companies.read     |
| company_contacts              | crm           | tenant        | id        | gen_random_uuid  | company_id, person_id, tenant_id                            | sim | MISSING_PAGE | —                                          | companies.read     |
| skills                        | recruitment   | global        | id        | gen_random_uuid  | —                                                           | sim | MISSING_PAGE | —                                          | skills.read        |
| candidates                    | recruitment   | tenant        | id        | gen_random_uuid  | person_id, tenant_id, created_by                            | sim | CONNECTED    | candidates.repository                      | candidates.read    |
| candidate_skills              | recruitment   | tenant        | id        | gen_random_uuid  | candidate_id, skill_id                                      | sim | MISSING_PAGE | candidates.repository (parcial)            | candidates.read    |
| jobs                          | recruitment   | tenant        | id        | gen_random_uuid  | tenant_id, company_relationship_id, created_by              | sim | CONNECTED    | jobs.repository                            | jobs.read          |
| job_skills                    | recruitment   | tenant        | id        | gen_random_uuid  | job_id, skill_id                                            | sim | CONNECTED    | jobs.repository (parcial)                  | jobs.read          |
| applications                  | recruitment   | tenant        | id        | gen_random_uuid  | tenant_id, job_id, candidate_id, created_by                 | sim | CONNECTED    | recruitment-processes.repository           | applications.read  |
| application_status_history    | recruitment   | tenant        | id        | gen_random_uuid  | application_id, changed_by                                  | sim | CONNECTED    | recruitment-processes.repository (parcial) | applications.read  |
| application_profile_snapshots | recruitment   | tenant        | id        | gen_random_uuid  | application_id                                              | sim | CONNECTED    | recruitment-processes.repository (parcial) | applications.read  |
| roles                         | rbac          | global+tenant | id        | gen_random_uuid  | —                                                           | sim | CONNECTED    | —                                          | roles.read         |
| permissions                   | rbac          | global        | id        | gen_random_uuid  | —                                                           | sim | CONNECTED    | —                                          | roles.read         |
| role_permissions              | rbac          | global        | id        | gen_random_uuid  | role_id, permission_id                                      | sim | CONNECTED    | —                                          | roles.read         |
| role_assignments              | rbac          | global+tenant | id        | gen_random_uuid  | person_id, role_id, tenant_id, assigned_by                  | sim | MISSING_PAGE | —                                          | roles.manage       |
| role_resource_permissions     | rbac          | global+tenant | id        | gen_random_uuid  | role_id                                                     | sim | MISSING_PAGE | —                                          | roles.manage       |
| files                         | storage       | tenant        | id        | gen_random_uuid  | tenant_id, owner_person_id                                  | sim | CONNECTED    | —                                          | files.read         |
| file_access_logs              | storage       | tenant        | id        | gen_random_uuid  | file_id, person_id                                          | sim | MISSING_PAGE | —                                          | audit.read         |
| domain_events                 | audit         | tenant        | id        | gen_random_uuid  | tenant_id, actor_person_id                                  | sim | CONNECTED    | —                                          | audit.read         |
| notifications                 | notifications | tenant        | id        | gen_random_uuid  | tenant_id, recipient_person_id, source_event_id, created_by | sim | MISSING_PAGE | —                                          | notifications.read |
| notification_deliveries       | notifications | tenant        | id        | gen_random_uuid  | notification_id                                             | sim | MISSING_PAGE | —                                          | notifications.read |
| notification_preferences      | notifications | tenant        | id        | gen_random_uuid  | person_id                                                   | sim | MISSING_PAGE | —                                          | notifications.read |
| candidate_preferences         | recruitment   | tenant        | id        | gen_random_uuid  | candidate_id                                                | sim | MISSING_PAGE | —                                          | candidates.read    |
| candidate_profile_views       | recruitment   | tenant        | id        | gen_random_uuid  | candidate_id, tenant_id, viewer_person_id                   | sim | MISSING_PAGE | —                                          | candidates.read    |
| job_matches                   | recruitment   | tenant        | id        | gen_random_uuid  | candidate_id, job_id, tenant_id                             | sim | MISSING_PAGE | —                                          | jobs.read          |
| talent_pool_memberships       | recruitment   | tenant        | id        | gen_random_uuid  | candidate_id, tenant_id, created_by                         | sim | MISSING_PAGE | —                                          | talent_pool.read   |
| first_login_state             | auth          | tenant        | person_id | —                | person_id                                                   | sim | CONNECTED    | —                                          | —                  |
| legal_acceptances             | auth          | tenant        | id        | gen_random_uuid  | person_id, tenant_id                                        | sim | CONNECTED    | —                                          | documents.read     |
| chat_rooms                    | chat          | tenant        | id        | uuid_generate_v4 | tenant_id, assigned_to                                      | sim | CONNECTED    | —                                          | support.read       |
| chat_messages                 | chat          | tenant        | id        | uuid_generate_v4 | tenant_id, room_id                                          | sim | CONNECTED    | —                                          | support.read       |

---

## 6. PENDÊNCIAS E GAPS

### Sem tabela correspondente no schema atual

- financial_transactions
- leads
- partners (tabela legacy)
- reports
- service_catalog
- services
- settings
- stock_movements
- suppliers (tabela legacy)
- support_tickets

### Tabelas sem UI

- company_types
- company_relationship_types
- company_contacts
- skills
- candidate_skills
- candidate_preferences
- candidate_profile_views
- job_matches
- role_assignments
- role_resource_permissions
- file_access_logs
- notifications
- notification_deliveries
- notification_preferences
- talent_pool_memberships

### Permissions órfãs no ModuleRegistry

- finance.dashboard.read (sem tabela financeira)
- fiscal.dashboard.read (sem tabela fiscal)
- accounting.dashboard.read (sem tabela contábil)
- stock_movements.read (sem tabela estoque)
- support_tickets.read (sem tabela suporte)
- skills.read (tabela existe, mas sem permissão seed e sem módulo correspondente)

---

## 7. PENDÊNCIAS E GAPS

### Sem tabela correspondente no schema atual

- financial_transactions
- leads
- partners (tabela legacy usada em seed, mas sem migration de criação)
- reports
- service_catalog
- services (tabela legacy usada em seed, mas sem migration de criação)
- settings
- stock_movements
- suppliers (tabela legacy usada em seed, mas sem migration de criação)
- support_tickets

### Tabelas sem UI

- company_types
- company_relationship_types
- company_contacts
- skills
- candidate_skills
- candidate_preferences
- candidate_profile_views
- job_matches
- role_assignments
- role_resource_permissions
- file_access_logs
- notifications
- notification_deliveries
- notification_preferences
- talent_pool_memberships

### Permissions órfãs no ModuleRegistry

- finance.dashboard.read (sem tabela financeira)
- fiscal.dashboard.read (sem tabela fiscal)
- accounting.dashboard.read (sem tabela contábil)
- stock_movements.read (sem tabela estoque)
- support_tickets.read (sem tabela suporte)
- skills.read (tabela existe, mas sem permissão seed e sem módulo correspondente)

### Observações importantes

- Tabelas `services`, `partners`, `leads`, `reports`, `settings`, `stock_movements`, `support_tickets`, `financial_transactions`, `suppliers` são referenciadas em seeds, mas **não possuem migration de criação de schema**.
- Permissões de finance/fiscal/accounting existem no banco, mas **não existem tabelas correspondentes**.
- O site público usa RLS policies separadas para jobs publicados (`rls_published_jobs_public.sql`), fora do escopo da gestão.

### Reconciliação com Supabase Cloud

- Esse inventário considera **32 tabelas canônicas** em `supabase/migrations/`.
- Há referência a **~200 tabelas físicas no Supabase Cloud**, que ainda não foram reconciliadas.
- Antes de avançar na UI, é necessário comparar Cloud vs canônico para:
  - Confirmar tabelas realmente existentes;
  - Identificar tabelas legadas/orfãs;
  - Mapear `tenant_id` e RLS efetivos.

### Regra canônica de isolamento

- `people` é identidade canônica; não é uma lista global de usuários do sistema.
- `tenant_id` acompanha todos os domínios: RH, Financeiro, Fiscal, Contabilidade, etc.
- Acesso a usuários do sistema pertence a **Administração/IAM**, não ao domínio RH.
- RBAC deve ser respeitado em camadas: rota → permissão → repository → Supabase Auth → RLS → banco.

---

## 8. PRÓXIMOS PASSOS (sem implementação)

1. Reconciliação Cloud vs canônico: confirmar ~200 tabelas físicas, `tenant_id` e RLS.
2. Fechar matriz C1.7-B com domínios → módulos → permissions → rotas → UI potenciais.
3. Somente depois: C1.7-A (session lifecycle), C1.8 (header/sidebar), C1.9 (dashboard).
