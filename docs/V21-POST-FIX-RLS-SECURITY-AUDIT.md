# Auditoria de Segurança RLS — V2.1 Pós-Fix Fase 1

**Branch:** feat/database-v21-local-rebuild  
**Commit:** 8e26594 (HEAD)  
**Data:** 2026-08-21  
**Arquivos auditados:** `supabase/specs/sql/22_rls.sql`, `supabase/specs/sql/21_functions_triggers.sql`, `supabase/specs/sql/39_fiscal.sql`  
**Escopo:** RLS, RPCs SECURITY DEFINER, cross-tenant leakage, tabelas sem proteção.

---

## 1. Resumo Executivo

| Item                                               | Status      |
| -------------------------------------------------- | ----------- |
| RLS habilitado em todas as tabelas tenant-scoped   | **FAIL**    |
| Políticas DELETE em todas as tabelas tenant-scoped | **FAIL**    |
| RPCs SECURITY DEFINER auditadas                    | **WARNING** |
| `search_path` correto em todas as RPCs             | **PASS**    |
| Tabelas sem RLS que deveriam ter                   | **FAIL**    |
| Policies com potencial acesso cross-tenant         | **WARNING** |

**Veredito Final:** **FAIL** — O banco contém vulnerabilidades críticas de segurança que permitem escalation de privilégio e acesso cross-tenant antes mesmo da aplicação das RLS.

---

## 2. Matriz de RLS por Tabela

### 2.1 Tabelas com RLS Completo (SELECT + INSERT + UPDATE)

| Tabela                              | RLS | SELECT | INSERT | UPDATE | DELETE | Classificação DELETE   |
| ----------------------------------- | --- | ------ | ------ | ------ | ------ | ---------------------- |
| people                              | SIM | SIM    | N/A    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| tenants                             | SIM | SIM    | N/A    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| tenant_memberships                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| tenant_settings                     | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| roles                               | SIM | SIM    | N/A    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| permissions                         | SIM | SIM    | N/A    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| role_permissions                    | SIM | SIM    | N/A    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| role_assignments                    | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| companies                           | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| company_relationships               | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| company_contacts                    | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidates                          | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| jobs                                | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| applications                        | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| application_status_history          | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| interviews                          | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| services                            | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| service_orders                      | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| service_order_status_history        | SIM | SIM    | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| contracts                           | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| contract_status_history             | SIM | SIM    | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| suppliers                           | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_orders                     | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_order_items                | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_receipts                   | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_receipt_items              | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| products                            | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| stock_movements                     | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| stock_balances                      | SIM | SIM    | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| stock_entries                       | SIM | SIM    | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| third_party_custody                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| third_party_custody_items           | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| tasks                               | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| support_tickets                     | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| support_ticket_status_history       | SIM | SIM    | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| chat_rooms                          | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| chat_participants                   | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| chat_messages                       | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| ai_conversations                    | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| ai_messages                         | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| chat_handoffs                       | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| notifications                       | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| notification_deliveries             | SIM | SIM    | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| domain_events                       | SIM | admin  | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| event_outbox                        | SIM | admin  | N/A    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| event_deliveries                    | SIM | admin  | N/A    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| files                               | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| file_access_logs                    | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| document_versions                   | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| document_links                      | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| administrative_requests             | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| administrative_tasks                | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| administrative_approvals            | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| administrative_documents            | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| audit_logs                          | SIM | admin  | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| security_events                     | SIM | admin  | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| first_login_state                   | SIM | SIM    | N/A    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| legal_acceptances                   | SIM | SIM    | N/A    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| consents                            | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| privacy_requests                    | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| data_export_requests                | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| data_deletion_requests              | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| data_retention_policies             | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| employees                           | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| departments                         | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| positions                           | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| employee_positions                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| employee_contracts                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| employee_documents                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| employee_status_history             | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| company_services                    | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| service_order_items                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| service_acceptances                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| service_executions                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| service_attachments                 | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| interactions                        | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| recruitment_demands                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| talent_pool_memberships             | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| job_matches                         | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidate_profile_views             | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| warehouses                          | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| warehouse_locations                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| product_categories                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| stock_lots                          | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| stock_inventory                     | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| stock_inventory_items               | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_requests                   | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_request_items              | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_quotations                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_quotation_items            | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_status_history             | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| purchase_receipt_divergences        | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| invoices                            | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| invoice_items                       | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| financial_accounts                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| financial_transactions              | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| bank_reconciliations                | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| financial_installments              | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| financial_installment_payments      | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| financial_installment_cancellations | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| fiscal_integrations                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_operators                       | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| task_comments                       | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| task_attachments                    | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| task_status_history                 | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| support_ticket_categories           | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| support_ticket_messages             | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| support_ticket_assignments          | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| ai_usage                            | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| sessions                            | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| password_policies                   | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| automation_templates                | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| notification_preferences            | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| report_definitions                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| report_executions                   | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| report_schedules                    | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| dashboard_widgets                   | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| dashboard_layouts                   | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| webhook_deliveries                  | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| automation_jobs                     | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| automation_executions               | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| skills                              | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidate_documents                 | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidate_experiences               | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidate_education                 | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidate_courses                   | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidate_languages                 | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidate_skills                    | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| job_skills                          | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| stage_templates                     | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| recruitment_processes               | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| recruitment_stages                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| candidate_processes                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| application_profile_snapshots       | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| interview_participants              | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| interview_feedback                  | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_terminals                       | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_cashiers                        | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_cashier_sessions                | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_sales                           | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_sale_items                      | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_payments                        | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_cancellations                   | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_returns                         | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_cash_movements                  | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| pos_daily_closures                  | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| fiscal_configurations               | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| tax_rates                           | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| tax_calculations                    | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| fiscal_documents                    | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| fiscal_document_items               | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| fiscal_document_status_history      | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| fiscal_api_requests                 | SIM | SIM    | SIM    | SIM    | NÃO    | **DELETE_NOT_ALLOWED** |
| fiscal_api_responses                | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |
| fiscal_document_events              | SIM | SIM    | SIM    | N/A    | NÃO    | **DELETE_NOT_ALLOWED** |

### 2.2 Tabelas SEM RLS (tenant-scoped)

| Tabela               | Arquivo            | RLS Habilitado | Risco   |
| -------------------- | ------------------ | -------------- | ------- |
| financial_categories | 27_finance.sql:8   | NÃO            | CRÍTICO |
| cost_centers         | 27_finance.sql:25  | NÃO            | CRÍTICO |
| accounts_receivable  | 27_finance.sql:41  | NÃO            | CRÍTICO |
| accounts_payable     | 27_finance.sql:68  | NÃO            | CRÍTICO |
| payments             | 27_finance.sql:95  | NÃO            | CRÍTICO |
| receipts             | 27_finance.sql:115 | NÃO            | CRÍTICO |

> **Nota:** Todas possuem `tenant_id` e dados financeiros sensíveis. Sem RLS, qualquer usuário autenticado pode ler/inserir/atualizar dados de qualquer tenant.

---

## 3. Auditoria de RPCs SECURITY DEFINER

### 3.1 user_has_permission()

| Arquivo                   | Linha |
| ------------------------- | ----- |
| 21_functions_triggers.sql | 715   |

| Check            | Status  | Detalhe                                                           |
| ---------------- | ------- | ----------------------------------------------------------------- |
| SECURITY DEFINER | PASS    | Declarado                                                         |
| search_path      | PASS    | `public, pg_temp`                                                 |
| auth.uid()       | WARNING | Usa `p_auth_user_id` como parâmetro, não `auth.uid()` diretamente |
| tenant check     | PASS    | Verifica `p_tenant_id` via `role_assignments`                     |
| permission check | PASS    | Verifica resource + action                                        |
| ownership check  | WARNING | Não verifica se o chamador é o próprio usuário                    |

**Risco:** O parâmetro `p_auth_user_id` é fornecido pelo chamador. Um usuário mal-intencionado pode passar o UUID de outro usuário para verificar suas permissões. A função deve usar `auth.uid()` internamente ou validar que o chamador tem permissão para consultar outros usuários.

### 3.2 user_permissions()

| Arquivo                   | Linha |
| ------------------------- | ----- |
| 21_functions_triggers.sql | 737   |

| Check            | Status  | Detalhe                                        |
| ---------------- | ------- | ---------------------------------------------- |
| SECURITY DEFINER | PASS    | Declarado                                      |
| search_path      | PASS    | `public, pg_temp`                              |
| auth.uid()       | WARNING | Usa `p_auth_user_id` como parâmetro            |
| tenant check     | PASS    | Verifica `p_tenant_id`                         |
| permission check | PASS    | Retorna permissões do usuário                  |
| ownership check  | WARNING | Não verifica se o chamador é o próprio usuário |

**Risco:** Mesmo problema de `user_has_permission()`. Um atacante pode listar permissões de qualquer usuário conhecendo seu `auth_user_id`.

### 3.3 fiscal_emit_invoice()

| Arquivo       | Linha |
| ------------- | ----- |
| 39_fiscal.sql | 14    |

| Check            | Status | Detalhe                                                                       |
| ---------------- | ------ | ----------------------------------------------------------------------------- |
| SECURITY DEFINER | PASS   | Declarado                                                                     |
| search_path      | PASS   | `public, pg_temp`                                                             |
| auth.uid()       | PASS   | Usa `auth.uid()`                                                              |
| tenant check     | PASS   | Verifica `is_tenant_member(v_tenant_id)`                                      |
| permission check | PASS   | Verifica `user_has_permission(auth.uid(), 'invoices', 'update', v_tenant_id)` |
| ownership check  | N/A    | Não necessário (permission check cobre)                                       |

**Status:** Seguro.

### 3.4 fiscal_cancel_invoice()

| Arquivo       | Linha |
| ------------- | ----- |
| 39_fiscal.sql | 44    |

| Check            | Status | Detalhe                                                                       |
| ---------------- | ------ | ----------------------------------------------------------------------------- |
| SECURITY DEFINER | PASS   | Declarado                                                                     |
| search_path      | PASS   | `public, pg_temp`                                                             |
| auth.uid()       | PASS   | Usa `auth.uid()`                                                              |
| tenant check     | PASS   | Verifica `is_tenant_member(v_tenant_id)`                                      |
| permission check | PASS   | Verifica `user_has_permission(auth.uid(), 'invoices', 'update', v_tenant_id)` |
| ownership check  | N/A    | Não necessário (permission check cobre)                                       |

**Status:** Seguro.

### 3.5 financial_reversal()

| Arquivo        | Linha |
| -------------- | ----- |
| 27_finance.sql | 281   |

| Check            | Status   | Detalhe                           |
| ---------------- | -------- | --------------------------------- |
| SECURITY DEFINER | PASS     | Declarado                         |
| search_path      | PASS     | `public, pg_temp`                 |
| auth.uid()       | WARNING  | Usa apenas para `actor_person_id` |
| tenant check     | **FAIL** | NÃO VERIFICA tenant               |
| permission check | **FAIL** | NÃO VERIFICA permissão            |
| ownership check  | **FAIL** | NÃO VERIFICA propriedade          |

**Risco CRÍTICO:** Qualquer usuário autenticado pode chamar esta função com qualquer `p_transaction_id` e criar uma reversão financeira em qualquer tenant. Não há validação de tenant, permissão ou ownership.

### 3.6 match_candidates_to_demand()

| Arquivo                        | Linha |
| ------------------------------ | ----- |
| 35_recruitment_talent_pool.sql | 45    |

| Check            | Status   | Detalhe                  |
| ---------------- | -------- | ------------------------ |
| SECURITY DEFINER | PASS     | Declarado                |
| search_path      | PASS     | `public, pg_temp`        |
| auth.uid()       | **FAIL** | NÃO USA auth.uid()       |
| tenant check     | **FAIL** | NÃO VERIFICA tenant      |
| permission check | **FAIL** | NÃO VERIFICA permissão   |
| ownership check  | **FAIL** | NÃO VERIFICA propriedade |

**Risco CRÍTICO:** Esta função é completamente desautenticada. Qualquer pessoa (inclusive anon) pode chamá-la e obter uma lista de candidatos do talent pool de qualquer demanda, vazando dados pessoais e de recrutamento entre tenants.

---

## 4. Problemas Encontrados

### 4.1 CRÍTICO — Tabelas financeiras sem RLS (6 tabelas)

As tabelas `financial_categories`, `cost_centers`, `accounts_receivable`, `accounts_payable`, `payments` e `receipts` definidas em `27_finance.sql` não possuem `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` em `22_rls.sql`.

**Impacto:** Dados financeiros sensíveis de todos os tenants estão expostos a leitura e modificação por qualquer usuário autenticado.

### 4.2 CRÍTICO — RPCs sem validação de tenant/permissão

- `financial_reversal()` (`27_finance.sql:281`) — permite reversão de transações de qualquer tenant sem verificação de tenant ou permissão.
- `match_candidates_to_demand()` (`35_recruitment_talent_pool.sql:45`) — completamente desautenticada, permite vazamento de dados de candidatos entre tenants.

### 4.3 CRÍTICO — Duplicidade de policies quebra migração

O arquivo `22_rls.sql` contém dois lotes de policies:

1. **Primeiro lote** (linhas 1–1771): Policies corretas, com nomes como `applications_member_read`, `interviews_member_read`, etc.
2. **Segundo lote** (linhas 1586–2890): Tenta recriar policies com os mesmos nomes, mas:
   - **Duplicidade de nomes:** `create policy applications_member_read` aparece duas vezes (linhas 387 e 2780). A segunda execução falhará com `duplicate policy name`.
   - **Colunas inexistentes:** Policies do segundo lote referenciam `tenant_id` em tabelas que não possuem essa coluna (ex: `applications`, `interviews`), causando erro de `column does not exist`.

**Tabelas afetadas por policies quebradas no segundo lote:**

- applications (linha 2780 — referencia `tenant_id` inexistente)
- interviews (linha 2801 — referencia `tenant_id` inexistente)
- employee_positions (duplicidade)
- employee_contracts (duplicidade)
- employee_documents (duplicidade)
- employee_status_history (duplicidade)
- company_relationships (duplicidade)
- company_contacts (duplicidade)
- chat_rooms (linha 2814 — referencia `ai_conversation_id` inexistente)
- chat_participants (duplicidade)
- chat_messages (duplicidade)
- ai_messages (duplicidade)
- chat_handoffs (duplicidade)

**Impacto:** A aplicação desta migration falhará, impedindo o deploy do banco V2.1.

### 4.4 WARNING — Nenhuma política DELETE explícita

Nenhuma tabela tenant-scoped possui política `FOR DELETE`. Em PostgreSQL com RLS, isso implica bloqueio total de DELETE.

| Classificação          | Significado                              | Tabelas Afetadas                    |
| ---------------------- | ---------------------------------------- | ----------------------------------- |
| **DELETE_NOT_ALLOWED** | DELETE bloqueado pelo RLS (sem política) | Todas as 160+ tabelas tenant-scoped |

**Recomendação:** Confirmar se a aplicação usa exclusivamente soft-delete (campo `status`). Se houver necessidade de hard delete, devem ser criadas policies com verificação de tenant e permissão.

### 4.5 WARNING — Parâmetro caller-supplied em RBAC RPCs

`user_has_permission()` e `user_permissions()` recebem `p_auth_user_id` como parâmetro. Isso permite:

- Enumeração de usuários e suas permissões
- Bypass de auditoria (consulta permissões de outro usuário sem rastro)

**Recomendação:** Ambas as funções devem usar `auth.uid()` internamente, ou receber `p_auth_user_id` apenas quando o chamador possuir permissão `admin_master`.

---

## 5. Veredito Final

| Categoria                                        | Status                                        |
| ------------------------------------------------ | --------------------------------------------- |
| RLS habilitado em todas as tabelas tenant-scoped | **FAIL**                                      |
| Políticas SELECT/INSERT/UPDATE corretas          | **PASS** (para tabelas com RLS)               |
| Políticas DELETE                                 | **FAIL** (ausentes em todas)                  |
| RPCs SECURITY DEFINER — tenant check             | **FAIL** (2 de 6)                             |
| RPCs SECURITY DEFINER — permission check         | **FAIL** (2 de 6)                             |
| RPCs SECURITY DEFINER — search_path              | **PASS**                                      |
| Migração aplicável sem erros                     | **FAIL** (duplicidade + colunas inexistentes) |

**Conclusão:** O banco V2.1 **não está seguro para produção** na configuração atual. As falhas críticas identificadas permitem:

1. Vazamento massivo de dados financeiros (6 tabelas sem RLS)
2. Reversão financeira cross-tenant sem autorização
3. Vazamento de dados de candidatos cross-tenant
4. Falha total na aplicação da migration devido a policies duplicadas e inválidas

**Ações corretivas requeridas antes do deploy:**

1. Adicionar RLS nas 6 tabelas financeiras faltantes
2. Remover o segundo lote de policies duplicadas em `22_rls.sql` e corrigir policies que referenciam colunas inexistentes
3. Adicionar validação de tenant + permissão em `financial_reversal()`
4. Adicionar validação de auth + tenant + permissão em `match_candidates_to_demand()`
5. Revisar se soft-delete é a estratégia correta ou criar policies DELETE explícitas
6. Alterar `user_has_permission()` e `user_permissions()` para usar `auth.uid()` internamente
