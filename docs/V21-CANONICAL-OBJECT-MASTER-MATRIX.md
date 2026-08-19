# V21 — Canonical Object Master Matrix

**Data:** 2026-08-19  
**Empresa:** J&S Empregos LTDA  
**Objetivo:** Mapear cada objeto V2.1 para exatamente uma fonte de verdade, identificando duplicatas, objetos ausentes, mesclagens e itens transversais.

---

## 1. Arquivos canônicos atuais vs. backup

| Arquivo atual               | Domínio atual        | Arquivo backup                                              | Status                                    |
| --------------------------- | -------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| 00_extensions.sql           | Extensions           | 00_extensions.sql                                           | ✅ Presente                               |
| 01_core.sql                 | Core/Tenancy         | 01_core.sql                                                 | ✅ Presente                               |
| 02_rbac.sql                 | RBAC                 | 03_rbac.sql                                                 | ✅ Presente (nome divergente)             |
| 03_crm.sql                  | CRM                  | 04_crm.sql                                                  | ✅ Presente (nome divergente)             |
| 04_rh_recruitment.sql       | RH+Recruitment       | 05_rh.sql + 06_recruitment.sql                              | ⚠️ Consolidado                            |
| 05_services_contracts.sql   | Services+Contracts   | 08_services.sql + 09_contracts.sql                          | ⚠️ Consolidado                            |
| 06_suppliers_purchasing.sql | Suppliers+Purchasing | 10_suppliers.sql + 13_purchasing.sql                        | ✅ Presente (mesclado)                    |
| 07_inventory_custody.sql    | Inventory+Custody    | 11_inventory.sql + 12_custody.sql                           | ⚠️ Consolidado + DUPLICADO                |
| 09_chat.sql                 | Chat                 | 17_chat.sql                                                 | ✅ Presente (nome divergente)             |
| 10_notifications_events.sql | Notifications+Events | 16_notifications.sql + 22_domain_events.sql + 23_outbox.sql | ⚠️ Consolidado                            |
| 11_audit_security.sql       | Audit+Security+LGPD  | 24_audit.sql + 25_security.sql + 26_lgpd.sql                | ⚠️ Consolidado                            |
| 12_custody.sql              | Custody              | 12_custody.sql                                              | ⚠️ DUPLICADO com 07_inventory_custody.sql |
| 14_tasks.sql                | Tasks                | 14_tasks.sql                                                | ✅ Presente                               |
| 15_support.sql              | Support              | 15_support.sql                                              | ✅ Presente                               |
| —                           | Employees            | 07_employees.sql                                            | ❌ Ausente                                |
| —                           | Finance              | 19_finance.sql                                              | ❌ Ausente (scaffold)                     |
| —                           | Fiscal               | 20_fiscal.sql                                               | ❌ Ausente (scaffold)                     |
| —                           | Documents            | 21_documents.sql                                            | ❌ Ausente (scaffold)                     |
| —                           | Functions            | 27_functions.sql                                            | ❌ Ausente (scaffold)                     |
| —                           | Triggers             | 28_triggers.sql                                             | ❌ Ausente (scaffold)                     |
| —                           | Indexes              | 29_indexes.sql                                              | ❌ Ausente (scaffold)                     |
| —                           | Views                | 30_views.sql                                                | ❌ Ausente (scaffold)                     |
| —                           | RLS                  | 31_rls.sql                                                  | ❌ Ausente (scaffold)                     |
| —                           | Seed                 | 32_seed.sql                                                 | ❌ Ausente (scaffold)                     |
| —                           | Validation           | 33_validation.sql                                           | ❌ Ausente (scaffold)                     |

---

## 2. Matriz mestra de objetos

| Object                         | Type                                | Current File                             | Backup File          | Source of Truth             | Status     | Duplicate | Action              |
| ------------------------------ | ----------------------------------- | ---------------------------------------- | -------------------- | --------------------------- | ---------- | --------- | ------------------- |
| people                         | TABLE                               | 01_core.sql                              | 01_core.sql          | 01_core.sql                 | PRESENT    | —         | NONE                |
| tenants                        | TABLE                               | 01_core.sql                              | 01_core.sql          | 01_core.sql                 | PRESENT    | —         | NONE                |
| tenant_memberships             | TABLE                               | 01_core.sql                              | 01_core.sql          | 01_core.sql                 | PRESENT    | —         | NONE                |
| tenant_settings                | TABLE                               | 01_core.sql                              | 01_core.sql          | 01_core.sql                 | PRESENT    | —         | NONE                |
| roles                          | TABLE                               | 02_rbac.sql                              | 03_rbac.sql          | 02_rbac.sql                 | PRESENT    | —         | NONE                |
| permissions                    | TABLE                               | 02_rbac.sql                              | 03_rbac.sql          | 02_rbac.sql                 | PRESENT    | —         | NONE                |
| role_permissions               | TABLE                               | 02_rbac.sql                              | 03_rbac.sql          | 02_rbac.sql                 | PRESENT    | —         | NONE                |
| role_assignments               | TABLE                               | 02_rbac.sql                              | 03_rbac.sql          | 02_rbac.sql                 | PRESENT    | —         | NONE                |
| role_resource_permissions      | TABLE                               | —                                        | 03_rbac.sql          | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| companies                      | TABLE                               | 03_crm.sql                               | 04_crm.sql           | 03_crm.sql                  | PRESENT    | —         | NONE                |
| company_relationships          | TABLE                               | 03_crm.sql                               | 04_crm.sql           | 03_crm.sql                  | PRESENT    | —         | NONE                |
| company_contacts               | TABLE                               | 03_crm.sql                               | 04_crm.sql           | 03_crm.sql                  | PRESENT    | —         | NONE                |
| candidates                     | TABLE                               | 04_rh_recruitment.sql                    | 05_rh.sql            | 04_rh_recruitment.sql       | PRESENT    | —         | NONE                |
| candidate_documents            | TABLE                               | —                                        | 05_rh.sql            | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| candidate_experiences          | TABLE                               | —                                        | 05_rh.sql            | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| candidate_education            | TABLE                               | —                                        | 05_rh.sql            | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| candidate_courses              | TABLE                               | —                                        | 05_rh.sql            | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| candidate_languages            | TABLE                               | —                                        | 05_rh.sql            | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| candidate_skills               | TABLE                               | —                                        | 05_rh.sql            | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| skills                         | TABLE                               | —                                        | 05_rh.sql            | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| stage_templates                | TABLE                               | —                                        | 06_recruitment.sql   | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| jobs                           | TABLE                               | 04_rh_recruitment.sql                    | 06_recruitment.sql   | 04_rh_recruitment.sql       | PRESENT    | —         | NONE                |
| job_skills                     | TABLE                               | —                                        | 06_recruitment.sql   | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| recruitment_processes          | TABLE                               | —                                        | 06_recruitment.sql   | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| recruitment_stages             | TABLE                               | —                                        | 06_recruitment.sql   | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| candidate_processes            | TABLE                               | —                                        | 06_recruitment.sql   | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| applications                   | TABLE                               | 04_rh_recruitment.sql                    | 06_recruitment.sql   | 04_rh_recruitment.sql       | PRESENT    | —         | NONE                |
| application_status_history     | TABLE                               | 04_rh_recruitment.sql                    | 06_recruitment.sql   | 04_rh_recruitment.sql       | PRESENT    | —         | NONE                |
| application_profile_snapshots  | TABLE                               | —                                        | 06_recruitment.sql   | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| interviews                     | TABLE                               | 04_rh_recruitment.sql                    | 06_recruitment.sql   | 04_rh_recruitment.sql       | PRESENT    | —         | NONE                |
| interview_participants         | TABLE                               | —                                        | 06_recruitment.sql   | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| interview_feedback             | TABLE                               | —                                        | 06_recruitment.sql   | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| services                       | TABLE                               | 05_services_contracts.sql                | 08_services.sql      | 05_services_contracts.sql   | PRESENT    | —         | NONE                |
| service_orders                 | TABLE                               | 05_services_contracts.sql                | 08_services.sql      | 05_services_contracts.sql   | PRESENT    | —         | NONE                |
| service_order_status_history   | TABLE                               | 05_services_contracts.sql                | 08_services.sql      | 05_services_contracts.sql   | PRESENT    | —         | NONE                |
| contracts                      | TABLE                               | 05_services_contracts.sql                | 09_contracts.sql     | 05_services_contracts.sql   | PRESENT    | —         | NONE                |
| contract_items                 | TABLE                               | —                                        | 09_contracts.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| contract_services              | TABLE                               | —                                        | 09_contracts.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| contract_status_history        | TABLE                               | 05_services_contracts.sql                | 09_contracts.sql     | 05_services_contracts.sql   | PRESENT    | —         | NONE                |
| contract_documents             | TABLE                               | —                                        | 09_contracts.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| contract_versions              | TABLE                               | —                                        | 09_contracts.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| contract_obligations           | TABLE                               | —                                        | 09_contracts.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| contract_renewals              | TABLE                               | —                                        | 09_contracts.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| employees                      | TABLE                               | —                                        | 07_employees.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| employee_contracts             | TABLE                               | —                                        | 07_employees.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| employee_documents             | TABLE                               | —                                        | 07_employees.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| employee_status_history        | TABLE                               | —                                        | 07_employees.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| departments                    | TABLE                               | —                                        | 07_employees.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| positions                      | TABLE                               | —                                        | 07_employees.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| employee_positions             | TABLE                               | —                                        | 07_employees.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| suppliers                      | TABLE                               | 06_suppliers_purchasing.sql              | 10_suppliers.sql     | 06_suppliers_purchasing.sql | PRESENT    | —         | NONE                |
| purchase_orders                | TABLE                               | 06_suppliers_purchasing.sql              | 13_purchasing.sql    | 06_suppliers_purchasing.sql | PRESENT    | —         | NONE                |
| purchase_order_items           | TABLE                               | 06_suppliers_purchasing.sql              | 13_purchasing.sql    | 06_suppliers_purchasing.sql | PRESENT    | —         | NONE                |
| products                       | TABLE                               | 07_inventory_custody.sql                 | 11_inventory.sql     | 07_inventory_custody.sql    | PRESENT    | —         | NONE                |
| product_categories             | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| warehouses                     | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| warehouse_locations            | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| stock_balances                 | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| stock_movements                | TABLE                               | 07_inventory_custody.sql                 | 11_inventory.sql     | 07_inventory_custody.sql    | PRESENT    | —         | NONE                |
| stock_entries                  | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| stock_exits                    | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| stock_inventory                | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| stock_inventory_items          | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| stock_adjustments              | TABLE                               | —                                        | 11_inventory.sql     | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |
| third_party_custody            | TABLE                               | 07_inventory_custody.sql, 12_custody.sql | 12_custody.sql       | 12_custody.sql              | DUPLICATED | DUPLICATE | REMOVE_DUPLICATE    |
| third_party_custody_items      | TABLE                               | 07_inventory_custody.sql, 12_custody.sql | 12_custody.sql       | 12_custody.sql              | DUPLICATED | DUPLICATE | REMOVE_DUPLICATE    |
| notifications                  | TABLE                               | 10_notifications_events.sql              | 16_notifications.sql | 10_notifications_events.sql | PRESENT    | —         | NONE                |
| notification_deliveries        | TABLE                               | 10_notifications_events.sql              | 16_notifications.sql | 10_notifications_events.sql | PRESENT    | —         | NONE                |
| domain_events                  | TABLE                               | 10_notifications_events.sql              | 22_domain_events.sql | 10_notifications_events.sql | PRESENT    | —         | NONE                |
| event_outbox                   | TABLE                               | 10_notifications_events.sql              | 23_outbox.sql        | 10_notifications_events.sql | PRESENT    | —         | NONE                |
| event_deliveries               | TABLE                               | 10_notifications_events.sql              | 23_outbox.sql        | 10_notifications_events.sql | PRESENT    | —         | NONE                |
| audit_logs                     | TABLE                               | 11_audit_security.sql                    | 24_audit.sql         | 11_audit_security.sql       | PRESENT    | —         | NONE                |
| security_events                | TABLE                               | 11_audit_security.sql                    | 25_security.sql      | 11_audit_security.sql       | PRESENT    | —         | NONE                |
| first_login_state              | TABLE                               | 11_audit_security.sql                    | 25_security.sql      | 11_audit_security.sql       | PRESENT    | —         | NONE                |
| legal_acceptances              | TABLE                               | 11_audit_security.sql                    | 26_lgpd.sql          | 11_audit_security.sql       | PRESENT    | —         | NONE                |
| chat_rooms                     | TABLE                               | 09_chat.sql                              | 17_chat.sql          | 09_chat.sql                 | PRESENT    | —         | NONE                |
| chat_participants              | TABLE                               | 09_chat.sql                              | 17_chat.sql          | 09_chat.sql                 | PRESENT    | —         | NONE                |
| chat_messages                  | TABLE                               | 09_chat.sql                              | 17_chat.sql          | 09_chat.sql                 | PRESENT    | —         | NONE                |
| ai_conversations               | TABLE                               | 09_chat.sql                              | 17_chat.sql          | 09_chat.sql                 | PRESENT    | —         | NONE                |
| ai_messages                    | TABLE                               | 09_chat.sql                              | 17_chat.sql          | 09_chat.sql                 | PRESENT    | —         | NONE                |
| chat_handoffs                  | TABLE                               | 09_chat.sql                              | 17_chat.sql          | 09_chat.sql                 | PRESENT    | —         | NONE                |
| tasks                          | TABLE                               | 14_tasks.sql                             | 14_tasks.sql         | 14_tasks.sql                | PRESENT    | —         | NONE                |
| support_tickets                | TABLE                               | 15_support.sql                           | 15_support.sql       | 15_support.sql              | PRESENT    | —         | NONE                |
| support_ticket_status_history  | TABLE                               | 15_support.sql                           | 15_support.sql       | 15_support.sql              | PRESENT    | —         | NONE                |
| support_ticket_messages        | TABLE                               | —                                        | (build spec)         | MISSING                     | ABSENT     | —         | VERIFY              |
| support_ticket_assignments     | TABLE                               | —                                        | (build spec)         | MISSING                     | ABSENT     | —         | VERIFY              |
| support_ticket_categories      | TABLE                               | —                                        | (build spec)         | MISSING                     | ABSENT     | —         | VERIFY              |
| files                          | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| file_access_logs               | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| candidate_favorite_jobs        | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| interactions                   | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| financial_accounts             | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| financial_categories           | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| cost_centers                   | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| accounts_receivable            | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| accounts_payable               | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| invoices                       | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| invoice_items                  | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| payments                       | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| expenses                       | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| revenues                       | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| fiscal_configurations          | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| fiscal_integrations            | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| fiscal_documents               | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| fiscal_document_items          | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| fiscal_document_events         | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| fiscal_document_status_history | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| fiscal_api_requests            | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| fiscal_api_responses           | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| document_versions              | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| document_links                 | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| privacy_requests               | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| data_export_requests           | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| data_deletion_requests         | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| data_retention_policies        | TABLE                               | —                                        | (docs/sql)           | MISSING                     | ABSENT     | —         | VERIFY              |
| (transversals)                 | FUNC/TRIG/INDEX/VIEW/RLS/SEED/VALID | —                                        | 27-33                | MISSING                     | ABSENT     | —         | RESTORE_FROM_BACKUP |

---

## 3. Lista de objetos duplicados

| Object                    | Files                                    | Action           |
| ------------------------- | ---------------------------------------- | ---------------- |
| third_party_custody       | 07_inventory_custody.sql, 12_custody.sql | REMOVE_DUPLICATE |
| third_party_custody_items | 07_inventory_custody.sql, 12_custody.sql | REMOVE_DUPLICATE |

---

## 4. Lista de objetos ausentes

| Object                        | Expected backup file | Action              |
| ----------------------------- | -------------------- | ------------------- |
| role_resource_permissions     | 03_rbac.sql          | RESTORE_FROM_BACKUP |
| candidate_documents           | 05_rh.sql            | RESTORE_FROM_BACKUP |
| candidate_experiences         | 05_rh.sql            | RESTORE_FROM_BACKUP |
| candidate_education           | 05_rh.sql            | RESTORE_FROM_BACKUP |
| candidate_courses             | 05_rh.sql            | RESTORE_FROM_BACKUP |
| candidate_languages           | 05_rh.sql            | RESTORE_FROM_BACKUP |
| candidate_skills              | 05_rh.sql            | RESTORE_FROM_BACKUP |
| skills                        | 05_rh.sql            | RESTORE_FROM_BACKUP |
| stage_templates               | 06_recruitment.sql   | RESTORE_FROM_BACKUP |
| job_skills                    | 06_recruitment.sql   | RESTORE_FROM_BACKUP |
| recruitment_processes         | 06_recruitment.sql   | RESTORE_FROM_BACKUP |
| recruitment_stages            | 06_recruitment.sql   | RESTORE_FROM_BACKUP |
| candidate_processes           | 06_recruitment.sql   | RESTORE_FROM_BACKUP |
| application_profile_snapshots | 06_recruitment.sql   | RESTORE_FROM_BACKUP |
| interview_participants        | 06_recruitment.sql   | RESTORE_FROM_BACKUP |
| interview_feedback            | 06_recruitment.sql   | RESTORE_FROM_BACKUP |
| contract_items                | 09_contracts.sql     | RESTORE_FROM_BACKUP |
| contract_services             | 09_contracts.sql     | RESTORE_FROM_BACKUP |
| contract_documents            | 09_contracts.sql     | RESTORE_FROM_BACKUP |
| contract_versions             | 09_contracts.sql     | RESTORE_FROM_BACKUP |
| contract_obligations          | 09_contracts.sql     | RESTORE_FROM_BACKUP |
| contract_renewals             | 09_contracts.sql     | RESTORE_FROM_BACKUP |
| employees                     | 07_employees.sql     | RESTORE_FROM_BACKUP |
| employee_contracts            | 07_employees.sql     | RESTORE_FROM_BACKUP |
| employee_documents            | 07_employees.sql     | RESTORE_FROM_BACKUP |
| employee_status_history       | 07_employees.sql     | RESTORE_FROM_BACKUP |
| departments                   | 07_employees.sql     | RESTORE_FROM_BACKUP |
| positions                     | 07_employees.sql     | RESTORE_FROM_BACKUP |
| employee_positions            | 07_employees.sql     | RESTORE_FROM_BACKUP |
| product_categories            | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| warehouses                    | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| warehouse_locations           | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| stock_balances                | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| stock_entries                 | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| stock_exits                   | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| stock_inventory               | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| stock_inventory_items         | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| stock_adjustments             | 11_inventory.sql     | RESTORE_FROM_BACKUP |
| support_ticket_messages       | build spec           | VERIFY              |
| support_ticket_assignments    | build spec           | VERIFY              |
| support_ticket_categories     | build spec           | VERIFY              |

---

## 5. Lista de objetos mesclados

| Current file                | Backup files merged                                         | Objects                                                                                                     |
| --------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 04_rh_recruitment.sql       | 05_rh.sql + 06_recruitment.sql                              | candidates, jobs, applications, application_status_history, interviews + missing extras                     |
| 05_services_contracts.sql   | 08_services.sql + 09_contracts.sql                          | services, service_orders, service_order_status_history, contracts, contract_status_history + missing extras |
| 06_suppliers_purchasing.sql | 10_suppliers.sql + 13_purchasing.sql                        | suppliers, purchase_orders, purchase_order_items                                                            |
| 07_inventory_custody.sql    | 11_inventory.sql + 12_custody.sql                           | products, stock_movements + missing inventory extras + custody extras                                       |
| 09_chat.sql                 | 17_chat.sql                                                 | chat_rooms, chat_participants, chat_messages, ai_conversations, ai_messages, chat_handoffs                  |
| 10_notifications_events.sql | 16_notifications.sql + 22_domain_events.sql + 23_outbox.sql | notifications, notification_deliveries, domain_events, event_outbox, event_deliveries                       |
| 11_audit_security.sql       | 24_audit.sql + 25_security.sql + 26_lgpd.sql                | audit_logs, security_events, first_login_state, legal_acceptances                                           |

---

## 6. Objetos exclusivamente transversais

| Object       | Type       | Backup file       | Status   |
| ------------ | ---------- | ----------------- | -------- |
| (functions)  | FUNCTION   | 27_functions.sql  | SCAFFOLD |
| (triggers)   | TRIGGER    | 28_triggers.sql   | SCAFFOLD |
| (indexes)    | INDEX      | 29_indexes.sql    | SCAFFOLD |
| (views)      | VIEW       | 30_views.sql      | SCAFFOLD |
| (rls)        | POLICY     | 31_rls.sql        | SCAFFOLD |
| (seed)       | SEED       | 32_seed.sql       | SCAFFOLD |
| (validation) | VALIDATION | 33_validation.sql | SCAFFOLD |

---

## 7. Proposta de árvore final 00→33

Opção A — Manter mesclagens atuais, restaurar apenas ausentes:

- 00_extensions.sql
- 01_core.sql
- 02_rbac.sql
- 03_crm.sql
- 04_rh_recruitment.sql (+ restaurar objetos ausentes de RH/Recruitment)
- 05_services_contracts.sql (+ restaurar objetos ausentes de Contracts)
- 06_suppliers_purchasing.sql
- 07_inventory_custody.sql (remover custódia duplicada; restaurar objetos ausentes de Inventory)
- 08_employees.sql (novo/restaurado)
- 09_chat.sql
- 10_notifications_events.sql
- 11_audit_security.sql
- 12_custody.sql (fonte única)
- 13_purchasing.sql (mesclado em 06; manter opcional)
- 14_tasks.sql
- 15_support.sql
- 16_notifications.sql (mesclado em 10; manter opcional)
- 17_chat.sql (mesclado em 09; manter opcional)
- 18_storage.sql (scaffold)
- 19_finance.sql (scaffold)
- 20_fiscal.sql (scaffold)
- 21_documents.sql (scaffold)
- 22_domain_events.sql (mesclado em 10; manter opcional)
- 23_outbox.sql (mesclado em 10; manter opcional)
- 24_audit.sql (mesclado em 11; manter opcional)
- 25_security.sql (mesclado em 11; manter opcional)
- 26_lgpd.sql (mesclado em 11; manter opcional)
- 27_functions.sql
- 28_triggers.sql
- 29_indexes.sql
- 30_views.sql
- 31_rls.sql
- 32_seed.sql
- 33_validation.sql

Opção B — Separar domínios em arquivos individuais:

- Reconstruir 00→33 exatamente como backup, eliminando mesclagens.
- Mais trabalho, mas elimina duplicidade e sobreposição.

---

## 8. Gates já aprovados

| Gate | Domínio    | Resultado |
| ---- | ---------- | --------- |
| D.12 | Custody    | PASS      |
| D.13 | Purchasing | PASS      |
| D.14 | Tasks      | PASS      |
| D.15 | Support    | PASS      |

---

## 9. Próximos passos sugeridos

1. Decidir entre Opção A (mesclagens mantidas) ou Opção B (separação total).
2. Se Opção A: restaurar objetos ausentes nos arquivos mesclados correspondentes.
3. Se Opção B: reconstruir árvore 00→33 a partir do backup, validando cada stage.
4. Remover duplicidade em 07_inventory_custody.sql vs 12_custody.sql.
5. Implementar transversais (27→33) apenas no gate correspondente.
6. Só então prosseguir para D.16 Notifications.

---

**Checkpoint:**

- Nenhum arquivo alterado.
- Nenhuma migration executada.
- Supabase remoto não alterado.
- Frontend não alterado.
