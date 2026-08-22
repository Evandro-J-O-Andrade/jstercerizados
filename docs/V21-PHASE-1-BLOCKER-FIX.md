# V2.1 — Phase 1 Blocker Fix

**Checkpoint:** `8f9e476`  
**Branch:** `feat/database-v21-local-rebuild`  
**Data:** 2026-08-21  
**Modo:** IMPLEMENTAÇÃO — correções controladas

---

## Objetivo

Corrigir os 6 bloqueadores que impedem a promoção para Supabase/runtime, **sem reconstruir o banco do zero** e **sem criar novas tabelas/funcionalidades**.

---

## Escopo Fechado

### 1. Resolver `service_orders` (duplicidade 05 vs 34)

**Arquivos envolvidos:**

- `05_services_contracts.sql`
- `34_crm_services.sql`

**Ação:**

1. Comparar as duas definições
2. Definir qual é a canônica V2.1
3. Consolidar colunas/relações necessárias
4. Remover duplicidade
5. Documentar decisão

**Critérios de decisão:**

- Manter `company_service_id` (34) ao invés de `service_id` + `company_id` separados
- Manter `status`, `scheduled_at`, `completed_at` (34)
- Adicionar `company_id` se necessário para queries
- Garantir FK para `company_services`

---

### 2. Resolver `support_tickets` (duplicidade 15 vs 40)

**Arquivos envolvidos:**

- `15_support.sql`
- `40_tasks_support.sql`

**Ação:**

1. Comparar as duas definições
2. Definir qual é a canônica V2.1
3. Consolidar colunas/relações necessárias
4. Remover duplicidade
5. Garantir que `support_ticket_messages`, `support_ticket_assignments`, `support_ticket_status_history` apontam para a entidade única

**Critérios de decisão:**

- Manter definição de `40_tasks_support.sql` (mais completa)
- Garantir FK para `support_ticket_categories`
- Manter `title`, `description`, `status`

---

### 3. Corrigir ordem das migrations

**Problema:**

- `06_suppliers_purchasing.sql` referencia `products(id)`
- `products` é definido em `07_inventory_custody.sql`

**Ação:**

1. Mover `products` para arquivo anterior ou criar `07_products.sql`
2. Atualizar `docs/V21-SQL-IMPLEMENTATION-ORDER.md`
3. Garantir que todas as FKs respeitem ordem topológica

---

### 4. Implementar RLS nas 47 tabelas faltantes

**Tabelas prioritárias:**

- `financial_transactions`
- `fiscal_documents`
- `pos_sales`
- `accounts_receivable`
- `accounts_payable`
- `payments`
- `receipts`
- `fiscal_document_items`
- `fiscal_document_status_history`
- `fiscal_api_requests`
- `fiscal_api_responses`
- `fiscal_document_events`
- `pos_terminals`
- `pos_cashiers`
- `pos_cashier_sessions`
- `pos_sale_items`
- `pos_payments`
- `pos_cancellations`
- `pos_returns`
- `pos_cash_movements`
- `pos_daily_closures`
- `skills`
- `candidate_documents`
- `candidate_experiences`
- `candidate_education`
- `candidate_courses`
- `candidate_languages`
- `candidate_skills`
- `job_skills`
- `stage_templates`
- `recruitment_processes`
- `recruitment_stages`
- `candidate_processes`
- `application_profile_snapshots`
- `interview_participants`
- `interview_feedback`
- `webhook_deliveries`
- `automation_jobs`
- `automation_executions`

**Ação para cada tabela:**

1. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
2. Criar policy SELECT usando `is_tenant_member(tenant_id)` ou subquery para FK indireto
3. Criar policy INSERT com `WITH CHECK`
4. Criar policy UPDATE quando aplicável
5. Documentar no snapshot

---

### 5. Proteger RPCs fiscais

**Arquivo:** `39_fiscal.sql`

**Ação:**

1. `fiscal_emit_invoice()`:
   - Validar que `auth.uid()` é membro do tenant da invoice
   - Validar permissão `invoices.update` ou `fiscal.emit`
   - Validar ownership da invoice
2. `fiscal_cancel_invoice()`:
   - Mesmas validações
   - Adicionar log de auditoria

---

### 6. Corrigir isolamento das views

**Arquivos:**

- `27_finance.sql` (`financial_kpis`)
- `35_recruitment_talent_pool.sql` (`recruitment_kpis`)

**Ação:**

1. Recriar views com `WITH (security_invoker = true)` se suportado
2. OU adicionar filtro `tenant_id in (select user_tenant_ids())`
3. Garantir que tenant A não vê dados de tenant B

---

## Ordem de Execução

1. `service_orders` duplicidade
2. `support_tickets` duplicidade
3. Ordem das migrations
4. RLS nas 47 tabelas
5. RPCs fiscais
6. Views cross-tenant
7. Re-auditoria

---

## Regras

- ❌ NÃO criar novas tabelas
- ❌ NÃO criar novas funcionalidades
- ❌ NÃO fazer deploy
- ❌ NÃO integrar frontend
- ✅ Apenas corrigir bloqueadores
- ✅ Documentar cada decisão
- ✅ Commits pequenos e focados
- ✅ Re-auditar após cada fase

---

## Critérios de Saída

- [ ] `service_orders` consolidada
- [ ] `support_tickets` consolidada
- [ ] Ordem de migrations documentada e executável
- [ ] 0 tabelas sem RLS
- [ ] RPCs fiscais com checagem de segurança
- [ ] Views com isolamento garantido
- [ ] Re-auditoria passando em todos os gates
- [ ] `READY FOR SUPABASE = YES`
