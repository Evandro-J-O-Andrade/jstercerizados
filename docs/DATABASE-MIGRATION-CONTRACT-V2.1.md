# DATABASE-MIGRATION-CONTRACT-V2.1.md

**Data:** 2026-08-18  
**Escopo:** Contrato determinístico para migração AS-IS → V2.1  
**Objetivo:** Definir regras, invariantes e estratégia antes de escrever o migrador

---

## 1. Princípios

1. **Produção é intocada** até autorização explícita
2. **Migração é transacional** por entidade
3. **Nenhum dado operacional é perdido** sem autorização
4. **Frontend/backend dependency mapping** precede qualquer DDL/DML
5. **Dry-run descartável** antes de apply

---

## 2. Invariantes

| ID | Regra | Validação |
|----|-------|-----------|
| INVARIANT-001 | `COUNT(people)_after = COUNT(people)_before` | `SELECT count(*) FROM people` |
| INVARIANT-002 | `COUNT(tenant_memberships)_after = COUNT(tenant_memberships)_before` | `SELECT count(*) FROM tenant_memberships` |
| INVARIANT-003 | `admin_master` continua global (`tenant_id IS NULL`) | `SELECT tenant_id FROM role_assignments WHERE role_id = (SELECT id FROM roles WHERE name = 'admin_master')` |
| INVARIANT-004 | Nenhuma FK aponta para entidade inexistente | `SELECT * FROM ... WHERE NOT EXISTS (SELECT 1 FROM ...)` |
| INVARIANT-005 | Nenhum dado operacional de Tenant A é visível para Tenant B | RLS policies |
| INVARIANT-006 | `notifications` não possui mais dependência operacional direta de `auth.users` | `SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id'` deve retornar 0 |
| INVARIANT-007 | `jobs.company_id` corresponde ao `company_id` derivado de `company_relationship_id` | `SELECT count(*) FROM jobs WHERE company_id NOT IN (SELECT company_id FROM company_relationships WHERE id = jobs.company_relationship_id)` |
| INVARIANT-008 | Nenhuma role legacy: `admin`, `empresa`, `candidato` | `SELECT count(*) FROM roles WHERE name IN ('admin', 'empresa', 'candidato')` |
| INVARIANT-009 | `people.auth_user_id` é único e não nulo para usuários autenticados | `SELECT count(*) FROM people WHERE auth_user_id IS NOT NULL GROUP BY auth_user_id HAVING count(*) > 1` |
| INVARIANT-010 | Todos os `tenant_id` em tabelas tenant-scoped referenciam tenant existente | `SELECT count(*) FROM X WHERE tenant_id NOT IN (SELECT id FROM tenants)` |

---

## 3. Estratégia por Entidade

### 3.1 Tabelas PRESERVAR (sem mudança estrutural)

| AS-IS | V2.1 | Ação | Dados | Observação |
|-------|------|------|-------|------------|
| `tenants` | `tenants` | PRESERVE | 100% | Manter `id` canônico J&S |
| `people` | `people` | PRESERVE | 100% | Não renomear para `profiles` |
| `tenant_memberships` | `tenant_memberships` | PRESERVE | 100% | `person_id` mantido |
| `roles` | `roles` | PRESERVE | 100% | Seed global + tenant |
| `permissions` | `permissions` | PRESERVE | 100% | 26 registros |
| `role_permissions` | `role_permissions` | PRESERVE | 100% | |
| `role_assignments` | `role_assignments` | PRESERVE | 100% | admin_master global mantido |
| `company_types` | `company_types` | PRESERVE | 100% | 6 registros |
| `company_relationship_types` | `company_relationship_types` | PRESERVE | 100% | 3 registros |
| `skills` | `skills` | PRESERVE | 100% | 68 registros |
| `candidate_skills` | `candidate_skills` | PRESERVE | 0 | |
| `job_skills` | `job_skills` | PRESERVE | 0 | |
| `files` | `files` | PRESERVE | 0 | |
| `file_access_logs` | `file_access_logs` | PRESERVE | 0 | |
| `domain_events` | `domain_events` | RECONCILE | 0 | Preservar estrutura rica |
| `talent_pool_memberships` | `talent_pool_memberships` | PRESERVE | 0 | |
| `candidate_preferences` | `candidate_preferences` | PRESERVE | 0 | |
| `candidate_profile_views` | `candidate_profile_views` | PRESERVE | 0 | |
| `job_matches` | `job_matches` | PRESERVE | 0 | |
| `notifications` | `notifications` | TRANSFORM | 0 | `user_id` → `recipient_person_id` |
| `notification_deliveries` | `notification_deliveries` | PRESERVE | 0 | |
| `notification_preferences` | `notification_preferences` | PRESERVE | 0 | |
| `role_resource_permissions` | `role_resource_permissions` | PRESERVE | 114 | Matriz RBAC |
| `application_status_history` | `application_status_history` | PRESERVE | 0 | |
| `application_profile_snapshots` | `application_profile_snapshots` | PRESERVE | 0 | |

### 3.2 Tabelas REBUILD (mudança estrutural)

| AS-IS | V2.1 | Ação | Transformação | Dados |
|-------|------|------|---------------|-------|
| `companies` | `companies` | REBUILD | Adicionar `tenant_id NOT NULL`. Migrar todas as empresas para tenant J&S (`slug = 'js-empregos'`) | 100% |
| `jobs` | `jobs` | TRANSFORM | `company_relationship_id` → `company_id` via `company_relationships` | 100% |

### 3.3 Tabelas TRANSFORM (FK/conteúdo alterado)

| AS-IS | V2.1 | Ação | Transformação | Dados |
|-------|------|------|---------------|-------|
| `notifications` | `notifications` | TRANSFORM | `user_id` (auth.users) → `recipient_person_id` (people) via `people.auth_user_id` | 100% |
| `domain_events` | `domain_events` | RECONCILE | Ajustar `aggregate/aggregate_id` para V2.1, preservar `actor_person_id`, `correlation_id`, `causation_id`, `payload`, `metadata` | 100% |

### 3.4 Tabelas NEW (criar na V2.1)

| V2.1 | Depende de | Dados | Observação |
|------|-----------|-------|------------|
| `tenant_settings` | `tenants` | seed | Configurações J&S |
| `interactions` | `companies`, `people` | 0 | CRM |
| `stage_templates` | — | seed | Templates de processo |
| `recruitment_stages` | `recruitment_processes` | 0 | |
| `candidate_processes` | `candidates`, `recruitment_processes` | 0 | |
| `interview_participants` | `interviews`, `people` | 0 | |
| `interview_feedback` | `interviews`, `people` | 0 | |
| `employees` | `people`, `companies` | 0 | |
| `employee_contracts` | `employees` | 0 | |
| `employee_documents` | `employees` | 0 | |
| `employee_status_history` | `employees` | 0 | |
| `departments` | `tenants` | seed | |
| `positions` | `departments` | seed | |
| `employee_positions` | `employees`, `positions` | 0 | |
| `administrative_requests` | `tenants`, `people` | 0 | |
| `administrative_tasks` | `administrative_requests` | 0 | |
| `administrative_approvals` | `administrative_tasks` | 0 | |
| `administrative_documents` | `administrative_requests` | 0 | |
| `financial_accounts` | `tenants` | seed | |
| `financial_categories` | `tenants` | seed | |
| `cost_centers` | `tenants` | seed | |
| `accounts_receivable` | `companies`, `invoices` | 0 | |
| `accounts_payable` | `suppliers`, `invoices` | 0 | |
| `financial_transactions` | `financial_accounts` | 0 | |
| `invoices` | `companies` | 0 | |
| `invoice_items` | `invoices` | 0 | |
| `payments` | `invoices` | 0 | |
| `expenses` | `financial_transactions` | 0 | |
| `revenues` | `financial_transactions` | 0 | |
| `fiscal_configurations` | `companies` | 0 | |
| `fiscal_integrations` | `fiscal_configurations` | 0 | |
| `fiscal_documents` | `invoices` | 0 | |
| `fiscal_document_items` | `fiscal_documents` | 0 | |
| `fiscal_document_events` | `fiscal_documents` | 0 | |
| `fiscal_document_status_history` | `fiscal_documents` | 0 | |
| `fiscal_api_requests` | `fiscal_documents` | 0 | |
| `fiscal_api_responses` | `fiscal_api_requests` | 0 | |
| `products` | `tenants` | seed | |
| `product_categories` | `tenants` | seed | |
| `warehouses` | `tenants` | seed | |
| `warehouse_locations` | `warehouses` | 0 | |
| `stock_balances` | `products`, `warehouses` | 0 | |
| `stock_movements` | `products`, `warehouses` | 0 | |
| `stock_entries` | `stock_movements` | 0 | |
| `stock_exits` | `stock_movements` | 0 | |
| `stock_inventory` | `warehouses` | 0 | |
| `stock_inventory_items` | `stock_inventory` | 0 | |
| `stock_adjustments` | `stock_balances` | 0 | |
| `suppliers` | `companies` | 0 | |
| `purchase_orders` | `suppliers` | 0 | |
| `purchase_order_items` | `purchase_orders` | 0 | |
| `tasks` | `tenants`, `people` | 0 | |
| `task_comments` | `tasks`, `people` | 0 | |
| `task_attachments` | `tasks` | 0 | |
| `task_status_history` | `tasks`, `people` | 0 | |
| `support_ticket_categories` | `tenants` | seed | |
| `support_tickets` | `tenants`, `people` | 0 | |
| `support_ticket_messages` | `support_tickets`, `people` | 0 | |
| `support_ticket_assignments` | `support_tickets`, `people` | 0 | |
| `support_ticket_status_history` | `support_tickets`, `people` | 0 | |
| `chat_rooms` | `tenants`, `people` | 0 | |
| `chat_participants` | `chat_rooms`, `people` | 0 | |
| `chat_messages` | `chat_rooms`, `people` | 0 | |
| `ai_conversations` | `tenants`, `chat_rooms` | 0 | |
| `ai_messages` | `ai_conversations` | 0 | |
| `ai_usage` | `ai_conversations` | 0 | |
| `chat_assignments` | `chat_rooms`, `people` | 0 | |
| `chat_handoffs` | `chat_rooms`, `people` | 0 | |
| `chat_events` | `chat_rooms` | 0 | |
| `document_versions` | `files` | 0 | |
| `document_links` | `files` | 0 | |
| `security_events` | `tenants`, `people` | 0 | |
| `privacy_requests` | `tenants`, `people` | 0 | |
| `data_export_requests` | `tenants`, `people` | 0 | |
| `data_deletion_requests` | `tenants`, `people` | 0 | |
| `data_retention_policies` | `tenants` | seed | |

### 3.5 Tabelas REMOVER

| AS-IS | Motivo |
|-------|--------|
| `profiles` (schema.sql) | Legado. Identity é `people`. Não recriar. |
| `leads` | Não existe na V2.1. CRM usa `companies` + `interactions`. |
| `contact_requests` | Não existe na V2.1. |
| `webhooks` | Substituído por `domain_events` + n8n. |
| `automation_queue` | Substituído por `domain_events` + n8n. |
| `whatsapp_messages` | Logging deve ir para tabela de integração, não core. |
| `emails` | Logging deve ir para tabela de integração, não core. |
| `services` | Não existe na V2.1. Conteúdo deve ser `products` ou CMS. |
| `tickets` | Substituído por `support_tickets`. |
| `company_contacts` (reavaliar) | Manter se CRM precisar. Senão, REMOVER. |
| `company_relationships` (reavaliar) | Manter se CRM precisar. Senão, REMOVER. |

---

## 4. Ordem de Migração

```text
PHASE 1 — PRESERVE (sem transformação)
├── tenants
├── people
├── tenant_memberships
├── roles
├── permissions
├── role_permissions
├── role_assignments
├── role_resource_permissions
├── company_types
├── company_relationship_types
├── skills
├── candidate_skills
├── job_skills
├── files
├── file_access_logs
├── domain_events
├── talent_pool_memberships
├── candidate_preferences
├── candidate_profile_views
├── job_matches
├── notifications (se vazio)
├── notification_deliveries
├── notification_preferences
├── application_status_history
├── application_profile_snapshots
└── candidates, jobs, applications (se vazios)

PHASE 2 — TRANSFORM
├── companies (adicionar tenant_id)
├── jobs (company_relationship_id → company_id)
├── notifications (user_id → recipient_person_id)

PHASE 3 — RECONCILE
└── domain_events (ajustar campos para V2.1)

PHASE 4 — NEW (criar após transformação)
├── tenant_settings
├── interactions
├── stage_templates
├── recruitment_stages
├── candidate_processes
├── interview_participants
├── interview_feedback
├── employees
├── employee_contracts
├── employee_documents
├── employee_status_history
├── departments
├── positions
├── employee_positions
├── administrative_requests
├── administrative_tasks
├── administrative_approvals
├── administrative_documents
├── financial_accounts
├── financial_categories
├── cost_centers
├── accounts_receivable
├── accounts_payable
├── financial_transactions
├── invoices
├── invoice_items
├── payments
├── expenses
├── revenues
├── fiscal_configurations
├── fiscal_integrations
├── fiscal_documents
├── fiscal_document_items
├── fiscal_document_events
├── fiscal_document_status_history
├── fiscal_api_requests
├── fiscal_api_responses
├── products
├── product_categories
├── warehouses
├── warehouse_locations
├── stock_balances
├── stock_movements
├── stock_entries
├── stock_exits
├── stock_inventory
├── stock_inventory_items
├── stock_adjustments
├── suppliers
├── purchase_orders
├── purchase_order_items
├── tasks
├── task_comments
├── task_attachments
├── task_status_history
├── support_ticket_categories
├── support_tickets
├── support_ticket_messages
├── support_ticket_assignments
├── support_ticket_status_history
├── chat_rooms
├── chat_participants
├── chat_messages
├── ai_conversations
├── ai_messages
├── ai_usage
├── chat_assignments
├── chat_handoffs
├── chat_events
├── document_versions
├── document_links
├── security_events
├── privacy_requests
├── data_export_requests
├── data_deletion_requests
└── data_retention_policies

PHASE 5 — SEED
├── company_types
├── company_relationship_types
├── skills
├── roles
├── permissions
├── role_resource_permissions
├── departments
├── positions
├── financial_accounts
├── financial_categories
├── cost_centers
├── products
├── product_categories
├── warehouses
├── support_ticket_categories
├── stage_templates
└── data_retention_policies

PHASE 6 — VALIDATE
├── INVARIANT-001 a INVARIANT-010
├── FK checks
├── tenant isolation checks
├── RBAC checks
├── Auth-400 checks
└── frontend contract checks
```

---

## 5. Transformações Detalhadas

### 5.1 `companies` — global → tenant-scoped

```sql
-- 1. Adicionar coluna
ALTER TABLE public.companies ADD COLUMN tenant_id UUID;

-- 2. Migrar dados para tenant J&S
UPDATE public.companies
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'js-empregos')
WHERE tenant_id IS NULL;

-- 3. Tornar NOT NULL
ALTER TABLE public.companies ALTER COLUMN tenant_id SET NOT NULL;

-- 4. Adicionar FK
ALTER TABLE public.companies
  ADD CONSTRAINT fk_companies_tenant
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 5. Índice
CREATE INDEX idx_companies_tenant ON public.companies(tenant_id);

-- 6. RLS ajustada
DROP POLICY IF EXISTS "Companies visible to authenticated" ON public.companies;
CREATE POLICY "Companies visible within tenant"
  ON public.companies FOR SELECT
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_memberships tm
      JOIN public.people p ON p.id = tm.person_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
```

### 5.2 `jobs` — relationship FK → company FK

```sql
-- 1. Adicionar coluna
ALTER TABLE public.jobs ADD COLUMN company_id UUID;

-- 2. Migrar dados via company_relationships
UPDATE public.jobs j
SET company_id = cr.company_id
FROM public.company_relationships cr
WHERE j.company_relationship_id = cr.id;

-- 3. Remover FK antiga (se existir)
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS fk_jobs_company_relationship;

-- 4. Adicionar FK nova
ALTER TABLE public.jobs
  ADD CONSTRAINT fk_jobs_company
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- 5. Índice
CREATE INDEX idx_jobs_company ON public.companies(company_id);

-- 6. company_relationships preservada (não deletar)
```

### 5.3 `notifications` — auth FK → people FK

```sql
-- 1. Adicionar coluna
ALTER TABLE public.notifications ADD COLUMN recipient_person_id UUID;

-- 2. Migrar dados via people
UPDATE public.notifications n
SET recipient_person_id = p.id
FROM public.people p
WHERE n.user_id = p.auth_user_id;

-- 3. Tornar NOT NULL
ALTER TABLE public.notifications ALTER COLUMN recipient_person_id SET NOT NULL;

-- 4. Remover coluna antiga
ALTER TABLE public.notifications DROP COLUMN user_id;

-- 5. Renomear
ALTER TABLE public.notifications RENAME COLUMN recipient_person_id TO user_id;

-- 6. FK
ALTER TABLE public.notifications
  ADD CONSTRAINT fk_notifications_user
  FOREIGN KEY (user_id) REFERENCES public.people(id) ON DELETE CASCADE;

-- 7. RLS ajustada
DROP POLICY IF EXISTS "Notifications visible to owner" ON public.notifications;
CREATE POLICY "Notifications visible to tenant members"
  ON public.notifications FOR SELECT
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_memberships tm
      JOIN public.people p ON p.id = tm.person_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
```

### 5.4 `domain_events` — reconcile

```sql
-- Preservar estrutura rica atual
-- Ajustar apenas se V2.1 definir campos diferentes
-- Nenhuma ação destrutiva sem validação explícita
```

---

## 6. Script de Migração

Arquivo: `scripts/migrate-v21-data.ts`

### Modos

| Modo | Comportamento |
|------|---------------|
| `--mode=analyze` | Calcula o que seria migrado. Não altera nada. |
| `--mode=dry-run` | Executa em transação controlada. Produz relatório. |
| `--mode=apply` | Aplica migração. Bloqueado até autorização. |

### Flags

| Flag | Descrição |
|------|-----------|
| `--source-url` | URL do banco AS-IS |
| `--source-key` | Service role key do AS-IS |
| `--target-url` | URL do banco V2.1 |
| `--target-key` | Service role key do V2.1 |
| `--tenant-slug` | Slug do tenant principal (default: `js-empregos`) |
| `--dry-run` | Alias para `--mode=dry-run` |
| `--apply` | Alias para `--mode=apply` |

### Saída do `--mode=analyze`

```text
=== ANALYSIS ===
Source: Supabase js-empregos (AS-IS)
Target: V2.1 (hypothetical)

PRESERVE (23 entities)
  - tenants: 1 row
  - people: 1 row
  - tenant_memberships: 1 row
  - roles: 10 rows
  - permissions: 26 rows
  - role_assignments: 1 row
  - role_resource_permissions: 114 rows
  - company_types: 6 rows
  - company_relationship_types: 3 rows
  - skills: 68 rows
  ...

TRANSFORM (3 entities)
  - companies: 0 rows → add tenant_id
  - jobs: 0 rows → company_relationship_id → company_id
  - notifications: 0 rows → user_id → recipient_person_id

RECONCILE (1 entity)
  - domain_events: 0 rows → adjust aggregate fields

NEW (70 entities)
  - tenant_settings
  - interactions
  - ...

REMOVE (9 entities)
  - leads
  - contact_requests
  - webhooks
  - automation_queue
  - whatsapp_messages
  - emails
  - services
  - tickets
  - profiles (legacy)

INVARIANTS
  - INVARIANT-001: OK
  - INVARIANT-002: OK
  - INVARIANT-003: OK
  ...

=== END ANALYSIS ===
```

### Saída do `--mode=dry-run`

```text
=== DRY-RUN ===
Transaction: STARTED

PHASE 1 — PRESERVE
  [OK] tenants: 1 row preserved
  [OK] people: 1 row preserved
  ...

PHASE 2 — TRANSFORM
  [OK] companies: 0 rows transformed (tenant_id = js-empregos)
  [OK] jobs: 0 rows transformed (company_relationship_id → company_id)
  [OK] notifications: 0 rows transformed (user_id → recipient_person_id)

PHASE 3 — RECONCILE
  [OK] domain_events: 0 rows reconciled

PHASE 4 — NEW
  [OK] 70 tables created

PHASE 5 — SEED
  [OK] canonical data inserted

PHASE 6 — VALIDATE
  [OK] INVARIANT-001: COUNT(people) = 1
  [OK] INVARIANT-002: COUNT(tenant_memberships) = 1
  [OK] INVARIANT-003: admin_master is global
  [OK] INVARIANT-004: 0 orphan FKs
  [OK] INVARIANT-005: 0 tenant violations
  [OK] INVARIANT-006: notifications.user_id references people
  [OK] INVARIANT-007: jobs.company_id valid
  [OK] INVARIANT-008: 0 legacy roles
  [OK] INVARIANT-009: 0 duplicate auth_user_id
  [OK] INVARIANT-010: 0 invalid tenant_id

Transaction: ROLLED BACK (dry-run)

=== END DRY-RUN ===
```

### Saída do `--mode=apply`

```text
=== APPLY ===
Transaction: STARTED

[PHASE 1-6 executed]

Transaction: COMMITTED

=== END APPLY ===
```

**Nota:** `--mode=apply` está bloqueado até autorização explícita.

---

## 7. Validação Frontend/Backend

Antes do dry-run, mapear:

| Frontend Component | Tabela(s) | Campos | Status |
|-------------------|-----------|--------|--------|
| AuthContext | people, auth.users | auth_user_id | ✅ |
| Login | people | email | ✅ |
| Dashboard | tenant_memberships, roles | membership_role | ✅ |
| RH | candidates, jobs, applications | tenant_id | ✅ |
| Vagas | jobs, job_skills | tenant_id | ✅ |
| Candidatos | candidates, candidate_skills | tenant_id | ✅ |
| Empresas | companies, company_relationships | tenant_id | ✅ |
| Financeiro | invoices, financial_transactions | tenant_id | ✅ |
| Fiscal | fiscal_documents | tenant_id | ✅ |
| Estoque | products, stock_movements | tenant_id | ✅ |
| Chat | chat_rooms, chat_messages | tenant_id | ✅ |
| Notificações | notifications | recipient_person_id | ✅ |
| Admin | roles, role_assignments | person_id | ✅ |

---

## 8. Rollback Strategy

```text
FALHA EM PHASE 1
└── ROLLBACK total (nada alterado)

FALHA EM PHASE 2
└── ROLLBACK das transformações
└── PRESERVE dados originais

FALHA EM PHASE 3
└── ROLLBACK da reconcile
└── PRESERVE domain_events original

FALHA EM PHASE 4
└── ROLLBACK das novas tabelas
└── PRESERVE estrutura existente

FALHA EM PHASE 5
└── ROLLBACK do seed
└── PRESERVE estrutura

FALHA EM PHASE 6
└── ROLLBACK total
└── PRODUÇÃO INTACTA
```

---

## 9. Próximos Passos

1. Validar `DATABASE-ASIS-TO-V21-MAPPING.md` contra frontend/backend
2. Escrever `scripts/migrate-v21-data.ts` em modo `--mode=analyze`
3. Executar `--mode=analyze` e revisar resultados
4. Preparar ambiente descartável
5. Executar `--mode=dry-run`
6. Executar validation suite
7. Produzir evidências
8. Solicitar autorização para `--mode=apply`

---

**Checkpoint:**

```text
PRODUÇÃO
🔒 INTOCADA

MIGRATION CONTRACT
✅ DEFINIDO

MIGRATOR SCRIPT
⏳ AGUARDANDO

DRY-RUN
⏳ AGUARDANDO

DROP
❌ BLOQUEADO
```
