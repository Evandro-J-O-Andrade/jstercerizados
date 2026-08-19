# V21 — Inventory, Billing, Warehouse e POS Master Spec

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Status:** READ-ONLY — Draft para aprovação  
**Objetivo:** Levantar estado atual, gaps e modelo alvo para Estoque, Almoxarifado, Faturamento e PDV antes de reconstruir os objetos faltantes.  
**Restrição:** Nenhum arquivo SQL alterado, nenhuma migration executada, Supabase remoto intacto, frontend intacto.

---

## 1. Fontes consultadas

| Fonte                   | Caminho                                               |
| ----------------------- | ----------------------------------------------------- |
| Canônico atual          | `supabase/specs/sql/*.sql`                            |
| Backup canônico         | `.kilo/worktrees/joyous-quasar/v2.1-backup/sql/*.sql` |
| Build spec              | `docs/DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md`        |
| Mapeamento AS-IS → V2.1 | `docs/DATABASE-ASIS-TO-V21-MAPPING.md`                |
| Regras de negócio       | `docs/BUSINESS-RULES-V2.1.md`                         |
| Decisões arquiteturais  | `docs/V21-DATABASE-ARCHITECTURE-DECISIONS.md`         |
| Matriz final            | `docs/V21-DATABASE-FINAL-MATRIX.md`                   |
| Contrato de migração    | `docs/DATABASE-MIGRATION-CONTRACT-V2.1.md`            |
| Gap analysis            | `docs/V2.1-GAP-ANALYSIS.md`                           |
| Matriz de objetos       | `docs/V21-CANONICAL-OBJECT-MASTER-MATRIX.md`          |
| Plano de reconstrução   | `docs/V21-MISSING-OBJECTS-RECONSTRUCTION-PLAN.md`     |

---

## 2. Objetivo do domínio

### 2.1 Estoque / Inventory

Modelar o fluxo completo de **produtos, armazenagem, saldos, movimentações, entradas, saídas, inventários e ajustes**, com ledger imutável, saldo derivado, rastreabilidade e isolamento multi-tenant.

### 2.2 Almoxarifado / Warehouse

Modelar a **operação de almoxarifado**: requisições, aprovações, separação, entrega, devoluções e transferências, com centro de custo, setor requisitante e histórico auditável.

### 2.3 Faturamento / Billing

Modelar o **documento de faturamento** e sua integração com financeiro/fiscal, sem duplicar domínios. Inclui itens, valores, impostos, condições de pagamento, vencimentos, parcelas, status e conciliação.

### 2.4 PDV / Ponto de Venda

Modelar a **venda no balcão/caixa**, com controle de turno, operador, vendas, recebimentos, cancelamentos, devoluções, fechamento e reconciliação com estoque e financeiro.

---

## 3. Estado atual no canônico V2.1

### 3.1 Presente no canônico atual

| Arquivo                       | Objetos presentes                                                                 | Status              |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| `07_inventory_custody.sql`    | `products`, `stock_movements`, `third_party_custody`, `third_party_custody_items` | ⚠️ Simplificado     |
| `06_suppliers_purchasing.sql` | `suppliers`, `purchase_orders`, `purchase_order_items`                            | ✅ Corrigido        |
| `12_custody.sql`              | `third_party_custody`, `third_party_custody_items`                                | ⚠️ Duplicado com 07 |

### 3.2 Presente no backup, ausente no canônico atual

| Arquivo backup       | Objetos ausentes                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `11_inventory.sql`   | `product_categories`, `warehouses`, `warehouse_locations`, `stock_balances`, `stock_entries`, `stock_exits`, `stock_inventory`, `stock_inventory_items`, `stock_adjustments`           |
| `07_employees.sql`   | `employees`, `employee_contracts`, `employee_documents`, `employee_status_history`, `departments`, `positions`, `employee_positions`                                                   |
| `09_contracts.sql`   | `contract_items`, `contract_services`, `contract_documents`, `contract_versions`, `contract_obligations`, `contract_renewals`                                                          |
| `05_rh.sql`          | `skills`, `candidate_skills`, `candidate_documents`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`                                        |
| `06_recruitment.sql` | `stage_templates`, `job_skills`, `recruitment_processes`, `recruitment_stages`, `candidate_processes`, `application_profile_snapshots`, `interview_participants`, `interview_feedback` |
| `19_finance.sql`     | scaffold vazio                                                                                                                                                                         |
| `20_fiscal.sql`      | scaffold vazio                                                                                                                                                                         |
| `21_documents.sql`   | scaffold vazio                                                                                                                                                                         |
| `18_storage.sql`     | scaffold vazio                                                                                                                                                                         |

### 3.3 Objetos que podem pertencer a estes domínios mas estão em outros arquivos

| Objeto                    | Arquivo atual               | Observação                                                            |
| ------------------------- | --------------------------- | --------------------------------------------------------------------- |
| `contracts`               | `05_services_contracts.sql` | ⚠️ Versão simplificada; backup `09_contracts.sql` tem versão completa |
| `contract_status_history` | `05_services_contracts.sql` | ✅ Presente                                                           |
| `services`                | `05_services_contracts.sql` | ⚠️ Pode precisar de separação com `contracts`                         |
| `service_orders`          | `05_services_contracts.sql` | ⚠️ Pode precisar de separação                                         |

---

## 4. Gap analysis por domínio

### 4.1 Estoque / Inventory

| Objeto                  | Situação                             | Ação                                                 |
| ----------------------- | ------------------------------------ | ---------------------------------------------------- |
| `products`              | ✅ Presente, mas versão simplificada | RECONCILE — atualizar para versão completa do backup |
| `product_categories`    | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `warehouses`            | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `warehouse_locations`   | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `stock_balances`        | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `stock_movements`       | ✅ Presente, mas versão simplificada | RECONCILE — atualizar para versão completa do backup |
| `stock_entries`         | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `stock_exits`           | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `stock_inventory`       | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `stock_inventory_items` | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `stock_adjustments`     | ❌ Ausente                           | RESTORE_FROM_BACKUP                                  |
| `suppliers`             | ✅ Presente                          | —                                                    |
| `purchase_orders`       | ✅ Presente                          | —                                                    |
| `purchase_order_items`  | ✅ Presente                          | —                                                    |

### 4.2 Almoxarifado / Warehouse

| Objeto                     | Situação   | Ação                               |
| -------------------------- | ---------- | ---------------------------------- |
| `warehouse_requests`       | ❌ Ausente | DESIGN — verificar se deve existir |
| `warehouse_request_items`  | ❌ Ausente | DESIGN — verificar se deve existir |
| `warehouse_transfers`      | ❌ Ausente | DESIGN — verificar se deve existir |
| `warehouse_transfer_items` | ❌ Ausente | DESIGN — verificar se deve existir |

### 4.3 Faturamento / Billing

| Objeto                 | Situação                     | Ação                                    |
| ---------------------- | ---------------------------- | --------------------------------------- |
| `invoices`             | ❌ Ausente no canônico atual | VERIFY — existe no build spec e mapping |
| `invoice_items`        | ❌ Ausente                   | VERIFY                                  |
| `payments`             | ❌ Ausente no canônico atual | VERIFY                                  |
| `financial_accounts`   | ❌ Ausente                   | VERIFY                                  |
| `financial_categories` | ❌ Ausente                   | VERIFY                                  |
| `cost_centers`         | ❌ Ausente                   | VERIFY                                  |
| `accounts_receivable`  | ❌ Ausente                   | VERIFY                                  |
| `accounts_payable`     | ❌ Ausente                   | VERIFY                                  |
| `expenses`             | ❌ Ausente                   | VERIFY                                  |
| `revenues`             | ❌ Ausente                   | VERIFY                                  |

### 4.4 PDV / Ponto de Venda

| Objeto            | Situação   | Ação                                                     |
| ----------------- | ---------- | -------------------------------------------------------- |
| `sales`           | ❌ Ausente | VERIFY — não há referência no contrato/backup/build spec |
| `sale_items`      | ❌ Ausente | VERIFY                                                   |
| `cash_registers`  | ❌ Ausente | VERIFY                                                   |
| `cash_operations` | ❌ Ausente | VERIFY                                                   |
| `payments`        | ❌ Ausente | VERIFY                                                   |

---

## 5. Modelo alvo por domínio

### 5.1 Estoque / Inventory

```text
products
├── product_categories
├── warehouses
│   └── warehouse_locations
├── stock_balances
├── stock_movements (ledger, append-only)
├── stock_entries
├── stock_exits
├── stock_inventory
│   └── stock_inventory_items
├── stock_adjustments
├── suppliers (via companies)
├── purchase_orders
│   └── purchase_order_items
└── third_party_custody (Custody)
```

Regras:

- `stock_movements` é append-only.
- `stock_balances` é estado derivado, não histórico.
- `stock_entries`, `stock_exits`, `stock_adjustments` são tipos específicos de `stock_movements`.
- `warehouse_locations` é opcional mas recomendado para rastreabilidade.
- `product_categories` é hierárquico (`parent_category_id`).
- `products` deve ter `sku`, `min_stock`, `unit`, `category`.
- `stock_balances` deve ter `reserved_quantity`, `last_movement_at`.

### 5.2 Almoxarifado / Warehouse

```text
warehouse_requests
├── warehouse_request_items
└── warehouse_request_status_history

warehouse_transfers
├── warehouse_transfer_items
└── warehouse_transfer_status_history
```

Regras:

- Requisição requer aprovação antes de separação.
- Transferência entre locais/armazéns registra movimentação.
- Centro de custo / setor requisitante deve ser registrado.
- Status lifecycle: requested → approved → picking → delivered → returned/canceled.

### 5.3 Faturamento / Billing

```text
invoices
├── invoice_items
├── payments
└── invoice_status_history

accounts_receivable
accounts_payable
```

Regras:

- `invoices` está vinculado a `companies` (clientes) e pode referenciar `contracts`, `service_orders` ou `purchase_orders`.
- `invoice_items` define produtos/serviços, quantidades, preços, descontos, impostos.
- `payments` registra recibos/baixas com método, data, conciliação.
- `accounts_receivable` e `accounts_payable` são visões/ledgers de títulos.
- Vida útil: draft → issued → paid/overdue → canceled.

### 5.4 PDV / Ponto de Venda

```text
sales
├── sale_items
├── sale_payments
├── sale_cancellations
└── sale_status_history

cash_registers
├── cash_operations
└── cash_closings
```

Regras:

- Venda só é efetivada após confirmação de pagamento.
- Pagamento pode ser múltiplo (dinheiro, cartão, Pix, etc.).
- Cancelamento gera devolução automática de estoque.
- `cash_registers` controla abertura/fechamento de caixa por operador/turno.
- `cash_operations` registra suprimento/sangria.
- PDV não altera estoque diretamente; usa `stock_movements` através de evento/function.

---

## 6. Decisões arquiteturais pendentes

| #   | Decisão                                                                              | Opções               | Recomendação                                                                               |
| --- | ------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------ |
| 1   | PDV entra no V2.1?                                                                   | SIM / NÃO            | **VERIFY** — não há referência no backup/build spec atual; confirmar necessidade           |
| 2   | Almoxarifado é domínio separado ou parte de Inventory?                               | SEPARADO / INTEGRADO | **INTEGRADO** — `warehouse_requests` e `warehouse_transfers` como subtabelas de Inventory  |
| 3   | `contracts` fica em Services/Contracts ou separa?                                    | MANTIDO / SEPARADO   | **MANTIDO** em `05_services_contracts.sql`, mas reconciliado com backup `09_contracts.sql` |
| 4   | `services` e `service_orders` pertencem a Services ou a Contracts?                   | SERVICES / CONTRACTS | **SERVICES** — manter em `05_services_contracts.sql`                                       |
| 5   | Financeiro/Faturamento usa tabelas existentes ou novas?                              | NOVAS / EXISTENTES   | **NOVAS** — `invoices`, `payments`, `financial_accounts`, etc. são NEW no mapping          |
| 6   | Fiscal deve ser criado antes ou depois de Financeiro?                                | DEPOIS / PARALELO    | **DEPOIS** — fiscal depende de invoices/financeiro                                         |
| 7   | `products` e `stock_movements` devem ser atualizados para versão completa do backup? | SIM / NÃO            | **SIM** — versão completa é a fonte da verdade canônica                                    |
| 8   | `third_party_custody*` deve ser removido de `07_inventory_custody.sql`?              | SIM / NÃO            | **SIM** — fonte única é `12_custody.sql`                                                   |

---

## 7. Ordem de reconstrução sugerida

```text
Fase 1 — Estrutura base
├── 01_core.sql (mantido)
├── 02_rbac.sql (mantido)
├── 03_crm.sql (mantido)
└── 07_inventory_custody.sql (reconciliado: Inventory puro, sem Custody)

Fase 2 — RH + Recruitment
├── 05_rh.sql (restaurar)
├── 06_recruitment.sql (restaurar)
├── 04_rh_recruitment.sql (reconciliar com 05+06)
└── 07_employees.sql (restaurar)

Fase 3 — Purchasing + Custody
├── 06_suppliers_purchasing.sql (mantido)
└── 12_custody.sql (mantido, fonte única)

Fase 4 — Contracts
├── 05_services_contracts.sql (reconciliado com 08+09)
└── 09_contracts.sql (restaurar objetos ausentes)

Fase 5 — Almoxarifado + PDV (se aprovado)
├── warehouse_requests*
├── warehouse_request_items*
├── warehouse_transfers*
├── warehouse_transfer_items*
├── sales* (se aprovado)
├── sale_items* (se aprovado)
├── cash_registers* (se aprovado)
└── cash_operations* (se aprovado)

Fase 6 — Financeiro + Fiscal
├── invoices
├── invoice_items
├── payments
├── accounts_receivable
├── accounts_payable
├── financial_accounts
├── financial_categories
├── cost_centers
├── expenses
├── revenues
├── fiscal_documents
├── fiscal_document_items
├── fiscal_document_events
├── fiscal_document_status_history
├── fiscal_configurations
└── fiscal_integrations

Fase 7 — Support + Chat + Notifications + Events
├── 15_support.sql (mantido)
├── 09_chat.sql (mantido)
├── 10_notifications_events.sql (mantido)
└── 11_audit_security.sql (mantido)

Fase 8 — Transversais
├── 27_functions.sql
├── 28_triggers.sql
├── 29_indexes.sql
├── 30_views.sql
├── 31_rls.sql
├── 32_seed.sql
└── 33_validation.sql
```

---

## 8. Regras comuns a todos os domínios

| Regra        | Aplicação                                              |
| ------------ | ------------------------------------------------------ |
| UUID         | `gen_random_uuid()` para todas as PKs                  |
| tenant_id    | Obrigatório em toda tabela operacional                 |
| Auditoria    | `created_at`, `updated_at`, `created_by`, `updated_by` |
| Histórico    | Tabelas append-only para status/histórico              |
| RLS          | Habilitar antes dos seeds                              |
| Constraints  | CHECK para invariantes de domínio                      |
| Índices      | Em `tenant_id`, FKs e campos de consulta frequente     |
| LGPD         | Aplicar em dados pessoais/sensíveis                    |
| Idempotência | `idempotency_key` em eventos/outbox                    |
| Correlation  | `correlation_id` em operações importantes              |

---

## 9. Objetos que NÃO devem ser criados

| Objeto              | Motivo                                    |
| ------------------- | ----------------------------------------- |
| `profiles`          | Legado; identity é `people`               |
| `tickets`           | Substituído por `support_tickets`         |
| `messages`          | Substituído por `chat_messages`           |
| `attachments`       | Substituído por `files`                   |
| `logs`              | Substituído por `audit_logs`              |
| `storage_objects`   | Substituído por `file_access_logs`        |
| `fila_automacao`    | Substituído por `automation_queue`        |
| `eventos_automacao` | Substituído por `automation_events`       |
| `fluxos_automacao`  | Substituído por `automation_flows`        |
| `notificacoes`      | Substituído por `notifications`           |
| `documentos`        | Substituído por `documents`               |
| `leads`             | Não existe na V2.1                        |
| `contact_requests`  | Não existe na V2.1                        |
| `webhooks`          | Substituído por `domain_events` + n8n     |
| `automation_queue`  | Substituído por `domain_events` + n8n     |
| `whatsapp_messages` | Logging deve ir para tabela de integração |
| `emails`            | Logging deve ir para tabela de integração |

---

## 10. Próximos passos

1. Aprovar esta master spec.
2. Reconciliar `products` e `stock_movements` em `07_inventory_custody.sql`.
3. Remover duplicidade de custódia em `07_inventory_custody.sql`.
4. Restaurar objetos ausentes do backup conforme prioridade.
5. Implementar transversais (27→33) no gate correspondente.
6. Só então prosseguir para D.16.

---

## 11. Confirmação de gates aprovados

| Gate | Domínio    | Resultado |
| ---- | ---------- | --------- |
| D.12 | Custody    | PASS      |
| D.13 | Purchasing | PASS      |
| D.14 | Tasks      | PASS      |
| D.15 | Support    | PASS      |

---

**Checkpoint:**

- Nenhum arquivo alterado.
- Nenhuma migration executada.
- Supabase remoto não alterado.
- Frontend não alterado.
