# V2.1 — Post-Fix Snapshot Consistency Check

**Branch:** `feat/database-v21-local-rebuild`
**Commit:** `fb75dff` (HEAD)
**Data:** 2026-08-21

Referências comparadas:

- `docs/V21-DATABASE-CANONICAL-SNAPSHOT.md` (snapshot base, commit `7c2aa30`)
- `docs/V21-DATABASE-FINAL-MATRIX.md`
- `docs/V21-GAP-CLOSURE-MATRIX.md`

---

## 1. Objetivo

Verificar se o estado atual do schema (`supabase/specs/sql/00-44`) é consistente com os documentos de referência e identificar drift.

---

## 2. Tabelas

### 2.1 Presentes no snapshot, confirmadas no código

| Tabela                              | Arquivo                        | Status            |
| ----------------------------------- | ------------------------------ | ----------------- |
| people                              | 01_core.sql                    | CONFIRMADO        |
| tenants                             | 01_core.sql                    | CONFIRMADO        |
| tenant_memberships                  | 01_core.sql                    | CONFIRMADO        |
| tenant_settings                     | 01_core.sql                    | CONFIRMADO        |
| roles                               | 02_rbac.sql                    | CONFIRMADO        |
| permissions                         | 02_rbac.sql                    | CONFIRMADO        |
| role_permissions                    | 02_rbac.sql                    | CONFIRMADO        |
| role_assignments                    | 02_rbac.sql                    | CONFIRMADO        |
| companies                           | 03_crm.sql                     | CONFIRMADO        |
| company_relationships               | 03_crm.sql                     | CONFIRMADO        |
| company_contacts                    | 03_crm.sql                     | CONFIRMADO        |
| company_services                    | 03_crm.sql                     | CONFIRMADO        |
| candidates                          | 04_rh_recruitment.sql          | CONFIRMADO        |
| applications                        | 04_rh_recruitment.sql          | CONFIRMADO        |
| application_status_history          | 04_rh_recruitment.sql          | CONFIRMADO        |
| interviews                          | 04_rh_recruitment.sql          | CONFIRMADO        |
| services                            | 05_services_contracts.sql      | CONFIRMADO (órfã) |
| contracts                           | 05_services_contracts.sql      | CONFIRMADO        |
| contract_status_history             | 05_services_contracts.sql      | CONFIRMADO        |
| products                            | 06b_products.sql               | CONFIRMADO        |
| suppliers                           | 06_suppliers_purchasing.sql    | CONFIRMADO        |
| purchase_orders                     | 06_suppliers_purchasing.sql    | CONFIRMADO        |
| purchase_order_items                | 06_suppliers_purchasing.sql    | CONFIRMADO        |
| warehouses                          | 07_inventory_custody.sql       | CONFIRMADO        |
| warehouse_locations                 | 07_inventory_custody.sql       | CONFIRMADO        |
| third_party_custody                 | 07_inventory_custody.sql       | CONFIRMADO        |
| third_party_custody_items           | 07_inventory_custody.sql       | CONFIRMADO        |
| stock_movements                     | 07_inventory_custody.sql       | CONFIRMADO        |
| stock_balances                      | 07_inventory_custody.sql       | CONFIRMADO        |
| stock_entries                       | 07_inventory_custody.sql       | CONFIRMADO        |
| chat_rooms                          | 09_chat.sql                    | CONFIRMADO        |
| chat_participants                   | 09_chat.sql                    | CONFIRMADO        |
| chat_messages                       | 09_chat.sql                    | CONFIRMADO        |
| ai_conversations                    | 09_chat.sql                    | CONFIRMADO        |
| ai_messages                         | 09_chat.sql                    | CONFIRMADO        |
| notifications                       | 10_notifications_events.sql    | CONFIRMADO        |
| notification_deliveries             | 10_notifications_events.sql    | CONFIRMADO        |
| domain_events                       | 10_notifications_events.sql    | CONFIRMADO        |
| event_outbox                        | 10_notifications_events.sql    | CONFIRMADO        |
| event_deliveries                    | 10_notifications_events.sql    | CONFIRMADO        |
| audit_logs                          | 11_audit_security.sql          | CONFIRMADO        |
| security_events                     | 11_audit_security.sql          | CONFIRMADO        |
| files                               | 18_storage_documents.sql       | CONFIRMADO        |
| file_access_logs                    | 18_storage_documents.sql       | CONFIRMADO        |
| document_versions                   | 18_storage_documents.sql       | CONFIRMADO        |
| document_links                      | 18_storage_documents.sql       | CONFIRMADO        |
| consents                            | 20_lgpd.sql                    | CONFIRMADO        |
| privacy_requests                    | 20_lgpd.sql                    | CONFIRMADO        |
| data_export_requests                | 20_lgpd.sql                    | CONFIRMADO        |
| data_deletion_requests              | 20_lgpd.sql                    | CONFIRMADO        |
| data_retention_policies             | 20_lgpd.sql                    | CONFIRMADO        |
| legal_acceptances                   | 20_lgpd.sql                    | CONFIRMADO        |
| first_login_state                   | 11_audit_security.sql          | CONFIRMADO        |
| password_policies                   | 11_audit_security.sql          | CONFIRMADO        |
| sessions                            | 11_audit_security.sql          | CONFIRMADO        |
| employees                           | 33_employees.sql               | CONFIRMADO        |
| departments                         | 33_employees.sql               | CONFIRMADO        |
| positions                           | 33_employees.sql               | CONFIRMADO        |
| employee_positions                  | 33_employees.sql               | CONFIRMADO        |
| employee_contracts                  | 33_employees.sql               | CONFIRMADO        |
| employee_documents                  | 33_employees.sql               | CONFIRMADO        |
| employee_status_history             | 33_employees.sql               | CONFIRMADO        |
| service_orders                      | 34_crm_services.sql            | CONFIRMADO        |
| service_order_items                 | 34_crm_services.sql            | CONFIRMADO        |
| service_acceptances                 | 34_crm_services.sql            | CONFIRMADO        |
| service_executions                  | 34_crm_services.sql            | CONFIRMADO        |
| service_attachments                 | 34_crm_services.sql            | CONFIRMADO        |
| interactions                        | 03_crm.sql                     | CONFIRMADO        |
| recruitment_demands                 | 03_crm.sql                     | CONFIRMADO        |
| talent_pool_memberships             | 35_recruitment_talent_pool.sql | CONFIRMADO        |
| job_matches                         | 35_recruitment_talent_pool.sql | CONFIRMADO        |
| candidate_profile_views             | 35_recruitment_talent_pool.sql | CONFIRMADO        |
| candidate_documents                 | 04_rh_recruitment.sql          | CONFIRMADO        |
| candidate_experiences               | 04_rh_recruitment.sql          | CONFIRMADO        |
| candidate_education                 | 04_rh_recruitment.sql          | CONFIRMADO        |
| candidate_courses                   | 04_rh_recruitment.sql          | CONFIRMADO        |
| candidate_languages                 | 04_rh_recruitment.sql          | CONFIRMADO        |
| candidate_skills                    | 04_rh_recruitment.sql          | CONFIRMADO        |
| job_skills                          | 30_recruitment.sql             | CONFIRMADO        |
| stage_templates                     | 30_recruitment.sql             | CONFIRMADO        |
| recruitment_processes               | 30_recruitment.sql             | CONFIRMADO        |
| recruitment_stages                  | 30_recruitment.sql             | CONFIRMADO        |
| candidate_processes                 | 30_recruitment.sql             | CONFIRMADO        |
| application_profile_snapshots       | 04_rh_recruitment.sql          | CONFIRMADO        |
| interview_participants              | 04_rh_recruitment.sql          | CONFIRMADO        |
| interview_feedback                  | 04_rh_recruitment.sql          | CONFIRMADO        |
| products                            | 06b_products.sql               | CONFIRMADO        |
| product_categories                  | 36_inventory.sql               | CONFIRMADO        |
| stock_lots                          | 36_inventory.sql               | CONFIRMADO        |
| stock_inventory                     | 36_inventory.sql               | CONFIRMADO        |
| stock_inventory_items               | 36_inventory.sql               | CONFIRMADO        |
| purchase_requests                   | 37_purchasing.sql              | CONFIRMADO        |
| purchase_request_items              | 37_purchasing.sql              | CONFIRMADO        |
| purchase_quotations                 | 37_purchasing.sql              | CONFIRMADO        |
| purchase_quotation_items            | 37_purchasing.sql              | CONFIRMADO        |
| purchase_status_history             | 06_suppliers_purchasing.sql    | CONFIRMADO        |
| purchase_receipts                   | 06_suppliers_purchasing.sql    | CONFIRMADO        |
| purchase_receipt_items              | 06_suppliers_purchasing.sql    | CONFIRMADO        |
| purchase_receipt_divergences        | 37_purchasing.sql              | CONFIRMADO        |
| invoices                            | 27_finance.sql                 | CONFIRMADO        |
| invoice_items                       | 27_finance.sql                 | CONFIRMADO        |
| financial_categories                | 27_finance.sql                 | CONFIRMADO        |
| cost_centers                        | 27_finance.sql                 | CONFIRMADO        |
| accounts_receivable                 | 27_finance.sql                 | CONFIRMADO        |
| accounts_payable                    | 27_finance.sql                 | CONFIRMADO        |
| payments                            | 27_finance.sql                 | CONFIRMADO        |
| receipts                            | 27_finance.sql                 | CONFIRMADO        |
| financial_transactions              | 27_finance.sql                 | CONFIRMADO        |
| bank_reconciliations                | 27_finance.sql                 | CONFIRMADO        |
| financial_installments              | 27_finance.sql                 | CONFIRMADO        |
| financial_installment_payments      | 27_finance.sql                 | CONFIRMADO        |
| financial_installment_cancellations | 27_finance.sql                 | CONFIRMADO        |
| financial_accounts                  | 27_finance.sql                 | CONFIRMADO        |
| fiscal_configurations               | 28_fiscal.sql                  | CONFIRMADO        |
| tax_rates                           | 28_fiscal.sql                  | CONFIRMADO        |
| tax_calculations                    | 28_fiscal.sql                  | CONFIRMADO        |
| fiscal_documents                    | 28_fiscal.sql                  | CONFIRMADO        |
| fiscal_document_items               | 28_fiscal.sql                  | CONFIRMADO        |
| fiscal_document_status_history      | 28_fiscal.sql                  | CONFIRMADO        |
| fiscal_api_requests                 | 28_fiscal.sql                  | CONFIRMADO        |
| fiscal_api_responses                | 28_fiscal.sql                  | CONFIRMADO        |
| fiscal_document_events              | 28_fiscal.sql                  | CONFIRMADO        |
| fiscal_integrations                 | 39_fiscal.sql                  | CONFIRMADO        |
| pos_terminals                       | 29_pos.sql                     | CONFIRMADO        |
| pos_cashiers                        | 29_pos.sql                     | CONFIRMADO        |
| pos_operators                       | 29_pos.sql                     | CONFIRMADO        |
| pos_cashier_sessions                | 29_pos.sql                     | CONFIRMADO        |
| pos_sales                           | 29_pos.sql                     | CONFIRMADO        |
| pos_sale_items                      | 29_pos.sql                     | CONFIRMADO        |
| pos_payments                        | 29_pos.sql                     | CONFIRMADO        |
| pos_cancellations                   | 29_pos.sql                     | CONFIRMADO        |
| pos_returns                         | 29_pos.sql                     | CONFIRMADO        |
| pos_cash_movements                  | 29_pos.sql                     | CONFIRMADO        |
| pos_daily_closures                  | 29_pos.sql                     | CONFIRMADO        |
| tasks                               | 14_tasks.sql                   | CONFIRMADO        |
| task_comments                       | 40_tasks_support.sql           | CONFIRMADO        |
| task_attachments                    | 40_tasks_support.sql           | CONFIRMADO        |
| task_status_history                 | 14_tasks.sql                   | CONFIRMADO        |
| support_ticket_categories           | 15_support.sql                 | CONFIRMADO        |
| support_tickets                     | 40_tasks_support.sql           | CONFIRMADO        |
| support_ticket_messages             | 40_tasks_support.sql           | CONFIRMADO        |
| support_ticket_assignments          | 40_tasks_support.sql           | CONFIRMADO        |
| support_ticket_status_history       | 40_tasks_support.sql           | CONFIRMADO        |
| chat_handoffs                       | 09_chat.sql                    | CONFIRMADO        |
| ai_usage                            | 41_chat_security.sql           | CONFIRMADO        |
| automation_templates                | 31_automation.sql              | CONFIRMADO        |
| notification_preferences            | 10_notifications_events.sql    | CONFIRMADO        |
| report_definitions                  | 44_reports_views.sql           | CONFIRMADO        |
| report_executions                   | 44_reports_views.sql           | CONFIRMADO        |
| report_schedules                    | 44_reports_views.sql           | CONFIRMADO        |
| dashboard_widgets                   | 44_reports_views.sql           | CONFIRMADO        |
| dashboard_layouts                   | 44_reports_views.sql           | CONFIRMADO        |
| webhook_deliveries                  | 31_automation.sql              | CONFIRMADO        |
| automation_jobs                     | 31_automation.sql              | CONFIRMADO        |
| automation_executions               | 31_automation.sql              | CONFIRMADO        |
| skills                              | 30_recruitment.sql             | CONFIRMADO        |
| administrative_requests             | 44_reports_views.sql           | CONFIRMADO        |
| administrative_tasks                | 44_reports_views.sql           | CONFIRMADO        |
| administrative_approvals            | 44_reports_views.sql           | CONFIRMADO        |
| administrative_documents            | 44_reports_views.sql           | CONFIRMADO        |
| validation_results                  | 25_validation.sql              | CONFIRMADO        |

### 2.2 Drift identificado

| Item                                | Snapshot            | Estado Atual              | Status                         |
| ----------------------------------- | ------------------- | ------------------------- | ------------------------------ |
| service_orders duplicada            | Presente em 05 + 34 | Apenas em 34              | DRIFT — snapshot desatualizado |
| support_tickets duplicada           | Presente em 15 + 40 | Apenas em 40              | DRIFT — snapshot desatualizado |
| RLS em 47 tabelas                   | Ausente             | Presente para 158 tabelas | DRIFT — snapshot desatualizado |
| 6 tabelas financeiras sem RLS       | Ausente no snapshot | Ainda ausentes no código  | CONFIRMADO — gap persiste      |
| Policies DELETE                     | Ausentes            | Ausentes                  | CONFIRMADO — mantido           |
| Arquivos 08, 13, 16, 17, 19, 24, 38 | Ausentes            | Ausentes                  | CONFIRMADO — intencional       |

---

## 3. Functions e RPCs

| Função                     | Arquivo | Snapshot | Estado Atual              | Status     |
| -------------------------- | ------- | -------- | ------------------------- | ---------- |
| user_has_permission        | 21      | Presente | Presente                  | CONFIRMADO |
| user_permissions           | 21      | Presente | Presente                  | CONFIRMADO |
| is_tenant_member           | 22      | Presente | Presente                  | CONFIRMADO |
| is_admin_master            | 22      | Presente | Presente                  | CONFIRMADO |
| user_tenant_ids            | 22      | Presente | Presente                  | CONFIRMADO |
| fiscal_emit_invoice        | 39      | Presente | Presente (protegido)      | CONFIRMADO |
| fiscal_cancel_invoice      | 39      | Presente | Presente (protegido)      | CONFIRMADO |
| financial_reversal         | 27      | Presente | Presente (sem proteção)   | CONFIRMADO |
| match_candidates_to_demand | 35      | Presente | Presente (desautenticado) | CONFIRMADO |

---

## 4. Views

| View             | Arquivo | Snapshot | Estado Atual                 | Status     |
| ---------------- | ------- | -------- | ---------------------------- | ---------- |
| financial_kpis   | 27      | Presente | Presente (com filtro tenant) | CONFIRMADO |
| recruitment_kpis | 30      | Presente | Presente (com filtro tenant) | CONFIRMADO |

---

## 5. Matriz Final Matrix

| Domínio      | Regra                  | Snapshot | Estado Atual | Status     |
| ------------ | ---------------------- | -------- | ------------ | ---------- |
| Core         | People-First identity  | 🟢       | 🟢           | CONFIRMADO |
| Core         | Tenant membership      | 🟢       | 🟢           | CONFIRMADO |
| Core         | RBAC                   | 🟢       | 🟢           | CONFIRMADO |
| CRM          | Empresas               | 🟢       | 🟢           | CONFIRMADO |
| CRM          | Relacionamentos        | 🟢       | 🟢           | CONFIRMADO |
| RH           | Candidatos             | 🟢       | 🟢           | CONFIRMADO |
| RH           | Candidaturas           | 🟢       | 🟢           | CONFIRMADO |
| RH           | Entrevistas            | 🟢       | 🟢           | CONFIRMADO |
| RH           | Publicar vaga          | 🟡       | 🟡           | CONFIRMADO |
| RH           | Aprovar candidato      | 🟡       | 🟡           | CONFIRMADO |
| Serviços     | Ordem de serviço       | 🟡       | 🟡           | CONFIRMADO |
| Contratos    | Vencimento/renovação   | 🟡       | 🟡           | CONFIRMADO |
| Estoque      | Entrada/saída/ajuste   | 🟡       | 🟡           | CONFIRMADO |
| Almoxarifado | Custódia               | 🔵       | 🔵           | CONFIRMADO |
| Financeiro   | Contas a receber/pagar | 🟡       | 🟡           | CONFIRMADO |
| Fiscal       | Documento fiscal       | 🟡       | 🟡           | CONFIRMADO |
| Atendimento  | SLA/ticket             | 🟡       | 🟡           | CONFIRMADO |
| Chat         | IA/humano/handoff      | 🟢       | 🟢           | CONFIRMADO |
| Notificações | E-mail/WhatsApp        | 🟢       | 🟢           | CONFIRMADO |
| Automação    | Eventos/outbox         | 🟡       | 🟡           | CONFIRMADO |
| LGPD         | Consentimento/aceite   | 🟡       | 🟡           | CONFIRMADO |
| Segurança    | First login            | 🟡       | 🟡           | CONFIRMADO |
| Relatórios   | Dashboard/executivo    | 🔴       | 🔴           | CONFIRMADO |

---

## 6. Gap Closure Matrix

| Gap ID | Descrição                   | Status no Snapshot | Status Atual | Observação   |
| ------ | --------------------------- | ------------------ | ------------ | ------------ |
| 06-01  | invoices ausente            | 🔵                 | 🟢           | Implementado |
| 06-02  | invoice_items ausente       | 🔵                 | 🟢           | Implementado |
| 02-01  | employees ausente           | 🔵                 | 🟢           | Implementado |
| 02-02  | employee_contracts ausente  | 🔵                 | 🟢           | Implementado |
| 04-01  | warehouses ausente          | 🔵                 | 🟢           | Implementado |
| 04-02  | warehouse_locations ausente | 🔵                 | 🟢           | Implementado |
| 05-01  | purchase_requests ausente   | 🔵                 | 🟢           | Implementado |

Todos os gaps classificados como CONFIRMED no snapshot foram implementados. O estado atual é consistente com a Gap Closure Matrix.

---

## 7. Veredito Final

| Item                                                 | Status                          |
| ---------------------------------------------------- | ------------------------------- |
| Todas as tabelas do snapshot existem no código atual | CONFIRMADO                      |
| Nenhuma tabela duplicada                             | CONFIRMADO                      |
| Drift entre snapshot e código atual                  | EXISTE — snapshot desatualizado |
| Gap Closure Matrix consistente com código            | CONFIRMADO                      |
| Final Matrix consistente com código                  | CONFIRMADO                      |

**Conclusão:** O código atual (`fb75dff`) é consistente com a `V21-GAP-CLOSURE-MATRIX.md` e `V21-DATABASE-FINAL-MATRIX.md`. O `V21-DATABASE-CANONICAL-SNAPSHOT.md` está desatualizado em relação aos fixes da Fase 1 (duplicidades removidas, RLS adicionada). O snapshot deve ser preservado como histórico e um novo snapshot deve ser gerado após a correção dos bloqueios remanescentes.

---

_Relatório gerado por auditoria estática. Não foram executadas queries contra banco de dados vivo._
