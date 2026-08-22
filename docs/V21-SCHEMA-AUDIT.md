# V2.1 Schema Audit Report

**Commit:** 7c2aa30  
**Branch:** feat/database-v21-local-rebuild  
**Date:** 2026-08-21  
**Auditor:** Kilo (Automated Structural Audit)

---

## Status Geral: FAIL

A auditoria estrutural identificou **3 problemas críticos** que impedem a execução bem-sucedida do schema V2.1 na ordem atual dos arquivos. Além disso, há **15 advertências** e **8 recomendações** de melhorias.

---

## Tabelas Auditadas

| #   | Tabela                              | Arquivo                        | Status  | Observações                                                    |
| --- | ----------------------------------- | ------------------------------ | ------- | -------------------------------------------------------------- |
| 1   | people                              | 01_core.sql                    | PASS    | PK, FKs, unique, timestamps OK                                 |
| 2   | tenants                             | 01_core.sql                    | PASS    | PK, unique slug, timestamps OK                                 |
| 3   | tenant_memberships                  | 01_core.sql                    | PASS    | PK, UK, FKs, timestamps OK                                     |
| 4   | tenant_settings                     | 01_core.sql                    | PASS    | PK, UK, FKs, timestamps OK                                     |
| 5   | roles                               | 02_rbac.sql                    | PASS    | PK, unique name, timestamps OK                                 |
| 6   | permissions                         | 02_rbac.sql                    | PASS    | PK, UK, timestamps OK                                          |
| 7   | role_permissions                    | 02_rbac.sql                    | PASS    | PK, UK, FKs OK                                                 |
| 8   | role_assignments                    | 02_rbac.sql                    | WARNING | tenant_id nullable; UK inclui null                             |
| 9   | companies                           | 03_crm.sql                     | PASS    | PK, FKs, timestamps OK                                         |
| 10  | company_relationships               | 03_crm.sql                     | WARNING | Sem tenant_id; sem updated_at                                  |
| 11  | company_contacts                    | 03_crm.sql                     | WARNING | Sem tenant_id; sem updated_at                                  |
| 12  | candidates                          | 04_rh_recruitment.sql          | PASS    | PK, FKs, timestamps OK                                         |
| 13  | jobs                                | 04_rh_recruitment.sql          | PASS    | PK, FKs, timestamps OK                                         |
| 14  | applications                        | 04_rh_recruitment.sql          | WARNING | Sem tenant_id direto; sem updated_at                           |
| 15  | application_status_history          | 04_rh_recruitment.sql          | WARNING | Sem tenant_id; sem updated_at                                  |
| 16  | interviews                          | 04_rh_recruitment.sql          | WARNING | Sem tenant_id; sem updated_at                                  |
| 17  | services                            | 05_services_contracts.sql      | PASS    | PK, FKs, timestamps OK                                         |
| 18  | service_orders                      | 05_services_contracts.sql      | FAIL    | **CONFLITO** com 34_crm_services.sql                           |
| 19  | service_order_status_history        | 05_services_contracts.sql      | PASS    | PK, FKs OK                                                     |
| 20  | contracts                           | 05_services_contracts.sql      | PASS    | PK, FKs, timestamps OK                                         |
| 21  | contract_status_history             | 05_services_contracts.sql      | PASS    | PK, FKs OK                                                     |
| 22  | suppliers                           | 06_suppliers_purchasing.sql    | PASS    | PK, FKs, timestamps OK                                         |
| 23  | purchase_orders                     | 06_suppliers_purchasing.sql    | PASS    | PK, FKs, timestamps OK                                         |
| 24  | purchase_order_items                | 06_suppliers_purchasing.sql    | FAIL    | **FK quebrada**: products(id) inexistente na ordem de execução |
| 25  | products                            | 07_inventory_custody.sql       | PASS    | PK, FKs, timestamps OK                                         |
| 26  | stock_movements                     | 07_inventory_custody.sql       | WARNING | Sem updated_at; trigger ausente                                |
| 27  | chat_rooms                          | 09_chat.sql                    | PASS    | PK, FKs, timestamps OK                                         |
| 28  | chat_participants                   | 09_chat.sql                    | WARNING | Sem tenant_id; sem updated_at                                  |
| 29  | chat_messages                       | 09_chat.sql                    | WARNING | Sem tenant_id; sem updated_at                                  |
| 30  | ai_conversations                    | 09_chat.sql                    | PASS    | PK, FKs, timestamps OK                                         |
| 31  | ai_messages                         | 09_chat.sql                    | WARNING | Sem tenant_id; sem updated_at                                  |
| 32  | chat_handoffs                       | 09_chat.sql                    | WARNING | Sem tenant_id; sem updated_at                                  |
| 33  | notifications                       | 10_notifications_events.sql    | PASS    | PK, FKs, timestamps OK                                         |
| 34  | notification_deliveries             | 10_notifications_events.sql    | PASS    | PK, FKs, UK, timestamps OK                                     |
| 35  | domain_events                       | 10_notifications_events.sql    | PASS    | PK, UK, timestamps OK                                          |
| 36  | event_outbox                        | 10_notifications_events.sql    | PASS    | PK, FKs, UK, timestamps OK                                     |
| 37  | event_deliveries                    | 10_notifications_events.sql    | PASS    | PK, FKs, UK, timestamps OK                                     |
| 38  | audit_logs                          | 11_audit_security.sql          | PASS    | PK, FKs OK (append-only)                                       |
| 39  | security_events                     | 11_audit_security.sql          | PASS    | PK, FKs OK (append-only)                                       |
| 40  | first_login_state                   | 11_audit_security.sql          | WARNING | Naming singular vs plural                                      |
| 41  | legal_acceptances                   | 11_audit_security.sql          | PASS    | PK, FKs, timestamps OK                                         |
| 42  | third_party_custody                 | 12_custody.sql                 | PASS    | PK, FKs, timestamps OK                                         |
| 43  | third_party_custody_items           | 12_custody.sql                 | PASS    | PK, FKs, timestamps OK                                         |
| 44  | tasks                               | 14_tasks.sql                   | PASS    | PK, FKs, timestamps OK                                         |
| 45  | support_tickets                     | 15_support.sql                 | FAIL    | **CONFLITO** com 40_tasks_support.sql                          |
| 46  | support_ticket_status_history       | 15_support.sql                 | PASS    | PK, FKs OK                                                     |
| 47  | files                               | 18_storage_documents.sql       | PASS    | PK, FKs, UK, timestamps OK                                     |
| 48  | file_access_logs                    | 18_storage_documents.sql       | PASS    | PK, FKs, timestamps OK                                         |
| 49  | document_versions                   | 18_storage_documents.sql       | PASS    | PK, FKs, UK, timestamps OK                                     |
| 50  | document_links                      | 18_storage_documents.sql       | PASS    | PK, FKs, timestamps OK                                         |
| 51  | administrative_requests             | 18_storage_documents.sql       | PASS    | PK, FKs, timestamps OK                                         |
| 52  | administrative_tasks                | 18_storage_documents.sql       | PASS    | PK, FKs, timestamps OK                                         |
| 53  | administrative_approvals            | 18_storage_documents.sql       | PASS    | PK, FKs, timestamps OK                                         |
| 54  | administrative_documents            | 18_storage_documents.sql       | PASS    | PK, FKs, timestamps OK                                         |
| 55  | consents                            | 20_lgpd.sql                    | PASS    | PK, FKs, UK, timestamps OK                                     |
| 56  | privacy_requests                    | 20_lgpd.sql                    | PASS    | PK, FKs, UK, timestamps OK                                     |
| 57  | data_export_requests                | 20_lgpd.sql                    | PASS    | PK, FKs, UK, timestamps OK                                     |
| 58  | data_deletion_requests              | 20_lgpd.sql                    | PASS    | PK, FKs, UK, timestamps OK                                     |
| 59  | data_retention_policies             | 20_lgpd.sql                    | PASS    | PK, FKs, UK, timestamps OK                                     |
| 60  | stock_balances                      | 21_functions_triggers.sql      | PASS    | PK, FKs, UK, timestamps OK                                     |
| 61  | stock_entries                       | 21_functions_triggers.sql      | PASS    | PK, FKs, timestamps OK                                         |
| 62  | purchase_receipts                   | 21_functions_triggers.sql      | PASS    | PK, FKs, timestamps OK                                         |
| 63  | purchase_receipt_items              | 21_functions_triggers.sql      | PASS    | PK, FKs, timestamps OK                                         |
| 64  | validation_results                  | 25_validation.sql              | PASS    | PK, CHECK, timestamps OK                                       |
| 65  | financial_categories                | 27_finance.sql                 | PASS    | PK, FKs, UK, CHECK, timestamps OK                              |
| 66  | cost_centers                        | 27_finance.sql                 | PASS    | PK, FKs, UK, timestamps OK                                     |
| 67  | accounts_receivable                 | 27_finance.sql                 | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 68  | accounts_payable                    | 27_finance.sql                 | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 69  | payments                            | 27_finance.sql                 | PASS    | PK, FKs, timestamps OK                                         |
| 70  | receipts                            | 27_finance.sql                 | PASS    | PK, FKs, timestamps OK                                         |
| 71  | financial_transactions              | 27_finance.sql                 | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 72  | bank_reconciliations                | 27_finance.sql                 | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 73  | financial_installments              | 27_finance.sql                 | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 74  | financial_installment_payments      | 27_finance.sql                 | PASS    | PK, FKs, timestamps OK                                         |
| 75  | financial_installment_cancellations | 27_finance.sql                 | PASS    | PK, FKs, timestamps OK                                         |
| 76  | invoices                            | 27_finance.sql                 | PASS    | PK, FKs, UK, timestamps OK                                     |
| 77  | invoice_items                       | 27_finance.sql                 | PASS    | PK, FKs, timestamps OK                                         |
| 78  | financial_accounts                  | 27_finance.sql                 | PASS    | PK, FKs, UK, timestamps OK                                     |
| 79  | fiscal_configurations               | 28_fiscal.sql                  | PASS    | PK, FKs, UK, CHECK, timestamps OK                              |
| 80  | tax_rates                           | 28_fiscal.sql                  | PASS    | PK, FKs, UK, CHECK, timestamps OK                              |
| 81  | tax_calculations                    | 28_fiscal.sql                  | PASS    | PK, FKs, timestamps OK                                         |
| 82  | fiscal_documents                    | 28_fiscal.sql                  | PASS    | PK, FKs, UK, CHECK, timestamps OK                              |
| 83  | fiscal_document_items               | 28_fiscal.sql                  | PASS    | PK, FKs, timestamps OK                                         |
| 84  | fiscal_document_status_history      | 28_fiscal.sql                  | PASS    | PK, FKs, timestamps OK                                         |
| 85  | fiscal_api_requests                 | 28_fiscal.sql                  | PASS    | PK, FKs, timestamps OK                                         |
| 86  | fiscal_api_responses                | 28_fiscal.sql                  | PASS    | PK, FKs, timestamps OK                                         |
| 87  | fiscal_document_events              | 28_fiscal.sql                  | PASS    | PK, FKs, timestamps OK                                         |
| 88  | pos_terminals                       | 29_pos.sql                     | PASS    | PK, FKs, UK, timestamps OK                                     |
| 89  | pos_cashiers                        | 29_pos.sql                     | PASS    | PK, FKs, timestamps OK                                         |
| 90  | pos_operators                       | 29_pos.sql                     | PASS    | PK, FKs, UK, timestamps OK                                     |
| 91  | pos_cashier_sessions                | 29_pos.sql                     | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 92  | pos_sales                           | 29_pos.sql                     | PASS    | PK, FKs, UK, CHECK, timestamps OK                              |
| 93  | pos_sale_items                      | 29_pos.sql                     | PASS    | PK, FKs, timestamps OK                                         |
| 94  | pos_payments                        | 29_pos.sql                     | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 95  | pos_cancellations                   | 29_pos.sql                     | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 96  | pos_returns                         | 29_pos.sql                     | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 97  | pos_cash_movements                  | 29_pos.sql                     | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 98  | pos_daily_closures                  | 29_pos.sql                     | PASS    | PK, FKs, CHECK, trigger OK                                     |
| 99  | skills                              | 30_recruitment.sql             | WARNING | tenant_id nullable; UK permite duplicatas global               |
| 100 | candidate_documents                 | 30_recruitment.sql             | PASS    | PK, FKs, timestamps OK                                         |
| 101 | candidate_experiences               | 30_recruitment.sql             | PASS    | PK, FKs, timestamps OK                                         |
| 102 | candidate_education                 | 30_recruitment.sql             | PASS    | PK, FKs, timestamps OK                                         |
| 103 | candidate_courses                   | 30_recruitment.sql             | PASS    | PK, FKs, timestamps OK                                         |
| 104 | candidate_languages                 | 30_recruitment.sql             | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 105 | candidate_skills                    | 30_recruitment.sql             | PASS    | PK, FKs, UK, timestamps OK                                     |
| 106 | job_skills                          | 30_recruitment.sql             | PASS    | PK, FKs, UK, timestamps OK                                     |
| 107 | stage_templates                     | 30_recruitment.sql             | PASS    | PK, FKs, timestamps OK                                         |
| 108 | recruitment_processes               | 30_recruitment.sql             | PASS    | PK, FKs, UK, CHECK, timestamps OK                              |
| 109 | recruitment_stages                  | 30_recruitment.sql             | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 110 | candidate_processes                 | 30_recruitment.sql             | PASS    | PK, FKs, UK, timestamps OK                                     |
| 111 | application_profile_snapshots       | 30_recruitment.sql             | PASS    | PK, FKs, timestamps OK                                         |
| 112 | interview_participants              | 30_recruitment.sql             | PASS    | PK, FKs, timestamps OK                                         |
| 113 | interview_feedback                  | 30_recruitment.sql             | PASS    | PK, FKs, timestamps OK                                         |
| 114 | webhook_deliveries                  | 31_automation.sql              | PASS    | PK, FKs, UK, CHECK, timestamps OK                              |
| 115 | automation_jobs                     | 31_automation.sql              | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 116 | automation_executions               | 31_automation.sql              | PASS    | PK, FKs, CHECK, timestamps OK                                  |
| 117 | departments                         | 33_employees.sql               | PASS    | PK, FKs, UK, timestamps OK                                     |
| 118 | positions                           | 33_employees.sql               | PASS    | PK, FKs, UK, timestamps OK                                     |
| 119 | employees                           | 33_employees.sql               | PASS    | PK (1:1), FKs, unique, timestamps OK                           |
| 120 | employee_positions                  | 33_employees.sql               | WARNING | Sem tenant_id; UK OK                                           |
| 121 | employee_contracts                  | 33_employees.sql               | WARNING | Sem tenant_id                                                  |
| 122 | employee_documents                  | 33_employees.sql               | WARNING | Sem tenant_id                                                  |
| 123 | employee_status_history             | 33_employees.sql               | WARNING | Sem tenant_id                                                  |
| 124 | company_services                    | 34_crm_services.sql            | PASS    | PK, FKs, timestamps OK                                         |
| 125 | service_orders                      | 34_crm_services.sql            | FAIL    | **CONFLITO** com 05_services_contracts.sql                     |
| 126 | service_order_items                 | 34_crm_services.sql            | PASS    | PK, FKs, timestamps OK                                         |
| 127 | service_acceptances                 | 34_crm_services.sql            | PASS    | PK, FKs, UK, timestamps OK                                     |
| 128 | service_executions                  | 34_crm_services.sql            | PASS    | PK, FKs, timestamps OK                                         |
| 129 | service_attachments                 | 34_crm_services.sql            | PASS    | PK, FKs, timestamps OK                                         |
| 130 | interactions                        | 34_crm_services.sql            | WARNING | Sem tenant_id? (tem); sem CHECK em type/direction              |
| 131 | recruitment_demands                 | 34_crm_services.sql            | PASS    | PK, FKs, timestamps OK                                         |
| 132 | talent_pool_memberships             | 35_recruitment_talent_pool.sql | PASS    | PK, FKs, UK, timestamps OK                                     |
| 133 | job_matches                         | 35_recruitment_talent_pool.sql | PASS    | PK, FKs, UK, timestamps OK                                     |
| 134 | candidate_profile_views             | 35_recruitment_talent_pool.sql | PASS    | PK, FKs, timestamps OK                                         |
| 135 | warehouses                          | 36_inventory.sql               | PASS    | PK, FKs, UK, timestamps OK                                     |
| 136 | warehouse_locations                 | 36_inventory.sql               | PASS    | PK, FKs, UK, timestamps OK                                     |
| 137 | product_categories                  | 36_inventory.sql               | PASS    | PK, FKs, UK, timestamps OK                                     |
| 138 | stock_lots                          | 36_inventory.sql               | PASS    | PK, FKs, UK, timestamps OK                                     |
| 139 | stock_inventory                     | 36_inventory.sql               | PASS    | PK, FKs, timestamps OK                                         |
| 140 | stock_inventory_items               | 36_inventory.sql               | PASS    | PK, FKs, timestamps OK                                         |
| 141 | purchase_requests                   | 37_purchasing.sql              | PASS    | PK, FKs, timestamps OK                                         |
| 142 | purchase_request_items              | 37_purchasing.sql              | PASS    | PK, FKs, timestamps OK                                         |
| 143 | purchase_quotations                 | 37_purchasing.sql              | PASS    | PK, FKs, timestamps OK                                         |
| 144 | purchase_quotation_items            | 37_purchasing.sql              | PASS    | PK, FKs, timestamps OK                                         |
| 145 | purchase_status_history             | 37_purchasing.sql              | PASS    | PK, FKs, timestamps OK                                         |
| 146 | purchase_receipt_divergences        | 37_purchasing.sql              | PASS    | PK, FKs, timestamps OK                                         |
| 147 | fiscal_integrations                 | 39_fiscal.sql                  | PASS    | PK, FKs, timestamps OK                                         |
| 148 | task_comments                       | 40_tasks_support.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 149 | task_attachments                    | 40_tasks_support.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 150 | task_status_history                 | 40_tasks_support.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 151 | support_ticket_categories           | 40_tasks_support.sql           | PASS    | PK, FKs, UK, timestamps OK                                     |
| 152 | support_tickets                     | 40_tasks_support.sql           | FAIL    | **CONFLITO** com 15_support.sql                                |
| 153 | support_ticket_messages             | 40_tasks_support.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 154 | support_ticket_assignments          | 40_tasks_support.sql           | PASS    | PK, FKs, UK, timestamps OK                                     |
| 155 | ai_usage                            | 41_chat_security.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 156 | sessions                            | 41_chat_security.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 157 | password_policies                   | 41_chat_security.sql           | PASS    | PK, FKs, UK, timestamps OK                                     |
| 158 | automation_templates                | 42_automation.sql              | PASS    | PK, FKs, timestamps OK                                         |
| 159 | notification_preferences            | 43_notifications.sql           | PASS    | PK, FKs, UK, timestamps OK                                     |
| 160 | report_definitions                  | 44_reports_views.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 161 | report_executions                   | 44_reports_views.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 162 | report_schedules                    | 44_reports_views.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 163 | dashboard_widgets                   | 44_reports_views.sql           | PASS    | PK, FKs, timestamps OK                                         |
| 164 | dashboard_layouts                   | 44_reports_views.sql           | PASS    | PK, FKs, timestamps OK                                         |

**Total:** 164 tabelas auditadas

- PASS: 149
- WARNING: 15
- FAIL: 3 (service_orders x2, support_tickets x2, purchase_order_items) — 3 falhas únicas

---

## Problemas Encontrados

### CRÍTICOS (FAIL)

#### 1. Duplicidade de definição: `service_orders`

- **Arquivos:** `05_services_contracts.sql` (linhas 15-29) e `34_crm_services.sql` (linhas 15-24)
- **Problema:** A tabela `service_orders` é definida duas vezes com schemas incompatíveis:
  - 05: `company_id`, `service_id`, `quantity`, `value`, `period_start`, `period_end`, `location`, `notes`
  - 34: `company_service_id`, `scheduled_at`, `completed_at`
- **Impacto:** A segunda execução falhará com `ERROR: relation "service_orders" already exists`
- **Root cause:** Falta de coordenação entre fases de implementação; arquivo 34 não foi removido/consolidado

#### 2. Duplicidade de definição: `support_tickets`

- **Arquivos:** `15_support.sql` (linhas 11-22) e `40_tasks_support.sql` (linhas 45-54)
- **Problema:** A tabela `support_tickets` é definida duas vez com schemas incompatíveis:
  - 15: `subject`, `priority`, `category` (text), `assignee_person_id`, `sla_due_at`
  - 40: `category_id` (FK), `title`, `description`
- **Impacto:** Perda de dados de colunas (`priority`, `sla_due_at`, `subject`) se 40 for executado após 15, ou falha de execução
- **Root cause:** Mesmo problema do item 1; falta de consolidação

#### 3. Foreign Key quebrada por ordem de execução: `purchase_order_items.product_id -> products(id)`

- **Arquivos:** `06_suppliers_purchasing.sql` (linha 29) referencia `public.products(id)` definido em `07_inventory_custody.sql`
- **Problema:** Na ordem numérica atual, 06 executa antes de 07. O PostgreSQL valida FKs no momento do `CREATE TABLE`, causando falha
- **Impacto:** Deploy completo falha
- **Root cause:** Numeração incorreta dos arquivos de migração

#### 4. RLS habilitado em tabelas inexistentes

- **Arquivo:** `22_rls.sql` (linhas 1483-1489, 1586-1592, 1684-1688, 1740-1745, 1829-1834, 1908-1955, 1974, 1993-1999, 2076-2114, 2146-2150)
- **Problema:** `22_rls.sql` contém `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` para tabelas definidas em arquivos posteriores:
  - `employees`, `departments`, `positions`, `employee_positions`, `employee_contracts`, `employee_documents`, `employee_status_history` (33)
  - `company_services`, `service_orders`, `service_order_items`, `service_acceptances`, `service_executions`, `service_attachments`, `interactions` (34)
  - `recruitment_demands`, `talent_pool_memberships`, `job_matches`, `candidate_profile_views` (35)
  - `warehouses`, `warehouse_locations`, `product_categories`, `stock_lots`, `stock_inventory`, `stock_inventory_items` (36)
  - `purchase_requests`, `purchase_request_items`, `purchase_quotations`, `purchase_quotation_items`, `purchase_status_history`, `purchase_receipt_divergences` (37)
  - `invoices`, `invoice_items`, `financial_accounts` (27)
  - `fiscal_integrations` (39)
  - `pos_operators` (29)
  - `task_comments`, `task_attachments`, `task_status_history`, `support_ticket_categories`, `support_tickets`, `support_ticket_messages`, `support_ticket_assignments` (40)
  - `ai_usage`, `sessions`, `password_policies` (41)
  - `automation_templates` (42)
  - `notification_preferences` (43)
  - `report_definitions`, `report_executions`, `report_schedules`, `dashboard_widgets`, `dashboard_layouts` (44)
- **Impacto:** Falha total na aplicação do arquivo 22 se executado antes dos arquivos de definição
- **Root cause:** Separação indevida de DDL (schema) e DCL (RLS) em arquivos não ordenados corretamente

### AVISOS (WARNING)

#### 5. `skills.tenant_id` nullable com unique constraint

- **Arquivo:** `30_recruitment.sql` (linhas 8-19)
- **Problema:** `tenant_id uuid references public.tenants(id)` é nullable, e `uq_skills_tenant_name unique (tenant_id, name)` permite múltiplas skills globais com mesmo nome (PostgreSQL permite múltiplos NULL em unique)
- **Impacto:** Duplicação de skills globais
- **Recomendação:** Tornar `tenant_id NOT NULL` e usar um valor padrão, ou alterar a unique constraint para `(tenant_id, name) WHERE tenant_id IS NOT NULL`

#### 6. Tabelas sem `tenant_id` dependentes de tenant

- **Arquivos:** `03_crm.sql` (`company_contacts`), `04_rh_recruitment.sql` (`applications`, `application_status_history`, `interviews`), `09_chat.sql` (`chat_participants`, `chat_messages`, `chat_handoffs`, `ai_messages`), `33_employees.sql` (`employee_positions`, `employee_contracts`, `employee_documents`, `employee_status_history`)
- **Problema:** Essas tabelas herdam o tenant via FK em cascata (ex: applications -> candidates -> tenants), mas não possuem `tenant_id` próprio
- **Impacto:** Queries de tenant isolado requerem JOINs adicionais; risco de vazamento se RLS não cobrir todo o caminho
- **Recomendação:** Adicionar `tenant_id` denormalizado com trigger para sincronizar, ou garantir RLS em todas as tabelas pai

#### 7. Naming inconsistency: `first_login_state` (singular)

- **Arquivo:** `11_audit_security.sql` (linha 29)
- **Problema:** Todas as outras tabelas usam plural (`people`, `tenants`, `roles`, etc.), exceto `first_login_state`
- **Impacto:** Baixo — apenas consistência de código
- **Recomendação:** Renomear para `first_login_states`

#### 8. Colunas de status/enum sem CHECK constraints

- **Afeta:** ~80 tabelas com colunas `status`, `type`, `category`, `priority`, `direction`, `source`, `action`, `scope`, `event_type`, `operation`, `provider`, `model`, `payment_method`, `document_type`, `contract_type`, `role`, `recommendation`, `trigger_type`, `channel`
- **Problema:** Muitas colunas de texto aceitam valores arbitrários sem validação de domínio
- **Impacto:** Dados corrompidos por valores inválidos; dificulta migrações futuras
- **Recomendação:** Adicionar CHECK constraints ou ENUMs para colunas com domínio fechado

#### 9. Falta de `updated_at` em tabelas históricas/de log

- **Tabelas:** `chat_participants`, `chat_messages`, `ai_messages`, `chat_handoffs`, `company_contacts`, `stock_movements`, `stock_entries`, `purchase_receipt_items`, `application_status_history`, `audit_logs`, `security_events`, `domain_events`
- **Problema:** Sem `updated_at` não há rastreabilidade de alterações
- **Impacto:** Baixo para logs (append-only), moderado para tabelas históricas
- **Recomendação:** Avaliar caso a caso; para logs, `updated_at` é desnecessário

#### 10. `people.auth_user_id` unique mas nullable

- **Arquivo:** `01_core.sql` (linha 6)
- **Problema:** `auth_user_id uuid unique` permite múltiplas pessoas sem auth_user_id, e não garante 1:1 com auth.users
- **Impacto:** Risco de órfãos ou múltiplos registros para mesmo usuário Auth
- **Recomendação:** Adicionar `NOT NULL` após migração de dados existentes, ou usar trigger para garantir unicidade

#### 11. `role_assignments.tenant_id` nullable

- **Arquivo:** `02_rbac.sql` (linha 34)
- **Problema:** Permite assignments globais (tenant_id NULL) mas a UK `(person_id, role_id, tenant_id)` permite duplicatas com NULL
- **Impacto:** Comportamento ambíguo para roles globais vs tenant
- **Recomendação:** Documentar claramente; considerar separar `global_role_assignments`

#### 12. `invoices` e `financial_transactions` sem CHECK em `status`

- **Arquivo:** `27_finance.sql`
- **Problema:** `invoices.status` e outras colunas de status sem enum/check
- **Impacto:** Status inválidos podem ser inseridos
- **Recomendação:** Adicionar CHECK constraints alinhadas com o domínio

#### 13. `employees.employee_code` unique global

- **Arquivo:** `33_employees.sql` (linha 29)
- **Problema:** `employee_code text not null unique` é global (sem tenant_id na constraint)
- **Impacto:** Colisão de códigos entre tenants
- **Recomendação:** `unique (tenant_id, employee_code)`

#### 14. `purchase_order_items.total_price` sem validação

- **Arquivo:** `06_suppliers_purchasing.sql` (linha 32)
- **Problema:** `total_price numeric not null` sem CHECK ou generated column; pode divergir de `quantity * unit_price`
- **Impacto:** Inconsistência financeira
- **Recomendação:** Gerar via trigger ou application layer; adicionar CHECK `total_price = quantity * unit_price`

#### 15. `stock_movements.reference_id` sem tipo referenciado

- **Arquivo:** `07_inventory_custody.sql` (linha 21)
- **Problema:** `reference_id uuid` sem `reference_type` para identificar a tabela origem
- **Impacto:** Dificulta auditoria e rastreabilidade
- **Recomendação:** Adicionar `reference_type text` ou remover se não utilizado

---

## Recomendações

### 1. Consolidação de schemas duplicados

**Prioridade: CRÍTICA**

Resolver os conflitos de `service_orders` e `support_tickets` antes do deploy:

- Opção A: Remover `34_crm_services.sql` e `40_tasks_support.sql` (se forem versões antigas)
- Opção B: Consolidar as colunas faltantes de 05 em 34 e de 15 em 40, garantindo backward compatibility
- Opção C: Renomear uma das versões (ex: `service_orders_v2`) e criar migration

### 2. Reordenação dos arquivos de migração

**Prioridade: CRÍTICA**

Renumerar os arquivos para garantir ordem de dependência:

- `07_inventory_custody.sql` (products) deve executar **antes** de `06_suppliers_purchasing.sql` (que referencia products)
- `22_rls.sql` deve executar **após** todos os arquivos de DDL (01-21, 23, 25-44)
- Sugestão: mover RLS para o final da sequência ou separar em `99_rls.sql`

### 3. Padronização de CHECK constraints

**Prioridade: ALTA**

Adicionar CHECK constraints em todas as colunas com domínio fechado:

```sql
-- Exemplo para companies.status
alter table public.companies add constraint chk_companies_status check (status in ('active', 'inactive', 'suspended'));
```

### 4. Adição de `tenant_id` em tabelas dependentes

**Prioridade: MÉDIA**

Avaliar denormalização de `tenant_id` em:

- `applications`, `interviews`, `application_status_history`
- `chat_participants`, `chat_messages`, `chat_handoffs`, `ai_messages`
- `company_contacts`, `company_relationships`
- `employee_positions`, `employee_contracts`, `employee_documents`, `employee_status_history`

### 5. Naming convention enforcement

**Prioridade: BAIXA**

- Renomear `first_login_state` para `first_login_states`
- Padronizar sufixos: usar `_id` para todas as FKs (já está OK)
- Padronizar prefixos de índice: `idx_{table}_{column}` (já está OK)

### 6. Triggers de `updated_at` ausentes

**Prioridade: MÉDIA**

Adicionar triggers `set_updated_at` em tabelas que possuem `updated_at` mas não têm trigger:

- `applications`, `application_status_history`, `interviews`
- `company_relationships`, `company_contacts`
- `chat_participants`, `chat_messages`, `ai_messages`, `chat_handoffs`
- `stock_movements`, `stock_entries`, `purchase_receipt_items`
- `service_order_status_history`, `contract_status_history`
- `support_ticket_status_history` (em 15)

### 7. Validação de `employee_code` por tenant

**Prioridade: MÉDIA**

Alterar unique constraint:

```sql
alter table public.employees drop constraint employees_employee_code_key;
alter table public.employees add constraint uq_employees_tenant_code unique (tenant_id, employee_code);
```

### 8. Validação de integridade de `stock_movements`

**Prioridade: MÉDIA**

Adicionar CHECK constraint na coluna `movement_type`:

```sql
alter table public.stock_movements add constraint chk_stock_movements_type check (movement_type in ('entry', 'exit', 'transfer', 'adjustment', 'inventory', 'return'));
```

(Atualmente validado apenas via trigger em 21)

### 9. Documentação de soft-delete strategy

**Prioridade: BAIXA**

O schema atual usa `status` columns para exclusão lógica. Documentar a estratégia e garantir que todas as queries respeitem o filtro de status, ou adicionar `deleted_at` onde apropriado.

### 10. Migration safety

**Prioridade: ALTA**

Todos os `CREATE TABLE` devem usar `IF NOT EXISTS`, mas as redefinições (como em 34 e 40) devem ser convertidas em `ALTER TABLE` com adição de colunas, ou usar migrations versionadas (ex: Flyway, Sqitch) em vez de execução direta de arquivos.

---

## Sumário de Conformidade

| Critério                            | Status  | Observações                                       |
| ----------------------------------- | ------- | ------------------------------------------------- |
| PK em todas as tabelas              | PASS    | 100% das tabelas possuem PK                       |
| FKs válidas                         | FAIL    | 1 FK quebrada por ordem de execução + duplicidade |
| UNIQUE constraints                  | PASS    | Aplicados onde necessário                         |
| CHECK constraints                   | WARNING | ~80 colunas sem validação de domínio              |
| NOT NULL obrigatórias               | PASS    | Colunas críticas são NOT NULL                     |
| tenant_id em tabelas tenant-scoped  | WARNING | 15 tabelas dependentes sem tenant_id próprio      |
| Timestamps (created_at, updated_at) | WARNING | ~20 tabelas sem updated_at                        |
| Soft delete/versionamento           | WARNING | Uso de `status` sem padronização                  |
| Triggers de updated_at              | WARNING | ~15 tabelas com updated_at sem trigger            |
| Indexes básicos                     | PASS    | Cobertura abrangente em 23_indexes.sql            |
| RLS em tabelas tenant-scoped        | FAIL    | RLS definido antes das tabelas existirem          |
| Naming conventions                  | WARNING | 1 tabela singular; tipos/texto sem padronização   |

---

## Conclusão

O schema V2.1 apresenta **3 falhas críticas de estruturação** que impedem deploy direto:

1. Duplicidade de definições de tabela (`service_orders`, `support_tickets`)
2. Ordem de execução incorreta causando FK quebrada (`products` após `purchase_order_items`)
3. RLS aplicado antes das tabelas existirem

Recomenda-se **não executar** os arquivos na ordem atual. Corrigir a numeração/ordem dos arquivos e consolidar as definições duplicadas antes de qualquer deploy em produção.
