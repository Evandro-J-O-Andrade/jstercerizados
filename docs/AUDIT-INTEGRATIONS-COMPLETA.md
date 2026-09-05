# Auditoria Completa — Bloco INTEGRAÇÕES

> **J&S Empregos LTDA** • Audit State: 2026-09-03T22:57  
> Escopo: Banco, RBAC, Frontend, Backend, Integrações, Segurança, Operação, UX  
> Fontes: `supabase/migrations/`, `supabase/specs/sql/`, `docs/_raw_*.txt`, `docs/SUPABASE-SCHEMA-REPORT.json`, `docs/SUPABASE-REAL-SCHEMA-INVENTORY.md`, `docs/C18-CLOUD-RECONCILIATION.md`, `docs/AUDITORIA-MATRIZ-COMPLETUDE.md`, `docs/GAP-MATRIX.md`, `docs/HARDENING-SPEC.md`, código-fonte `src/`

---

## ⚠️ DISCREPÂNCIA CRÍTICA (Bloco 0)

**O usuário afirma que migrations 04 e 05 foram aplicadas e as tabelas existem com 0 registros.**  
**Evidência do código contrária isso:**

| Fonte | Statement |
|---|---|
| `supabase/migrations/20260902000004_04_integration_contracts.sql` | `Status: AGUARDANDO OK EXPLÍCITO` |
| `supabase/migrations/20260902000005_05_providers.sql` | `Status: AGUARDANDO OK EXPLÍCITO` |
| `supabase/HARDENING-SPEC.md` L136-137 | `⏳ Aguardando seu OK explícito para git push origin main` / `⏳ Depois do push, você aplica no Supabase com psql -f` |
| `supabase/GAP-MATRIX.md` L62-63 | **Integrações** e **Providers**: `🔴 não existe` |
| `docs/SUPABASE-SCHEMA-REPORT.json` | `providers`, `provider_configs`, `integration_connections`, `integration_credentials`, `integration_events`, `integration_webhooks`, `integration_sync_runs`, `integration_errors` **NÃO** na lista de 201 tabelas |

**As tabelas `providers` e `integration_connections` etc. NÃO EXISTEM no Supabase real.**  
As migrations que as criam estão no repositório mas **não foram aplicadas**. O que existe no real são tabelas de integração **antigas** (calendar_integrations, calendars, etc.) que preexistiram a esse plano.

---

## 1. BANCO

### 1.1 Tabelas do migrations 04 + 05 (AGUARDANDO OK — NÃO APLICADAS)

| Tabela | Migration | Colunas | FK | Índice | RLS | Policy | Dados |
|---|---|---|---|---|---|---|---|
| `providers` | 05 | id, code UNIQUE, category CHECK, display_name, description, api_base_url, docs_url, is_active, config_schema jsonb, created_at, updated_at | — | idx_providers_category (is_active) | ✅ | providers_authenticated_read (SELECT, authenticated, is_active=true) | 0 |
| `provider_configs` | 05 | id, tenant_id, provider_id, connection_id, is_enabled, settings jsonb, created_at, updated_at | tenant_id→tenants, provider_id→providers, connection_id→integration_connections | idx_provider_configs_tenant (is_enabled) | ✅ | provider_configs_tenant_read (SELECT, is_tenant_member) | 0 |
| `integration_connections` | 04 | id, tenant_id, provider_code text, display_name, status CHECK, external_account_id, config jsonb, last_synced_at, last_error_at, created_at, updated_at | tenant_id→tenants | idx_connection_tenant, idx_connection_provider | ✅ | tenant_read (is_tenant_member SELECT) + tenant_write (ALL, is_tenant_member, via backend_gate_final migration) | 0 |
| `integration_credentials` | 04 | id, connection_id, credential_type, ciphertext text, key_uri, expires_at, rotated_at, created_at | connection_id→integration_connections | idx_credentials_connection | ✅ | **DENY ALL** (authenticated: USING false, WITH CHECK false) — service_role only | 0 |
| `integration_events` | 04 | id, connection_id, domain_event_id, provider_code, event_type, idempotency_key, status CHECK, attempts, last_error, sent_at, delivered_at, payload jsonb, response jsonb, created_at, updated_at | connection_id→integration_connections, domain_event_id→domain_events | idx_events_status_created, idx_events_connection | ✅ | tenant_read (via connection join) | 0 |
| `integration_webhooks` | 04 | id, connection_id, provider_code, external_id, event_type, payload jsonb, signature_valid, processed, received_at, processed_at | connection_id→integration_connections | idx_webhooks_unprocessed | ✅ | tenant_read (via connection join) | 0 |
| `integration_sync_runs` | 04 | id, connection_id, direction CHECK, started_at, finished_at, status CHECK, records_total, records_ok, records_failed, error_summary, metadata jsonb | connection_id→integration_connections | idx_sync_runs_connection_started | ✅ | tenant_read (via connection join) | 0 |
| `integration_errors` | 04 | id, connection_id, provider_code, error_code, error_message, context jsonb, occurred_at, resolved_at | connection_id→integration_connections | idx_errors_occurred, idx_errors_unresolved | ✅ | tenant_read (via connection join) | 0 |

### 1.2 Tabelas que EXISTEM no Supabase real (sem migration — aplicadas via spec SQL / diretamente)

Estas tabelas existem no banco real, têm RLS e colunas definidas, mas **não têm CREATE TABLE em migrations** (o DDL está apenas nas specs SQL ou foi criado manualmente). Todas têm **0 registros** (dados vazios).

| Tabela | Colunas (reais) | FK | RLS? | Policy real |
|---|---|---|---|---|
| `calendar_integrations` | id, tenant_id, provider text, status, config jsonb, created_at, updated_at | tenant_id→tenants | ✅ | calendar_integrations_member_read/write/update |
| `calendars` | id, tenant_id, integration_id, name, description, color, is_shared, created_at, updated_at | integration_id→calendar_integrations, tenant_id→tenants | ✅ | calendars_member_read/write/update |
| `calendar_events` | id, tenant_id, calendar_id, title, description, start_at, end_at, all_day, is_busy, location, created_by, created_at, updated_at | calendar_id→calendars, tenant_id→tenants | ✅ | calendar_events_member_read/write/update |
| `event_participants` | id, event_id, person_id, role, status, created_at | event_id→calendar_events, person_id→people | ✅ | event_participants_member_read/write/update (via join) |
| `meeting_rooms` | id, tenant_id, name, capacity, location, amenities jsonb, created_at, updated_at | tenant_id→tenants | ✅ | meeting_rooms_member_read/write/update |
| `meeting_room_reservations` | id, tenant_id, room_id, title, start_at, end_at, created_by, created_at | room_id→meeting_rooms, tenant_id→tenants | ✅ | meeting_room_reservations_member_read/write/update |
| `email_templates` | id, tenant_id, name, subject, body_html, body_text, variables jsonb, status, created_at, updated_at | tenant_id→tenants | ✅ | email_templates_member_read/write/update |
| `email_messages` | id, tenant_id, template_id, recipient_email, subject, body_html, body_text, status, sent_at, created_at | template_id→email_templates, tenant_id→tenants | ✅ | email_messages_member_read/write (sem update policy) |
| `integration_sync_jobs` | id, tenant_id, provider text, last_sync_at, status, config jsonb, created_at, updated_at | tenant_id→tenants | ✅ | integration_sync_jobs_member_read/write |
| `interviews` | id, application_id, scheduled_at, type, location, status, evaluation, notes, created_at, updated_at | application_id→applications | ✅ | interviews_member_read/write/update (via applications→candidates→tenant) |
| `interview_participants` | id, tenant_id, interview_id, person_id, role, created_at, updated_at | interview_id→interviews, person_id→people | ✅ | interview_participants policies (via interview join) |
| `interview_feedback` | id, tenant_id, interview_id, participant_id, rating, comments, recommendation, created_at, updated_at | interview_id→interviews, participant_id→interview_participants | ✅ | interview_feedback policies (via interview join) |
| `notifications` | (especificações do spec) | tenant_id→tenants | ✅ | notifications_member_read/write |
| `notification_deliveries` | (especificações do spec) | notification_id→notifications | ✅ | notification_deliveries_member_read/write |
| `notification_preferences` | (especificações do spec) | tenant_id→tenants, person_id→people | ✅ | (spec políticas) |
| `domain_events` | id, tenant_id, event_type, aggregate_type, aggregate_id, actor_person_id, payload, correlation_id, causation_id, idempotency_key, created_at | tenant_id→tenants, actor_person_id→people | ✅ | domain_events_admin_read (is_admin_master) |
| `event_outbox` | id, tenant_id, event_id, status, attempts, correlation_id, available_at, processed_at, last_error, created_at, updated_at | event_id→domain_events, tenant_id→tenants | ✅ | event_outbox_admin_write (is_admin_master) |
| `event_deliveries` | id, tenant_id, outbox_id, destination, status, actor_person_id, correlation_id, idempotency_key, request_payload, response_payload, attempts, sent_at, failed_at, last_error, created_at, updated_at | outbox_id→event_outbox | ✅ | event_deliveries_admin_write (is_admin_master) |
| `automation_jobs` | id, tenant_id, name, description, trigger_type, trigger_config, action_type, action_config, is_active, last_run_at, next_run_at, run_count, failure_count, actor_person_id, created_at, updated_at | tenant_id→tenants | ✅ | automation_jobs_member_read/write/update |
| `automation_executions` | id, tenant_id, automation_job_id, event_id, status, input_data, output_data, error_message, started_at, finished_at, actor_person_id, correlation_id, created_at, updated_at | automation_job_id→automation_jobs, event_id→domain_events | ✅ | automation_executions_member_read/write |
| `webhook_deliveries` | id, tenant_id, event_id, destination, status, attempts, last_error, sent_at, failed_at, response_status, response_body, actor_person_id, correlation_id, idempotency_key, created_at, updated_at | event_id→domain_events | ✅ | webhook_deliveries_member_read/write |

### 1.3 Conflitos de nomenclatura entre migration 04 e real DB

| Conceito | Migration 04 | Real DB |
|---|---|---|
| Sync runs | `integration_sync_runs` (FK connection_id, direction, started/finished) | `integration_sync_jobs` (tenant_id, provider text, last_sync_at, status, config) |
| Connections | `integration_connections` (provider_code text) | `calendar_integrations` (provider text) — sem tabela providers |
| Credentials | `integration_credentials` (ciphertext, key_uri) | ❌ NÃO EXISTE |
| Events tracking | `integration_events` (provider_code, idempotency_key) | `event_deliveries` (different schema) |
| Webhooks | `integration_webhooks` (provider_code, external_id) | `webhook_deliveries` (event_id, destination) — outbound, not inbound |

**CONCLUSÃO:** Existe uma duplicação conceitual. O migration 04 cria tabelas mais robustas com relacionamento a `providers`, mas NÃO FORAM APLICADAS. O real DB tem tabelas simples e planas sem catálogo de providers.

### 1.4 Tabelas de providers (como no plano) — NÃO EXISTEM no real DB

Nenhuma tabela `providers`, `provider_configs`, `integration_connections` ou sub-tabelas de provider (google, microsoft, zoom, etc.) existem no Supabase real.

---

## 2. RBAC (Controle de Acesso)

### 2.1 Permissões existentes no DB real

| Permissão | Resource | Action | Origem |
|---|---|---|---|
| `integrations.manage` | integrations | manage | Migration `20260816000700_rbac.sql` L375 ✅ |
| `integrations.create` | integrations | create | Reconcile script / manual ❌ (não em migration seed) |
| `integrations.update` | integrations | update | Reconcile script / manual ❌ |
| `integrations.delete` | integrations | delete | Reconcile script / manual ❌ |
| `integrations.test` | integrations | test | Reconcile script / manual ❌ |

> **GAP:** As 4 permissões granulares existem no DB real (via reconcile scripts) mas NÃO estão na migration de seed canônica. Só `integrations.manage` está no migration.

### 2.2 Atribuição por role

| Role | integrations.manage | integrations.create | integrations.update | integrations.delete | integrations.test |
|---|---|---|---|---|---|
| `admin_master` | ✅ (auto-link todos) | ✅ | ✅ | ✅ | ✅ |
| `tenant_admin` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `platform_admin` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `it_admin` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `rh_manager` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `recruiter` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `viewer` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `candidato` | ❌ | ❌ | ❌ | ❌ | ❌ |

> **PROBLEMA:** `platform_admin` e `it_admin` — que são os perfis que realmente administrariam integrações de plataforma — NÃO têm permissão `integrations.manage`. Apenas `tenant_admin` (escopo tenant) e `admin_master` (escopo global) têm acesso.

### 2.3 Como o frontend carrega permissões

1. `AuthContext.tsx` L191-231: carrega `role_assignments` → `role_ids` → `role_permissions` → `permissions` do Supabase real
2. `rbac-normalize.ts` `getPermissionKey()`: prioriza `code`, fallback para `name`, fallback para `resource.action`
3. `PermissionGuard.tsx`: se `isAdminMaster` → acesso irrestrito; senão verifica `hasAnyPermission()`/`hasAllPermissions()`
4. `MODULE_PERMISSION_MAP` (ModuleRegistry.ts L2507): `integracoes: 'integrations.manage'`

### 2.4 Permissões faltando para o escopo de integrações

| Permissão | Status | Observação |
|---|---|---|
| `integrations.read` | ❌ FALTA | Referenciada em docs mas não existe no DB |
| `calendar_integrations.read/create/update` | ❌ FALTA | Nenhuma permissão específica para calendar_integrations |
| `calendar_events.read/create/update` | ❌ FALTA | Nenhuma permissão específica |
| `meeting_rooms.read/create/update` | ❌ FALTA | Nenhuma permissão específica |
| `email_templates.read/create/update` | ❌ FALTA | Nenhuma permissão específica |
| `integration_sync_jobs.read` | ❌ FALTA | Nenhuma permissão específica |
| `interviews.read/update` | ❌ FALTA | Interviews usam `recruitment.read` indiretamente |

---

## 3. FRONTEND

### 3.1 Estado atual

| Componente | Arquivo | Status |
|---|---|---|
| Página | `src/pages/dashboard/IntegracoesPage.tsx` | ⚠️ **Placeholder estático** — hardcoded array de 4 itens |
| Rota | `App.tsx` L35, L160 + dynamic `PORTAL_MODULES` L2118-2211 | ✅ Registrada dinamicamente |
| Permission | `ModuleRegistry.ts` L2507 | ✅ `integracoes: 'integrations.manage'` |
| ModuleRegistry | `ModuleRegistry.ts` L2118-2212 | ✅ 4 features definidas: supabase, n8n, whatsapp, email |
| Repository | — | ❌ NÃO EXISTE |
| Tipos/Domain | `src/types/domain/` | ❌ Nenhum tipo de integração |
| Hooks | `src/hooks/` | ❌ Nenhum hook de integração |
| Services | `src/services/` | ❌ Nenhum serviço de OAuth/webhook |
| Contexts | — | ❌ Nenhum contexto de integração |

### 3.2 IntegracoesPage.tsx — análise detalhada

```tsx
// src/pages/dashboard/IntegracoesPage.tsx
const integrations = [
  { id: 'supabase', name: 'Supabase', status: 'active' },     // hardcoded
  { id: 'n8n',      name: 'n8n',      status: 'pending' },    // hardcoded
  { id: 'whatsapp', name: 'WhatsApp', status: 'pending' },    // hardcoded
  { id: 'email',    name: 'E-mail',   status: 'pending' },    // hardcoded
];
```

- **Não consulta Supabase** — dados são 100% hardcoded
- **Nenhum repositório** — não faz `.from('providers')` ou `.from('integration_connections')`
- **Nenhum action handler** — botões não fazem nada
- **Nenhum sub-feature** — as rotas `/integracoes/supabase`, `/integracoes/n8n`, `/integracoes/whatsapp`, `/integracoes/email` todas caem no mesmo componente (IntegracoesPage) via ModuleWorkspace, sem páginas separadas

### 3.3 ModuleRegistry — features definidas vs implementadas

| Feature ID | Título | Rota | Permission | Implementação |
|---|---|---|---|---|
| `integracoes-ia.conectar` | Conectar | `/dashboard/ia/integracoes` | `integrations.create` | `coming_soon` |
| `integracoes-ia.editar` | Editar | — | `integrations.update` | `coming_soon` |
| `integracoes-ia.desconectar` | Desconectar | — | `integrations.delete` | `coming_soon` |
| `integracoes.supabase` | Configurar | `/dashboard/integracoes/supabase` | `integrations.update` | Placeholder |
| `integracoes.n8n` | Configurar | `/dashboard/integracoes/n8n` | `integrations.update` | Placeholder |
| `integracoes.whatsapp` | Configurar | `/dashboard/integracoes/whatsapp` | `integrations.update` | Placeholder |
| `integracoes.email` | Configurar | `/dashboard/integracoes/email` | `integrations.update` | Placeholder |

### 3.4 Páginas órfãs / faltando

| Página | Status |
|---|---|
| Calendar (agenda de entrevistas) | ❌ NÃO EXISTE como página |
| Providers catalog | ❌ NÃO EXISTE |
| OAuth callback (Google/Microsoft/Zoom) | ❌ NÃO EXISTE |
| Webhook management | ❌ NÃO EXISTE |
| Sync jobs monitor | ❌ NÃO EXISTE |
| Errors dashboard | ❌ NÃO EXISTE |

### 3.5 Repositório padrão do projeto (padrão a seguir)

```typescript
// src/repositories/*.repository.ts — padrão: extends SupabaseRepository
export class XRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<X[]> { ... .from('table').select('*').eq('tenant_id', tenantId) ... }
  async findById(id: string, tenantId: string): Promise<X | null> { ... }
  async create(input, tenantId): Promise<X> { ... }
  async update(id, input, tenantId): Promise<X> { ... }
  async delete(id, tenantId): Promise<void> { ... }
}
export const xRepository = new XRepository();
```

---

## 4. BACKEND

### 4.1 Edge Functions

| Componente | Caminho | Status |
|---|---|---|
| `supabase/functions/` | — | ❌ **NÃO EXISTE** (directory not found) |
| `api/` (root) | — | Contém backups legados (.sql), não functions |
| `@supabase/functions-js` | `package.json` | ✅ Dependency instalada mas NENHUMA função implementada |
| `supabase HARDENING-SPEC.md` L16,30 | — | Menciona Edge Functions como executor de OAuth + KMS, mas **não implementado** |

### 4.2 OAuth / Callbacks

| Provider | OAuth Flow | Callback Handler | Token Exchange | Refresh Token | Revocation |
|---|---|---|---|---|---|
| Google | ❌ | ❌ | ❌ | ❌ | ❌ |
| Microsoft | ❌ | ❌ | ❌ | ❌ | ❌ |
| Zoom | ❌ | ❌ | ❌ | ❌ | ❌ |

### 4.3 Webhooks

| Tipo | Implementado? | Observação |
|---|---|---|
| Inbound (receber de providers) | ❌ | `integration_webhooks` não existe no DB; `webhook_deliveries` é outbound |
| Outbound (enviar a providers) | ✅ (infra) | `event_outbox` + `webhook_deliveries` existem, mas precisam de consumer (n8n) |
| Signature validation | ❌ | `integration_webhooks.signature_valid` não existe; `webhook_deliveries` não tem signature column |
| Retry logic | ⚠️ Parcial | `webhook_deliveries.attempts` existe, mas não há worker |

### 4.4 Sincronização

| Componente | Status | Observação |
|---|---|---|
| Sync job scheduler | ❌ | `integration_sync_jobs` existe (provider text, last_sync_at, status) mas não há worker/cron implementado |
| Sync history | ❌ | `integration_sync_runs` (migration 04) não foi aplicada; `integration_sync_jobs` é apenas status atual, não histórico |
| Trigger eventos | ⚠️ Parcial | `domain_events` + `domain_event_emit()` existem; `emit_domain_event()` wrapper criado na migration 07 mas não aplicada |

### 4.5 Auth callback existente

`src/pages/auth/AuthCallback.tsx` — **apenas Supabase Auth** (`/auth/callback`), NÃO é OAuth de providers.

---

## 5. PROVEDORES (Google, Microsoft, Zoom, Email, WhatsApp)

### 5.1 Estado por provider

| Provider | OAuth | API | Calendar | Meet/Chat | Drive/Storage | Sheets | Email | Webhook | Sync | Status geral |
|---|---|---|---|---|---|---|---|---|---|---|
| **Google** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | NÃO IMPLEMENTADO |
| **Microsoft** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | NÃO IMPLEMENTADO |
| **Zoom** | ❌ | ❌ | ❌ | ✅ (meeting) | N/A | N/A | N/A | ❌ | ❌ | NÃO IMPLEMENTADO |
| **WhatsApp** | ❌ | ❌ | N/A | N/A | N/A | N/A | N/A | ❌ | ❌ | NÃO IMPLEMENTADO |
| **E-mail (SMTP)** | ❌ | ❌ | N/A | N/A | N/A | N/A | ✅ (email_messages/templates) | ❌ | ❌ | PARCIAL (templates existem) |
| **Teams** | ❌ | ❌ | ❌ | ✅ (meeting) | N/A | N/A | N/A | ❌ | ❌ | NÃO IMPLEMENTADO |
| **Gmail** | ❌ | ❌ | N/A | N/A | N/A | N/A | ✅ (via email_messages) | ❌ | ❌ | PARCIAL |
| **Outlook** | ❌ | ❌ | N/A | N/A | N/A | N/A | ✅ (via email_messages) | ❌ | ❌ | PARCIAL |

### 5.2 Configuração de e-mail

`src/lib/index.ts` L5-7:
```typescript
smtpHost: import.meta.env.VITE_SMTP_HOST ?? '',
smtpPort: Number(import.meta.env.VITE_SMTP_PORT ?? 587),
```
- Variáveis de ambiente definidas mas **nenhuma lógica de envio ou conexão SMTP implementada**

### 5.3 WhatsApp

`src/services/mock/clientes.ts` — mock de orçamentos em localStorage
`src/config/whatsappMessages.ts` — config de mensagens (templates estáticos)
- Nenhum provider de WhatsApp real conectado
- Nenhum repositório de WhatsApp

---

## 6. SEGURANÇA

| Item | Status | Observação |
|---|---|---|
| OAuth | ❌ | Nenhum provider conectado |
| Segredos no banco | ❌ | `integration_credentials` não existe; migration 04 define `ciphertext` + `key_uri` mas não aplicada |
| Encryption at rest | ⚠️ | `config jsonb` em calendar_integrations/integration_sync_jobs — **pode conter segredos em plain text** |
| RLS tenant isolation | ✅ | Todas as tabelas de calendário/email têm `is_tenant_member(tenant_id)` |
| RLS credentials | ✅ (migration 04) | `integration_credentials_deny_all` — deny ALL para authenticated |
| Revogação tokens | ❌ | Nenhum mecanismo |
| Expiração tokens | ❌ | `integration_credentials.expires_at` definido na migration 04, mas não aplicada |
| Auditoria | ✅ | `domain_events`, `audit_logs` existem; `emit_domain_event()` na migration 07 |
| Tenant isolation (candidates) | ❌ | `candidato` verifica permissões mas não vê providers/calendar/integrations — OK por enquanto |
| Idempotent operation | ✅ (domain_events) | `idempotency_key` UNIQUE em `domain_events`; migration 04 adiciona em `integration_events` |

### 6.1 Risco de segurança crítico

As tabelas `calendar_integrations`, `integration_sync_jobs` e `calendars` têm coluna `config jsonb` que **pode armazenar tokens OAuth em plain text**. Não há coluna `ciphertext` ou `key_uri`. A migration 04 corrige isso com `integration_credentials`, mas NÃO FOI APLICADA.

---

## 7. OPERAÇÃO

| Operação | Frontend | Backend | DB | Status |
|---|---|---|---|---|
| Conectar (OAuth) | ❌ | ❌ | ❌ | FALTA |
| Testar conexão | ❌ | ❌ | ❌ | FALTA |
| Sincronizar | ❌ | ❌ | ⚠️ (`integration_sync_jobs` exists, sem worker) | FALTA |
| Pausar | ❌ | ❌ | ❌ | FALTA |
| Desconectar | ❌ | ❌ | ❌ | FALTA |
| Reconectar | ❌ | ❌ | ❌ | FALTA |
| Renovar credenciais | ❌ | ❌ | ❌ | FALTA |
| Visualizar erros | ❌ | ❌ | ⚠️ (`integration_errors` migration 04 não aplicada) | FALTA |
| Retry | ❌ | ❌ | ❌ | FALTA |
| Idempotência | ⚠️ (`domain_events`) | ⚠️ | ✅ parcial | PARCIAL |

### 7.1 Integrações de calendário e recrutamento

Fluxo planejado (interview → calendar):
```
interviews (scheduled_at, location) 
  → (deveria linkar a calendar_events)
    → calendar_events (calendar_id → calendars → calendar_integrations.provider)
```

**Problema:** `interviews` tem `scheduled_at` e `location` mas **NÃO tem `calendar_event_id`** ou `integration_id`. Não há ligação direta entre interviews e calendar_events.

---

## 8. UX POR MODALIDADE

### 8.1 Candidate (candidato)

| Ação | Permissão | Acesso |
|---|---|---|
| Ver página Integrações | `integrations.manage` | ❌ candidato não tem |
| Ver agenda própria | `calendar_events.read` / `recruitment.read` | ❌ sem permission específica |
| Ver e-mail de confirmação | `notifications.read` | ⚠️ permission existe mas não atribuída a candidato |

### 8.2 Empresa (empresa/comercial)

| Ação | Permissão | Acesso |
|---|---|---|
| Ver integrações | `integrations.manage` | ❌ empresa não tem |

### 8.3 RH (rh_manager)

| Ação | Permissão | Acesso |
|---|---|---|
| Ver integrações | `integrations.manage` | ❌ rh_manager não tem |
| Agendar entrevista | `applications.interview` | ✅ (permissão existe) |
| Ver agenda | `calendar_events.read` | ❌ NÃO EXISTE |

### 8.4 Suporte (support)

| Ação | Permissão | Acesso |
|---|---|---|
| Ver integrações | `integrations.manage` | ❌ support não tem |
| Ver erros de integração | N/A | ❌ sem permission |

### 8.5 Admin (tenant_admin)

| Ação | Permissão | Acesso |
|---|---|---|
| Ver página Integrações | `integrations.manage` | ✅ |
| Conectar provider | `integrations.create` | ✅ |
| Editar config | `integrations.update` | ✅ |
| Testar conexão | `integrations.test` | ✅ |
| Desconectar | `integrations.delete` | ✅ |

### 8.6 Platform Admin (platform_admin)

| Ação | Permissão | Acesso |
|---|---|---|
| Ver página Integrações | `integrations.manage` | ❌ **GAP CRÍTICO** — platform_admin não tem integrations.manage |

---

## 9. MATRIZ CANÔNICA DE EVIDÊNCIAS

Formato: **EXISTE → PARCIAL → QUEBRADO → FALTA → COMO IMPLEMENTAR**

### 9.1 Banco de Dados

| Item | Status | Evidência | Como implementar |
|---|---|---|---|
| `providers` table | FALTA | Migration 05 não aplicada (AGUARDANDO OK) | Aplicar migration 05 |
| `provider_configs` | FALTA | Migration 05 não aplicada | Aplicar migration 05 |
| `integration_connections` | FALTA | Migration 04 não aplicada | Aplicar migration 04 |
| `integration_credentials` | FALTA | Migration 04 não aplicada | Aplicar migration 04 |
| `integration_events` | FALTA | Migration 04 não aplicada | Aplicar migration 04 |
| `integration_webhooks` | FALTA | Migration 04 não aplicada | Aplicar migration 04 |
| `integration_sync_runs` | FALTA | Migration 04 não aplicada | Aplicar migration 04 |
| `integration_errors` | FALTA | Migration 04 não aplicada | Aplicar migration 04 |
| `calendar_integrations` | EXISTE (parcial) | Real DB ✓, colunas definidas | Unificar com providers/providers_configs |
| `calendars` | EXISTE | Real DB ✓ | — |
| `calendar_events` | EXISTE | Real DB ✓ | Adicionar FK a interviews |
| `event_participants` | EXISTE | Real DB ✓ | — |
| `meeting_rooms` | EXISTE | Real DB ✓ | — |
| `meeting_room_reservations` | EXISTE | Real DB ✓ | — |
| `email_templates` | EXISTE | Real DB ✓ | — |
| `email_messages` | EXISTE | Real DB ✓ | — |
| `integration_sync_jobs` | EXISTE | Real DB ✓ (diferente do sync_runs) | Unificar com sync_runs |
| `notifications` | EXISTE | Real DB ✓ | — |
| `notification_deliveries` | EXISTE | Real DB ✓ | — |
| `notification_preferences` | EXISTE | Real DB ✓ | — |
| `domain_events` | EXISTE | Real DB ✓ | — |
| `event_outbox` | EXISTE | Real DB ✓ | — |
| `automation_jobs` | EXISTE | Real DB ✓ | — |
| `automation_executions` | EXISTE | Real DB ✓ | — |
| `webhook_deliveries` | EXISTE | Real DB ✓ | — |
| `interviews` | EXISTE | Real DB ✓, sem FK calendar | Adicionar calendar_event_id |
| `interview_participants` | EXISTE | Real DB ✓ | — |
| `interview_feedback` | EXISTE | Real DB ✓ | — |

### 9.2 RBAC

| Item | Status | Evidência | Como implementar |
|---|---|---|---|
| `integrations.manage` | EXISTE | Migration 0700 L375 + real DB | — |
| `integrations.create` | PARCIAL | Real DB ✓, migration seed ✗ | Adicionar ao seed migration |
| `integrations.update` | PARCIAL | Real DB ✓, migration seed ✗ | Adicionar ao seed migration |
| `integrations.delete` | PARCIAL | Real DB ✓, migration seed ✗ | Adicionar ao seed migration |
| `integrations.test` | PARCIAL | Real DB ✓, migration seed ✗ | Adicionar ao seed migration |
| `integrations.read` | FALTA | Não existe | Create new + assign |
| `calendar_events.*` | FALTA | Nenhuma permission | Create new + assign |
| `calendar_integrations.*` | FALTA | Nenhuma permission | Create new + assign |
| `meeting_rooms.*` | FALTA | Nenhuma permission | Create new + assign |
| `email_templates.*` | FALTA | Nenhuma permission | Create new + assign |
| `tenant_admin` → integrations | EXISTE | `_raw_role_permissions.txt` L585-589 | — |
| `platform_admin` → integrations | QUEBRADO | NÃO tem permissions | Assign integrations.* |
| `it_admin` → integrations | QUEBRADO | NÃO tem permissions | Assign integrations.manage |
| `rh_manager` → integrations | FALTA | NÃO tem | Decide: assign ou não |
| `recruiter` → integrations | FALTA | NÃO tem | Decide: assign ou não |

### 9.3 Frontend

| Item | Status | Evidência | Como implementar |
|---|---|---|---|
| `IntegracoesPage.tsx` | PARCIAL | ✅ existe, mas placeholder hardcoded | Conectar a repository real |
| Repository (`integration.repository.ts`) | FALTA | Nenhum arquivo | Criar seguindo padrão SupabaseRepository |
| Domain types | FALTA | `src/types/domain/` não tem | Criar `integration.ts` |
| Hook (`useIntegrations`) | FALTA | `src/hooks/` não tem | Criar hook |
| Service (OAuth) | FALTA | Nenhum service | Edge Functions |
| Sub-páginas (supabase, n8n, whatsapp, email) | FALTA | ModuleRegistry define rotas, mas todas usam IntegracoesPage | Criar páginas ou router |
| OAuth callback page | FALTA | AuthCallback só para Supabase Auth | Criar página dedicada |
| Calendar page | FALTA | Nenhuma página de calendário | Criar página de agenda |
| Meeting rooms page | FALTA | Nenhuma página | Criar página |

### 9.4 Backend (Edge Functions)

| Item | Status | Como implementar |
|---|---|---|
| `supabase/functions/` dir | FALTA | Criar diretório |
| OAuth callback (Google) | FALTA | `functions/integrations/oauth-callback/index.ts` |
| OAuth callback (Microsoft) | FALTA | `functions/integrations/oauth-callback-microsoft/index.ts` |
| Token refresh | FALTA | `functions/integrations/refresh-tokens/index.ts` |
| Webhook inbound | FALTA | `functions/integrations/webhook-receiver/index.ts` |
| Sync worker | FALTA | `functions/integrations/sync-worker/index.ts` |
| Connection test | FALTA | `functions/integrations/test-connection/index.ts` |

### 9.5 Segurança

| Item | Status | Como implementar |
|---|---|---|
| Credenciais criptografadas | FALTA | `integration_credentials` migration 04 não aplicada |
| KMS / Vault | FALTA | Edge Function + Supabase Vault secrets |
| Webhook signature | FALTA | `webhook_deliveries` não valida assinatura |
| Token revocation | FALTA | Função + Edge Function |
| Token expiration | FALTA | `integration_credentials.expires_at` não existe no DB |
| RLS credentials deny-all | PARCIAL | Definida na migration 04 mas não aplicada |

---

## 10. RESSALVAS

1. **`providers` ≠ `auth.providers`**: A coluna `auth.providers` em `auth.users` refere-se a provedores de identidade do Supabase Auth (email, google, etc.), não à tabela `providers` do migration 05.
2. **`integration_sync_jobs` ≠ `integration_sync_runs`**: Existem duas convenções diferentes. O real DB usa `integration_sync_jobs` (tenant-scoped, simples). A migration 04 cria `integration_sync_runs` (connection-scoped, com direction e metrics). Precisa unificar.
3. **`calendar_integrations.provider` é TEXT, não FK**: Não referencia a tabela `providers` (que não existe). É um provider code string livre.
4. **Nome da empresa**: Mantido sempre como "J&S Empregos LTDA" conforme AGENTS.md.
