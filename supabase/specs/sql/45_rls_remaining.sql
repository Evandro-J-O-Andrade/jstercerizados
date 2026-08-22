-- 45_rls_remaining.sql
-- RLS policies for tables created after 22_rls.sql
-- Dependencies: tables from 27_finance.sql through 44_reports_views.sql must exist before this file

-- ============================================================
-- FINANCE
-- ============================================================

alter table public.financial_categories enable row level security;
alter table public.cost_centers enable row level security;
alter table public.accounts_receivable enable row level security;
alter table public.accounts_payable enable row level security;
alter table public.payments enable row level security;
alter table public.receipts enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.bank_reconciliations enable row level security;
alter table public.financial_installments enable row level security;
alter table public.financial_installment_payments enable row level security;
alter table public.financial_installment_cancellations enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.financial_accounts enable row level security;

create policy financial_categories_member_read on public.financial_categories
  for select
  using (is_tenant_member(tenant_id));

create policy financial_categories_member_write on public.financial_categories
  for insert
  with check (is_tenant_member(tenant_id));

create policy financial_categories_member_update on public.financial_categories
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy cost_centers_member_read on public.cost_centers
  for select
  using (is_tenant_member(tenant_id));

create policy cost_centers_member_write on public.cost_centers
  for insert
  with check (is_tenant_member(tenant_id));

create policy cost_centers_member_update on public.cost_centers
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy accounts_receivable_member_read on public.accounts_receivable
  for select
  using (is_tenant_member(tenant_id));

create policy accounts_receivable_member_write on public.accounts_receivable
  for insert
  with check (is_tenant_member(tenant_id));

create policy accounts_receivable_member_update on public.accounts_receivable
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy accounts_payable_member_read on public.accounts_payable
  for select
  using (is_tenant_member(tenant_id));

create policy accounts_payable_member_write on public.accounts_payable
  for insert
  with check (is_tenant_member(tenant_id));

create policy accounts_payable_member_update on public.accounts_payable
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy payments_member_read on public.payments
  for select
  using (is_tenant_member(tenant_id));

create policy payments_member_write on public.payments
  for insert
  with check (is_tenant_member(tenant_id));

create policy payments_member_update on public.payments
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy receipts_member_read on public.receipts
  for select
  using (is_tenant_member(tenant_id));

create policy receipts_member_write on public.receipts
  for insert
  with check (is_tenant_member(tenant_id));

create policy receipts_member_update on public.receipts
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy financial_transactions_member_read on public.financial_transactions
  for select
  using (is_tenant_member(tenant_id));

create policy financial_transactions_member_write on public.financial_transactions
  for insert
  with check (is_tenant_member(tenant_id));

create policy financial_transactions_member_update on public.financial_transactions
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy bank_reconciliations_member_read on public.bank_reconciliations
  for select
  using (is_tenant_member(tenant_id));

create policy bank_reconciliations_member_write on public.bank_reconciliations
  for insert
  with check (is_tenant_member(tenant_id));

create policy bank_reconciliations_member_update on public.bank_reconciliations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy financial_installments_member_read on public.financial_installments
  for select
  using (is_tenant_member(tenant_id));

create policy financial_installments_member_write on public.financial_installments
  for insert
  with check (is_tenant_member(tenant_id));

create policy financial_installments_member_update on public.financial_installments
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy financial_installment_payments_member_read on public.financial_installment_payments
  for select
  using (exists (select 1 from public.financial_installments fi where fi.id = installment_id and is_tenant_member(fi.tenant_id)));

create policy financial_installment_payments_member_write on public.financial_installment_payments
  for insert
  with check (exists (select 1 from public.financial_installments fi where fi.id = installment_id and is_tenant_member(fi.tenant_id)));

create policy financial_installment_cancellations_member_read on public.financial_installment_cancellations
  for select
  using (exists (select 1 from public.financial_installments fi where fi.id = installment_id and is_tenant_member(fi.tenant_id)));

create policy financial_installment_cancellations_member_write on public.financial_installment_cancellations
  for insert
  with check (exists (select 1 from public.financial_installments fi where fi.id = installment_id and is_tenant_member(fi.tenant_id)));

create policy invoices_member_read on public.invoices
  for select
  using (is_tenant_member(tenant_id));

create policy invoices_member_write on public.invoices
  for insert
  with check (is_tenant_member(tenant_id));

create policy invoices_member_update on public.invoices
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy invoice_items_member_read on public.invoice_items
  for select
  using (exists (select 1 from public.invoices i where i.id = invoice_id and is_tenant_member(i.tenant_id)));

create policy invoice_items_member_write on public.invoice_items
  for insert
  with check (exists (select 1 from public.invoices i where i.id = invoice_id and is_tenant_member(i.tenant_id)));

create policy invoice_items_member_update on public.invoice_items
  for update
  using (exists (select 1 from public.invoices i where i.id = invoice_id and is_tenant_member(i.tenant_id)))
  with check (exists (select 1 from public.invoices i where i.id = invoice_id and is_tenant_member(i.tenant_id)));

create policy financial_accounts_member_read on public.financial_accounts
  for select
  using (is_tenant_member(tenant_id));

create policy financial_accounts_member_write on public.financial_accounts
  for insert
  with check (is_tenant_member(tenant_id));

create policy financial_accounts_member_update on public.financial_accounts
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- FISCAL
-- ============================================================

alter table public.fiscal_configurations enable row level security;
alter table public.tax_rates enable row level security;
alter table public.tax_calculations enable row level security;
alter table public.fiscal_documents enable row level security;
alter table public.fiscal_document_items enable row level security;
alter table public.fiscal_document_status_history enable row level security;
alter table public.fiscal_api_requests enable row level security;
alter table public.fiscal_api_responses enable row level security;
alter table public.fiscal_document_events enable row level security;

create policy fiscal_configurations_member_read on public.fiscal_configurations
  for select
  using (is_tenant_member(tenant_id));

create policy fiscal_configurations_member_write on public.fiscal_configurations
  for insert
  with check (is_tenant_member(tenant_id));

create policy fiscal_configurations_member_update on public.fiscal_configurations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy tax_rates_member_read on public.tax_rates
  for select
  using (is_tenant_member(tenant_id));

create policy tax_rates_member_write on public.tax_rates
  for insert
  with check (is_tenant_member(tenant_id));

create policy tax_rates_member_update on public.tax_rates
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy tax_calculations_member_read on public.tax_calculations
  for select
  using (is_tenant_member(tenant_id));

create policy tax_calculations_member_write on public.tax_calculations
  for insert
  with check (is_tenant_member(tenant_id));

create policy tax_calculations_member_update on public.tax_calculations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy fiscal_documents_member_read on public.fiscal_documents
  for select
  using (is_tenant_member(tenant_id));

create policy fiscal_documents_member_write on public.fiscal_documents
  for insert
  with check (is_tenant_member(tenant_id));

create policy fiscal_documents_member_update on public.fiscal_documents
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy fiscal_document_items_member_read on public.fiscal_document_items
  for select
  using (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_document_items_member_write on public.fiscal_document_items
  for insert
  with check (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_document_items_member_update on public.fiscal_document_items
  for update
  using (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)))
  with check (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_document_status_history_member_read on public.fiscal_document_status_history
  for select
  using (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_document_status_history_member_write on public.fiscal_document_status_history
  for insert
  with check (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_api_requests_member_read on public.fiscal_api_requests
  for select
  using (is_tenant_member(tenant_id));

create policy fiscal_api_requests_member_write on public.fiscal_api_requests
  for insert
  with check (is_tenant_member(tenant_id));

create policy fiscal_api_requests_member_update on public.fiscal_api_requests
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy fiscal_api_responses_member_read on public.fiscal_api_responses
  for select
  using (exists (select 1 from public.fiscal_api_requests far where far.id = fiscal_api_request_id and is_tenant_member(far.tenant_id)));

create policy fiscal_api_responses_member_write on public.fiscal_api_responses
  for insert
  with check (exists (select 1 from public.fiscal_api_requests far where far.id = fiscal_api_request_id and is_tenant_member(far.tenant_id)));

create policy fiscal_document_events_member_read on public.fiscal_document_events
  for select
  using (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_document_events_member_write on public.fiscal_document_events
  for insert
  with check (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

-- ============================================================
-- POS
-- ============================================================

alter table public.pos_terminals enable row level security;
alter table public.pos_cashiers enable row level security;
alter table public.pos_operators enable row level security;
alter table public.pos_cashier_sessions enable row level security;
alter table public.pos_sales enable row level security;
alter table public.pos_sale_items enable row level security;
alter table public.pos_payments enable row level security;
alter table public.pos_cancellations enable row level security;
alter table public.pos_returns enable row level security;
alter table public.pos_cash_movements enable row level security;
alter table public.pos_daily_closures enable row level security;

create policy pos_terminals_member_read on public.pos_terminals
  for select
  using (is_tenant_member(tenant_id));

create policy pos_terminals_member_write on public.pos_terminals
  for insert
  with check (is_tenant_member(tenant_id));

create policy pos_terminals_member_update on public.pos_terminals
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy pos_cashiers_member_read on public.pos_cashiers
  for select
  using (is_tenant_member(tenant_id));

create policy pos_cashiers_member_write on public.pos_cashiers
  for insert
  with check (is_tenant_member(tenant_id));

create policy pos_cashiers_member_update on public.pos_cashiers
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy pos_operators_member_read on public.pos_operators
  for select
  using (is_tenant_member(tenant_id));

create policy pos_operators_member_write on public.pos_operators
  for insert
  with check (is_tenant_member(tenant_id));

create policy pos_operators_member_update on public.pos_operators
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy pos_cashier_sessions_member_read on public.pos_cashier_sessions
  for select
  using (is_tenant_member(tenant_id));

create policy pos_cashier_sessions_member_write on public.pos_cashier_sessions
  for insert
  with check (is_tenant_member(tenant_id));

create policy pos_cashier_sessions_member_update on public.pos_cashier_sessions
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy pos_sales_member_read on public.pos_sales
  for select
  using (is_tenant_member(tenant_id));

create policy pos_sales_member_write on public.pos_sales
  for insert
  with check (is_tenant_member(tenant_id));

create policy pos_sales_member_update on public.pos_sales
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy pos_sale_items_member_read on public.pos_sale_items
  for select
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_sale_items_member_write on public.pos_sale_items
  for insert
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_sale_items_member_update on public.pos_sale_items
  for update
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)))
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_payments_member_read on public.pos_payments
  for select
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_payments_member_write on public.pos_payments
  for insert
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_payments_member_update on public.pos_payments
  for update
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)))
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_cancellations_member_read on public.pos_cancellations
  for select
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_cancellations_member_write on public.pos_cancellations
  for insert
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_cancellations_member_update on public.pos_cancellations
  for update
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)))
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_returns_member_read on public.pos_returns
  for select
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_returns_member_write on public.pos_returns
  for insert
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_returns_member_update on public.pos_returns
  for update
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)))
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_cash_movements_member_read on public.pos_cash_movements
  for select
  using (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)));

create policy pos_cash_movements_member_write on public.pos_cash_movements
  for insert
  with check (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)));

create policy pos_cash_movements_member_update on public.pos_cash_movements
  for update
  using (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)))
  with check (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)));

create policy pos_daily_closures_member_read on public.pos_daily_closures
  for select
  using (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)));

create policy pos_daily_closures_member_write on public.pos_daily_closures
  for insert
  with check (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)));

create policy pos_daily_closures_member_update on public.pos_daily_closures
  for update
  using (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)))
  with check (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)));

-- ============================================================
-- RECRUITMENT
-- ============================================================

alter table public.skills enable row level security;
alter table public.candidate_documents enable row level security;
alter table public.candidate_experiences enable row level security;
alter table public.candidate_education enable row level security;
alter table public.candidate_courses enable row level security;
alter table public.candidate_languages enable row level security;
alter table public.candidate_skills enable row level security;
alter table public.job_skills enable row level security;
alter table public.stage_templates enable row level security;
alter table public.recruitment_processes enable row level security;
alter table public.recruitment_stages enable row level security;
alter table public.candidate_processes enable row level security;
alter table public.application_profile_snapshots enable row level security;
alter table public.interview_participants enable row level security;
alter table public.interview_feedback enable row level security;

create policy skills_member_read on public.skills
  for select
  using (is_tenant_member(tenant_id));

create policy skills_member_write on public.skills
  for insert
  with check (is_tenant_member(tenant_id));

create policy skills_member_update on public.skills
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy candidate_documents_member_read on public.candidate_documents
  for select
  using (is_tenant_member(tenant_id));

create policy candidate_documents_member_write on public.candidate_documents
  for insert
  with check (is_tenant_member(tenant_id));

create policy candidate_documents_member_update on public.candidate_documents
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy candidate_experiences_member_read on public.candidate_experiences
  for select
  using (is_tenant_member(tenant_id));

create policy candidate_experiences_member_write on public.candidate_experiences
  for insert
  with check (is_tenant_member(tenant_id));

create policy candidate_experiences_member_update on public.candidate_experiences
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy candidate_education_member_read on public.candidate_education
  for select
  using (is_tenant_member(tenant_id));

create policy candidate_education_member_write on public.candidate_education
  for insert
  with check (is_tenant_member(tenant_id));

create policy candidate_education_member_update on public.candidate_education
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy candidate_courses_member_read on public.candidate_courses
  for select
  using (is_tenant_member(tenant_id));

create policy candidate_courses_member_write on public.candidate_courses
  for insert
  with check (is_tenant_member(tenant_id));

create policy candidate_courses_member_update on public.candidate_courses
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy candidate_languages_member_read on public.candidate_languages
  for select
  using (is_tenant_member(tenant_id));

create policy candidate_languages_member_write on public.candidate_languages
  for insert
  with check (is_tenant_member(tenant_id));

create policy candidate_languages_member_update on public.candidate_languages
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy candidate_skills_member_read on public.candidate_skills
  for select
  using (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_skills_member_write on public.candidate_skills
  for insert
  with check (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_skills_member_update on public.candidate_skills
  for update
  using (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)))
  with check (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy job_skills_member_read on public.job_skills
  for select
  using (exists (select 1 from public.jobs j where j.id = job_id and is_tenant_member(j.tenant_id)));

create policy job_skills_member_write on public.job_skills
  for insert
  with check (exists (select 1 from public.jobs j where j.id = job_id and is_tenant_member(j.tenant_id)));

create policy job_skills_member_update on public.job_skills
  for update
  using (exists (select 1 from public.jobs j where j.id = job_id and is_tenant_member(j.tenant_id)))
  with check (exists (select 1 from public.jobs j where j.id = job_id and is_tenant_member(j.tenant_id)));

create policy stage_templates_member_read on public.stage_templates
  for select
  using (is_tenant_member(tenant_id));

create policy stage_templates_member_write on public.stage_templates
  for insert
  with check (is_tenant_member(tenant_id));

create policy stage_templates_member_update on public.stage_templates
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy recruitment_processes_member_read on public.recruitment_processes
  for select
  using (is_tenant_member(tenant_id));

create policy recruitment_processes_member_write on public.recruitment_processes
  for insert
  with check (is_tenant_member(tenant_id));

create policy recruitment_processes_member_update on public.recruitment_processes
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy recruitment_stages_member_read on public.recruitment_stages
  for select
  using (is_tenant_member(tenant_id));

create policy recruitment_stages_member_write on public.recruitment_stages
  for insert
  with check (is_tenant_member(tenant_id));

create policy recruitment_stages_member_update on public.recruitment_stages
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy candidate_processes_member_read on public.candidate_processes
  for select
  using (is_tenant_member(tenant_id));

create policy candidate_processes_member_write on public.candidate_processes
  for insert
  with check (is_tenant_member(tenant_id));

create policy candidate_processes_member_update on public.candidate_processes
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy application_profile_snapshots_member_read on public.application_profile_snapshots
  for select
  using (is_tenant_member(tenant_id));

create policy application_profile_snapshots_member_write on public.application_profile_snapshots
  for insert
  with check (is_tenant_member(tenant_id));

create policy interview_participants_member_read on public.interview_participants
  for select
  using (is_tenant_member(tenant_id));

create policy interview_participants_member_write on public.interview_participants
  for insert
  with check (is_tenant_member(tenant_id));

create policy interview_participants_member_update on public.interview_participants
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy interview_feedback_member_read on public.interview_feedback
  for select
  using (is_tenant_member(tenant_id));

create policy interview_feedback_member_write on public.interview_feedback
  for insert
  with check (is_tenant_member(tenant_id));

create policy interview_feedback_member_update on public.interview_feedback
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- EMPLOYEES
-- ============================================================

alter table public.employees enable row level security;
alter table public.departments enable row level security;
alter table public.positions enable row level security;
alter table public.employee_positions enable row level security;
alter table public.employee_contracts enable row level security;
alter table public.employee_documents enable row level security;
alter table public.employee_status_history enable row level security;

create policy employees_member_read on public.employees
  for select
  using (is_tenant_member(tenant_id));

create policy employees_member_write on public.employees
  for insert
  with check (is_tenant_member(tenant_id));

create policy employees_member_update on public.employees
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy departments_member_read on public.departments
  for select
  using (is_tenant_member(tenant_id));

create policy departments_member_write on public.departments
  for insert
  with check (is_tenant_member(tenant_id));

create policy departments_member_update on public.departments
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy positions_member_read on public.positions
  for select
  using (is_tenant_member(tenant_id));

create policy positions_member_write on public.positions
  for insert
  with check (is_tenant_member(tenant_id));

create policy positions_member_update on public.positions
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy employee_positions_member_read on public.employee_positions
  for select
  using (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_positions_member_write on public.employee_positions
  for insert
  with check (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_positions_member_update on public.employee_positions
  for update
  using (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)))
  with check (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_contracts_member_read on public.employee_contracts
  for select
  using (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_contracts_member_write on public.employee_contracts
  for insert
  with check (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_contracts_member_update on public.employee_contracts
  for update
  using (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)))
  with check (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_documents_member_read on public.employee_documents
  for select
  using (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_documents_member_write on public.employee_documents
  for insert
  with check (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_documents_member_update on public.employee_documents
  for update
  using (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)))
  with check (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_status_history_member_read on public.employee_status_history
  for select
  using (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_status_history_member_write on public.employee_status_history
  for insert
  with check (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

create policy employee_status_history_member_update on public.employee_status_history
  for update
  using (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)))
  with check (exists (select 1 from public.employees e where e.id = employee_id and is_tenant_member(e.tenant_id)));

-- ============================================================
-- CRM
-- ============================================================

alter table public.company_services enable row level security;
alter table public.interactions enable row level security;
alter table public.recruitment_demands enable row level security;

create policy company_services_member_read on public.company_services
  for select
  using (is_tenant_member(tenant_id));

create policy company_services_member_write on public.company_services
  for insert
  with check (is_tenant_member(tenant_id));

create policy company_services_member_update on public.company_services
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy interactions_member_read on public.interactions
  for select
  using (is_tenant_member(tenant_id));

create policy interactions_member_write on public.interactions
  for insert
  with check (is_tenant_member(tenant_id));

create policy interactions_member_update on public.interactions
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy recruitment_demands_member_read on public.recruitment_demands
  for select
  using (is_tenant_member(tenant_id));

create policy recruitment_demands_member_write on public.recruitment_demands
  for insert
  with check (is_tenant_member(tenant_id));

create policy recruitment_demands_member_update on public.recruitment_demands
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- CRM COMMERCIAL
-- ============================================================

alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

create policy leads_member_read on public.leads
  for select
  using (is_tenant_member(tenant_id));

create policy leads_member_write on public.leads
  for insert
  with check (is_tenant_member(tenant_id));

create policy leads_member_update on public.leads
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy customers_member_read on public.customers
  for select
  using (is_tenant_member(tenant_id));

create policy customers_member_write on public.customers
  for insert
  with check (is_tenant_member(tenant_id));

create policy customers_member_update on public.customers
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy quotes_member_read on public.quotes
  for select
  using (is_tenant_member(tenant_id));

create policy quotes_member_write on public.quotes
  for insert
  with check (is_tenant_member(tenant_id));

create policy quotes_member_update on public.quotes
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy quote_items_member_read on public.quote_items
  for select
  using (exists (select 1 from public.quotes q where q.id = quote_id and is_tenant_member(q.tenant_id)));

create policy quote_items_member_write on public.quote_items
  for insert
  with check (exists (select 1 from public.quotes q where q.id = quote_id and is_tenant_member(q.tenant_id)));

create policy quote_items_member_update on public.quote_items
  for update
  using (exists (select 1 from public.quotes q where q.id = quote_id and is_tenant_member(q.tenant_id)))
  with check (exists (select 1 from public.quotes q where q.id = quote_id and is_tenant_member(q.tenant_id)));

create policy sales_member_read on public.sales
  for select
  using (is_tenant_member(tenant_id));

create policy sales_member_write on public.sales
  for insert
  with check (is_tenant_member(tenant_id));

create policy sales_member_update on public.sales
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy sale_items_member_read on public.sale_items
  for select
  using (exists (select 1 from public.sales s where s.id = sale_id and is_tenant_member(s.tenant_id)));

create policy sale_items_member_write on public.sale_items
  for insert
  with check (exists (select 1 from public.sales s where s.id = sale_id and is_tenant_member(s.tenant_id)));

create policy sale_items_member_update on public.sale_items
  for update
  using (exists (select 1 from public.sales s where s.id = sale_id and is_tenant_member(s.tenant_id)))
  with check (exists (select 1 from public.sales s where s.id = sale_id and is_tenant_member(s.tenant_id)));

-- ============================================================
-- TALENT POOL
-- ============================================================

alter table public.talent_pool_memberships enable row level security;
alter table public.job_matches enable row level security;
alter table public.candidate_profile_views enable row level security;

create policy talent_pool_memberships_member_read on public.talent_pool_memberships
  for select
  using (is_tenant_member(tenant_id));

create policy talent_pool_memberships_member_write on public.talent_pool_memberships
  for insert
  with check (is_tenant_member(tenant_id));

create policy talent_pool_memberships_member_update on public.talent_pool_memberships
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy job_matches_member_read on public.job_matches
  for select
  using (is_tenant_member(tenant_id));

create policy job_matches_member_write on public.job_matches
  for insert
  with check (is_tenant_member(tenant_id));

create policy job_matches_member_update on public.job_matches
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy candidate_profile_views_member_read on public.candidate_profile_views
  for select
  using (is_tenant_member(tenant_id));

create policy candidate_profile_views_member_write on public.candidate_profile_views
  for insert
  with check (is_tenant_member(tenant_id));

create policy candidate_profile_views_member_update on public.candidate_profile_views
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- INVENTORY
-- ============================================================

alter table public.warehouses enable row level security;
alter table public.warehouse_locations enable row level security;
alter table public.product_categories enable row level security;
alter table public.stock_lots enable row level security;
alter table public.stock_inventory enable row level security;
alter table public.stock_inventory_items enable row level security;

create policy warehouses_member_read on public.warehouses
  for select
  using (is_tenant_member(tenant_id));

create policy warehouses_member_write on public.warehouses
  for insert
  with check (is_tenant_member(tenant_id));

create policy warehouses_member_update on public.warehouses
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy warehouse_locations_member_read on public.warehouse_locations
  for select
  using (is_tenant_member(tenant_id));

create policy warehouse_locations_member_write on public.warehouse_locations
  for insert
  with check (is_tenant_member(tenant_id));

create policy warehouse_locations_member_update on public.warehouse_locations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy product_categories_member_read on public.product_categories
  for select
  using (is_tenant_member(tenant_id));

create policy product_categories_member_write on public.product_categories
  for insert
  with check (is_tenant_member(tenant_id));

create policy product_categories_member_update on public.product_categories
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy stock_lots_member_read on public.stock_lots
  for select
  using (is_tenant_member(tenant_id));

create policy stock_lots_member_write on public.stock_lots
  for insert
  with check (is_tenant_member(tenant_id));

create policy stock_lots_member_update on public.stock_lots
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy stock_inventory_member_read on public.stock_inventory
  for select
  using (is_tenant_member(tenant_id));

create policy stock_inventory_member_write on public.stock_inventory
  for insert
  with check (is_tenant_member(tenant_id));

create policy stock_inventory_member_update on public.stock_inventory
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy stock_inventory_items_member_read on public.stock_inventory_items
  for select
  using (is_tenant_member(tenant_id));

create policy stock_inventory_items_member_write on public.stock_inventory_items
  for insert
  with check (is_tenant_member(tenant_id));

create policy stock_inventory_items_member_update on public.stock_inventory_items
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- PURCHASING
-- ============================================================

alter table public.purchase_requests enable row level security;
alter table public.purchase_request_items enable row level security;
alter table public.purchase_quotations enable row level security;
alter table public.purchase_quotation_items enable row level security;
alter table public.purchase_status_history enable row level security;
alter table public.purchase_receipt_divergences enable row level security;

create policy purchase_requests_member_read on public.purchase_requests
  for select
  using (is_tenant_member(tenant_id));

create policy purchase_requests_member_write on public.purchase_requests
  for insert
  with check (is_tenant_member(tenant_id));

create policy purchase_requests_member_update on public.purchase_requests
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy purchase_request_items_member_read on public.purchase_request_items
  for select
  using (exists (select 1 from public.purchase_requests pr where pr.id = request_id and is_tenant_member(pr.tenant_id)));

create policy purchase_request_items_member_write on public.purchase_request_items
  for insert
  with check (exists (select 1 from public.purchase_requests pr where pr.id = request_id and is_tenant_member(pr.tenant_id)));

create policy purchase_request_items_member_update on public.purchase_request_items
  for update
  using (exists (select 1 from public.purchase_requests pr where pr.id = request_id and is_tenant_member(pr.tenant_id)))
  with check (exists (select 1 from public.purchase_requests pr where pr.id = request_id and is_tenant_member(pr.tenant_id)));

create policy purchase_quotations_member_read on public.purchase_quotations
  for select
  using (is_tenant_member(tenant_id));

create policy purchase_quotations_member_write on public.purchase_quotations
  for insert
  with check (is_tenant_member(tenant_id));

create policy purchase_quotations_member_update on public.purchase_quotations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy purchase_quotation_items_member_read on public.purchase_quotation_items
  for select
  using (exists (select 1 from public.purchase_quotations pq where pq.id = quotation_id and is_tenant_member(pq.tenant_id)));

create policy purchase_quotation_items_member_write on public.purchase_quotation_items
  for insert
  with check (exists (select 1 from public.purchase_quotations pq where pq.id = quotation_id and is_tenant_member(pq.tenant_id)));

create policy purchase_status_history_member_read on public.purchase_status_history
  for select
  using (exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and is_tenant_member(po.tenant_id)));

create policy purchase_status_history_member_write on public.purchase_status_history
  for insert
  with check (exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and is_tenant_member(po.tenant_id)));

create policy purchase_receipt_divergences_member_read on public.purchase_receipt_divergences
  for select
  using (exists (select 1 from public.purchase_receipts pr where pr.id = purchase_receipt_id and is_tenant_member(pr.tenant_id)));

create policy purchase_receipt_divergences_member_write on public.purchase_receipt_divergences
  for insert
  with check (exists (select 1 from public.purchase_receipts pr where pr.id = purchase_receipt_id and is_tenant_member(pr.tenant_id)));

-- ============================================================
-- TASKS / SUPPORT
-- ============================================================

alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.task_status_history enable row level security;

create policy task_comments_member_read on public.task_comments
  for select
  using (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_comments_member_write on public.task_comments
  for insert
  with check (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_comments_member_update on public.task_comments
  for update
  using (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)))
  with check (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_attachments_member_read on public.task_attachments
  for select
  using (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_attachments_member_write on public.task_attachments
  for insert
  with check (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_attachments_member_update on public.task_attachments
  for update
  using (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)))
  with check (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_status_history_member_read on public.task_status_history
  for select
  using (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_status_history_member_write on public.task_status_history
  for insert
  with check (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_status_history_member_update on public.task_status_history
  for update
  using (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)))
  with check (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

-- ============================================================
-- CHAT / SECURITY
-- ============================================================

alter table public.ai_usage enable row level security;
alter table public.sessions enable row level security;
alter table public.password_policies enable row level security;

create policy ai_usage_member_read on public.ai_usage
  for select
  using (is_tenant_member(tenant_id));

create policy ai_usage_member_write on public.ai_usage
  for insert
  with check (is_tenant_member(tenant_id));

create policy ai_usage_member_update on public.ai_usage
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy sessions_member_read on public.sessions
  for select
  using (is_tenant_member(tenant_id));

create policy sessions_member_write on public.sessions
  for insert
  with check (is_tenant_member(tenant_id));

create policy password_policies_member_read on public.password_policies
  for select
  using (is_tenant_member(tenant_id));

create policy password_policies_member_write on public.password_policies
  for insert
  with check (is_tenant_member(tenant_id));

create policy password_policies_member_update on public.password_policies
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- AUTOMATION
-- ============================================================

alter table public.automation_templates enable row level security;

create policy automation_templates_member_read on public.automation_templates
  for select
  using (is_tenant_member(tenant_id));

create policy automation_templates_member_write on public.automation_templates
  for insert
  with check (is_tenant_member(tenant_id));

create policy automation_templates_member_update on public.automation_templates
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

alter table public.notification_preferences enable row level security;

create policy notification_preferences_member_read on public.notification_preferences
  for select
  using (is_tenant_member(tenant_id));

create policy notification_preferences_member_write on public.notification_preferences
  for insert
  with check (is_tenant_member(tenant_id));

create policy notification_preferences_member_update on public.notification_preferences
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- REPORTS / VIEWS
-- ============================================================

alter table public.report_definitions enable row level security;
alter table public.report_executions enable row level security;
alter table public.report_schedules enable row level security;
alter table public.dashboard_widgets enable row level security;
alter table public.dashboard_layouts enable row level security;

create policy report_definitions_member_read on public.report_definitions
  for select
  using (is_tenant_member(tenant_id));

create policy report_definitions_member_write on public.report_definitions
  for insert
  with check (is_tenant_member(tenant_id));

create policy report_definitions_member_update on public.report_definitions
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy report_executions_member_read on public.report_executions
  for select
  using (is_tenant_member(tenant_id));

create policy report_executions_member_write on public.report_executions
  for insert
  with check (is_tenant_member(tenant_id));

create policy report_schedules_member_read on public.report_schedules
  for select
  using (is_tenant_member(tenant_id));

create policy report_schedules_member_write on public.report_schedules
  for insert
  with check (is_tenant_member(tenant_id));

create policy report_schedules_member_update on public.report_schedules
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy dashboard_widgets_member_read on public.dashboard_widgets
  for select
  using (is_tenant_member(tenant_id));

create policy dashboard_widgets_member_write on public.dashboard_widgets
  for insert
  with check (is_tenant_member(tenant_id));

create policy dashboard_widgets_member_update on public.dashboard_widgets
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy dashboard_layouts_member_read on public.dashboard_layouts
  for select
  using (is_tenant_member(tenant_id));

create policy dashboard_layouts_member_write on public.dashboard_layouts
  for insert
  with check (is_tenant_member(tenant_id));

create policy dashboard_layouts_member_update on public.dashboard_layouts
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- VALIDATION
-- ============================================================

alter table public.validation_results enable row level security;

create policy validation_results_member_read on public.validation_results
  for select
  using (is_tenant_member(tenant_id));

create policy validation_results_member_write on public.validation_results
  for insert
  with check (is_tenant_member(tenant_id));

create policy validation_results_member_update on public.validation_results
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- AUTOMATION
-- ============================================================

alter table public.webhook_deliveries enable row level security;
alter table public.automation_jobs enable row level security;
alter table public.automation_executions enable row level security;

create policy webhook_deliveries_member_read on public.webhook_deliveries
  for select
  using (is_tenant_member(tenant_id));

create policy webhook_deliveries_member_write on public.webhook_deliveries
  for insert
  with check (is_tenant_member(tenant_id));

create policy automation_jobs_member_read on public.automation_jobs
  for select
  using (is_tenant_member(tenant_id));

create policy automation_jobs_member_write on public.automation_jobs
  for insert
  with check (is_tenant_member(tenant_id));

create policy automation_jobs_member_update on public.automation_jobs
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy automation_executions_member_read on public.automation_executions
  for select
  using (is_tenant_member(tenant_id));

create policy automation_executions_member_write on public.automation_executions
  for insert
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- FISCAL INTEGRATIONS
-- ============================================================

alter table public.fiscal_integrations enable row level security;

create policy fiscal_integrations_member_read on public.fiscal_integrations
  for select
  using (is_tenant_member(tenant_id));

create policy fiscal_integrations_member_write on public.fiscal_integrations
  for insert
  with check (is_tenant_member(tenant_id));

create policy fiscal_integrations_member_update on public.fiscal_integrations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- SCHEDULING / CALENDAR / EMAIL
-- ============================================================

alter table public.calendar_integrations enable row level security;
alter table public.calendars enable row level security;
alter table public.calendar_events enable row level security;
alter table public.event_participants enable row level security;
alter table public.meeting_rooms enable row level security;
alter table public.meeting_room_reservations enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_messages enable row level security;
alter table public.integration_sync_jobs enable row level security;

create policy calendar_integrations_member_read on public.calendar_integrations
  for select
  using (is_tenant_member(tenant_id));

create policy calendar_integrations_member_write on public.calendar_integrations
  for insert
  with check (is_tenant_member(tenant_id));

create policy calendar_integrations_member_update on public.calendar_integrations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy calendars_member_read on public.calendars
  for select
  using (is_tenant_member(tenant_id));

create policy calendars_member_write on public.calendars
  for insert
  with check (is_tenant_member(tenant_id));

create policy calendars_member_update on public.calendars
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy calendar_events_member_read on public.calendar_events
  for select
  using (is_tenant_member(tenant_id));

create policy calendar_events_member_write on public.calendar_events
  for insert
  with check (is_tenant_member(tenant_id));

create policy calendar_events_member_update on public.calendar_events
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy event_participants_member_read on public.event_participants
  for select
  using (exists (select 1 from public.calendar_events ce where ce.id = event_id and is_tenant_member(ce.tenant_id)));

create policy event_participants_member_write on public.event_participants
  for insert
  with check (exists (select 1 from public.calendar_events ce where ce.id = event_id and is_tenant_member(ce.tenant_id)));

create policy event_participants_member_update on public.event_participants
  for update
  using (exists (select 1 from public.calendar_events ce where ce.id = event_id and is_tenant_member(ce.tenant_id)))
  with check (exists (select 1 from public.calendar_events ce where ce.id = event_id and is_tenant_member(ce.tenant_id)));

create policy meeting_rooms_member_read on public.meeting_rooms
  for select
  using (is_tenant_member(tenant_id));

create policy meeting_rooms_member_write on public.meeting_rooms
  for insert
  with check (is_tenant_member(tenant_id));

create policy meeting_rooms_member_update on public.meeting_rooms
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy meeting_room_reservations_member_read on public.meeting_room_reservations
  for select
  using (is_tenant_member(tenant_id));

create policy meeting_room_reservations_member_write on public.meeting_room_reservations
  for insert
  with check (is_tenant_member(tenant_id));

create policy meeting_room_reservations_member_update on public.meeting_room_reservations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy email_templates_member_read on public.email_templates
  for select
  using (is_tenant_member(tenant_id));

create policy email_templates_member_write on public.email_templates
  for insert
  with check (is_tenant_member(tenant_id));

create policy email_templates_member_update on public.email_templates
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy email_messages_member_read on public.email_messages
  for select
  using (is_tenant_member(tenant_id));

create policy email_messages_member_write on public.email_messages
  for insert
  with check (is_tenant_member(tenant_id));

create policy integration_sync_jobs_member_read on public.integration_sync_jobs
  for select
  using (is_tenant_member(tenant_id));

create policy integration_sync_jobs_member_write on public.integration_sync_jobs
  for insert
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- SERVICE ORDERS
-- ============================================================

alter table public.service_orders enable row level security;
alter table public.service_order_items enable row level security;
alter table public.service_acceptances enable row level security;
alter table public.service_executions enable row level security;
alter table public.service_attachments enable row level security;
alter table public.service_order_status_history enable row level security;

create policy service_orders_member_read on public.service_orders
  for select
  using (is_tenant_member(tenant_id));

create policy service_orders_member_write on public.service_orders
  for insert
  with check (is_tenant_member(tenant_id));

create policy service_orders_member_update on public.service_orders
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy service_order_items_member_read on public.service_order_items
  for select
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_order_items_member_write on public.service_order_items
  for insert
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_order_items_member_update on public.service_order_items
  for update
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)))
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_acceptances_member_read on public.service_acceptances
  for select
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_acceptances_member_write on public.service_acceptances
  for insert
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_acceptances_member_update on public.service_acceptances
  for update
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)))
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_executions_member_read on public.service_executions
  for select
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_executions_member_write on public.service_executions
  for insert
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_executions_member_update on public.service_executions
  for update
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)))
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_attachments_member_read on public.service_attachments
  for select
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_attachments_member_write on public.service_attachments
  for insert
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_attachments_member_update on public.service_attachments
  for update
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)))
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_order_status_history_member_read on public.service_order_status_history
  for select
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_order_status_history_member_write on public.service_order_status_history
  for insert
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));

create policy service_order_status_history_member_update on public.service_order_status_history
  for update
  using (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)))
  with check (exists (select 1 from public.service_orders so where so.id = service_order_id and is_tenant_member(so.tenant_id)));
