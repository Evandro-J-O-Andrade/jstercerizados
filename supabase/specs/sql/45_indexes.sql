-- SERVICE ORDERS
-- ============================================================

create index idx_service_orders_tenant_id on public.service_orders(tenant_id);
create index idx_service_orders_status on public.service_orders(tenant_id, status);
create index idx_service_orders_company_id on public.service_orders(company_service_id);
create index idx_service_orders_period on public.service_orders(tenant_id, period_start, period_end);
create index idx_service_order_status_history_service_order_id on public.service_order_status_history(service_order_id);
create index idx_service_order_status_history_changed_at on public.service_order_status_history(service_order_id, changed_at);

-- ============================================================
-- CRM COMMERCIAL

create index idx_leads_tenant_id on public.leads(tenant_id);
create index idx_leads_status on public.leads(tenant_id, status);
create index idx_leads_company_id on public.leads(company_id);
create index idx_leads_person_id on public.leads(person_id);

create index idx_customers_tenant_id on public.customers(tenant_id);
create index idx_customers_status on public.customers(tenant_id, status);
create index idx_customers_company_id on public.customers(company_id);
create index idx_customers_person_id on public.customers(person_id);
create index idx_customers_document on public.customers(tenant_id, document);

create index idx_quotes_tenant_id on public.quotes(tenant_id);
create index idx_quotes_status on public.quotes(tenant_id, status);
create index idx_quotes_customer_id on public.quotes(customer_id);
create index idx_quotes_number on public.quotes(tenant_id, quote_number);
create index idx_quotes_issue_date on public.quotes(tenant_id, issue_date);

create index idx_quote_items_quote_id on public.quote_items(quote_id);
create index idx_quote_items_service_id on public.quote_items(service_id);
create index idx_quote_items_product_id on public.quote_items(product_id);

create index idx_sales_tenant_id on public.sales(tenant_id);
create index idx_sales_status on public.sales(tenant_id, status);
create index idx_sales_customer_id on public.sales(customer_id);
create index idx_sales_number on public.sales(tenant_id, sale_number);
create index idx_sales_issue_date on public.sales(tenant_id, issue_date);

create index idx_sale_items_sale_id on public.sale_items(sale_id);
create index idx_sale_items_service_id on public.sale_items(service_id);
create index idx_sale_items_product_id on public.sale_items(product_id);

-- ============================================================
-- FINANCE
-- ============================================================

create index idx_financial_categories_tenant_id on public.financial_categories(tenant_id);
create index idx_cost_centers_tenant_id on public.cost_centers(tenant_id);
create index idx_accounts_receivable_tenant_id on public.accounts_receivable(tenant_id);
create index idx_accounts_receivable_status on public.accounts_receivable(tenant_id, status);
create index idx_accounts_receivable_due_date on public.accounts_receivable(tenant_id, due_date);
create index idx_accounts_payable_tenant_id on public.accounts_payable(tenant_id);
create index idx_accounts_payable_status on public.accounts_payable(tenant_id, status);
create index idx_accounts_payable_due_date on public.accounts_payable(tenant_id, due_date);
create index idx_payments_tenant_id on public.payments(tenant_id);
create index idx_payments_account_payable_id on public.payments(account_payable_id);
create index idx_receipts_tenant_id on public.receipts(tenant_id);
create index idx_receipts_account_receivable_id on public.receipts(account_receivable_id);
create index idx_financial_transactions_tenant_id on public.financial_transactions(tenant_id);
create index idx_financial_transactions_type on public.financial_transactions(tenant_id, type, competence_date);
create index idx_bank_reconciliations_tenant_id on public.bank_reconciliations(tenant_id);
create index idx_bank_reconciliations_status on public.bank_reconciliations(tenant_id, status);
create index idx_financial_installments_tenant_id on public.financial_installments(tenant_id);
create index idx_financial_installments_status on public.financial_installments(tenant_id, status);
create index idx_financial_installment_payments_installment_id on public.financial_installment_payments(installment_id);
create index idx_financial_installment_cancellations_installment_id on public.financial_installment_cancellations(installment_id);

-- ============================================================
-- FISCAL
-- ============================================================

create index idx_fiscal_configurations_tenant_id on public.fiscal_configurations(tenant_id);
create index idx_tax_rates_tenant_id on public.tax_rates(tenant_id);
create index idx_tax_rates_type on public.tax_rates(tenant_id, type, effective_date);
create index idx_fiscal_documents_tenant_id on public.fiscal_documents(tenant_id);
create index idx_fiscal_documents_status on public.fiscal_documents(tenant_id, status);
create index idx_fiscal_documents_type_number on public.fiscal_documents(tenant_id, type, number);
create index idx_fiscal_documents_key on public.fiscal_documents(key);
create index idx_fiscal_document_items_document_id on public.fiscal_document_items(fiscal_document_id);
create index idx_fiscal_document_status_history_document_id on public.fiscal_document_status_history(fiscal_document_id);
create index idx_fiscal_api_requests_tenant_id on public.fiscal_api_requests(tenant_id);
create index idx_fiscal_api_requests_fiscal_document_id on public.fiscal_api_requests(fiscal_document_id);
create index idx_fiscal_api_responses_request_id on public.fiscal_api_responses(fiscal_api_request_id);
create index idx_fiscal_document_events_document_id on public.fiscal_document_events(fiscal_document_id);

-- ============================================================
-- POS
-- ============================================================

create index idx_pos_terminals_tenant_id on public.pos_terminals(tenant_id);
create index idx_pos_cashiers_tenant_id on public.pos_cashiers(tenant_id);
create index idx_pos_cashiers_terminal_id on public.pos_cashiers(terminal_id);
create index idx_pos_operators_tenant_id on public.pos_operators(tenant_id);
create index idx_pos_operators_person_id on public.pos_operators(person_id);
create index idx_pos_cashier_sessions_tenant_id on public.pos_cashier_sessions(tenant_id);
create index idx_pos_cashier_sessions_cashier_id on public.pos_cashier_sessions(cashier_id);
create index idx_pos_cashier_sessions_status on public.pos_cashier_sessions(tenant_id, status);
create index idx_pos_sales_tenant_id on public.pos_sales(tenant_id);
create index idx_pos_sales_session_id on public.pos_sales(session_id);
create index idx_pos_sales_status on public.pos_sales(tenant_id, status);
create index idx_pos_sale_items_sale_id on public.pos_sale_items(sale_id);
create index idx_pos_payments_sale_id on public.pos_payments(sale_id);
create index idx_pos_payments_status on public.pos_payments(tenant_id, status);
create index idx_pos_cancellations_sale_id on public.pos_cancellations(sale_id);
create index idx_pos_returns_sale_id on public.pos_returns(sale_id);
create index idx_pos_cash_movements_session_id on public.pos_cash_movements(session_id);
create index idx_pos_daily_closures_session_id on public.pos_daily_closures(session_id);

-- ============================================================
-- RECRUITMENT
-- ============================================================

create index idx_skills_tenant_id on public.skills(tenant_id);
create index idx_skills_is_global on public.skills(is_global);
create index idx_candidate_documents_tenant_id on public.candidate_documents(tenant_id);
create index idx_candidate_documents_candidate_id on public.candidate_documents(candidate_id);
create index idx_candidate_experiences_tenant_id on public.candidate_experiences(tenant_id);
create index idx_candidate_experiences_candidate_id on public.candidate_experiences(candidate_id);
create index idx_candidate_education_tenant_id on public.candidate_education(tenant_id);
create index idx_candidate_education_candidate_id on public.candidate_education(candidate_id);
create index idx_candidate_courses_tenant_id on public.candidate_courses(tenant_id);
create index idx_candidate_courses_candidate_id on public.candidate_courses(candidate_id);
create index idx_candidate_languages_tenant_id on public.candidate_languages(tenant_id);
create index idx_candidate_languages_candidate_id on public.candidate_languages(candidate_id);
create index idx_candidate_skills_tenant_id on public.candidate_skills(tenant_id);
create index idx_candidate_skills_candidate_id on public.candidate_skills(candidate_id);
create index idx_candidate_skills_skill_id on public.candidate_skills(skill_id);
create index idx_job_skills_tenant_id on public.job_skills(tenant_id);
create index idx_job_skills_job_id on public.job_skills(job_id);
create index idx_job_skills_skill_id on public.job_skills(skill_id);
create index idx_stage_templates_tenant_id on public.stage_templates(tenant_id);
create index idx_recruitment_processes_tenant_id on public.recruitment_processes(tenant_id);
create index idx_recruitment_processes_job_id on public.recruitment_processes(job_id);
create index idx_recruitment_processes_candidate_id on public.recruitment_processes(candidate_id);
create index idx_recruitment_processes_status on public.recruitment_processes(tenant_id, status);
create index idx_recruitment_stages_process_id on public.recruitment_stages(recruitment_process_id);
create index idx_recruitment_stages_status on public.recruitment_stages(tenant_id, status);
create index idx_candidate_processes_tenant_id on public.candidate_processes(tenant_id);
create index idx_candidate_processes_candidate_id on public.candidate_processes(candidate_id);
create index idx_application_profile_snapshots_application_id on public.application_profile_snapshots(application_id);
create index idx_interview_participants_tenant_id on public.interview_participants(tenant_id);
create index idx_interview_participants_interview_id on public.interview_participants(interview_id);
create index idx_interview_feedback_tenant_id on public.interview_feedback(tenant_id);
create index idx_interview_feedback_interview_id on public.interview_feedback(interview_id);

-- ============================================================
-- AUTOMATION
-- ============================================================

create index idx_webhook_deliveries_tenant_id on public.webhook_deliveries(tenant_id);
create index idx_webhook_deliveries_event_id on public.webhook_deliveries(event_id);
create index idx_webhook_deliveries_status on public.webhook_deliveries(tenant_id, status);
create index idx_webhook_deliveries_idempotency_key on public.webhook_deliveries(idempotency_key);
create index idx_automation_jobs_tenant_id on public.automation_jobs(tenant_id);
create index idx_automation_jobs_active on public.automation_jobs(tenant_id, is_active, next_run_at) where is_active = true;
create index idx_automation_executions_tenant_id on public.automation_executions(tenant_id);
create index idx_automation_executions_job_id on public.automation_executions(automation_job_id);
create index idx_automation_executions_status on public.automation_executions(tenant_id, status);

-- ============================================================
-- INDEX COMMENTS
-- ============================================================

comment on index idx_event_outbox_status_available_at is 'Worker outbox: pending jobs ordered by availability';
comment on index idx_domain_events_idempotency_key is 'Idempotency lookup for domain events';
comment on index idx_notification_deliveries_idempotency_key is 'Idempotency lookup for notification deliveries';
comment on index idx_event_deliveries_idempotency_key is 'Idempotency lookup for event deliveries';
comment on index idx_stock_balances_tenant_product is 'Stock balance lookup per product per tenant';
comment on index idx_stock_movements_tenant_product is 'Stock movement history per product';
comment on index idx_audit_logs_tenant_id is 'Audit log queries by tenant';
comment on index idx_privacy_requests_status is 'Privacy request queue by tenant and status';
