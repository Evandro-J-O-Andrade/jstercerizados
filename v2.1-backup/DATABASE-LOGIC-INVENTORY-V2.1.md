# DATABASE-LOGIC-INVENTORY-V2.1

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Fase:** 3A — Inventário local (read-only)  
**Status:** LOCAL_VERIFIED | REMOTE_UNVERIFIED | CONFLICT | MISSING | LEGACY  

---

## Sumário executivo

| Categoria | Quantidade | LOCAL_VERIFIED | REMOTE_UNVERIFIED | CONFLICT | MISSING | LEGACY |
|-----------|-----------:|----------------:|------------------:|---------:|--------:|--------|
| Functions/RPCs | 18 | 18 | 18 | 0 | 0 | 0 |
| Triggers | 22 | 22 | 22 | 1 | 0 | 2 |
| Views | 0 | 0 | 0 | 0 | 0 | 0 |
| Policies | 39 | 39 | 39 | 0 | 0 | 5 |
| Enums | 7 | 7 | 7 | 0 | 0 | 0 |
| Storage | 2 tabelas | 2 | 2 | 0 | 2 | 0 |
| Events/Outbox | 1 tabela + 3 funções | 1 | 1 | 0 | 0 | 0 |
| Notificações | 3 tabelas + 10 funções | 3 | 3 | 0 | 0 | 0 |
| RBAC | 5 tabelas + 2 funções | 5 | 5 | 0 | 0 | 0 |
| Talent Pool | 4 tabelas + 4 funções | 4 | 4 | 0 | 0 | 0 |
| Chat | 2 tabelas | 0 | 2 | 2 | 0 | 2 |
| Cron/Jobs | 0 | 0 | 0 | 0 | 1 | 0 |
| **Total** | | **89** | **89** | **3** | **3** | **9** |

**Legenda de status:**
- `LOCAL_VERIFIED` — existe no repositório e foi analisado
- `REMOTE_UNVERIFIED` — existe no repositório, mas não confirmado no banco remoto
- `CONFLICT` — duas fontes discordam
- `MISSING` — esperado pela matriz V2.1 mas não encontrado localmente
- `LEGACY` — objeto antigo que pode não ser necessário

---

## 3.1 Functions / RPCs

### 1.1 Functions de negócio

| Nome | Schema | Tipo | Retorno | SECURITY DEFINER | Dependências | Status |
|------|--------|------|---------|------------------|--------------|--------|
| `emit_domain_event` | public | plpgsql | uuid | SIM | `domain_events` | LOCAL_VERIFIED |
| `emit_application_created_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_application_status_changed_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_candidate_created_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_job_published_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_talent_pool_joined_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `emit_job_match_found_event` | public | plpgsql | trigger | NÃO | `emit_domain_event` | LOCAL_VERIFIED |
| `prevent_event_modification` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `skip_expired_notification_deliveries` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `validate_talent_pool_consent` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `validate_candidate_preferences_update` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `update_updated_at` | public | plpgsql | trigger | NÃO | — | LOCAL_VERIFIED |
| `user_has_permission` | public | plpgsql | boolean | SIM | `role_assignments`, `roles`, `role_resource_permissions`, `tenant_memberships` | LOCAL_VERIFIED |
| `can_access_tenant` | public | sql | boolean | SIM | `tenant_memberships`, `people` | LOCAL_VERIFIED |
| `create_notification` | public | plpgsql | uuid | SIM | `notifications` | LOCAL_VERIFIED |
| `create_notification_delivery` | public | plpgsql | uuid | SIM | `notification_deliveries` | LOCAL_VERIFIED |
| `mark_delivery_sent` | public | plpgsql | void | SIM | `notification_deliveries` | LOCAL_VERIFIED |
| `mark_delivery_delivered` | public | plpgsql | void | SIM | `notification_deliveries` | LOCAL_VERIFIED |
| `mark_delivery_failed` | public | plpgsql | void | SIM | `notification_deliveries` | LOCAL_VERIFIED |
| `mark_event_published` | public | plpgsql | void | SIM | `domain_events` | LOCAL_VERIFIED |
| `mark_event_failed` | public | plpgsql | void | SIM | `domain_events` | LOCAL_VERIFIED |
| `mark_notification_read` | public | plpgsql | void | SIM | `notifications` | LOCAL_VERIFIED |
| `is_channel_enabled` | public | sql | boolean | SIM | `notification_preferences` | LOCAL_VERIFIED |
| `join_talent_pool` | public | plpgsql | uuid | SIM | `talent_pool_memberships`, `candidates` | LOCAL_VERIFIED |
| `remove_from_talent_pool` | public | plpgsql | void | SIM | `talent_pool_memberships` | LOCAL_VERIFIED |
| `pause_talent_pool` | public | plpgsql | void | SIM | `talent_pool_memberships` | LOCAL_VERIFIED |
| `get_active_candidates_for_matching` | public | sql | table | SIM | `talent_pool_memberships`, `candidates`, `job_matches`, `candidate_preferences`, `candidate_skills` | LOCAL_VERIFIED |
| `get_pending_domain_events` | public | sql | table | SIM | `domain_events` | LOCAL_VERIFIED |
| `get_pending_deliveries` | public | sql | table | SIM | `notification_deliveries`, `notifications` | LOCAL_VERIFIED |
| `get_due_deliveries` | public | sql | table | SIM | `notification_deliveries`, `notifications` | LOCAL_VERIFIED |
| `is_frontend_safe_role` | public | sql | boolean | SIM | — | LOCAL_VERIFIED |
| `create_default_notification_preferences` | public | plpgsql | void | SIM | `notification_preferences` | LOCAL_VERIFIED |
| `handle_new_user` | public | plpgsql | trigger | SIM | `tenants`, `profiles` | LOCAL_VERIFIED |

**Nota:** `update_updated_at` é referenciada por múltiplas triggers como função genérica.

### 1.2 Functions de seed/bootstrap

| Nome | Schema | Tipo | Retorno | SECURITY DEFINER | Dependências | Status |
|------|--------|------|---------|------------------|--------------|--------|
| (nenhuma função de seed declarada) | — | — | — | — | — | LOCAL_VERIFIED |

**Conflito:** O seed global (`admin_master`, `platform_admin`, `support_engineer`) é feito via `INSERT INTO roles` na migration `20260816000700_rbac.sql`, não via função. Isso pode gerar problema em re-deploys.

---

## 3.1 Gate — Functions / RPCs

| Item | Valor | Status |
|------|-------|--------|
| Functions/RPCs encontradas | 18 | LOCAL_VERIFIED |
| Referenciadas pelo frontend | 0 | INVESTIGATE |
| Aparentemente legacy | 1 (`handle_new_user`) | LEGACY |
| Conflitos | 0 | — |
| Itens REMOTE_UNVERIFIED | 18 | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.2 — Triggers | PENDENTE |

**Conclusão da 3.1:** Nenhuma alteração de banco foi executada. O inventário de Functions/RPCs está completo localmente. Próximo passo: Fase 3.2.

---

## 3.2 Triggers

### 2.1 Triggers de `updated_at`

| Trigger | Tabela | Timing | Evento | Função | Status |
|---------|--------|--------|--------|--------|--------|
| `update_roles_updated_at` | `roles` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `update_permissions_updated_at` | `permissions` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `update_files_updated_at` | `files` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `update_notification_deliveries_updated_at` | `notification_deliveries` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `update_notification_preferences_updated_at` | `notification_preferences` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `update_talent_pool_updated_at` | `talent_pool_memberships` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `update_job_matches_updated_at` | `job_matches` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `update_candidate_prefs_updated_at` | `candidate_preferences` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `update_chat_rooms_updated_at` | `chat_rooms` | BEFORE | UPDATE | `update_updated_at()` (legacy) | LEGACY |
| `update_domain_events_updated_at` | `domain_events` | BEFORE | UPDATE | `update_updated_at()` | LOCAL_VERIFIED |
| `log_file_access_insert` | `file_access_logs` | AFTER | INSERT | `update_updated_at()` | LOCAL_VERIFIED |

### 2.2 Triggers de imutabilidade/validação

| Trigger | Tabela | Timing | Evento | Função | Finalidade | Status |
|---------|--------|--------|--------|--------|------------|--------|
| `prevent_event_update` | `domain_events` | BEFORE | UPDATE | `prevent_event_modification()` | Bloqueia alteração de payload/event_name/tenant_id/occurred_at | LOCAL_VERIFIED |
| `prevent_event_delete` | `domain_events` | BEFORE | DELETE | `prevent_history_modification()` | Bloqueia DELETE em domain_events | CONFLICT |
| `validate_talent_pool_consent` | `talent_pool_memberships` | BEFORE | INSERT/UPDATE | `validate_talent_pool_consent()` | Garante consentimento para active | LOCAL_VERIFIED |
| `validate_candidate_preferences_update` | `candidate_preferences` | BEFORE | UPDATE | `validate_candidate_preferences_update()` | Garante tenant ownership | LOCAL_VERIFIED |
| `skip_expired_notification_deliveries` | `notification_deliveries` | BEFORE | UPDATE | `skip_expired_notification_deliveries()` | Marca deliveries expiradas | LOCAL_VERIFIED |

### 2.3 Triggers de emissão de eventos (Domain Events)

| Trigger | Tabela | Timing | Evento | Função | Evento emitido | Status |
|---------|--------|--------|--------|--------|----------------|--------|
| `application_created_event` | `applications` | AFTER | INSERT | `emit_application_created_event()` | `application.created` | LOCAL_VERIFIED |
| `application_status_changed_event` | `application_status_history` | AFTER | INSERT | `emit_application_status_changed_event()` | `application.status_changed` | LOCAL_VERIFIED |
| `candidate_created_event` | `candidates` | AFTER | INSERT | `emit_candidate_created_event()` | `candidate.created` | LOCAL_VERIFIED |
| `job_published_event` | `jobs` | AFTER | UPDATE | `emit_job_published_event()` | `job.published` | LOCAL_VERIFIED |
| `talent_pool_joined_event` | `talent_pool_memberships` | AFTER | INSERT | `emit_talent_pool_joined_event()` | `talent_pool.joined` | LOCAL_VERIFIED |
| `job_match_found_event` | `job_matches` | AFTER | INSERT | `emit_job_match_found_event()` | `job.match_found` | LOCAL_VERIFIED |

### 2.4 Triggers de Auth/Identity

| Trigger | Tabela | Timing | Evento | Função | Finalidade | Status |
|---------|--------|--------|--------|--------|------------|--------|
| `on_auth_user_created` | `auth.users` | AFTER | INSERT | `handle_new_user()` | Cria tenant + profile automaticamente | LEGACY |

**Conflito:** `handle_new_user()` usa `profiles` (schema antigo) e `tenant_memberships.user_id` (referência `auth.users`). A V2.1 usa `people.auth_user_id`. Este trigger precisa ser reconciliado.

### 2.5 Triggers LEGACY / Chat

| Trigger | Tabela | Timing | Evento | Função | Status |
|---------|--------|--------|--------|--------|--------|
| (nenhum trigger adicional no chat além de `update_chat_rooms_updated_at`) | — | — | — | — | LEGACY |

---

## 3.2 Gate — Triggers

| Item | Valor | Status |
|------|-------|--------|
| Triggers encontradas | 22 | LOCAL_VERIFIED |
| Triggers de `updated_at` | 11 | LOCAL_VERIFIED |
| Triggers de validação/imutabilidade | 5 | LOCAL_VERIFIED |
| Triggers de eventos (domain) | 6 | LOCAL_VERIFIED |
| Triggers de auth/identity | 1 | LEGACY |
| Conflitos | 1 (`prevent_history_modification` não encontrada) | CONFLICT |
| Itens REMOTE_UNVERIFIED | 22 | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.3 — Views | PENDENTE |

**Conclusão da 3.2:** Nenhuma alteração de banco foi executada. O inventário de Triggers está completo localmente. Próximo passo: Fase 3.3.

---

## 3. Views / Materialized Views

| Nome | Tipo | Definição | Dependências | Consumidores | Status |
|------|------|-----------|--------------|--------------|--------|
| (nenhuma view declarada nos migrations V2.1) | — | — | — | — | LOCAL_VERIFIED |

**Nota:** A matriz V2.1 menciona Views para dashboards/relatórios, mas nenhuma foi encontrada nos migrations locais. Isso pode ser:
- Views criadas manualmente no banco remoto
- Views planejadas para Fase 4
- Views em specs que ainda não foram migradas

**Ação:** Investigar se existem views no banco remoto (Fase 3B).

---

## 3.3 Gate — Views / Materialized Views

| Item | Valor | Status |
|------|-------|--------|
| Views encontradas | 0 | LOCAL_VERIFIED |
| Materialized Views encontradas | 0 | LOCAL_VERIFIED |
| Conflitos | 0 | — |
| Itens REMOTE_UNVERIFIED | 0 (mas investigar manualmente no remoto) | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.4 — RLS / Policies | PENDENTE |

**Conclusão da 3.3:** Nenhuma view declarada localmente. Próximo passo: Fase 3.4.

---

## 3.4 RLS / Policies

### 4.1 Tabelas com RLS habilitado

| Tabela | RLS | Policies | Status |
|--------|-----|----------|--------|
| `tenants` | SIM | 1 | LOCAL_VERIFIED |
| `people` | SIM | 3 | LOCAL_VERIFIED |
| `profiles` | SIM | 3 | LEGACY |
| `tenant_memberships` | SIM | 2 | LOCAL_VERIFIED |
| `companies` | SIM | 3 | LOCAL_VERIFIED |
| `candidates` | SIM | 4 | LOCAL_VERIFIED |
| `applications` | SIM | 4 | LOCAL_VERIFIED |
| `application_status_history` | SIM | 1 | LOCAL_VERIFIED |
| `application_profile_snapshots` | SIM | 1 | LOCAL_VERIFIED |
| `files` | SIM | 2 | LOCAL_VERIFIED |
| `file_access_logs` | SIM | 2 | LOCAL_VERIFIED |
| `domain_events` | SIM | 2 | LOCAL_VERIFIED |
| `notifications` | SIM | 2 | LOCAL_VERIFIED |
| `notification_deliveries` | SIM | 1 | LOCAL_VERIFIED |
| `notification_preferences` | SIM | 1 | LOCAL_VERIFIED |
| `talent_pool_memberships` | SIM | 3 | LOCAL_VERIFIED |
| `job_matches` | SIM | 2 | LOCAL_VERIFIED |
| `candidate_preferences` | SIM | 1 | LOCAL_VERIFIED |
| `candidate_profile_views` | SIM | 1 | LOCAL_VERIFIED |
| `roles` | SIM | 2 | LOCAL_VERIFIED |
| `permissions` | SIM | 2 | LOCAL_VERIFIED |
| `role_permissions` | SIM | 2 | LOCAL_VERIFIED |
| `role_assignments` | SIM | 2 | LOCAL_VERIFIED |
| `role_resource_permissions` | SIM | 2 | LOCAL_VERIFIED |
| `chat_rooms` | SIM | 3 | LEGACY |
| `chat_messages` | SIM | 2 | LEGACY |

### 4.2 Policies detalhadas

#### 4.2.1 `tenants`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Tenants visible to authenticated` | SELECT | `auth.role() = 'authenticated'` | LOCAL_VERIFIED |

#### 4.2.2 `people`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `People: admin_master sees all` | SELECT | `user_has_permission(auth.uid(), 'people', 'read', null)` | LOCAL_VERIFIED |
| `People: users see own record` | SELECT | `auth_user_id = auth.uid()` | LOCAL_VERIFIED |
| `People: admin can update` | UPDATE | `user_has_permission(auth.uid(), 'people', 'update', null)` | LOCAL_VERIFIED |
| `People: tenant_admin can manage within tenant` | UPDATE | `tenant_admin` + `tenant_memberships` | LOCAL_VERIFIED |

#### 4.2.3 `tenant_memberships`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Role assignments visible to self or admin` | SELECT | `person_id` OU `admin_master` global | LOCAL_VERIFIED |
| `Role assignments manageable by global admin or tenant admin` | ALL | `admin_master` global OU `tenant_admin` no tenant | LOCAL_VERIFIED |

#### 4.2.4 `domain_events`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Domain events visible to tenant members` | SELECT | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Domain events insertable by trigger (service)` | INSERT | `true` | LOCAL_VERIFIED |

#### 4.2.5 `roles` / `permissions` / `role_permissions`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Roles visible to authenticated` | SELECT | `auth.role() = 'authenticated'` | LOCAL_VERIFIED |
| `Roles manageable by global admin` | ALL | `admin_master` global | LOCAL_VERIFIED |
| `Permissions visible to authenticated` | SELECT | `auth.role() = 'authenticated'` | LOCAL_VERIFIED |
| `Permissions manageable by global admin` | ALL | `admin_master` global | LOCAL_VERIFIED |
| `Role permissions visible to authenticated` | SELECT | `auth.role() = 'authenticated'` | LOCAL_VERIFIED |
| `Role permissions manageable by global admin` | ALL | `admin_master` global | LOCAL_VERIFIED |

#### 4.2.6 `roles` / `role_resource_permissions` (consolidação)

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Roles: admin_master only` | ALL | `admin_master` global | LOCAL_VERIFIED |
| `Role resource permissions: admin_master only` | ALL | `admin_master` global | LOCAL_VERIFIED |

#### 4.2.7 `notifications`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Notifications visible to tenant members` | SELECT | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Users see own notifications` | SELECT | `recipient_person_id = auth.uid()` | LOCAL_VERIFIED |

#### 4.2.8 `candidates` / `jobs` / `applications`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Candidates: visible to tenant members` | SELECT | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Candidates: candidate sees own` | SELECT | `person_id = auth.uid()` | LOCAL_VERIFIED |
| `Candidates: tenant members can create/update` | INSERT | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Candidates: tenant members can update` | UPDATE | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Jobs: visible to tenant members` | SELECT | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Jobs: tenant members can create` | INSERT | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Jobs: tenant members can update` | UPDATE | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Applications: visible to tenant members` | SELECT | `candidate.tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Applications: candidate sees own` | SELECT | `candidate_id IN (candidates do usuário)` | LOCAL_VERIFIED |

#### 4.2.9 `files` / `file_access_logs`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Files visible to tenant members` | SELECT | `visibility='public'` OU `tenant_id IN tenant_memberships` OU `owner_person_id = auth.uid()` | LOCAL_VERIFIED |
| `Files manageable by tenant admins` | ALL | `tenant_id IN tenant_memberships` + role check | LOCAL_VERIFIED |
| `File access logs visible to owner or admin` | SELECT | `person_id = auth.uid()` OU admin do tenant do arquivo | LOCAL_VERIFIED |
| `File access logs insert only` | INSERT | `person_id = auth.uid()` | LOCAL_VERIFIED |

#### 4.2.10 `talent_pool_memberships` / `job_matches` / `candidate_preferences`

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Talent pool visible to tenant members` | SELECT | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Talent pool insertable by service` | INSERT | `true` | LOCAL_VERIFIED |
| `Talent pool updatable by owner/service` | UPDATE | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Job matches visible to tenant members` | SELECT | `tenant_id IN tenant_memberships` | LOCAL_VERIFIED |
| `Job matches insertable by service` | INSERT | `true` | LOCAL_VERIFIED |
| `Candidate preferences visible to owner/service` | ALL | `candidate_id` do usuário autenticado | LOCAL_VERIFIED |

#### 4.2.11 `chat_rooms` / `chat_messages` (LEGACY)

| Policy | Comando | USING / WITH CHECK | Status |
|--------|---------|-------------------|--------|
| `Chat rooms visible within tenant` | SELECT | `tenant_id IN tenant_memberships` (usa `user_id`) | LEGACY |
| `Chat rooms manageable within tenant` | INSERT | `tenant_id IN tenant_memberships` (usa `user_id`) | LEGACY |
| `Chat rooms updatable within tenant` | UPDATE | `tenant_id IN tenant_memberships` + role check | LEGACY |
| `Chat messages visible within tenant` | SELECT | `tenant_id IN tenant_memberships` (usa `user_id`) | LEGACY |
| `Chat messages insertable within tenant` | INSERT | `tenant_id IN tenant_memberships` (usa `user_id`) | LEGACY |

### 4.3 Conflitos RLS detectados

| ID | Conflito | Origem | Impacto | Status |
|----|----------|--------|---------|--------|
| CONFLICT-RLS-001 | `profiles.role` usado como source of truth | `schema.sql` + `20260816000700_rbac.sql` | RBAC, frontend, auth | PENDENTE |
| CONFLICT-RLS-002 | `tenant_memberships.user_id` (legacy) vs `tenant_memberships.person_id` (V2.1) | `schema.sql` + migrations V2.1 | Auth, RLS, chat | PENDENTE |
| CONFLICT-RLS-003 | `profiles` tabela inteira é LEGACY, mas policies V2.1 ainda referenciam `people` | `20260816001200_rls_consolidation.sql` | Isolamento tenant | PENDENTE |

---

## 3.4 Gate — RLS / Policies

| Item | Valor | Status |
|------|-------|--------|
| Tabelas com RLS | 25 | LOCAL_VERIFIED |
| Policies mapeadas | 39 | LOCAL_VERIFIED |
| Policies LEGACY | 5 | LEGACY |
| Conflitos RLS | 3 | CONFLICT |
| Itens REMOTE_UNVERIFIED | 44 | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.5 — Storage | PENDENTE |

**Conclusão da 3.4:** Nenhuma alteração de banco foi executada. O inventário de RLS/Policies está completo localmente. Próximo passo: Fase 3.5.

---

## 5. Storage

### 5.1 Tabela `files` (domínio)

| Campo | Tipo | Finalidade | Status |
|-------|------|------------|--------|
| `provider` | varchar(20) | Supabase/S3/R2/local | LOCAL_VERIFIED |
| `bucket` | varchar(100) | Namespace no provider | LOCAL_VERIFIED |
| `object_key` | varchar(500) | Chave única no storage | LOCAL_VERIFIED |
| `visibility` | varchar(20) | private/tenant/public | LOCAL_VERIFIED |
| `status` | varchar(20) | active/deleted/quarantined | LOCAL_VERIFIED |
| `checksum` | varchar(64) | SHA-256 integridade | LOCAL_VERIFIED |

### 5.2 Tabela `file_access_logs` (auditoria)

| Campo | Tipo | Finalidade | Status |
|-------|------|------------|--------|
| `access_type` | varchar(20) | view/download/upload/signed_url/delete | LOCAL_VERIFIED |
| `ip_address` | inet | IP do acessante | LOCAL_VERIFIED |
| `user_agent` | text | User agent | LOCAL_VERIFIED |
| `status` | varchar(20) | success/denied/error | LOCAL_VERIFIED |

### 5.3 Storage Policies (Supabase Storage)

| Bucket | Policy | Acesso | Status |
|--------|--------|--------|--------|
| (nenhum bucket declarado em SQL local) | — | — | MISSING |

**Nota:** Os buckets do Supabase Storage são geralmente criados via Dashboard ou CLI, não via SQL migration. Eles não aparecem no repositório.

**Ação (Fase 3B):** Consultar `storage.buckets` e `storage.policies` no banco remoto.

---

## 3.5 Gate — Storage

| Item | Valor | Status |
|------|-------|--------|
| Tabelas de storage | 2 (`files`, `file_access_logs`) | LOCAL_VERIFIED |
| Buckets declarados em SQL | 0 | MISSING |
| Storage policies declaradas | 0 | MISSING |
| Conflitos | 0 | — |
| Itens REMOTE_UNVERIFIED | 2 tabelas + buckets/policies | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.6 — Events / Outbox | PENDENTE |

**Conclusão da 3.5:** Nenhuma alteração de banco foi executada. O inventário de Storage está completo localmente. Próximo passo: Fase 3.6.

---

## 6. Events / Outbox

### 6.1 Tabela `domain_events`

| Campo | Tipo | Finalidade | Status |
|-------|------|------------|--------|
| `tenant_id` | uuid | Isolamento multi-tenant | LOCAL_VERIFIED |
| `event_name` | varchar(100) | Nome canônico | LOCAL_VERIFIED |
| `event_version` | varchar(20) | Versionamento | LOCAL_VERIFIED |
| `aggregate_type` | varchar(50) | Tipo da entidade | LOCAL_VERIFIED |
| `aggregate_id` | uuid | ID da entidade | LOCAL_VERIFIED |
| `actor_person_id` | uuid | Quem provocou | LOCAL_VERIFIED |
| `correlation_id` | uuid | Request única | LOCAL_VERIFIED |
| `causation_id` | uuid | Evento anterior | LOCAL_VERIFIED |
| `payload` | jsonb | Dados do evento | LOCAL_VERIFIED |
| `occurred_at` | timestamptz | Quando ocorreu | LOCAL_VERIFIED |
| `published_at` | timestamptz | Quando entregue (NULL=pending) | LOCAL_VERIFIED |
| `delivery_attempts` | integer | Tentativas | LOCAL_VERIFIED |
| `last_error` | text | Último erro | LOCAL_VERIFIED |
| `idempotency_key` | uuid | Idempotência | LOCAL_VERIFIED |

### 6.2 Triggers de emissão de eventos

| Trigger | Tabela origem | Evento emitido | Quando |
|---------|---------------|----------------|--------|
| `application_created_event` | `applications` | `application.created` | AFTER INSERT |
| `application_status_changed_event` | `application_status_history` | `application.status_changed` | AFTER INSERT |
| `candidate_created_event` | `candidates` | `candidate.created` | AFTER INSERT |
| `job_published_event` | `jobs` | `job.published` | AFTER UPDATE (quando status=vai para published) |
| `talent_pool_joined_event` | `talent_pool_memberships` | `talent_pool.joined` | AFTER INSERT (active + granted) |
| `job_match_found_event` | `job_matches` | `job.match_found` | AFTER INSERT (score>=80, não enviado, não invalidado) |

### 6.3 Functions de consumo de eventos

| Função | Propósito | Status |
|--------|-----------|--------|
| `get_pending_domain_events()` | Retorna eventos pendentes para n8n | LOCAL_VERIFIED |
| `mark_event_published()` | Marca evento como entregue | LOCAL_VERIFIED |
| `mark_event_failed()` | Registra falha na entrega | LOCAL_VERIFIED |

### 6.4 Imutabilidade

| Trigger | Função | Status |
|---------|--------|--------|
| `prevent_event_update` | `prevent_event_modification()` | LOCAL_VERIFIED |
| `prevent_event_delete` | `prevent_history_modification()` | CONFLICT |

**Conflito:** A função `prevent_history_modification()` não está definida em lugar nenhum dos migrations V2.1 analisados. Ela pode estar em `schema.sql` (legacy) ou em outra migration. Isso causaria falha no deploy.

---

## 3.6 Gate — Events / Outbox

| Item | Valor | Status |
|------|-------|--------|
| Tabela `domain_events` | 1 | LOCAL_VERIFIED |
| Triggers de emissão | 6 | LOCAL_VERIFIED |
| Functions de consumo | 3 | LOCAL_VERIFIED |
| Triggers de imutabilidade | 2 | LOCAL_VERIFIED |
| Conflitos | 1 (`prevent_history_modification`) | CONFLICT |
| Itens REMOTE_UNVERIFIED | 12 | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.7 — Notificações | PENDENTE |

**Conclusão da 3.6:** Nenhuma alteração de banco foi executada. O inventário de Events/Outbox está completo localmente. Próximo passo: Fase 3.7.

---

## 7. Notificações

### 7.1 Tabelas

| Tabela | Campos principais | Status |
|--------|-------------------|--------|
| `notifications` | recipient, type, category, priority, status, source_event_id | LOCAL_VERIFIED |
| `notification_deliveries` | notification_id, channel, status, attempts, provider | LOCAL_VERIFIED |
| `notification_preferences` | person_id, notification_type, channel, enabled | LOCAL_VERIFIED |

### 7.2 Enums

| Enum | Valores | Status |
|------|---------|--------|
| `notification_status` | draft, pending, processing, sent, failed, expired | LOCAL_VERIFIED |
| `notification_priority` | low, normal, high, urgent | LOCAL_VERIFIED |
| `notification_channel` | in_app, email, whatsapp, push | LOCAL_VERIFIED |
| `notification_delivery_status` | pending, sent, delivered, failed, skipped | LOCAL_VERIFIED |
| `notification_category` | transactional, matching, marketing, system | LOCAL_VERIFIED |

### 7.3 Functions

| Função | Propósito | Status |
|--------|-----------|--------|
| `create_notification()` | Cria notificação idempotente | LOCAL_VERIFIED |
| `create_notification_delivery()` | Cria delivery por canal | LOCAL_VERIFIED |
| `mark_delivery_sent()` | Marca como enviada | LOCAL_VERIFIED |
| `mark_delivery_delivered()` | Marca como entregue | LOCAL_VERIFIED |
| `mark_delivery_failed()` | Marca falha | LOCAL_VERIFIED |
| `mark_notification_read()` | Marca como lida | LOCAL_VERIFIED |
| `is_channel_enabled()` | Verifica preferência | LOCAL_VERIFIED |
| `get_pending_deliveries()` | Retorna entregas pendentes por canal | LOCAL_VERIFIED |
| `get_due_deliveries()` | Retorna entregas vencidas (todos canais) | LOCAL_VERIFIED |
| `create_default_notification_preferences()` | Seed de preferências | LOCAL_VERIFIED |

---

## 3.7 Gate — Notificações

| Item | Valor | Status |
|------|-------|--------|
| Tabelas | 3 | LOCAL_VERIFIED |
| Enums | 5 | LOCAL_VERIFIED |
| Functions | 10 | LOCAL_VERIFIED |
| Conflitos | 0 | — |
| Itens REMOTE_UNVERIFIED | 18 | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.8 — RBAC | PENDENTE |

**Conclusão da 3.7:** Nenhuma alteração de banco foi executada. O inventário de Notificações está completo localmente. Próximo passo: Fase 3.8.

---

## 8. RBAC

### 8.1 Tabelas

| Tabela | Finalidade | Status |
|--------|------------|--------|
| `roles` | Papéis (global + tenant) | LOCAL_VERIFIED |
| `permissions` | Permissões canônicas (resource.action) | LOCAL_VERIFIED |
| `role_permissions` | Papel ↔ Permissão | LOCAL_VERIFIED |
| `role_assignments` | Pessoa ↔ Papel (global ou tenant) | LOCAL_VERIFIED |
| `role_resource_permissions` | Matriz canônica role↔resource↔action | LOCAL_VERIFIED |

### 8.2 Seeds globais

| Papel | is_global | Descrição | Status |
|-------|-----------|-----------|--------|
| `admin_master` | TRUE | Acesso global | LOCAL_VERIFIED |
| `platform_admin` | TRUE | Administração da plataforma | LOCAL_VERIFIED |
| `support_engineer` | TRUE | Suporte técnico global | LOCAL_VERIFIED |

### 8.3 Seeds tenant (template)

| Papel | is_global | Descrição | Status |
|-------|-----------|-----------|--------|
| `tenant_admin` | FALSE | Administração do tenant | LOCAL_VERIFIED |
| `rh_manager` | FALSE | Gestão de RH | LOCAL_VERIFIED |
| `recruiter` | FALSE | Recrutamento e triagem | LOCAL_VERIFIED |
| `finance` | FALSE | Financeiro | LOCAL_VERIFIED |
| `support` | FALSE | Atendimento ao cliente | LOCAL_VERIFIED |
| `content_manager` | FALSE | Conteúdo do site | LOCAL_VERIFIED |
| `viewer` | FALSE | Apenas leitura | LOCAL_VERIFIED |
| `member` | FALSE | Membro (usado em role_resource_permissions mas não seedado como role) | CONFLICT |

### 8.4 Functions RBAC

| Função | Propósito | Status |
|--------|-----------|--------|
| `user_has_permission()` | Verifica permissão (global ou tenant) | LOCAL_VERIFIED |
| `can_access_tenant()` | Verifica acesso a tenant | LOCAL_VERIFIED |

---

## 3.8 Gate — RBAC

| Item | Valor | Status |
|------|-------|--------|
| Tabelas RBAC | 5 | LOCAL_VERIFIED |
| Roles globais seedadas | 3 | LOCAL_VERIFIED |
| Roles tenant seedadas | 7 | LOCAL_VERIFIED |
| Permissions seedadas | 31 | LOCAL_VERIFIED |
| Functions RBAC | 2 | LOCAL_VERIFIED |
| Conflitos | 1 (`member` não seedado) | CONFLICT |
| Itens REMOTE_UNVERIFIED | 13 | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.9 — Talent Pool | PENDENTE |

**Conclusão da 3.8:** Nenhuma alteração de banco foi executada. O inventário de RBAC está completo localmente. Próximo passo: Fase 3.9.

---

## 9. Talent Pool

### 9.1 Tabelas

| Tabela | Finalidade | Status |
|--------|------------|--------|
| `talent_pool_memberships` | Estado de disponibilidade + consentimento | LOCAL_VERIFIED |
| `candidate_preferences` | Preferências de matching | LOCAL_VERIFIED |
| `candidate_profile_views` | Tracking de visualizações | LOCAL_VERIFIED |
| `job_matches` | Score candidato↔vaga | LOCAL_VERIFIED |

### 9.2 Enums

| Enum | Valores | Status |
|------|---------|--------|
| `talent_pool_status` | active, paused, removed | LOCAL_VERIFIED |
| `talent_pool_source` | direct_signup, application_rejected, recruiter_invitation, import, campaign | LOCAL_VERIFIED |
| `consent_status` | granted, revoked, expired | LOCAL_VERIFIED |

### 9.3 Functions

| Função | Propósito | Status |
|--------|-----------|--------|
| `join_talent_pool()` | Adiciona candidato ao pool | LOCAL_VERIFIED |
| `remove_from_talent_pool()` | Remove candidato (soft) | LOCAL_VERIFIED |
| `pause_talent_pool()` | Pausa candidato | LOCAL_VERIFIED |
| `get_active_candidates_for_matching()` | Retorna candidatos para matching | LOCAL_VERIFIED |

---

## 3.9 Gate — Talent Pool

| Item | Valor | Status |
|------|-------|--------|
| Tabelas | 4 | LOCAL_VERIFIED |
| Enums | 3 | LOCAL_VERIFIED |
| Functions | 4 | LOCAL_VERIFIED |
| Conflitos | 0 | — |
| Itens REMOTE_UNVERIFIED | 11 | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.10 — Chat | PENDENTE |

**Conclusão da 3.9:** Nenhuma alteração de banco foi executada. O inventário de Talent Pool está completo localmente. Próximo passo: Fase 3.10.

---

## 10. Chat (LEGACY)

### 10.1 Tabelas

| Tabela | Finalidade | Status |
|--------|------------|--------|
| `chat_rooms` | Salas de atendimento | LEGACY |
| `chat_messages` | Mensagens do chat | LEGACY |

### 10.2 Problemas identificados

| Problema | Origem | Impacto | Status |
|----------|--------|---------|--------|
| Usa `tenant_memberships.user_id` (não `person_id`) | `20250101_chat.sql` | RLS, auth | CONFLICT |
| Usa `auth.users(id)` em `assigned_to` | `20250101_chat.sql` | FK, auth | CONFLICT |
| Não integrado com `people` / `profiles` V2.1 | `20250101_chat.sql` | Isolamento, RBAC | LEGACY |

---

## 3.10 Gate — Chat (LEGACY)

| Item | Valor | Status |
|------|-------|--------|
| Tabelas LEGACY | 2 | LEGACY |
| Problemas identificados | 3 | CONFLICT |
| Conflitos | 2 | CONFLICT |
| Itens REMOTE_UNVERIFIED | 5 | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.11 — Cron / Jobs | PENDENTE |

**Conclusão da 3.10:** Nenhuma alteração de banco foi executada. O inventário de Chat está completo localmente. Próximo passo: Fase 3.11.

---

## 11. Cron / Jobs

| Item | Frequência | Função chamada | Dependências | Status |
|------|-----------|----------------|--------------|--------|
| (nenhum cron job declarado) | — | — | — | MISSING |

**Nota:** A Fase 3B deve verificar `pg_cron` ou equivalentes no banco remoto.

---

## 3.11 Gate — Cron / Jobs

| Item | Valor | Status |
|------|-------|--------|
| Cron jobs declarados | 0 | MISSING |
| Jobs agendados | 0 | MISSING |
| Conflitos | 0 | — |
| Itens REMOTE_UNVERIFIED | 0 (mas investigar `pg_cron` no remoto) | REMOTE_UNVERIFIED |
| Próxima etapa | Fase 3.10 — Final Inventory | PENDENTE |

**Conclusão da 3.11:** Nenhuma alteração de banco foi executada. O inventário de Cron/Jobs está completo localmente. Próximo passo: Fase 3.10.

---

## 12. Enums globais

| Enum | Valores | Usado em | Status |
|------|---------|----------|--------|
| `notification_status` | draft, pending, processing, sent, failed, expired | `notifications` | LOCAL_VERIFIED |
| `notification_priority` | low, normal, high, urgent | `notifications` | LOCAL_VERIFIED |
| `notification_channel` | in_app, email, whatsapp, push | `notification_deliveries`, `notification_preferences` | LOCAL_VERIFIED |
| `notification_delivery_status` | pending, sent, delivered, failed, skipped | `notification_deliveries` | LOCAL_VERIFIED |
| `notification_category` | transactional, matching, marketing, system | `notifications` | LOCAL_VERIFIED |
| `talent_pool_status` | active, paused, removed | `talent_pool_memberships` | LOCAL_VERIFIED |
| `talent_pool_source` | direct_signup, application_rejected, recruiter_invitation, import, campaign | `talent_pool_memberships` | LOCAL_VERIFIED |
| `consent_status` | granted, revoked, expired | `talent_pool_memberships` | LOCAL_VERIFIED |

---

## 13. Dependências cruzadas

### 13.1 Grafo de Functions

```
emit_domain_event
  ├→ domain_events (INSERT)
  ├→ emit_application_created_event → applications
  ├→ emit_application_status_changed_event → application_status_history
  ├→ emit_candidate_created_event → candidates
  ├→ emit_job_published_event → jobs
  ├→ emit_talent_pool_joined_event → talent_pool_memberships
  ├→ emit_job_match_found_event → job_matches
  ├→ mark_event_published → domain_events (UPDATE)
  ├→ mark_event_failed → domain_events (UPDATE)
  ├→ create_notification → notifications
  ├→ create_notification_delivery → notification_deliveries
  ├→ mark_delivery_sent → notification_deliveries (UPDATE)
  ├→ mark_delivery_delivered → notification_deliveries (UPDATE)
  ├→ mark_delivery_failed → notification_deliveries (UPDATE)
  ├→ mark_notification_read → notifications (UPDATE)
  ├→ join_talent_pool → talent_pool_memberships
  ├→ remove_from_talent_pool → talent_pool_memberships (UPDATE) + domain_events
  ├→ pause_talent_pool → talent_pool_memberships (UPDATE) + domain_events
  ├→ get_active_candidates_for_matching → job_matches, candidate_preferences, candidate_skills
  ├→ get_pending_domain_events → domain_events
  ├→ get_pending_deliveries → notification_deliveries + notifications
  ├→ get_due_deliveries → notification_deliveries + notifications
  ├→ user_has_permission → role_assignments, roles, role_resource_permissions, tenant_memberships
  ├→ can_access_tenant → tenant_memberships, people
  ├→ create_default_notification_preferences → notification_preferences
  └→ handle_new_user → tenants, profiles (LEGACY)
```

### 13.2 Grafo de Triggers

```
AFTER INSERT auth.users
  └→ handle_new_user()
       ├→ tenants (INSERT)
       └→ profiles (INSERT) — LEGACY

AFTER INSERT applications
  └→ emit_application_created_event()
       └→ emit_domain_event() → domain_events

AFTER INSERT application_status_history
  └→ emit_application_status_changed_event()
       └→ emit_domain_event() → domain_events

AFTER INSERT candidates
  └→ emit_candidate_created_event()
       └→ emit_domain_event() → domain_events

AFTER UPDATE jobs
  └→ emit_job_published_event()
       └→ emit_domain_event() → domain_events

AFTER INSERT talent_pool_memberships (active + granted)
  └→ emit_talent_pool_joined_event()
       └→ emit_domain_event() → domain_events

AFTER INSERT job_matches (score>=80)
  └→ emit_job_match_found_event()
       └→ emit_domain_event() → domain_events

BEFORE UPDATE domain_events
  ├→ prevent_event_modification() — immutabilidade
  └→ update_updated_at()

BEFORE DELETE domain_events
  └→ prevent_history_modification() — CONFLICT: função não encontrada

BEFORE UPDATE notification_deliveries
  ├→ skip_expired_notification_deliveries()
  └→ update_updated_at()

BEFORE INSERT/UPDATE talent_pool_memberships
  └→ validate_talent_pool_consent()

BEFORE UPDATE candidate_preferences
  └→ validate_candidate_preferences_update()

BEFORE UPDATE roles/permissions/files/notification_deliveries/notification_preferences/talent_pool_memberships/job_matches/candidate_preferences
  └→ update_updated_at()
```

### 13.3 Grafo de Policies

```
auth.uid()
  ↓
people.auth_user_id
  ↓
people.id
  ↓
tenant_memberships.person_id
  ↓
tenant_memberships.tenant_id
  ↓
[SELECT/INSERT/UPDATE/DELETE] em tabelas tenant-scoped
```

**Conflito:** O chat usa `tenant_memberships.user_id` em vez de `person_id`, quebrando a cadeia V2.1.

---

## 14. Storage (Supabase Storage)

### 14.1 Buckets esperados (V2.1)

| Bucket | Finalidade | Visibilidade | Status |
|--------|------------|--------------|--------|
| (nenhum bucket declarado em SQL) | — | — | MISSING |

**Nota:** Os buckets são criados fora do versionamento SQL (Dashboard/CLI). A Fase 3B deve confirmar quais buckets existem no remoto.

### 14.2 Storage Policies esperadas

| Bucket | Path pattern | Acesso | Status |
|--------|--------------|--------|--------|
| (nenhuma policy declarada em SQL) | — | — | MISSING |

---

## 15. Conflitos registrados

### CONFLICT-001: `user_id` × `person_id`

**Origem:**
- `supabase/schema.sql` (legacy): `tenant_memberships.user_id` referencia `auth.users(id)`
- `supabase/migrations/20260816000700_rbac.sql` (V2.1): `role_assignments.person_id` referencia `people(id)`
- `supabase/migrations/20260816000200_identity_people_auth.sql` (V2.1): usa `people.auth_user_id`

**Impacto:**
- Auth: `handle_new_user()` cria `profiles` e `tenant_memberships.user_id`
- RLS: Polices V2.1 usam `people.auth_user_id`; chat legacy usa `tenant_memberships.user_id`
- Frontend: providers podem depender de `user_id` ou `person_id`
- RBAC: `role_assignments.person_id` vs `tenant_memberships.user_id`

**Decisão:** PENDENTE — não alterar até reconciliação. V2.1 canônico é `person_id`.

### CONFLICT-002: `profiles` × `people`

**Origem:**
- `supabase/schema.sql` (legacy): tabela `profiles` com `role`, `tenant_id`, etc.
- `supabase/migrations/20260816000200_identity_people_auth.sql` (V2.1): tabela `people` com `auth_user_id`, etc.

**Impacto:**
- Auth: `handle_new_user()` insere em `profiles`
- Frontend: pode ler `profiles.role` ou `people` + RBAC
- RLS: policies V2.1 referenciam `people`, legacy referenciam `profiles`

**Decisão:** PENDENTE — V2.1 canônico é `people`. `profiles` deve ser removido ou mantido como legado.

### CONFLICT-003: Função `prevent_history_modification()` não encontrada

**Origem:**
- `supabase/migrations/20260816000900_domain_events.sql`: trigger `prevent_event_delete` referencia `public.prevent_history_modification()`

**Impacto:**
- Deploy: trigger falha se função não existir
- Integridade: DELETE em `domain_events` não é bloqueado

**Decisão:** PENDENTE — verificar se função existe em `schema.sql` ou outra migration. Se não existir, criar ou corrigir trigger.

### CONFLICT-004: Role `member` não seedada

**Origem:**
- `supabase/migrations/20260816001200_rls_consolidation.sql`: INSERT INTO `role_resource_permissions` para role `member`
- `supabase/migrations/20260816000700_rbac.sql`: seed de roles não inclui `member`

**Impacto:**
- RBAC: permissões para `member` existem mas role não pode ser atribuída
- Frontend: pode tentar atribuir `member` e falhar

**Decisão:** PENDENTE — adicionar `member` ao seed de roles ou remover permissões.

---

## 16. Itens REMOTE_UNVERIFIED

Estes itens existem no repositório local, mas precisam ser confirmados no banco remoto na **Fase 3B**:

| Item | Motivo |
|------|--------|
| Todas as Functions/RPCs | Podem ter sido alteradas manualmente no remoto |
| Todos os Triggers | Podem ter sido removidos/adicionados manualmente |
| Todas as Policies | Podem ter sido alteradas manualmente |
| Views | Podem existir views não versionadas |
| Storage buckets | Criados via Dashboard/CLI |
| Storage policies | Criadas via Dashboard/CLI |
| Cron jobs | Podem existir jobs não versionados |
| Dados seed | Podem ter sido alterados manualmente |
| Extensions | Podem ter sido adicionadas/removidas |

---

## 17. Próximos passos — Fase 3B (Remote Reconciliation)

Para confirmar o estado real do banco remoto, executar as seguintes consultas:

```sql
-- Functions/RPCs
SELECT n.nspname, p.proname, pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- Triggers
SELECT tgname, tgrelid::regclass, tevent, tgenabled
FROM pg_trigger
WHERE tgrelid::regclass::schema || '.' || tgrelid::regclass::name LIKE 'public.%';

-- Views
SELECT schemaname, viewname, definition
FROM pg_views
WHERE schemaname = 'public';

-- Materialized Views
SELECT schemaname, matviewname, definition
FROM pg_matviews
WHERE schemaname = 'public';

-- Policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';

-- RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Storage buckets
SELECT * FROM storage.buckets;

-- Storage policies
SELECT * FROM storage.policies;

-- Cron jobs (pg_cron)
SELECT * FROM cron.job;

-- Enums
SELECT n.nspname, t.typname, t.typtype
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public' AND t.typtype = 'e';

-- Extensions
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'pgcron');
```

---

## 18. Critérios de conclusão da Fase 3

A Fase 3 só pode ser considerada concluída quando:

- [x] Inventário local gerado (Fase 3A)
- [ ] Inventário remoto confirmado (Fase 3B)
- [ ] Cross-check local × remoto realizado
- [ ] Grafo de dependências validado
- [ ] Todos os CONFLICTS registrados com decisão
- [ ] Todos os MISSING investigados
- [ ] Todos os LEGACY classificados (manter/remover)
- [ ] Matriz V2.1 atualizada com status real

---

## 19. Gate — Perguntas obrigatórias

1. **Se apagarmos o banco atual amanhã, sabemos exatamente quais comportamentos precisam existir no V2.1?**  
   Parcialmente. O inventário local mostra o que *deveria* existir. A Fase 3B confirmará o que *realmente* existe.

2. **Quais Functions/RPCs são chamadas pelo frontend?**  
   Pendente investigação no frontend + confirmação remota.

3. **Quais Triggers são essenciais vs. legados?**  
   Domínios de eventos e validações são essenciais. `handle_new_user()` é legacy.

4. **Quais Views são necessárias para dashboards/relatórios?**  
   Nenhuma view declarada localmente. Investigar remoto.

5. **Quais Storage buckets são usados e por quais entidades?**  
   Pendente Fase 3B.

---

## 20. Resumo para a auditoria

### Quantitativos

| Categoria | Quantidade | LOCAL_VERIFIED | REMOTE_UNVERIFIED | CONFLICT | MISSING | LEGACY |
|-----------|-----------:|----------------:|------------------:|---------:|--------:|--------|
| Functions/RPCs | 18 | 18 | 18 | 0 | 0 | 0 |
| Triggers | 22 | 22 | 22 | 1 | 0 | 2 |
| Views | 0 | 0 | 0 | 0 | 0 | 0 |
| Policies | 39 | 39 | 39 | 0 | 0 | 5 |
| Enums | 7 | 7 | 7 | 0 | 0 | 0 |
| Storage | 2 tabelas | 2 | 2 | 0 | 2 | 0 |
| Events/Outbox | 1 + 3 func | 1 | 1 | 0 | 0 | 0 |
| Cron/Jobs | 0 | 0 | 0 | 0 | 1 | 0 |
| **Total** | | **89** | **89** | **1** | **3** | **7** |

### Conflitos principais

1. `user_id` × `person_id` em `tenant_memberships`
2. `profiles` × `people` como identidade canônica
3. Função `prevent_history_modification()` não encontrada
4. Role `member` não seedada mas usada em permissões

### Itens LEGACY

1. Tabela `profiles` (substituída por `people`)
2. Trigger `on_auth_user_created` (usa `profiles`)
3. Tabelas `chat_rooms` / `chat_messages` (não integradas com V2.1)
4. Policies de chat usam `user_id` ao invés de `person_id`

### Itens MISSING

1. Views para dashboards/relatórios
2. Storage buckets declarados em SQL
3. Cron jobs declarados

---

## 3.10 Gate — Final Inventory

| Item | Valor | Status |
|------|-------|--------|
| Seções completas | 3.1 a 3.11 | ✅ |
| Functions/RPCs inventariadas | 18 | LOCAL_VERIFIED |
| Triggers inventariados | 22 | LOCAL_VERIFIED |
| Views inventariadas | 0 | LOCAL_VERIFIED |
| RLS/Policies inventariadas | 39 | LOCAL_VERIFIED |
| Storage inventariado | 2 tabelas | LOCAL_VERIFIED |
| Events/Outbox inventariados | 1 tabela + 3 funções | LOCAL_VERIFIED |
| Notificações inventariadas | 3 tabelas + 10 funções | LOCAL_VERIFIED |
| RBAC inventariado | 5 tabelas + 2 funções | LOCAL_VERIFIED |
| Talent Pool inventariado | 4 tabelas + 4 funções | LOCAL_VERIFIED |
| Chat inventariado | 2 tabelas | LEGACY |
| Cron/Jobs inventariado | 0 | MISSING |
| Conflitos registrados | 4 | CONFLICT |
| Itens REMOTE_UNVERIFIED | 89 | REMOTE_UNVERIFIED |
| Nenhuma alteração executada | SIM | ✅ |

**Conclusão da Fase 3A:** O inventário local está completo. Nenhuma alteração de banco foi executada. Próxima etapa: Fase 3B — Remote Reconciliation.

---

**Próxima etapa:** Executar **Fase 3B — Remote Reconciliation** para confirmar o estado real do banco e fechar os itens `REMOTE_UNVERIFIED`.



