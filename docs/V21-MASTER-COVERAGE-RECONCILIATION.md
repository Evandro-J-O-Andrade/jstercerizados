# V2.1 — Master Coverage Reconciliation

**Branch:** `feat/database-v21-local-rebuild`  
**Commit base:** `19431c3`  
**Data:** 2026-08-21  
**Modo:** READ-ONLY — estático

## AVISO

Este documento é uma **análise estática**. Nenhum SQL foi alterado, nenhuma migration executada, nenhum commit realizado.

## Objetivo

Confrontar o SQL canônico atual (`feat/database-v21-local-rebuild` @ `19431c3`) contra **toda a documentação histórica V2.1** para identificar lacunas reais antes de qualquer implementação adicional.

## Fontes consultadas

1. `docs/V21-FUNCTIONAL-CONTRACT-INVENTORY-FINANCE-PDV.md`
2. `docs/V21-BUSINESS-CONTRACT-RECONCILIATION.md`
3. `docs/V21-CANONICAL-OBJECT-MASTER-MATRIX.md`
4. `docs/V21-MISSING-OBJECTS-RECONSTRUCTION-PLAN.md`
5. `docs/V21-INVENTORY-BILLING-WAREHOUSE-POS-MASTER-SPEC.md`
6. `docs/V21-INVENTORY-CUSTODY-RECONCILIATION-MATRIX.md`
7. `docs/FINAL-TRANSVERSAL-AUDIT.md`
8. `docs/V21-DATABASE-FINAL-MATRIX.md`
9. `docs/V2.1-GAP-ANALYSIS.md`
10. `docs/BUSINESS-RULES-V2.1.md`
11. `docs/DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md`
12. `docs/DATABASE-ASIS-TO-V21-MAPPING.md`
13. SQL canônico atual

---

## Estado atual do SQL canônico

### Arquivos presentes

| Arquivo                       | Domínio                 | Status |
| ----------------------------- | ----------------------- | ------ |
| `00_extensions.sql`           | Extensions              | ✅     |
| `01_core.sql`                 | Core/Tenancy            | ✅     |
| `02_rbac.sql`                 | RBAC                    | ✅     |
| `03_crm.sql`                  | CRM                     | ✅     |
| `04_rh_recruitment.sql`       | RH/Recruitment (básico) | ✅     |
| `05_services_contracts.sql`   | Services/Contracts      | ✅     |
| `06_suppliers_purchasing.sql` | Suppliers/Purchasing    | ✅     |
| `07_inventory_custody.sql`    | Inventory/Custody       | ✅     |
| `09_chat.sql`                 | Chat                    | ✅     |
| `10_notifications_events.sql` | Notifications/Events    | ✅     |
| `11_audit_security.sql`       | Audit/Security          | ✅     |
| `12_custody.sql`              | Custody                 | ✅     |
| `14_tasks.sql`                | Tasks                   | ✅     |
| `15_support.sql`              | Support                 | ✅     |
| `18_storage_documents.sql`    | Storage/Documents       | ✅     |
| `20_lgpd.sql`                 | LGPD                    | ✅     |
| `21_functions_triggers.sql`   | Functions/Triggers      | ✅     |
| `22_rls.sql`                  | RLS                     | ✅     |
| `23_indexes.sql`              | Indexes                 | ✅     |
| `25_validation.sql`           | Validation              | ✅     |
| `26_error_codes.sql`          | Error Codes             | ✅     |
| `27_finance.sql`              | Finance                 | ✅     |
| `28_fiscal.sql`               | Fiscal                  | ✅     |
| `29_pos.sql`                  | PDV                     | ✅     |
| `30_recruitment.sql`          | Recruitment (avançado)  | ✅     |
| `31_automation.sql`           | Automation              | ✅     |
| `32_seed.sql`                 | Seed                    | ✅     |

### Objetos presentes no SQL atual

| Domínio       | Tabelas presentes                                                                                                                                                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core          | `people`, `tenants`, `tenant_memberships`, `tenant_settings`                                                                                                                                                                                                                                                                            |
| RBAC          | `roles`, `permissions`, `role_permissions`, `role_assignments`                                                                                                                                                                                                                                                                          |
| CRM           | `companies`, `company_relationships`, `company_contacts`                                                                                                                                                                                                                                                                                |
| RH            | `candidates`, `applications`, `application_status_history`, `interviews`                                                                                                                                                                                                                                                                |
| Recruitment   | `skills`, `candidate_documents`, `candidate_experiences`, `candidate_education`, `candidate_courses`, `candidate_languages`, `candidate_skills`, `job_skills`, `stage_templates`, `recruitment_processes`, `recruitment_stages`, `candidate_processes`, `application_profile_snapshots`, `interview_participants`, `interview_feedback` |
| Services      | `services`, `service_orders`, `service_order_status_history`                                                                                                                                                                                                                                                                            |
| Contracts     | `contracts`, `contract_status_history`                                                                                                                                                                                                                                                                                                  |
| Suppliers     | `suppliers`, `purchase_orders`, `purchase_order_items`                                                                                                                                                                                                                                                                                  |
| Inventory     | `products`, `stock_movements`, `stock_balances`, `stock_entries`                                                                                                                                                                                                                                                                        |
| Custody       | `third_party_custody`, `third_party_custody_items`                                                                                                                                                                                                                                                                                      |
| Tasks         | `tasks`                                                                                                                                                                                                                                                                                                                                 |
| Support       | `support_tickets`, `support_ticket_status_history`                                                                                                                                                                                                                                                                                      |
| Notifications | `notifications`, `notification_deliveries`                                                                                                                                                                                                                                                                                              |
| Events        | `domain_events`, `event_outbox`, `event_deliveries`                                                                                                                                                                                                                                                                                     |
| Audit         | `audit_logs`, `security_events`, `first_login_state`, `legal_acceptances`                                                                                                                                                                                                                                                               |
| LGPD          | `consents`, `privacy_requests`, `data_export_requests`, `data_deletion_requests`, `data_retention_policies`                                                                                                                                                                                                                             |
| Storage       | `files`, `file_access_logs`, `document_versions`, `document_links`                                                                                                                                                                                                                                                                      |
| Admin         | `administrative_requests`, `administrative_tasks`, `administrative_approvals`, `administrative_documents`                                                                                                                                                                                                                               |
| Chat          | `chat_rooms`, `chat_participants`, `chat_messages`, `ai_conversations`, `ai_messages`, `chat_handoffs`                                                                                                                                                                                                                                  |
| Finance       | `financial_categories`, `cost_centers`, `accounts_receivable`, `accounts_payable`, `payments`, `receipts`, `financial_transactions`, `bank_reconciliations`, `financial_installments`, `financial_installment_payments`, `financial_installment_cancellations`                                                                          |
| Fiscal        | `fiscal_configurations`, `tax_rates`, `tax_calculations`, `fiscal_documents`, `fiscal_document_items`, `fiscal_document_status_history`, `fiscal_api_requests`, `fiscal_api_responses`, `fiscal_document_events`                                                                                                                        |
| POS           | `pos_terminals`, `pos_cashiers`, `pos_operators`, `pos_cashier_sessions`, `pos_sales`, `pos_sale_items`, `pos_payments`, `pos_cancellations`, `pos_returns`, `pos_cash_movements`, `pos_daily_closures`                                                                                                                                 |
| Automation    | `webhook_deliveries`, `automation_jobs`, `automation_executions`                                                                                                                                                                                                                                                                        |

---

## Lacunas identificadas contra documentação histórica

### 🔴 LACUNAS CRÍTICAS (bloqueiam runtime)

| #   | Domínio                | Objeto ausente                                                                                                                            | Fonte documentação                                                           | Impacto                                              |
| --- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | **RBAC**               | `role_resource_permissions`                                                                                                               | `DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md`                                    | Permissões por recurso/role não existe               |
| 2   | **Employees/RH**       | `employees`, `employee_contracts`, `employee_documents`, `employee_status_history`, `departments`, `positions`, `employee_positions`      | `DATABASE-ASIS-TO-V21-MAPPING.md`, `DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md` | RH interno não existe                                |
| 3   | **Inventory**          | `warehouses`, `warehouse_locations`, `stock_exits`, `stock_inventory`, `stock_inventory_items`, `stock_adjustments`, `product_categories` | `DATABASE-ASIS-TO-V21-MAPPING.md`, `BUSINESS-RULES-V2.1.md`                  | Almoxarifado, inventário físico, categorias ausentes |
| 4   | **Finance**            | `invoices`, `invoice_items`, `financial_accounts`, `expenses`, `revenues`, `financial_kpis`                                               | `DATABASE-ASIS-TO-V21-MAPPING.md`, `DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md` | Faturamento básico ausente                           |
| 5   | **Fiscal**             | `fiscal_integrations`                                                                                                                     | `DATABASE-ASIS-TO-V21-MAPPING.md`                                            | Integração com provedor fiscal ausente               |
| 6   | **Reports**            | `report_definitions`, `report_executions`, `report_schedules`, `report_recipients`, `dashboard_widgets`, `dashboard_layouts`              | `DATABASE-ASIS-TO-V21-MAPPING.md`, `V21-DATABASE-FINAL-MATRIX.md`            | Nenhuma estrutura de relatório/dashboard             |
| 7   | **Tasks**              | `task_comments`, `task_attachments`, `task_status_history`                                                                                | `DATABASE-ASIS-TO-V21-MAPPING.md`, `DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md` | Tarefas sem histórico/anexos                         |
| 8   | **Support**            | `support_ticket_categories`, `support_ticket_messages`, `support_ticket_assignments`                                                      | `DATABASE-ASIS-TO-V21-MAPPING.md`, `DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md` | Suporte sem categorias/mensagens/atribuições         |
| 9   | **Chat**               | `ai_usage`, `chat_assignments`, `chat_events`                                                                                             | `DATABASE-ASIS-TO-V21-MAPPING.md`, `DATABASE-BUILD-SPEC-JS-EMPREGOS-V2.1.md` | Chat sem métricas de IA/atribuições/eventos          |
| 10  | **Security**           | `sessions`, `password_policies`                                                                                                           | `DATABASE-ASIS-TO-V21-MAPPING.md`                                            | Sem gestão de sessões/políticas de senha             |
| 11  | **Automation**         | `automation_templates`, `automation_events`, `automation_flows`, `automation_queue`                                                       | `DATABASE-ASIS-TO-V21-MAPPING.md`                                            | Automação sem templates/fluxos/queue                 |
| 12  | **Talent Pool**        | `talent_pool_memberships`, `job_matches`, `candidate_profile_views`, `recruitment_kpis`                                                   | `DATABASE-ASIS-TO-V21-MAPPING.md`, `BUSINESS-RULES-V2.1.md`                  | Talent pool e matching ausentes                      |
| 13  | **Purchasing**         | `purchase_requests`, `purchase_quotations`, `purchase_receipt_divergences`, `purchase_status_history`                                     | `V21-FUNCTIONAL-CONTRACT-INVENTORY-FINANCE-PDV.md`                           | Fluxo completo de compras ausente                    |
| 14  | **Services/Contracts** | `company_services`, `service_order_items`, `service_acceptances`, `service_executions`, `service_attachments`                             | `DATABASE-ASIS-TO-V21-MAPPING.md`                                            | OS/contratos sem itens/execuções/aceites             |
| 15  | **Notifications**      | `notification_preferences`                                                                                                                | `DATABASE-ASIS-TO-V21-MAPPING.md`                                            | Sem preferências de notificação                      |
| 16  | **CRM**                | `interactions`, `recruitment_demands`                                                                                                     | `DATABASE-ASIS-TO-V21-MAPPING.md`                                            | CRM sem interações/demandas                          |

### 🟡 LACUNAS PARCIAIS (não bloqueiam runtime mas precisam de enforcement)

| #   | Domínio     | Regra                                        | Status atual                                   | Gap                                           |
| --- | ----------- | -------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| 1   | CRM         | `company_contacts` sem `tenant_id` direto    | Herdado via `company_id`                       | Documentar ou adicionar `tenant_id`           |
| 2   | Finance     | `competence_date` vs `payment_date`          | Colunas existem                                | Sem constraint/trigger enforcing separação    |
| 3   | Finance     | Parcela não alterada após baixa              | `financial_installments` existe                | Sem proteção contra UPDATE em parcela baixada |
| 4   | Finance     | `cost_center_id` obrigatório                 | Nullable                                       | Deveria ser NOT NULL                          |
| 5   | Finance     | Estorno automático                           | `financial_installment_cancellations` existe   | Sem função de estorno                         |
| 6   | Fiscal      | RPC emissão/cancelamento                     | Tabelas existem                                | Sem função RPC                                |
| 7   | Inventory   | Lotes/validade                               | `stock_lots` não existe                        | Em falta                                      |
| 8   | Inventory   | Almoxarifado                                 | `warehouses`, `warehouse_locations` não existe | Em falta                                      |
| 9   | POS         | Integração automática estoque/finance/fiscal | Tabelas existem                                | Sem função/trigger                            |
| 10  | POS         | Caixa não reaberto após fechamento           | `pos_daily_closures` existe                    | Sem validação                                 |
| 11  | POS         | Operador não altera venda de outro           | Tabelas existem                                | Sem RLS por operador                          |
| 12  | Talent Pool | Matching automático                          | `candidates` existe                            | Sem função de matching                        |
| 13  | Error Codes | Uso em functions/triggers                    | Enum existe                                    | Não adotado no código                         |
| 14  | Audit       | `sessions`                                   | Não existe                                     | Em falta                                      |
| 15  | Employees   | Gestão de colaboradores                      | Nenhuma tabela                                 | Em falta                                      |
| 16  | Services    | `company_services`                           | Não existe                                     | Em falta                                      |

### ✅ COBERTO COMPLETAMENTE

| Domínio                       | Status |
| ----------------------------- | ------ |
| Core/Identity/Tenancy         | ✅     |
| RBAC (básico)                 | ✅     |
| CRM (básico)                  | ✅     |
| RH/Recruitment (básico)       | ✅     |
| Recruitment (avançado)        | ✅     |
| Services/Contracts (básico)   | ✅     |
| Suppliers/Purchasing (básico) | ✅     |
| Inventory/Custody (ledger)    | ✅     |
| Tasks (básico)                | ✅     |
| Support (básico)              | ✅     |
| Chat (humano/IA/handoff)      | ✅     |
| Notifications/Events/Outbox   | ✅     |
| Audit/Security (básico)       | ✅     |
| LGPD                          | ✅     |
| Storage/Documents             | ✅     |
| Administrative                | ✅     |
| Finance (tables)              | ✅     |
| Fiscal (tables)               | ✅     |
| POS (tables)                  | ✅     |
| Automation (tables)           | ✅     |
| Error Codes (enum)            | ✅     |
| RLS                           | ✅     |
| Functions/Triggers            | ✅     |
| Indexes                       | ✅     |
| Seed                          | ✅     |
| Validation                    | ✅     |

---

## Matriz resumo

| Domínio           | Tabelas | Regras | FKs | Index | RLS | RPC | Trigger | Event | Outbox | View | Status |
| ----------------- | ------- | ------ | --- | ----- | --- | --- | ------- | ----- | ------ | ---- | ------ |
| Core              | ✅      | ✅     | ✅  | ✅    | ✅  | ✅  | ✅      | ✅    | ✅     | ❌   | 🟡     |
| RBAC              | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| CRM               | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| RH/Employees      | ❌      | ❌     | ❌  | ❌    | ❌  | ❌  | ❌      | ❌    | ❌     | ❌   | 🔴     |
| Recruitment       | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ✅    | ❌     | ❌   | 🟡     |
| Talent Pool       | ❌      | ❌     | ❌  | ❌    | ❌  | ❌  | ❌      | ❌    | ❌     | ❌   | 🔴     |
| Services          | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Contracts         | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Suppliers         | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Purchasing        | ✅      | ⚠️     | ✅  | ✅    | ✅  | ⚠️  | ⚠️      | ⚠️    | ❌     | ❌   | 🟡     |
| Inventory         | ✅      | ⚠️     | ✅  | ✅    | ✅  | ✅  | ✅      | ✅    | ❌     | ❌   | 🟡     |
| Almoxarifado      | ❌      | ❌     | ❌  | ❌    | ❌  | ❌  | ❌      | ❌    | ❌     | ❌   | 🔴     |
| Custody           | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Tasks             | ✅      | ⚠️     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Support           | ✅      | ⚠️     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Chat              | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| AI                | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Handoff           | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Notifications     | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Documents/Storage | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Finance           | ✅      | ⚠️     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Fiscal            | ✅      | ⚠️     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| POS               | ✅      | ⚠️     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Audit             | ✅      | ✅     | ✅  | ✅    | ✅  | ✅  | ✅      | ✅    | ❌     | ❌   | 🟡     |
| LGPD              | ✅      | ✅     | ✅  | ✅    | ✅  | ✅  | ✅      | ❌    | ❌     | ❌   | 🟡     |
| Events/Outbox     | ✅      | ✅     | ✅  | ✅    | ✅  | ✅  | ✅      | ✅    | ✅     | ❌   | 🟡     |
| Automation        | ✅      | ✅     | ✅  | ✅    | ✅  | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Reports/Views     | ❌      | ❌     | ❌  | ❌    | ❌  | ❌  | ❌      | ❌    | ❌     | ❌   | 🔴     |
| Error Codes       | ✅      | ⚠️     | —   | —     | —   | ❌  | ❌      | ❌    | ❌     | ❌   | 🟡     |
| Security/Sessions | ❌      | ❌     | ❌  | ❌    | ❌  | ❌  | ❌      | ❌    | ❌     | ❌   | 🔴     |

---

## Conclusão

### READY FOR SQL IMPLEMENTATION = NO

### READY FOR RUNTIME = NO

### Motivo

O SQL canônico atual cobre a **base estrutural** de ~52 domínios, mas **não cobre o escopo completo** definido pela documentação histórica V2.1.

Faltam **pelo menos 48 tabelas** distribuídas em:

- RBAC avançado
- Employees/RH interno
- Almoxarifado/warehouses
- Inventory avançado (lotes, inventário físico, ajustes)
- Purchasing completo (request, quotation, divergences)
- Finance completo (invoices, accounts, KPIs)
- Fiscal integração
- Reports/Views
- Tasks/Support enriquecido
- Chat enriquecido
- Talent Pool
- Security/sessions
- Automation completa

### Próximo passo

1. Revisar `docs/V21-GAP-CLOSURE-MATRIX.md`
2. Revisar `docs/V21-GAP-CLOSURE-DEPENDENCY-GRAPH.md`
3. Revisar `docs/V21-SQL-IMPLEMENTATION-ORDER.md`
4. Aprovar implementação faseada

**Nenhum commit adicional até aprovação.**
