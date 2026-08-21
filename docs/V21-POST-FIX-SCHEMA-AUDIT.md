# V2.1 Schema Audit — Post-Fix Report

**Branch:** `feat/database-v21-local-rebuild`  
**Commit:** `8e26594` (HEAD)  
**Date:** 2026-08-21  
**Auditor:** Kilo  
**Scope:** `supabase/specs/sql/00` a `44` (incl. `06b_products.sql`)

---

## Resumo Executivo

| Categoria                                                    | Status                     |
| ------------------------------------------------------------ | -------------------------- |
| Duplicidade de tabelas (`service_orders`, `support_tickets`) | **PASS**                   |
| Ordem de execução das migrations                             | **FAIL**                   |
| FKs respeitando ordem de criação                             | **FAIL**                   |
| Tabelas sem PK / FK / UNIQUE / CHECK / NOT NULL              | **WARNING**                |
| Índices críticos ausentes                                    | **PASS** (cobertura ampla) |
| Functions apontando para tabelas antigas                     | **PASS**                   |
| RLS duplicado / em tabelas inexistentes                      | **FAIL**                   |
| Triggers em tabelas inexistentes                             | **FAIL**                   |

**Veredito Final:** **FAIL** — O schema apresenta bloqueios estruturais que impedem execução limpa das migrations na ordem atual.

---

## 1. Duplicidade de Tabelas

**Status:** PASS

- `public.service_orders` — definida **uma única vez** em `34_crm_services.sql:15`
- `public.support_tickets` — definida **uma única vez** em `40_tasks_support.sql:45`

Nenhuma tabela duplicada foi identificada no escopo analisado.

---

## 2. Ordem de Execução das Migrations

**Status:** FAIL

A ordem lexicográfica dos arquivos é:

```
00 → 01 → 02 → 03 → 04 → 05 → 06 → 06b → 07 → 09 → 10 → 11 → 12 → 14 → 15 → 18 → 20 → 21 → 22 → 23 → 25 → 26 → 27 → 28 → 29 → 30 → 31 → 32 → 33 → 34 → 35 → 36 → 37 → 39 → 40 → 41 → 42 → 43 → 44
```

### 2.1. Problemas de FK na ordem atual

| Arquivo causador              | Tabela criada                   | FK referencia                | Arquivo alvo           | Tabela alvo       | Problema                          |
| ----------------------------- | ------------------------------- | ---------------------------- | ---------------------- | ----------------- | --------------------------------- |
| `06_suppliers_purchasing.sql` | `purchase_order_items`          | `public.products(id)`        | `06b_products.sql`     | `products`        | **06 < 06b**: FK falha na criação |
| `05_services_contracts.sql`   | `service_order_status_history`  | `public.service_orders(id)`  | `34_crm_services.sql`  | `service_orders`  | **05 < 34**: FK falha na criação  |
| `15_support.sql`              | `support_ticket_status_history` | `public.support_tickets(id)` | `40_tasks_support.sql` | `support_tickets` | **15 < 40**: FK falha na criação  |

### 2.2. Problemas de dependência indireta

`07_inventory_custody.sql` referencia `public.products(id)` — funciona porque `06b_products.sql` (06b) < `07`.

`12_custody.sql` referencia `public.products(id)` — funciona (06b < 12).

`29_pos.sql` referencia `public.products(id)` — funciona (06b < 29).

`30_recruitment.sql` referencia `public.candidates(id)` — funciona (04 < 30).

`37_purchasing.sql` referencia `public.products(id)` — funciona (06b < 37).

---

## 3. Integridade de Constraints

**Status:** WARNING

### 3.1. Todas as tabelas possuem PK

Todas as 96 tabelas analisadas possuem `id uuid primary key`. Nenhuma tabela órfã sem PK foi encontrada.

### 3.2. FKs ausentes ou questionáveis

| Tabela              | Coluna                            | Observação                                   |
| ------------------- | --------------------------------- | -------------------------------------------- |
| `stock_movements`   | `reference_id`                    | Sem FK explícita (polimórfico intencional)   |
| `stock_entries`     | `reference_id` / `reference_type` | Sem FK explícita (polimórfico intencional)   |
| `chat_participants` | `person_id`                       | FK opcional — OK para participantes externos |
| `company_contacts`  | `email`                           | Sem UNIQUE — risco de duplicidade de contato |

### 3.3. CHECK constraints ausentes

| Tabela            | Coluna                | Sugestão                                                |
| ----------------- | --------------------- | ------------------------------------------------------- |
| `service_orders`  | `status`              | `check (status in (...))`                               |
| `support_tickets` | `status` / `priority` | `check (status in (...))` / `check (priority in (...))` |
| `tasks`           | `status`              | `check (status in (...))`                               |
| `contracts`       | `status`              | Já possui CHECK — OK                                    |
| `purchase_orders` | `status`              | Já possui CHECK — OK                                    |

### 3.4. UNIQUE constraints ausentes

| Tabela             | Colunas                          | Risco                              |
| ------------------ | -------------------------------- | ---------------------------------- |
| `company_contacts` | `email`                          | Duplicidade de contato por empresa |
| `interviews`       | `(application_id, scheduled_at)` | Agendamento duplicado (baixo)      |

---

## 4. Índices Críticos

**Status:** PASS (com ressalva)

`23_indexes.sql` cobre de forma abrangente os caminhos quentes. Entretanto, há um **problema estrutural grave**: os índices em `23_indexes.sql` referenciam tabelas que ainda não existem no momento da execução (ver seção 2).

Índices identificados como **críticos e presentes**:

- `idx_people_auth_user_id`
- `idx_tenant_memberships_person_id`
- `idx_role_assignments_person_tenant`
- `idx_service_orders_tenant_id`
- `idx_support_tickets_tenant_id`
- `idx_stock_balances_tenant_product`
- `idx_event_outbox_status_available_at`
- `idx_domain_events_idempotency_key`

---

## 5. Functions Apontando para Tabelas Antigas

**Status:** PASS

Nenhuma function foi identificada referenciando tabelas renomeadas ou removidas. As functions em:

- `21_functions_triggers.sql` — referenciam tabelas existentes no momento de criação (01–21)
- `25_validation.sql` — referenciam tabelas existentes
- `27_finance.sql` — referenciam tabelas existentes
- `35_recruitment_talent_pool.sql` — referenciam tabelas existentes

---

## 6. Problemas Críticos em `22_rls.sql`

**Status:** FAIL

### 6.1. RLS habilitado em tabelas inexistentes

`22_rls.sql` executa `alter table public.<tabela> enable row level security` para **mais de 40 tabelas** que ainda não existem no momento da execução (22 < 27 a 44). Exemplos:

| Tabela                                               | Criada em              |
| ---------------------------------------------------- | ---------------------- |
| `service_orders`                                     | `34_crm_services.sql`  |
| `support_tickets`                                    | `40_tasks_support.sql` |
| `employees` / `departments` / `positions`            | `33_employees.sql`     |
| `pos_terminals` / `pos_cashiers` / ...               | `29_pos.sql`           |
| `skills` / `recruitment_processes` / ...             | `30_recruitment.sql`   |
| `warehouses` / `stock_lots` / ...                    | `36_inventory.sql`     |
| `financial_categories` / `accounts_receivable` / ... | `27_finance.sql`       |
| `fiscal_documents` / `tax_rates` / ...               | `28_fiscal.sql`        |
| `webhook_deliveries` / `automation_jobs` / ...       | `31_automation.sql`    |
| `task_comments` / `support_ticket_messages` / ...    | `40_tasks_support.sql` |
| `ai_usage` / `sessions` / `password_policies`        | `41_chat_security.sql` |
| `report_definitions` / `dashboard_widgets` / ...     | `44_reports_views.sql` |

### 6.2. Polices duplicadas

`22_rls.sql` contém **duas seções idênticas** de RLS para as seguintes tabelas, gerando duplicidade de `alter table ... enable row level security` e `create policy`:

| Tabela                       | Linhas duplicadas |
| ---------------------------- | ----------------- |
| `company_relationships`      | 217 / 1586+       |
| `company_contacts`           | 272 / 1586+       |
| `applications`               | 385 / 1586+       |
| `application_status_history` | 411 / 1586+       |
| `interviews`                 | 437 / 1586+       |
| `service_orders`             | 494 / 1587        |
| `support_tickets`            | 873 / 1997        |
| `chat_rooms`                 | 928 / 1586+       |
| `chat_participants`          | 955 / 1586+       |
| `chat_messages`              | 979 / 1586+       |
| `ai_messages`                | 1030 / 1586+      |
| `chat_handoffs`              | 1054 / 1586+      |
| `employee_positions`         | 1486 / 1586+      |
| `employee_contracts`         | 1487 / 1586+      |
| `employee_documents`         | 1488 / 1586+      |
| `employee_status_history`    | 1489 / 1586+      |

A segunda ocorrência de `alter table ... enable row level security` falhará com erro `row level security already enabled`. A segunda ocorrência de `create policy` falhará com erro `policy already exists`.

### 6.3. Seção SERVICES/CONTRACTS contém tabelas de SUPPORT

Linha 873: `alter table public.support_tickets enable row level security;` está inserida na seção `-- SERVICES / CONTRACTS` (entre `service_orders` e `service_order_status_history`). Isso é um **erro de copy-paste** — `support_tickets` pertence à seção TASKS/SUPPORT.

---

## 7. Triggers em Tabelas Inexistentes

**Status:** FAIL

`21_functions_triggers.sql` cria o trigger `trg_set_updated_at_support_tickets` (linha 591) na tabela `public.support_tickets`, que só é criada em `40_tasks_support.sql`. Como 21 < 40, a criação do trigger **falhará** na migration.

```sql
-- 21_functions_triggers.sql:591
create trigger trg_set_updated_at_support_tickets
  before update on public.support_tickets   -- tabela inexistente aqui
  for each row execute function public.set_updated_at();
```

---

## 8. Índices em Tabelas Inexistentes

**Status:** FAIL

`23_indexes.sql` cria índices para tabelas que ainda não existem no momento da execução. Exemplos:

| Índice                        | Tabela                  | Criada em |
| ----------------------------- | ----------------------- | --------- |
| `idx_service_orders_*`        | `service_orders`        | `34`      |
| `idx_support_tickets_*`       | `support_tickets`       | `40`      |
| `idx_pos_terminals_*`         | `pos_terminals`         | `29`      |
| `idx_pos_cashiers_*`          | `pos_cashiers`          | `29`      |
| `idx_pos_sales_*`             | `pos_sales`             | `29`      |
| `idx_skills_*`                | `skills`                | `30`      |
| `idx_recruitment_processes_*` | `recruitment_processes` | `30`      |
| `idx_warehouses_*`            | `warehouses`            | `36`      |
| `idx_financial_categories_*`  | `financial_categories`  | `27`      |
| `idx_accounts_receivable_*`   | `accounts_receivable`   | `27`      |
| `idx_fiscal_documents_*`      | `fiscal_documents`      | `28`      |
| `idx_webhook_deliveries_*`    | `webhook_deliveries`    | `31`      |

Todos esses `create index` falharão com `relation "<tabela>" does not exist`.

---

## 9. Checklist de Verificação

| #   | Verificação                                                             | Status                                                 |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | Nenhuma tabela duplicada (`service_orders`, `support_tickets`)          | PASS                                                   |
| 2   | FKs respeitam ordem de criação (products antes de purchase_order_items) | FAIL — 06 < 06b                                        |
| 3   | `service_order_status_history` referencia tabela existente              | FAIL — 05 < 34                                         |
| 4   | `support_ticket_status_history` referencia tabela existente             | FAIL — 15 < 40                                         |
| 5   | Todas as tabelas possuem PK                                             | PASS                                                   |
| 6   | Todas as FKs possuem NOT NULL onde obrigatório                          | PASS                                                   |
| 7   | CHECK constraints em colunas de status/enum                             | WARNING — parcial                                      |
| 8   | UNIQUE constraints em chaves naturais                                   | WARNING — `company_contacts.email`                     |
| 9   | Índices cobrem FKs e colunas de filtro                                  | PASS (cobertura)                                       |
| 10  | Índices executam após criação das tabelas                               | FAIL — 23 < 27..44                                     |
| 11  | Functions não referenciam tabelas antigas                               | PASS                                                   |
| 12  | Triggers não referenciam tabelas antigas                                | FAIL — 21 referencia suporte em 40                     |
| 13  | RLS habilitado após criação das tabelas                                 | FAIL — 22 < 27..44                                     |
| 14  | Sem RLS / policies duplicados                                           | FAIL — 16 tabelas duplicadas                           |
| 15  | Ordem lexicógica consistente                                            | WARNING — saltos (08, 13, 16, 17, 19, 24, 38 ausentes) |

---

## 10. Ações Corretivas Recomendadas

1. **Reordenar `06b_products.sql`** para `06_products.sql` (ou inserir antes de `06_suppliers_purchasing.sql`) para garantir que `products` exista antes de `purchase_order_items`.
2. **Mover `service_order_status_history`** de `05_services_contracts.sql` para `34_crm_services.sql` (ou criar `service_orders` antes de 05).
3. **Mover `support_ticket_status_history`** de `15_support.sql` para `40_tasks_support.sql` (ou criar `support_tickets` antes de 15).
4. **Mover `trg_set_updated_at_support_tickets`** de `21_functions_triggers.sql` para `40_tasks_support.sql` (ou arquivo posterior).
5. **Reestruturar `22_rls.sql`**:
   - Remover a seção duplicada (linhas ~1483–1771 e ~1990+)
   - Habilitar RLS apenas para tabelas criadas **antes** de 22
   - Mover RLS de tabelas criadas em 27–44 para um arquivo `45_rls_remaining.sql` (ou equivalente)
6. **Mover `23_indexes.sql`** para executar **após** a criação de todas as tabelas indexadas (sugestão: renomear para `45_indexes.sql`).
7. **Adicionar CHECK constraints** em `service_orders.status`, `support_tickets.status`, `support_tickets.priority`, `tasks.status`.
8. **Adicionar UNIQUE constraint** em `company_contacts.email` (ou definir como FK para `people`).

---

## 11. Veredito Final

**FAIL — Bloqueio total para migração limpa.**

Os arquivos `05_services_contracts.sql`, `06_suppliers_purchasing.sql`, `15_support.sql`, `21_functions_triggers.sql`, `22_rls.sql` e `23_indexes.sql` contêm referências a tabelas, triggers, policies e índices que não existem no momento de sua execução na ordem atual. A execução sequencial resultará em erros de `relation does not exist` e `policy already exists`.

**Recomendação:** Aplicar as ações corretivas da seção 10 antes de qualquer deploy em produção.
