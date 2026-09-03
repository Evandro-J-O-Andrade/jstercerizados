# AUDIT MASTER — FASE 1: BANCO

**Snapshot:** 2026-09-03 (Supabase `okxqfyoqbhcmflpurfrw`)

## Resumo

| Métrica                    | Valor |
| -------------------------- | ----- |
| Tabelas                    | 215   |
| Tabelas com tenant_id      | 193   |
| Tabelas com RLS habilitado | 215   |
| Tabelas com policies       | 215   |
| Total de policies (public) | 584   |
| Policies de storage        | 16    |
| Views públicas             | 5     |
| Functions (RPCs)           | 225   |
| Triggers                   | 78    |
| Foreign keys               | 531   |

## Tabelas (com RLS, tenant_id, policies e row count)

| Tabela                              | tenant_id | RLS | Policies | Linhas |
| ----------------------------------- | --------- | --- | -------- | ------ |
| accounts_payable                    | ✅        | ✅  | 3        | 0      |
| accounts_receivable                 | ✅        | ✅  | 3        | 0      |
| activity_logs                       | ✅        | ✅  | 2        | 0      |
| administrative_approvals            | ✅        | ✅  | 2        | 0      |
| administrative_documents            | ✅        | ✅  | 2        | 0      |
| administrative_requests             | ✅        | ✅  | 3        | 0      |
| administrative_tasks                | ✅        | ✅  | 2        | 0      |
| ai_conversations                    | ✅        | ✅  | 3        | 0      |
| ai_messages                         | —         | ✅  | 2        | 0      |
| ai_usage                            | ✅        | ✅  | 3        | 0      |
| application_profile_snapshots       | ✅        | ✅  | 2        | 0      |
| application_status_history          | —         | ✅  | 2        | 0      |
| applications                        | ✅        | ✅  | 3        | 0      |
| audit_logs                          | ✅        | ✅  | 1        | 237    |
| automation_executions               | ✅        | ✅  | 2        | 0      |
| automation_jobs                     | ✅        | ✅  | 3        | 2      |
| automation_templates                | ✅        | ✅  | 3        | 0      |
| bank_reconciliations                | ✅        | ✅  | 3        | 0      |
| blog_categories                     | ✅        | ✅  | 1        | 0      |
| blog_posts                          | ✅        | ✅  | 1        | 0      |
| calendar_events                     | ✅        | ✅  | 3        | 0      |
| calendar_integrations               | ✅        | ✅  | 3        | 0      |
| calendars                           | ✅        | ✅  | 3        | 0      |
| candidate_courses                   | ✅        | ✅  | 3        | 0      |
| candidate_documents                 | ✅        | ✅  | 3        | 0      |
| candidate_education                 | ✅        | ✅  | 3        | 0      |
| candidate_experiences               | ✅        | ✅  | 3        | 0      |
| candidate_languages                 | ✅        | ✅  | 3        | 0      |
| candidate_processes                 | ✅        | ✅  | 3        | 0      |
| candidate_profile_views             | ✅        | ✅  | 3        | 0      |
| candidate_skills                    | ✅        | ✅  | 3        | 0      |
| candidates                          | ✅        | ✅  | 3        | 8      |
| chat_handoffs                       | —         | ✅  | 2        | 0      |
| chat_messages                       | —         | ✅  | 2        | 0      |
| chat_participants                   | —         | ✅  | 2        | 0      |
| chat_rooms                          | ✅        | ✅  | 3        | 0      |
| companies                           | ✅        | ✅  | 4        | 10     |
| company_contacts                    | —         | ✅  | 3        | 4      |
| company_locations                   | ✅        | ✅  | 4        | 4      |
| company_relationship_types          | —         | ✅  | 1        | 4      |
| company_relationships               | ✅        | ✅  | 3        | 5      |
| company_services                    | ✅        | ✅  | 3        | 0      |
| company_social_links                | ✅        | ✅  | 4        | 0      |
| consents                            | ✅        | ✅  | 3        | 0      |
| contract_status_history             | ✅        | ✅  | 2        | 0      |
| contracts                           | ✅        | ✅  | 3        | 0      |
| cost_centers                        | ✅        | ✅  | 3        | 5      |
| customer_feedback                   | ✅        | ✅  | 4        | 0      |
| customer_ratings                    | ✅        | ✅  | 4        | 0      |
| customers                           | ✅        | ✅  | 3        | 0      |
| dashboard_layouts                   | ✅        | ✅  | 3        | 0      |
| dashboard_widgets                   | ✅        | ✅  | 3        | 0      |
| data_deletion_requests              | ✅        | ✅  | 2        | 1      |
| data_export_requests                | ✅        | ✅  | 2        | 0      |
| data_retention_policies             | ✅        | ✅  | 2        | 8      |
| departments                         | ✅        | ✅  | 3        | 0      |
| document_links                      | ✅        | ✅  | 2        | 0      |
| document_versions                   | ✅        | ✅  | 2        | 0      |
| domain_events                       | ✅        | ✅  | 1        | 3      |
| email_messages                      | ✅        | ✅  | 2        | 0      |
| email_templates                     | ✅        | ✅  | 3        | 0      |
| employee_contracts                  | —         | ✅  | 3        | 0      |
| employee_documents                  | —         | ✅  | 3        | 0      |
| employee_positions                  | —         | ✅  | 3        | 0      |
| employee_status_history             | —         | ✅  | 3        | 0      |
| employees                           | ✅        | ✅  | 3        | 0      |
| epi_deliveries                      | ✅        | ✅  | 4        | 0      |
| epi_delivery_items                  | ✅        | ✅  | 4        | 0      |
| epi_return_items                    | ✅        | ✅  | 4        | 0      |
| epi_returns                         | ✅        | ✅  | 4        | 0      |
| event_deliveries                    | ✅        | ✅  | 1        | 0      |
| event_outbox                        | ✅        | ✅  | 1        | 3      |
| event_participants                  | —         | ✅  | 3        | 0      |
| faqs                                | ✅        | ✅  | 4        | 0      |
| feedback                            | ✅        | ✅  | 4        | 0      |
| file_access_logs                    | ✅        | ✅  | 2        | 0      |
| file_uploads                        | ✅        | ✅  | 2        | 0      |
| files                               | ✅        | ✅  | 2        | 0      |
| financial_accounts                  | ✅        | ✅  | 3        | 0      |
| financial_categories                | ✅        | ✅  | 3        | 5      |
| financial_installment_cancellations | ✅        | ✅  | 2        | 0      |
| financial_installment_payments      | ✅        | ✅  | 2        | 0      |
| financial_installments              | ✅        | ✅  | 3        | 0      |
| financial_transactions              | ✅        | ✅  | 3        | 0      |
| first_login_state                   | —         | ✅  | 3        | 22     |
| fiscal_api_requests                 | ✅        | ✅  | 3        | 0      |
| fiscal_api_responses                | ✅        | ✅  | 2        | 0      |
| fiscal_configurations               | ✅        | ✅  | 3        | 1      |
| fiscal_document_events              | ✅        | ✅  | 2        | 0      |
| fiscal_document_items               | ✅        | ✅  | 3        | 0      |
| fiscal_document_status_history      | ✅        | ✅  | 2        | 0      |
| fiscal_documents                    | ✅        | ✅  | 3        | 0      |
| fiscal_integrations                 | ✅        | ✅  | 3        | 0      |
| integration_connections             | ✅        | ✅  | 2        | 0      |
| integration_credentials             | —         | ✅  | 1        | 0      |
| integration_errors                  | —         | ✅  | 1        | 0      |
| integration_events                  | —         | ✅  | 1        | 0      |
| integration_sync_jobs               | ✅        | ✅  | 2        | 0      |
| integration_sync_runs               | —         | ✅  | 1        | 0      |
| integration_webhooks                | —         | ✅  | 1        | 0      |
| interactions                        | ✅        | ✅  | 3        | 0      |
| interview_feedback                  | ✅        | ✅  | 3        | 0      |
| interview_followups                 | ✅        | ✅  | 2        | 0      |
| interview_participants              | ✅        | ✅  | 3        | 0      |
| interviews                          | —         | ✅  | 3        | 0      |
| invoice_items                       | ✅        | ✅  | 3        | 0      |
| invoices                            | ✅        | ✅  | 3        | 0      |
| job_matches                         | ✅        | ✅  | 3        | 0      |
| job_skills                          | ✅        | ✅  | 4        | 0      |
| jobs                                | ✅        | ✅  | 4        | 20     |
| leads                               | ✅        | ✅  | 3        | 0      |
| legal_acceptances                   | ✅        | ✅  | 2        | 2      |
| material_issue_items                | ✅        | ✅  | 4        | 0      |
| material_issues                     | ✅        | ✅  | 4        | 0      |
| material_return_items               | ✅        | ✅  | 4        | 0      |
| material_returns                    | ✅        | ✅  | 4        | 0      |
| media_assets                        | ✅        | ✅  | 4        | 0      |
| meeting_room_reservations           | ✅        | ✅  | 3        | 0      |
| meeting_rooms                       | ✅        | ✅  | 3        | 0      |
| notification_deliveries             | ✅        | ✅  | 1        | 0      |
| notification_preferences            | ✅        | ✅  | 3        | 0      |
| notifications                       | ✅        | ✅  | 2        | 0      |
| password_policies                   | ✅        | ✅  | 3        | 0      |
| payments                            | ✅        | ✅  | 3        | 0      |
| people                              | —         | ✅  | 1        | 27     |
| permissions                         | —         | ✅  | 1        | 211    |
| pos_cancellations                   | ✅        | ✅  | 3        | 0      |
| pos_cash_movements                  | ✅        | ✅  | 3        | 0      |
| pos_cashier_sessions                | ✅        | ✅  | 3        | 0      |
| pos_cashiers                        | ✅        | ✅  | 3        | 0      |
| pos_daily_closures                  | ✅        | ✅  | 3        | 0      |
| pos_operators                       | ✅        | ✅  | 3        | 0      |
| pos_payments                        | ✅        | ✅  | 3        | 0      |
| pos_returns                         | ✅        | ✅  | 3        | 0      |
| pos_sale_items                      | ✅        | ✅  | 3        | 0      |
| pos_sales                           | ✅        | ✅  | 3        | 0      |
| pos_terminals                       | ✅        | ✅  | 3        | 0      |
| positions                           | ✅        | ✅  | 3        | 0      |
| privacy_requests                    | ✅        | ✅  | 3        | 0      |
| product_categories                  | ✅        | ✅  | 3        | 0      |
| products                            | ✅        | ✅  | 3        | 5      |
| provider_configs                    | ✅        | ✅  | 1        | 0      |
| providers                           | —         | ✅  | 1        | 0      |
| purchase_order_items                | ✅        | ✅  | 2        | 0      |
| purchase_orders                     | ✅        | ✅  | 3        | 0      |
| purchase_quotation_items            | ✅        | ✅  | 2        | 0      |
| purchase_quotations                 | ✅        | ✅  | 3        | 0      |
| purchase_receipt_divergences        | ✅        | ✅  | 2        | 0      |
| purchase_receipt_items              | ✅        | ✅  | 2        | 0      |
| purchase_receipts                   | ✅        | ✅  | 2        | 0      |
| purchase_request_items              | ✅        | ✅  | 3        | 0      |
| purchase_requests                   | ✅        | ✅  | 3        | 0      |
| purchase_status_history             | ✅        | ✅  | 2        | 0      |
| quote_items                         | ✅        | ✅  | 3        | 0      |
| quotes                              | ✅        | ✅  | 3        | 0      |
| receipts                            | ✅        | ✅  | 3        | 0      |
| recruitment_demands                 | ✅        | ✅  | 3        | 0      |
| recruitment_processes               | ✅        | ✅  | 3        | 0      |
| recruitment_stages                  | ✅        | ✅  | 3        | 0      |
| report_definitions                  | ✅        | ✅  | 3        | 0      |
| report_executions                   | ✅        | ✅  | 2        | 0      |
| report_schedules                    | ✅        | ✅  | 3        | 0      |
| role_assignments                    | ✅        | ✅  | 3        | 25     |
| role_permissions                    | —         | ✅  | 1        | 673    |
| roles                               | —         | ✅  | 1        | 21     |
| sale_items                          | ✅        | ✅  | 3        | 0      |
| sales                               | ✅        | ✅  | 3        | 0      |
| security_events                     | ✅        | ✅  | 2        | 0      |
| service_acceptances                 | ✅        | ✅  | 3        | 0      |
| service_attachments                 | ✅        | ✅  | 3        | 0      |
| service_executions                  | ✅        | ✅  | 3        | 0      |
| service_occurrences                 | ✅        | ✅  | 4        | 0      |
| service_order_items                 | ✅        | ✅  | 3        | 0      |
| service_order_status_history        | ✅        | ✅  | 3        | 0      |
| service_orders                      | ✅        | ✅  | 3        | 0      |
| service_sla                         | ✅        | ✅  | 4        | 0      |
| services                            | ✅        | ✅  | 4        | 20     |
| sessions                            | ✅        | ✅  | 2        | 0      |
| skills                              | ✅        | ✅  | 3        | 0      |
| stage_templates                     | ✅        | ✅  | 3        | 5      |
| stock_balances                      | ✅        | ✅  | 1        | 1      |
| stock_entries                       | ✅        | ✅  | 2        | 1      |
| stock_inventory                     | ✅        | ✅  | 3        | 0      |
| stock_inventory_items               | ✅        | ✅  | 3        | 0      |
| stock_lots                          | ✅        | ✅  | 3        | 0      |
| stock_movements                     | ✅        | ✅  | 2        | 0      |
| suppliers                           | ✅        | ✅  | 3        | 0      |
| support_ticket_assignments          | ✅        | ✅  | 3        | 0      |
| support_ticket_categories           | ✅        | ✅  | 3        | 0      |
| support_ticket_messages             | ✅        | ✅  | 3        | 0      |
| support_ticket_status_history       | ✅        | ✅  | 2        | 0      |
| support_tickets                     | ✅        | ✅  | 3        | 0      |
| talent_pool_memberships             | ✅        | ✅  | 3        | 0      |
| task_attachments                    | ✅        | ✅  | 3        | 0      |
| task_comments                       | ✅        | ✅  | 3        | 0      |
| task_status_history                 | ✅        | ✅  | 3        | 0      |
| tasks                               | ✅        | ✅  | 3        | 0      |
| tax_calculations                    | ✅        | ✅  | 3        | 0      |
| tax_rates                           | ✅        | ✅  | 3        | 5      |
| tenant_memberships                  | ✅        | ✅  | 3        | 29     |
| tenant_settings                     | ✅        | ✅  | 3        | 21     |
| tenants                             | —         | ✅  | 1        | 3      |
| third_party_custody                 | ✅        | ✅  | 3        | 0      |
| third_party_custody_items           | ✅        | ✅  | 2        | 0      |
| validation_results                  | ✅        | ✅  | 3        | 77     |
| warehouse_locations                 | ✅        | ✅  | 3        | 0      |
| warehouses                          | ✅        | ✅  | 3        | 0      |
| webhook_deliveries                  | ✅        | ✅  | 2        | 0      |
| work_order_acceptances              | ✅        | ✅  | 3        | 0      |
| work_order_assignments              | ✅        | ✅  | 4        | 0      |
| work_order_attachments              | ✅        | ✅  | 3        | 0      |
| work_order_checklists               | ✅        | ✅  | 4        | 0      |
| work_order_materials                | ✅        | ✅  | 4        | 0      |
| work_order_occurrences              | ✅        | ✅  | 4        | 0      |
| work_orders                         | ✅        | ✅  | 4        | 0      |

## Views

- financial_kpis
- public_companies_by_type
- public_jobs_v1
- public_services_v1
- recruitment_kpis

## RPCs (functions)

- public.audit_log_insert
- public.bootstrap_candidate_from_auth_user
- public.bootstrap_candidate_identity
- public.cash_dist
- public.current_person_id
- public.date_dist
- public.domain_event_emit
- public.emit_domain_event
- public.event_outbox_enqueue
- public.event_outbox_process_next
- public.financial_reversal
- public.fiscal_cancel_invoice
- public.fiscal_emit_invoice
- public.float4_dist
- public.float8_dist
- public.gbt_bit_compress
- public.gbt_bit_consistent
- public.gbt_bit_penalty
- public.gbt_bit_picksplit
- public.gbt_bit_same
- public.gbt_bit_union
- public.gbt_bool_compress
- public.gbt_bool_consistent
- public.gbt_bool_fetch
- public.gbt_bool_penalty
- public.gbt_bool_picksplit
- public.gbt_bool_same
- public.gbt_bool_union
- public.gbt_bpchar_compress
- public.gbt_bpchar_consistent
- public.gbt_bytea_compress
- public.gbt_bytea_consistent
- public.gbt_bytea_penalty
- public.gbt_bytea_picksplit
- public.gbt_bytea_same
- public.gbt_bytea_union
- public.gbt_cash_compress
- public.gbt_cash_consistent
- public.gbt_cash_distance
- public.gbt_cash_fetch
- public.gbt_cash_penalty
- public.gbt_cash_picksplit
- public.gbt_cash_same
- public.gbt_cash_union
- public.gbt_date_compress
- public.gbt_date_consistent
- public.gbt_date_distance
- public.gbt_date_fetch
- public.gbt_date_penalty
- public.gbt_date_picksplit
- public.gbt_date_same
- public.gbt_date_union
- public.gbt_decompress
- public.gbt_enum_compress
- public.gbt_enum_consistent
- public.gbt_enum_fetch
- public.gbt_enum_penalty
- public.gbt_enum_picksplit
- public.gbt_enum_same
- public.gbt_enum_union
- public.gbt_float4_compress
- public.gbt_float4_consistent
- public.gbt_float4_distance
- public.gbt_float4_fetch
- public.gbt_float4_penalty
- public.gbt_float4_picksplit
- public.gbt_float4_same
- public.gbt_float4_union
- public.gbt_float8_compress
- public.gbt_float8_consistent
- public.gbt_float8_distance
- public.gbt_float8_fetch
- public.gbt_float8_penalty
- public.gbt_float8_picksplit
- public.gbt_float8_same
- public.gbt_float8_union
- public.gbt_inet_compress
- public.gbt_inet_consistent
- public.gbt_inet_penalty
- public.gbt_inet_picksplit
- public.gbt_inet_same
- public.gbt_inet_union
- public.gbt_int2_compress
- public.gbt_int2_consistent
- public.gbt_int2_distance
- public.gbt_int2_fetch
- public.gbt_int2_penalty
- public.gbt_int2_picksplit
- public.gbt_int2_same
- public.gbt_int2_union
- public.gbt_int4_compress
- public.gbt_int4_consistent
- public.gbt_int4_distance
- public.gbt_int4_fetch
- public.gbt_int4_penalty
- public.gbt_int4_picksplit
- public.gbt_int4_same
- public.gbt_int4_union
- public.gbt_int8_compress
- public.gbt_int8_consistent
- public.gbt_int8_distance
- public.gbt_int8_fetch
- public.gbt_int8_penalty
- public.gbt_int8_picksplit
- public.gbt_int8_same
- public.gbt_int8_union
- public.gbt_intv_compress
- public.gbt_intv_consistent
- public.gbt_intv_decompress
- public.gbt_intv_distance
- public.gbt_intv_fetch
- public.gbt_intv_penalty
- public.gbt_intv_picksplit
- public.gbt_intv_same
- public.gbt_intv_union
- public.gbt_macad8_compress
- public.gbt_macad8_consistent
- public.gbt_macad8_fetch
- public.gbt_macad8_penalty
- public.gbt_macad8_picksplit
- public.gbt_macad8_same
- public.gbt_macad8_union
- public.gbt_macad_compress
- public.gbt_macad_consistent
- public.gbt_macad_fetch
- public.gbt_macad_penalty
- public.gbt_macad_picksplit
- public.gbt_macad_same
- public.gbt_macad_union
- public.gbt_numeric_compress
- public.gbt_numeric_consistent
- public.gbt_numeric_penalty
- public.gbt_numeric_picksplit
- public.gbt_numeric_same
- public.gbt_numeric_union
- public.gbt_oid_compress
- public.gbt_oid_consistent
- public.gbt_oid_distance
- public.gbt_oid_fetch
- public.gbt_oid_penalty
- public.gbt_oid_picksplit
- public.gbt_oid_same
- public.gbt_oid_union
- public.gbt_text_compress
- public.gbt_text_consistent
- public.gbt_text_penalty
- public.gbt_text_picksplit
- public.gbt_text_same
- public.gbt_text_union
- public.gbt_time_compress
- public.gbt_time_consistent
- public.gbt_time_distance
- public.gbt_time_fetch
- public.gbt_time_penalty
- public.gbt_time_picksplit
- public.gbt_time_same
- public.gbt_time_union
- public.gbt_timetz_compress
- public.gbt_timetz_consistent
- public.gbt_ts_compress
- public.gbt_ts_consistent
- public.gbt_ts_distance
- public.gbt_ts_fetch
- public.gbt_ts_penalty
- public.gbt_ts_picksplit
- public.gbt_ts_same
- public.gbt_ts_union
- public.gbt_tstz_compress
- public.gbt_tstz_consistent
- public.gbt_tstz_distance
- public.gbt_uuid_compress
- public.gbt_uuid_consistent
- public.gbt_uuid_fetch
- public.gbt_uuid_penalty
- public.gbt_uuid_picksplit
- public.gbt_uuid_same
- public.gbt_uuid_union
- public.gbt_var_decompress
- public.gbt_var_fetch
- public.gbtreekey16_in
- public.gbtreekey16_out
- public.gbtreekey2_in
- public.gbtreekey2_out
- public.gbtreekey32_in
- public.gbtreekey32_out
- public.gbtreekey4_in
- public.gbtreekey4_out
- public.gbtreekey8_in
- public.gbtreekey8_out
- public.gbtreekey_var_in
- public.gbtreekey_var_out
- public.handle_auth_user_deleted
- public.handle_auth_user_updated
- public.handle_new_auth_user
- public.int2_dist
- public.int4_dist
- public.int8_dist
- public.interval_dist
- public.is_admin_master
- public.is_tenant_member
- public.is_valid_cnpj
- public.is_valid_cpf
- public.lgpd_consent_register
- public.lgpd_legal_hold_check
- public.match_candidates_to_demand
- public.media_for_entity
- public.normalize_cnpj
- public.normalize_cpf
- public.oid_dist
- public.pos_daily_closure_validate
- public.purchase_receipt_confirm
- public.repair_candidate_chain
- public.set_primary_media
- public.set_updated_at
- public.stock_movement_insert
- public.time_dist
- public.trg_domain_event_to_outbox
- public.ts_dist
- public.tstz_dist
- public.update_updated_at
- public.user_has_permission
- public.user_permissions
- public.user_tenant_ids
- public.validation_assert
- public.validation_upsert

## Foreign keys (todas)

| De                                                  | Para                         |
| --------------------------------------------------- | ---------------------------- |
| accounts_payable.tenant_id                          | tenants.id                   |
| accounts_payable.purchase_order_id                  | purchase_orders.id           |
| accounts_payable.supplier_id                        | suppliers.id                 |
| accounts_payable.company_id                         | companies.id                 |
| accounts_payable.purchase_receipt_id                | purchase_receipts.id         |
| accounts_payable.actor_person_id                    | people.id                    |
| accounts_receivable.invoice_id                      | invoices.id                  |
| accounts_receivable.tenant_id                       | tenants.id                   |
| accounts_receivable.company_id                      | companies.id                 |
| accounts_receivable.contract_id                     | contracts.id                 |
| accounts_receivable.service_order_id                | service_orders.id            |
| accounts_receivable.actor_person_id                 | people.id                    |
| administrative_approvals.approver_person_id         | people.id                    |
| administrative_approvals.tenant_id                  | tenants.id                   |
| administrative_approvals.task_id                    | administrative_tasks.id      |
| administrative_documents.file_id                    | files.id                     |
| administrative_documents.request_id                 | administrative_requests.id   |
| administrative_documents.tenant_id                  | tenants.id                   |
| administrative_requests.tenant_id                   | tenants.id                   |
| administrative_requests.requester_person_id         | people.id                    |
| administrative_tasks.assignee_person_id             | people.id                    |
| administrative_tasks.tenant_id                      | tenants.id                   |
| administrative_tasks.request_id                     | administrative_requests.id   |
| ai_conversations.tenant_id                          | tenants.id                   |
| ai_messages.conversation_id                         | ai_conversations.id          |
| ai_usage.tenant_id                                  | tenants.id                   |
| ai_usage.person_id                                  | people.id                    |
| application_profile_snapshots.tenant_id             | tenants.id                   |
| application_profile_snapshots.actor_person_id       | people.id                    |
| application_profile_snapshots.application_id        | applications.id              |
| application_status_history.actor_person_id          | people.id                    |
| application_status_history.application_id           | applications.id              |
| applications.job_id                                 | jobs.id                      |
| applications.candidate_id                           | candidates.id                |
| audit_logs.actor_person_id                          | people.id                    |
| audit_logs.tenant_id                                | tenants.id                   |
| automation_executions.tenant_id                     | tenants.id                   |
| automation_executions.event_id                      | domain_events.id             |
| automation_executions.automation_job_id             | automation_jobs.id           |
| automation_executions.actor_person_id               | people.id                    |
| automation_jobs.tenant_id                           | tenants.id                   |
| automation_jobs.actor_person_id                     | people.id                    |
| automation_templates.tenant_id                      | tenants.id                   |
| bank_reconciliations.tenant_id                      | tenants.id                   |
| bank_reconciliations.actor_person_id                | people.id                    |
| blog_categories.tenant_id                           | tenants.id                   |
| blog_posts.category_id                              | blog_categories.id           |
| blog_posts.tenant_id                                | tenants.id                   |
| blog_posts.author_person_id                         | people.id                    |
| calendar_events.created_by                          | people.id                    |
| calendar_events.tenant_id                           | tenants.id                   |
| calendar_events.calendar_id                         | calendars.id                 |
| calendar_integrations.tenant_id                     | tenants.id                   |
| calendars.tenant_id                                 | tenants.id                   |
| calendars.integration_id                            | calendar_integrations.id     |
| candidate_courses.candidate_id                      | candidates.id                |
| candidate_courses.tenant_id                         | tenants.id                   |
| candidate_documents.actor_person_id                 | people.id                    |
| candidate_documents.candidate_id                    | candidates.id                |
| candidate_documents.tenant_id                       | tenants.id                   |
| candidate_education.candidate_id                    | candidates.id                |
| candidate_education.tenant_id                       | tenants.id                   |
| candidate_experiences.candidate_id                  | candidates.id                |
| candidate_experiences.tenant_id                     | tenants.id                   |
| candidate_languages.tenant_id                       | tenants.id                   |
| candidate_languages.candidate_id                    | candidates.id                |
| candidate_processes.recruitment_process_id          | recruitment_processes.id     |
| candidate_processes.candidate_id                    | candidates.id                |
| candidate_processes.tenant_id                       | tenants.id                   |
| candidate_profile_views.candidate_id                | people.id                    |
| candidate_profile_views.viewed_by                   | people.id                    |
| candidate_profile_views.tenant_id                   | tenants.id                   |
| candidate_skills.tenant_id                          | tenants.id                   |
| candidate_skills.candidate_id                       | candidates.id                |
| candidate_skills.skill_id                           | skills.id                    |
| candidates.person_id                                | people.id                    |
| candidates.tenant_id                                | tenants.id                   |
| chat_handoffs.to_person_id                          | people.id                    |
| chat_handoffs.room_id                               | chat_rooms.id                |
| chat_handoffs.from_person_id                        | people.id                    |
| chat_messages.room_id                               | chat_rooms.id                |
| chat_messages.sender_person_id                      | people.id                    |
| chat_participants.room_id                           | chat_rooms.id                |
| chat_participants.person_id                         | people.id                    |
| chat_rooms.tenant_id                                | tenants.id                   |
| companies.tenant_id                                 | tenants.id                   |
| company_contacts.company_id                         | companies.id                 |
| company_locations.company_id                        | companies.id                 |
| company_locations.tenant_id                         | tenants.id                   |
| company_relationships.company_id                    | companies.id                 |
| company_services.company_id                         | companies.id                 |
| company_services.service_id                         | services.id                  |
| company_services.tenant_id                          | tenants.id                   |
| company_social_links.company_id                     | companies.id                 |
| company_social_links.tenant_id                      | tenants.id                   |
| consents.person_id                                  | people.id                    |
| consents.tenant_id                                  | tenants.id                   |
| consents.actor_person_id                            | people.id                    |
| contract_status_history.actor_person_id             | people.id                    |
| contract_status_history.contract_id                 | contracts.id                 |
| contract_status_history.tenant_id                   | tenants.id                   |
| contracts.company_id                                | companies.id                 |
| contracts.tenant_id                                 | tenants.id                   |
| cost_centers.tenant_id                              | tenants.id                   |
| customer_feedback.service_order_id                  | service_orders.id            |
| customer_feedback.tenant_id                         | tenants.id                   |
| customer_feedback.customer_id                       | customers.id                 |
| customer_feedback.work_order_id                     | work_orders.id               |
| customer_ratings.customer_id                        | customers.id                 |
| customer_ratings.work_order_id                      | work_orders.id               |
| customer_ratings.service_order_id                   | service_orders.id            |
| customer_ratings.tenant_id                          | tenants.id                   |
| customers.company_id                                | companies.id                 |
| customers.tenant_id                                 | tenants.id                   |
| customers.person_id                                 | people.id                    |
| dashboard_layouts.tenant_id                         | tenants.id                   |
| dashboard_layouts.person_id                         | people.id                    |
| dashboard_layouts.widget_id                         | dashboard_widgets.id         |
| dashboard_widgets.tenant_id                         | tenants.id                   |
| data_deletion_requests.tenant_id                    | tenants.id                   |
| data_deletion_requests.actor_person_id              | people.id                    |
| data_deletion_requests.person_id                    | people.id                    |
| data_export_requests.actor_person_id                | people.id                    |
| data_export_requests.person_id                      | people.id                    |
| data_export_requests.tenant_id                      | tenants.id                   |
| data_retention_policies.tenant_id                   | tenants.id                   |
| departments.tenant_id                               | tenants.id                   |
| departments.parent_id                               | departments.id               |
| document_links.tenant_id                            | tenants.id                   |
| document_links.file_id                              | files.id                     |
| document_versions.tenant_id                         | tenants.id                   |
| document_versions.changed_by_person_id              | people.id                    |
| domain_events.tenant_id                             | tenants.id                   |
| domain_events.actor_person_id                       | people.id                    |
| email_messages.tenant_id                            | tenants.id                   |
| email_messages.template_id                          | email_templates.id           |
| email_templates.tenant_id                           | tenants.id                   |
| employee_contracts.employee_id                      | employees.id                 |
| employee_documents.employee_id                      | employees.id                 |
| employee_positions.employee_id                      | employees.id                 |
| employee_positions.position_id                      | positions.id                 |
| employee_status_history.employee_id                 | employees.id                 |
| employees.tenant_id                                 | tenants.id                   |
| employees.id                                        | people.id                    |
| epi_deliveries.work_order_id                        | work_orders.id               |
| epi_deliveries.employee_id                          | employees.id                 |
| epi_deliveries.tenant_id                            | tenants.id                   |
| epi_deliveries.delivered_by                         | people.id                    |
| epi_delivery_items.tenant_id                        | tenants.id                   |
| epi_delivery_items.epi_delivery_id                  | epi_deliveries.id            |
| epi_delivery_items.stock_lot_id                     | stock_lots.id                |
| epi_delivery_items.product_id                       | products.id                  |
| epi_return_items.product_id                         | products.id                  |
| epi_return_items.epi_return_id                      | epi_returns.id               |
| epi_return_items.stock_lot_id                       | stock_lots.id                |
| epi_return_items.tenant_id                          | tenants.id                   |
| epi_returns.employee_id                             | employees.id                 |
| epi_returns.tenant_id                               | tenants.id                   |
| epi_returns.received_by                             | people.id                    |
| epi_returns.work_order_id                           | work_orders.id               |
| event_deliveries.actor_person_id                    | people.id                    |
| event_deliveries.tenant_id                          | tenants.id                   |
| event_deliveries.outbox_id                          | event_outbox.id              |
| event_outbox.tenant_id                              | tenants.id                   |
| event_outbox.event_id                               | domain_events.id             |
| event_participants.event_id                         | calendar_events.id           |
| event_participants.person_id                        | people.id                    |
| faqs.tenant_id                                      | tenants.id                   |
| feedback.tenant_id                                  | tenants.id                   |
| feedback.person_id                                  | people.id                    |
| file_access_logs.tenant_id                          | tenants.id                   |
| file_access_logs.file_id                            | files.id                     |
| file_access_logs.person_id                          | people.id                    |
| files.tenant_id                                     | tenants.id                   |
| files.uploaded_by_person_id                         | people.id                    |
| financial_accounts.tenant_id                        | tenants.id                   |
| financial_categories.tenant_id                      | tenants.id                   |
| financial_categories.parent_id                      | financial_categories.id      |
| financial_installment_cancellations.actor_person_id | people.id                    |
| financial_installment_cancellations.tenant_id       | tenants.id                   |
| financial_installment_cancellations.installment_id  | financial_installments.id    |
| financial_installment_payments.actor_person_id      | people.id                    |
| financial_installment_payments.tenant_id            | tenants.id                   |
| financial_installment_payments.installment_id       | financial_installments.id    |
| financial_installments.account_payable_id           | accounts_payable.id          |
| financial_installments.tenant_id                    | tenants.id                   |
| financial_installments.account_receivable_id        | accounts_receivable.id       |
| financial_installments.actor_person_id              | people.id                    |
| financial_transactions.category_id                  | financial_categories.id      |
| financial_transactions.cost_center_id               | cost_centers.id              |
| financial_transactions.tenant_id                    | tenants.id                   |
| financial_transactions.actor_person_id              | people.id                    |
| first_login_state.person_id                         | people.id                    |
| fiscal_api_requests.actor_person_id                 | people.id                    |
| fiscal_api_requests.tenant_id                       | tenants.id                   |
| fiscal_api_requests.fiscal_document_id              | fiscal_documents.id          |
| fiscal_api_responses.tenant_id                      | tenants.id                   |
| fiscal_api_responses.fiscal_api_request_id          | fiscal_api_requests.id       |
| fiscal_configurations.actor_person_id               | people.id                    |
| fiscal_configurations.tenant_id                     | tenants.id                   |
| fiscal_document_events.actor_person_id              | people.id                    |
| fiscal_document_events.tenant_id                    | tenants.id                   |
| fiscal_document_events.fiscal_document_id           | fiscal_documents.id          |
| fiscal_document_items.product_id                    | products.id                  |
| fiscal_document_items.tenant_id                     | tenants.id                   |
| fiscal_document_items.fiscal_document_id            | fiscal_documents.id          |
| fiscal_document_status_history.tenant_id            | tenants.id                   |
| fiscal_document_status_history.fiscal_document_id   | fiscal_documents.id          |
| fiscal_document_status_history.actor_person_id      | people.id                    |
| fiscal_documents.actor_person_id                    | people.id                    |
| fiscal_documents.tenant_id                          | tenants.id                   |
| fiscal_integrations.tenant_id                       | tenants.id                   |
| integration_connections.tenant_id                   | tenants.id                   |
| integration_credentials.connection_id               | integration_connections.id   |
| integration_errors.connection_id                    | integration_connections.id   |
| integration_events.connection_id                    | integration_connections.id   |
| integration_events.domain_event_id                  | domain_events.id             |
| integration_sync_jobs.tenant_id                     | tenants.id                   |
| integration_sync_runs.connection_id                 | integration_connections.id   |
| integration_webhooks.connection_id                  | integration_connections.id   |
| interactions.tenant_id                              | tenants.id                   |
| interactions.person_id                              | people.id                    |
| interactions.company_id                             | companies.id                 |
| interview_feedback.interview_id                     | interviews.id                |
| interview_feedback.tenant_id                        | tenants.id                   |
| interview_feedback.participant_id                   | interview_participants.id    |
| interview_followups.candidate_id                    | candidates.id                |
| interview_followups.job_id                          | jobs.id                      |
| interview_participants.interview_id                 | interviews.id                |
| interview_participants.person_id                    | people.id                    |
| interview_participants.tenant_id                    | tenants.id                   |
| interviews.application_id                           | applications.id              |
| invoice_items.tenant_id                             | tenants.id                   |
| invoice_items.invoice_id                            | invoices.id                  |
| invoices.tenant_id                                  | tenants.id                   |
| invoices.company_id                                 | companies.id                 |
| invoices.customer_id                                | companies.id                 |
| job_matches.candidate_id                            | people.id                    |
| job_matches.demand_id                               | recruitment_demands.id       |
| job_matches.tenant_id                               | tenants.id                   |
| job_skills.job_id                                   | jobs.id                      |
| job_skills.skill_id                                 | skills.id                    |
| job_skills.tenant_id                                | tenants.id                   |
| jobs.tenant_id                                      | tenants.id                   |
| jobs.company_id                                     | companies.id                 |
| leads.company_id                                    | companies.id                 |
| leads.person_id                                     | people.id                    |
| leads.tenant_id                                     | tenants.id                   |
| legal_acceptances.actor_person_id                   | people.id                    |
| legal_acceptances.person_id                         | people.id                    |
| legal_acceptances.tenant_id                         | tenants.id                   |
| material_issue_items.product_id                     | products.id                  |
| material_issue_items.warehouse_location_id          | warehouse_locations.id       |
| material_issue_items.stock_lot_id                   | stock_lots.id                |
| material_issue_items.tenant_id                      | tenants.id                   |
| material_issue_items.material_issue_id              | material_issues.id           |
| material_issues.work_order_id                       | work_orders.id               |
| material_issues.warehouse_id                        | warehouses.id                |
| material_issues.created_by                          | people.id                    |
| material_issues.tenant_id                           | tenants.id                   |
| material_issues.employee_id                         | employees.id                 |
| material_return_items.warehouse_location_id         | warehouse_locations.id       |
| material_return_items.stock_lot_id                  | stock_lots.id                |
| material_return_items.product_id                    | products.id                  |
| material_return_items.material_return_id            | material_returns.id          |
| material_return_items.tenant_id                     | tenants.id                   |
| material_returns.work_order_id                      | work_orders.id               |
| material_returns.created_by                         | people.id                    |
| material_returns.warehouse_id                       | warehouses.id                |
| material_returns.employee_id                        | employees.id                 |
| material_returns.tenant_id                          | tenants.id                   |
| media_assets.tenant_id                              | tenants.id                   |
| media_assets.uploaded_by                            | people.id                    |
| meeting_room_reservations.room_id                   | meeting_rooms.id             |
| meeting_room_reservations.tenant_id                 | tenants.id                   |
| meeting_room_reservations.created_by                | people.id                    |
| meeting_rooms.tenant_id                             | tenants.id                   |
| notification_deliveries.notification_id             | notifications.id             |
| notification_deliveries.tenant_id                   | tenants.id                   |
| notification_deliveries.actor_person_id             | people.id                    |
| notification_preferences.person_id                  | people.id                    |
| notification_preferences.tenant_id                  | tenants.id                   |
| notifications.tenant_id                             | tenants.id                   |
| notifications.recipient_person_id                   | people.id                    |
| password_policies.tenant_id                         | tenants.id                   |
| payments.account_payable_id                         | accounts_payable.id          |
| payments.tenant_id                                  | tenants.id                   |
| payments.actor_person_id                            | people.id                    |
| pos_cancellations.requested_by                      | people.id                    |
| pos_cancellations.tenant_id                         | tenants.id                   |
| pos_cancellations.sale_id                           | pos_sales.id                 |
| pos_cancellations.approved_by                       | people.id                    |
| pos_cash_movements.tenant_id                        | tenants.id                   |
| pos_cash_movements.session_id                       | pos_cashier_sessions.id      |
| pos_cash_movements.approved_by                      | people.id                    |
| pos_cash_movements.actor_person_id                  | people.id                    |
| pos_cashier_sessions.tenant_id                      | tenants.id                   |
| pos_cashier_sessions.cashier_id                     | pos_cashiers.id              |
| pos_cashier_sessions.actor_person_id                | people.id                    |
| pos_cashier_sessions.operator_id                    | pos_operators.id             |
| pos_cashiers.terminal_id                            | pos_terminals.id             |
| pos_cashiers.tenant_id                              | tenants.id                   |
| pos_daily_closures.actor_person_id                  | people.id                    |
| pos_daily_closures.approved_by                      | people.id                    |
| pos_daily_closures.session_id                       | pos_cashier_sessions.id      |
| pos_daily_closures.tenant_id                        | tenants.id                   |
| pos_operators.tenant_id                             | tenants.id                   |
| pos_operators.cashier_id                            | pos_cashiers.id              |
| pos_operators.person_id                             | people.id                    |
| pos_payments.tenant_id                              | tenants.id                   |
| pos_payments.sale_id                                | pos_sales.id                 |
| pos_payments.actor_person_id                        | people.id                    |
| pos_returns.sale_id                                 | pos_sales.id                 |
| pos_returns.tenant_id                               | tenants.id                   |
| pos_returns.actor_person_id                         | people.id                    |
| pos_sale_items.tenant_id                            | tenants.id                   |
| pos_sale_items.product_id                           | products.id                  |
| pos_sale_items.sale_id                              | pos_sales.id                 |
| pos_sales.tenant_id                                 | tenants.id                   |
| pos_sales.session_id                                | pos_cashier_sessions.id      |
| pos_sales.operator_id                               | pos_operators.id             |
| pos_sales.actor_person_id                           | people.id                    |
| pos_terminals.tenant_id                             | tenants.id                   |
| positions.department_id                             | departments.id               |
| positions.tenant_id                                 | tenants.id                   |
| privacy_requests.actor_person_id                    | people.id                    |
| privacy_requests.person_id                          | people.id                    |
| privacy_requests.tenant_id                          | tenants.id                   |
| product_categories.tenant_id                        | tenants.id                   |
| product_categories.parent_id                        | product_categories.id        |
| products.tenant_id                                  | tenants.id                   |
| provider_configs.connection_id                      | integration_connections.id   |
| provider_configs.tenant_id                          | tenants.id                   |
| provider_configs.provider_id                        | providers.id                 |
| purchase_order_items.purchase_order_id              | purchase_orders.id           |
| purchase_order_items.product_id                     | products.id                  |
| purchase_order_items.tenant_id                      | tenants.id                   |
| purchase_orders.tenant_id                           | tenants.id                   |
| purchase_orders.supplier_id                         | suppliers.id                 |
| purchase_quotation_items.product_id                 | products.id                  |
| purchase_quotation_items.tenant_id                  | tenants.id                   |
| purchase_quotation_items.quotation_id               | purchase_quotations.id       |
| purchase_quotations.supplier_id                     | suppliers.id                 |
| purchase_quotations.request_id                      | purchase_requests.id         |
| purchase_quotations.tenant_id                       | tenants.id                   |
| purchase_receipt_divergences.purchase_receipt_id    | purchase_receipts.id         |
| purchase_receipt_divergences.tenant_id              | tenants.id                   |
| purchase_receipt_divergences.item_id                | purchase_order_items.id      |
| purchase_receipt_items.purchase_order_item_id       | purchase_order_items.id      |
| purchase_receipt_items.product_id                   | products.id                  |
| purchase_receipt_items.receipt_id                   | purchase_receipts.id         |
| purchase_receipt_items.tenant_id                    | tenants.id                   |
| purchase_receipts.tenant_id                         | tenants.id                   |
| purchase_receipts.actor_person_id                   | people.id                    |
| purchase_receipts.supplier_id                       | suppliers.id                 |
| purchase_receipts.purchase_order_id                 | purchase_orders.id           |
| purchase_request_items.tenant_id                    | tenants.id                   |
| purchase_request_items.product_id                   | products.id                  |
| purchase_request_items.request_id                   | purchase_requests.id         |
| purchase_requests.requester_id                      | people.id                    |
| purchase_requests.tenant_id                         | tenants.id                   |
| purchase_requests.company_id                        | companies.id                 |
| purchase_status_history.changed_by                  | people.id                    |
| purchase_status_history.tenant_id                   | tenants.id                   |
| purchase_status_history.purchase_order_id           | purchase_orders.id           |
| quote_items.tenant_id                               | tenants.id                   |
| quote_items.product_id                              | products.id                  |
| quote_items.quote_id                                | quotes.id                    |
| quote_items.service_id                              | services.id                  |
| quotes.customer_id                                  | customers.id                 |
| quotes.parent_quote_id                              | quotes.id                    |
| quotes.person_id                                    | people.id                    |
| quotes.company_id                                   | companies.id                 |
| quotes.tenant_id                                    | tenants.id                   |
| receipts.account_receivable_id                      | accounts_receivable.id       |
| receipts.tenant_id                                  | tenants.id                   |
| receipts.actor_person_id                            | people.id                    |
| recruitment_demands.company_id                      | companies.id                 |
| recruitment_demands.tenant_id                       | tenants.id                   |
| recruitment_demands.service_id                      | services.id                  |
| recruitment_processes.actor_person_id               | people.id                    |
| recruitment_processes.tenant_id                     | tenants.id                   |
| recruitment_processes.candidate_id                  | candidates.id                |
| recruitment_processes.job_id                        | jobs.id                      |
| recruitment_stages.stage_template_id                | stage_templates.id           |
| recruitment_stages.tenant_id                        | tenants.id                   |
| recruitment_stages.recruitment_process_id           | recruitment_processes.id     |
| recruitment_stages.actor_person_id                  | people.id                    |
| report_definitions.tenant_id                        | tenants.id                   |
| report_executions.tenant_id                         | tenants.id                   |
| report_executions.executed_by                       | people.id                    |
| report_executions.report_id                         | report_definitions.id        |
| report_schedules.tenant_id                          | tenants.id                   |
| report_schedules.report_id                          | report_definitions.id        |
| role_assignments.person_id                          | people.id                    |
| role_assignments.tenant_id                          | tenants.id                   |
| role_assignments.role_id                            | roles.id                     |
| role_permissions.role_id                            | roles.id                     |
| role_permissions.permission_id                      | permissions.id               |
| sale_items.quote_item_id                            | quote_items.id               |
| sale_items.product_id                               | products.id                  |
| sale_items.tenant_id                                | tenants.id                   |
| sale_items.sale_id                                  | sales.id                     |
| sale_items.service_id                               | services.id                  |
| sales.tenant_id                                     | tenants.id                   |
| sales.customer_id                                   | customers.id                 |
| sales.company_id                                    | companies.id                 |
| sales.person_id                                     | people.id                    |
| sales.quote_id                                      | quotes.id                    |
| security_events.person_id                           | people.id                    |
| security_events.tenant_id                           | tenants.id                   |
| service_acceptances.tenant_id                       | tenants.id                   |
| service_acceptances.accepted_by                     | people.id                    |
| service_acceptances.service_order_id                | service_orders.id            |
| service_attachments.uploaded_by                     | people.id                    |
| service_attachments.tenant_id                       | tenants.id                   |
| service_attachments.service_order_id                | service_orders.id            |
| service_executions.service_order_id                 | service_orders.id            |
| service_executions.tenant_id                        | tenants.id                   |
| service_executions.executed_by                      | people.id                    |
| service_occurrences.work_order_id                   | work_orders.id               |
| service_occurrences.service_order_id                | service_orders.id            |
| service_occurrences.tenant_id                       | tenants.id                   |
| service_occurrences.resolved_by                     | people.id                    |
| service_occurrences.reported_by                     | people.id                    |
| service_order_items.tenant_id                       | tenants.id                   |
| service_order_items.service_order_id                | service_orders.id            |
| service_order_status_history.service_order_id       | service_orders.id            |
| service_order_status_history.tenant_id              | tenants.id                   |
| service_order_status_history.actor_person_id        | people.id                    |
| service_orders.company_service_id                   | company_services.id          |
| service_orders.company_relationship_id              | company_relationships.id     |
| service_orders.tenant_id                            | tenants.id                   |
| service_sla.tenant_id                               | tenants.id                   |
| service_sla.service_id                              | services.id                  |
| services.tenant_id                                  | tenants.id                   |
| services.created_by                                 | people.id                    |
| sessions.person_id                                  | people.id                    |
| sessions.tenant_id                                  | tenants.id                   |
| skills.tenant_id                                    | tenants.id                   |
| stage_templates.tenant_id                           | tenants.id                   |
| stock_balances.tenant_id                            | tenants.id                   |
| stock_balances.product_id                           | products.id                  |
| stock_entries.product_id                            | products.id                  |
| stock_entries.actor_person_id                       | people.id                    |
| stock_entries.tenant_id                             | tenants.id                   |
| stock_inventory.warehouse_id                        | warehouses.id                |
| stock_inventory.tenant_id                           | tenants.id                   |
| stock_inventory_items.tenant_id                     | tenants.id                   |
| stock_inventory_items.product_id                    | products.id                  |
| stock_inventory_items.lot_id                        | stock_lots.id                |
| stock_inventory_items.inventory_id                  | stock_inventory.id           |
| stock_inventory_items.warehouse_location_id         | warehouse_locations.id       |
| stock_lots.product_id                               | products.id                  |
| stock_lots.tenant_id                                | tenants.id                   |
| stock_movements.tenant_id                           | tenants.id                   |
| stock_movements.product_id                          | products.id                  |
| suppliers.tenant_id                                 | tenants.id                   |
| suppliers.company_id                                | companies.id                 |
| support_ticket_assignments.person_id                | people.id                    |
| support_ticket_assignments.ticket_id                | support_tickets.id           |
| support_ticket_assignments.tenant_id                | tenants.id                   |
| support_ticket_categories.tenant_id                 | tenants.id                   |
| support_ticket_messages.tenant_id                   | tenants.id                   |
| support_ticket_messages.ticket_id                   | support_tickets.id           |
| support_ticket_messages.person_id                   | people.id                    |
| support_ticket_status_history.tenant_id             | tenants.id                   |
| support_ticket_status_history.ticket_id             | support_tickets.id           |
| support_tickets.category_id                         | support_ticket_categories.id |
| support_tickets.tenant_id                           | tenants.id                   |
| support_tickets.assignee_person_id                  | people.id                    |
| talent_pool_memberships.tenant_id                   | tenants.id                   |
| talent_pool_memberships.person_id                   | people.id                    |
| task_attachments.uploaded_by                        | people.id                    |
| task_attachments.task_id                            | tasks.id                     |
| task_attachments.tenant_id                          | tenants.id                   |
| task_comments.tenant_id                             | tenants.id                   |
| task_comments.task_id                               | tasks.id                     |
| task_comments.person_id                             | people.id                    |
| task_status_history.changed_by                      | people.id                    |
| task_status_history.tenant_id                       | tenants.id                   |
| task_status_history.task_id                         | tasks.id                     |
| tasks.assignee_person_id                            | people.id                    |
| tasks.tenant_id                                     | tenants.id                   |
| tax_calculations.tenant_id                          | tenants.id                   |
| tax_calculations.tax_rate_id                        | tax_rates.id                 |
| tax_calculations.actor_person_id                    | people.id                    |
| tax_rates.tenant_id                                 | tenants.id                   |
| tenant_memberships.tenant_id                        | tenants.id                   |
| tenant_memberships.person_id                        | people.id                    |
| tenant_settings.tenant_id                           | tenants.id                   |
| third_party_custody.tenant_id                       | tenants.id                   |
| third_party_custody.company_id                      | companies.id                 |
| third_party_custody_items.product_id                | products.id                  |
| third_party_custody_items.tenant_id                 | tenants.id                   |
| third_party_custody_items.custody_id                | third_party_custody.id       |
| validation_results.tenant_id                        | tenants.id                   |
| warehouse_locations.warehouse_id                    | warehouses.id                |
| warehouse_locations.tenant_id                       | tenants.id                   |
| warehouses.tenant_id                                | tenants.id                   |
| webhook_deliveries.actor_person_id                  | people.id                    |
| webhook_deliveries.event_id                         | domain_events.id             |
| webhook_deliveries.tenant_id                        | tenants.id                   |
| work_order_acceptances.work_order_id                | work_orders.id               |
| work_order_acceptances.approved_by                  | people.id                    |
| work_order_acceptances.customer_id                  | customers.id                 |
| work_order_acceptances.tenant_id                    | tenants.id                   |
| work_order_assignments.employee_id                  | employees.id                 |
| work_order_assignments.work_order_id                | work_orders.id               |
| work_order_assignments.tenant_id                    | tenants.id                   |
| work_order_attachments.uploaded_by                  | people.id                    |
| work_order_attachments.tenant_id                    | tenants.id                   |
| work_order_attachments.work_order_id                | work_orders.id               |
| work_order_checklists.work_order_id                 | work_orders.id               |
| work_order_checklists.tenant_id                     | tenants.id                   |
| work_order_checklists.checked_by                    | people.id                    |
| work_order_materials.work_order_id                  | work_orders.id               |
| work_order_materials.product_id                     | products.id                  |
| work_order_materials.stock_lot_id                   | stock_lots.id                |
| work_order_materials.tenant_id                      | tenants.id                   |
| work_order_occurrences.reported_by                  | people.id                    |
| work_order_occurrences.tenant_id                    | tenants.id                   |
| work_order_occurrences.resolved_by                  | people.id                    |
| work_order_occurrences.work_order_id                | work_orders.id               |
| work_orders.service_order_id                        | service_orders.id            |
| work_orders.contract_id                             | contracts.id                 |
| work_orders.customer_id                             | customers.id                 |
| work_orders.location_id                             | company_locations.id         |
| work_orders.assigned_employee_id                    | employees.id                 |
| work_orders.created_by                              | people.id                    |
| work_orders.tenant_id                               | tenants.id                   |
