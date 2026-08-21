# V2.1 — Phase 1A/1B: Schema & Security Repair

**Branch:** `feat/database-v21-local-rebuild`
**Base commit:** `c73c879`
**Data:** 2026-08-21
**Escopo:** `supabase/specs/sql/00-44`
**Objetivo:** Eliminar bloqueios estruturais e de segurança que impedem deploy limpo das migrations.

---

## Critérios de Aceitação

Nenhum critério pode falhar. Qualquer FAIL impede a promoção para Supabase.

### Schema

```text
0 FK para tabelas futuras
0 trigger órfão
0 index para tabela inexistente
0 policy para tabela inexistente
0 policy duplicada incompatível
0 tabela estrutural duplicada
0 tabela operacional tenant-scoped sem RLS
0 RPC crítica sem auth
0 RPC crítica sem tenant check
0 RPC crítica sem permission check
0 view com exposição cross-tenant
```

### Business Flow mínimo

```text
CRM → cliente/serviço → orçamento → venda → financeiro
Compras → fornecedor → pedido → recebimento → estoque → financeiro
RH → pessoa → candidato → candidatura → contratação → funcionário
```

---

## Fase 1A — Schema Repair

### 1. Dependency Graph / Ordem das migrations

**Regra:** nenhuma FK pode apontar para tabela ainda não criada na ordem de execução.

#### 1.1 Corrigir products antes de purchase_order_items

- **Atual:** `06_suppliers_purchasing.sql` referencia `products(id)` e `products` existe em `06b_products.sql`.
- **Alvo:** `products` deve existir antes de `06_suppliers_purchasing.sql`.
- **Ação:** criar `06_products.sql` com a definição atual de `products` e remover `06b_products.sql`.

#### 1.2 Corrigir service_orders antes de service_order_status_history

- **Atual:** `05_services_contracts.sql` referencia `service_orders(id)` e `service_orders` existe em `34_crm_services.sql`.
- **Alvo:** `service_orders` deve existir antes de `service_order_status_history`.
- **Ação:** mover `service_orders`, `service_order_items`, `service_acceptances`, `service_executions`, `service_attachments` para um arquivo anterior a `05_services_contracts.sql`, por exemplo `04b_service_orders.sql`.

#### 1.3 Corrigir support_tickets antes de support_ticket_status_history

- **Atual:** `15_support.sql` referencia `support_tickets(id)` e `support_tickets` existe em `40_tasks_support.sql`.
- **Alvo:** `support_tickets` deve existir antes de `support_ticket_status_history`.
- **Ação:** mover `support_tickets` e `support_ticket_categories` para um arquivo anterior a `15_support.sql`, por exemplo `14b_support_tickets.sql`.

---

### 2. RLS / Policies / Triggers / Indexes

**Regra:** `CREATE TABLE → CREATE INDEX → ENABLE RLS → CREATE POLICY → CREATE TRIGGER`.

#### 2.1 Reestruturar RLS

- **Atual:** `22_rls.sql` habilita RLS e cria policies para tabelas que ainda não existem (27–44) e possui segundo lote duplicado.
- **Alvo:** RLS apenas para tabelas existentes antes de 22. Tabelas 27–44 devem receber RLS em arquivo separado após sua criação.
- **Ação:**
  1. Remover de `22_rls.sql` todas as seções que referenciam tabelas criadas em 27–44.
  2. Remover o segundo lote duplicado.
  3. Criar `45_rls_remaining.sql` com RLS para tabelas 27–44.
  4. Garantir que cada tabela tenha exatamente um conjunto canônico de policies.

#### 2.2 Consolidar policies duplicadas

Para cada tabela com duplicidade:

- Comparar policy original A vs policy original B.
- Manter a versão mais completa.
- Remover a duplicata.
- Registrar no relatório a decisão.

#### 2.3 Mover trigger órfão

- **Atual:** `trg_set_updated_at_support_tickets` em `21_functions_triggers.sql` referencia `support_tickets` (criada em 40).
- **Ação:** mover trigger para `40_tasks_support.sql` (após criação da tabela).

#### 2.4 Reestruturar indexes

- **Atual:** `23_indexes.sql` cria índices para tabelas que ainda não existem.
- **Alvo:** índices devem ser criados após a tabela existir.
- **Ação:**
  1. Mover índices de tabelas 27–44 para `45_indexes.sql`.
  2. Garantir que `23_indexes.sql` contenha apenas índices para tabelas existentes em 23.

#### 2.5 Corrigir FK accounts_receivable.invoice_id

- **Atual:** `accounts_receivable` possui coluna `invoice_id` sem FK explícita.
- **Ação:** adicionar FK `accounts_receivable.invoice_id → invoices(id)` com `ON DELETE SET NULL`.

---

## Fase 1B — Security Repair

### 3. RLS nas tabelas financeiras

Adicionar RLS completo (SELECT, INSERT, UPDATE) para:

```text
financial_categories
cost_centers
accounts_receivable
accounts_payable
payments
receipts
```

Cada tabela deve ter:

- `tenant_id UUID NOT NULL`
- Policy `FOR SELECT`: `is_tenant_member(tenant_id)`
- Policy `FOR INSERT`: `is_tenant_member(tenant_id) WITH CHECK (is_tenant_member(tenant_id))`
- Policy `FOR UPDATE`: `is_tenant_member(tenant_id) WITH CHECK (is_tenant_member(tenant_id))`

---

### 4. Proteger `financial_reversal()`

**Arquivo:** `27_finance.sql`

**Requisitos:**

1. Validar `auth.uid()` pertence a um membro ativo do tenant da transação.
2. Validar permissão `financial_transactions.update` via `user_has_permission()`.
3. Validar ownership: transação existe e pertence ao tenant.
4. Garantir `SECURITY DEFINER` com `search_path = public, pg_temp`.
5. Registrar reversal em tabela de auditoria/eventos.

---

### 5. Proteger `match_candidates_to_demand()`

**Arquivo:** `35_recruitment_talent_pool.sql`

**Requisitos:**

1. Validar `auth.uid()` via `is_tenant_member()`.
2. Validar permissão `candidates.read` ou `recruitment.read`.
3. Validar que `p_demand_id` pertence ao tenant do usuário.
4. Retornar apenas candidatos do tenant do usuário.
5. Garantir `SECURITY DEFINER` com `search_path = public, pg_temp`.

---

## Execução

### Ordem das alterações

1. Fase 1A.1: criar `06_products.sql`, remover `06b_products.sql`.
2. Fase 1A.2: criar `04b_service_orders.sql`, ajustar `05_services_contracts.sql`.
3. Fase 1A.3: criar `14b_support_tickets.sql`, ajustar `15_support.sql`.
4. Fase 1A.2/3: ajustar `34_crm_services.sql` e `40_tasks_support.sql` para manter apenas dependências.
5. Fase 1A.2/3: atualizar `V21-SQL-IMPLEMENTATION-ORDER.md`.
6. Fase 1A.4: reestruturar `22_rls.sql`, criar `45_rls_remaining.sql`.
7. Fase 1A.5: consolidar policies duplicadas.
8. Fase 1A.6: mover trigger para `40_tasks_support.sql`.
9. Fase 1A.7: reestruturar `23_indexes.sql`, criar `45_indexes.sql`.
10. Fase 1A.8: adicionar FK `accounts_receivable.invoice_id`.
11. Fase 1B.1: adicionar RLS nas 6 tabelas financeiras em `45_rls_remaining.sql`.
12. Fase 1B.2: proteger `financial_reversal()`.
13. Fase 1B.3: proteger `match_candidates_to_demand()`.

### Restrições

- NÃO modificar regras de negócio existentes.
- NÃO adicionar novas tabelas ou colunas além das necessárias para os fixes.
- NÃO alterar `service_orders` ou `support_tickets` além da movimentação entre arquivos.
- NÃO executar migrations no Supabase.
- NÃO fazer deploy.
- NÃO atualizar snapshot canônico antes da re-auditoria.

---

## Critérios de saída

Ao final desta fase, estes arquivos devem existir/atualizados:

```text
06_products.sql
04b_service_orders.sql
14b_support_tickets.sql
05_services_contracts.sql
15_support.sql
34_crm_services.sql
40_tasks_support.sql
22_rls.sql
45_rls_remaining.sql
23_indexes.sql
45_indexes.sql
27_finance.sql
35_recruitment_talent_pool.sql
docs/V21-POST-FIX-SCHEMA-AUDIT.md
docs/V21-POST-FIX-RLS-SECURITY-AUDIT.md
docs/V21-POST-FIX-BUSINESS-FLOW-AUDIT.md
docs/V21-POST-FIX-FRONTEND-CONTRACT-AUDIT.md
docs/V21-RE-AUDIT-FINAL-GATES.md
```

---

## Próximo passo após aprovação

Re-auditoria completa:

```text
SCHEMA
RLS/SECURITY
BUSINESS FLOW
FRONTEND CONTRACT
SNAPSHOT CONSISTENCY
```

Se todos os gates passarem:

```text
NEW CANONICAL SNAPSHOT
SUPABASE DEPLOY
```

Se não passar, documentar motivo e ajustar.

---

_Este documento é a autoridade para a Fase 1A/1B. Qualquer desvio deve ser registrado como exceção._
