# V2.1 — Re-Auditoria Pós-Fase 1: Relatório Final de Gates

**Branch:** `feat/database-v21-local-rebuild`
**Commit:** `fb75dff` (HEAD)
**Data:** 2026-08-21
**Escopo:** `supabase/specs/sql/00-44` (incl. `06b_products.sql`)

Relatórios de detalhe:

- `docs/V21-POST-FIX-SCHEMA-AUDIT.md`
- `docs/V21-POST-FIX-RLS-SECURITY-AUDIT.md`
- `docs/V21-POST-FIX-BUSINESS-FLOW-AUDIT.md`
- `docs/V21-POST-FIX-FRONTEND-CONTRACT-AUDIT.md`
- `docs/V21-POST-FIX-SNAPSHOT-CONSISTENCY.md`

---

## 1. Tabela Única de Gates

| Gate                              | Resultado | Severidade Máxima |
| --------------------------------- | --------- | ----------------- |
| 01 — Schema                       | FAIL      | BLOCKING          |
| 02 — RLS / Security               | FAIL      | BLOCKING          |
| 03 — Business Flow                | WARNING   | BLOCKING          |
| 04 — Frontend ↔ Database Contract | WARNING   | NON-BLOCKING      |
| 05 — Snapshot Consistency         | PASS      | —                 |
| **READY FOR SUPABASE**            | **NO**    | —                 |
| **READY FOR RUNTIME**             | **NO**    | —                 |

---

## 2. Detalhamento dos Gates

### 2.1 Gate 01 — Schema: FAIL (BLOCKING)

**Problemas bloqueantes:**

| #   | Problema                                                                                                                                                     | Arquivo(s)   | Motivo do bloqueio        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ------------------------- |
| 1   | `service_order_status_history` referencia `service_orders` antes de sua criação                                                                              | `05` → `34`  | FK falha na migration     |
| 2   | `support_ticket_status_history` referencia `support_tickets` antes de sua criação                                                                            | `15` → `40`  | FK falha na migration     |
| 3   | `purchase_order_items` referencia `products` antes de sua criação                                                                                            | `06` → `06b` | FK falha na migration     |
| 4   | `22_rls.sql` habilita RLS em 40+ tabelas que ainda não existem                                                                                               | `22`         | Migration falha           |
| 5   | `22_rls.sql` contém policies duplicadas para 16 tabelas                                                                                                      | `22`         | `policy already exists`   |
| 6   | Segundo lote de policies em `22_rls.sql` referencia colunas inexistentes (`tenant_id` em `applications`, `interviews`; `ai_conversation_id` em `chat_rooms`) | `22`         | `column does not exist`   |
| 7   | `21_functions_triggers.sql` cria trigger em `support_tickets` (inexistente em 21)                                                                            | `21`         | `relation does not exist` |
| 8   | `23_indexes.sql` cria índices em tabelas que ainda não existem                                                                                               | `23`         | `relation does not exist` |

**Problemas não-bloqueantes:**

| #   | Problema                                                                                                                 | Arquivo          | Classificação |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------- |
| 1   | Falta CHECK constraints em `service_orders.status`, `support_tickets.status`, `support_tickets.priority`, `tasks.status` | `34`, `40`, `14` | NON-BLOCKING  |
| 2   | `accounts_receivable.invoice_id` sem FK explícita                                                                        | `27`             | NON-BLOCKING  |
| 3   | `company_contacts.email` sem UNIQUE                                                                                      | `03`             | NON-BLOCKING  |

---

### 2.2 Gate 02 — RLS / Security: FAIL (BLOCKING)

**Problemas bloqueantes:**

| #   | Problema                                                           | Severidade | Detalhe                                                                                                                              |
| --- | ------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 6 tabelas financeiras sem RLS                                      | CRÍTICO    | `financial_categories`, `cost_centers`, `accounts_receivable`, `accounts_payable`, `payments`, `receipts` — dados sensíveis expostos |
| 2   | `financial_reversal()` sem validação de tenant/permissão/ownership | CRÍTICO    | Qualquer usuário autenticado pode reverter transações de qualquer tenant                                                             |
| 3   | `match_candidates_to_demand()` completamente desautenticada        | CRÍTICO    | Vazamento de dados de candidatos entre tenants                                                                                       |
| 4   | Policies duplicadas em `22_rls.sql` quebram a migration            | CRÍTICO    | `policy already exists` / `column does not exist`                                                                                    |

**Classificação DELETE por categoria:**

| Classificação      | Significado                                                       | Tabelas Afetadas                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DELETE_NOT_ALLOWED | DELETE bloqueado pelo RLS (sem política)                          | 160+ tabelas tenant-scoped                                                                                                                                                                             |
| IMMUTABLE          | Tabelas de auditoria/histórico que não devem ser deletadas        | `audit_logs`, `security_events`, `application_status_history`, `contract_status_history`, `fiscal_document_status_history`, `support_ticket_status_history`, `task_status_history`, `event_deliveries` |
| SOFT_DELETE        | Decisão pendente — verificar se app usa `status` para soft-delete | Todas as operacionais                                                                                                                                                                                  |
| DELETE_REQUIRED    | Tabelas onde hard-delete pode ser necessário                      | `notification_preferences`, `dashboard_layouts`, `tasks` (pendente decisão)                                                                                                                            |

**Problemas não-bloqueantes:**

| #   | Problema                                                                            | Classificação                                    |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | `user_has_permission()` e `user_permissions()` aceitam `p_auth_user_id` do chamador | NON-BLOCKING                                     |
| 2   | Ausência de policies DELETE explícitas                                              | NON-BLOCKING (soft-delete pode ser a estratégia) |

---

### 2.3 Gate 03 — Business Flow: WARNING (BLOCKING)

**Fluxos verificados:**

| Fluxo                          | Status  | Problema principal                                       |
| ------------------------------ | ------- | -------------------------------------------------------- |
| Compras → Estoque → Financeiro | PASS    | —                                                        |
| RH                             | PASS    | —                                                        |
| CRM → Venda → Financeiro       | WARNING | Falta `leads`, `customers`, `quotes`, `sales` comerciais |
| PDV                            | WARNING | Isolado de estoque, fiscal e financeiro                  |
| Fiscal                         | WARNING | Falta tabela de provedores externos                      |

**Problemas específicos:**

| #   | Problema                                                                                    | Fluxo            | Classificação |
| --- | ------------------------------------------------------------------------------------------- | ---------------- | ------------- |
| 1   | `accounts_receivable.service_order_id` tem FK quebrada na migração                          | CRM → Financeiro | BLOCKING      |
| 2   | Falta tabelas `leads`, `customers`, `quotes` para fluxo CRM/Venda                           | CRM → Venda      | BLOCKING      |
| 3   | `services` é órfã (nenhuma tabela referencia `services.id`)                                 | CRM              | NON-BLOCKING  |
| 4   | `pos_sales` não integra com `stock_movements`, `fiscal_documents`, `financial_transactions` | PDV              | NON-BLOCKING  |
| 5   | Falta tabela `external_providers` para fiscal                                               | Fiscal           | NON-BLOCKING  |
| 6   | `fiscal_emit_invoice()` apenas altera status de `invoices` sem criar `fiscal_document`      | Fiscal           | NON-BLOCKING  |

---

### 2.4 Gate 04 — Frontend ↔ Database Contract: WARNING (NON-BLOCKING)

**Problemas:**

| #   | Problema                                      | Módulo      | Classificação |
| --- | --------------------------------------------- | ----------- | ------------- |
| 1   | 6 tabelas financeiras sem RLS                 | /financeiro | BLOCKING      |
| 2   | `financial_reversal()` sem tenant check       | /financeiro | BLOCKING      |
| 3   | `match_candidates_to_demand()` desautenticada | /rh         | BLOCKING      |
| 4   | RPCs RBAC exigem `p_auth_user_id` manual      | Todos       | NON-BLOCKING  |
| 5   | Views sem `security_invoker`                  | /relatorios | NON-BLOCKING  |

**Módulos com contrato completo (PASS):**

- /auth, /admin, /clientes, /empresas, /fornecedores, /candidatos, /vagas, /funcionarios, /rh, /servicos, /orcamentos, /vendas, /pos, /compras, /estoque, /almoxarifado, /fiscal, /suporte, /chat, /relatorios

---

### 2.5 Gate 05 — Snapshot Consistency: PASS

| Item                                                 | Status     |
| ---------------------------------------------------- | ---------- |
| Todas as tabelas do snapshot existem no código atual | CONFIRMADO |
| Nenhuma tabela duplicada                             | CONFIRMADO |
| Gap Closure Matrix consistente com código            | CONFIRMADO |
| Final Matrix consistente com código                  | CONFIRMADO |

**Drift conhecido:**

- `service_orders` duplicada removida (snapshot ainda reflete duplicidade)
- `support_tickets` duplicada removida (snapshot ainda reflete duplicidade)
- RLS adicionada para 158 tabelas (snapshot ainda reporta 47 sem RLS)

**Ação:** O snapshot `e447443` deve ser preservado como histórico. Um novo snapshot deve ser gerado após correção dos bloqueios remanescentes.

---

## 3. Classificação Consolidada de Problemas

### BLOCKING (impede deploy)

| #   | Problema                                             | Gate          |
| --- | ---------------------------------------------------- | ------------- |
| 1   | Migration order quebrada (FKs para tabelas futuras)  | Schema        |
| 2   | RLS em tabelas inexistentes + policies duplicadas    | Schema        |
| 3   | Triggers em tabelas inexistentes                     | Schema        |
| 4   | Índices em tabelas inexistentes                      | Schema        |
| 5   | Policies com colunas inexistentes (quebra migration) | Schema        |
| 6   | 6 tabelas financeiras sem RLS                        | RLS/Security  |
| 7   | `financial_reversal()` sem tenant/permission check   | RLS/Security  |
| 8   | `match_candidates_to_demand()` desautenticada        | RLS/Security  |
| 9   | FKs quebradas por ordem de migração                  | Business Flow |
| 10  | Falta tabelas CRM (leads, customers, quotes)         | Business Flow |

### NON-BLOCKING (não impede deploy, mas requer atenção)

| #   | Problema                                       | Gate              |
| --- | ---------------------------------------------- | ----------------- |
| 1   | Ausência de policies DELETE                    | RLS/Security      |
| 2   | RBAC RPCs com `p_auth_user_id` caller-supplied | RLS/Security      |
| 3   | Falta CHECK constraints em enums               | Schema            |
| 4   | `accounts_receivable.invoice_id` sem FK        | Schema            |
| 5   | PDV isolado de estoque/fiscal/financeiro       | Business Flow     |
| 6   | Falta tabela `external_providers` para fiscal  | Business Flow     |
| 7   | `services` órfã                                | Business Flow     |
| 8   | Views sem `security_invoker`                   | Frontend Contract |
| 9   | Ausência de RPCs RBAC ergonômicas              | Frontend Contract |

### POST-DEPLOY (após deploy inicial)

| #   | Problema                                                                                 | Gate              |
| --- | ---------------------------------------------------------------------------------------- | ----------------- |
| 1   | Integrar `pos_sales` com `stock_movements`, `fiscal_documents`, `financial_transactions` | Business Flow     |
| 2   | Separar `fiscal_emit_invoice` de `invoices` (criar função específica para fiscal)        | Business Flow     |
| 3   | Adicionar `current_user_permissions`, `current_user_roles`, `current_user_tenants`       | Frontend Contract |
| 4   | Gerar novo snapshot canônico pós-fixes                                                   | Documentação      |

---

## 4. Ações Corretivas Prioritárias

### Fase 1A — Bloqueios de Migration (Schema)

1. **Reordenar `06b_products.sql`** para `06_products.sql` (ou inserir conteúdo antes de `06_suppliers_purchasing.sql`)
2. **Mover `service_order_status_history`** de `05_services_contracts.sql` para `34_crm_services.sql`
3. **Mover `support_ticket_status_history`** de `15_support.sql` para `40_tasks_support.sql`
4. **Mover `trg_set_updated_at_support_tickets`** de `21_functions_triggers.sql` para `40_tasks_support.sql`
5. **Reestruturar `22_rls.sql`**:
   - Remover seção duplicada (linhas ~1483–1771 e ~1990+)
   - Habilitar RLS apenas para tabelas criadas antes de 22
   - Mover RLS de tabelas criadas em 27–44 para `45_rls_remaining.sql`
6. **Mover `23_indexes.sql`** para executar após criação de todas as tabelas (sugestão: `45_indexes.sql`)

### Fase 1B — Segurança (RLS/RPCs)

7. **Adicionar RLS nas 6 tabelas financeiras faltantes**
8. **Adicionar validação de tenant + permissão em `financial_reversal()`**
9. **Adicionar validação de auth + tenant + permissão em `match_candidates_to_demand()`**
10. **Decidir estratégia de DELETE** (soft vs hard) e implementar policies correspondentes

### Fase 2 — Pós-Deploy

11. Integrar PDV com estoque/fiscal/financeiro
12. Criar tabelas CRM faltantes ou documentar que `companies` + `service_orders` cumprem o papel
13. Adicionar RPCs RBAC ergonômicas (`current_user_*`)
14. Gerar novo snapshot canônico

---

## 5. Histórico de Revisão

| Data       | Autor | Ação                                              |
| ---------- | ----- | ------------------------------------------------- |
| 2026-08-21 | Kilo  | Re-auditoria completa pós-Fase 1 — HEAD `fb75dff` |
| 2026-08-21 | Kilo  | Phase 1 blocker fixes — HEAD `8e26594`            |
| 2026-08-21 | Kilo  | Canonical snapshot — commit `e447443`             |

---

_Relatório gerado por Kilo. Não foram executadas queries contra banco de dados vivo._
