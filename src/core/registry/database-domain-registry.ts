/**
 * Registro central de mapeamento tabela → domínio → célula (CHECK BOULER 24H).
 * Fonte: inventário real do schema público Supabase (234 tabelas).
 */
export interface TableDomainEntry {
  table: string;
  domain: string;
  cell: string;
  shared: boolean;
  consumers: string[];
  operations: string[];
  status: 'implemented' | 'partial' | 'absent';
}

export const DATABASE_DOMAIN_REGISTRY: TableDomainEntry[] = [
  // === IDENTIDADE E ACESSO ===
  { table: 'people', domain: 'identity', cell: 'core', shared: true, consumers: ['admin-tenant','candidato','recrutamento','empresas'], operations: ['read','write'], status: 'implemented' },
  { table: 'tenants', domain: 'identity', cell: 'core', shared: true, consumers: ['admin-tenant','admin-master'], operations: ['read','write'], status: 'implemented' },
  { table: 'tenant_memberships', domain: 'identity', cell: 'core', shared: true, consumers: ['admin-tenant','admin-master'], operations: ['read','write'], status: 'implemented' },
  { table: 'tenant_settings', domain: 'identity', cell: 'core', shared: true, consumers: ['admin-tenant'], operations: ['read','write'], status: 'partial' },
  { table: 'roles', domain: 'identity', cell: 'core', shared: true, consumers: ['admin-tenant','admin-master'], operations: ['read','write'], status: 'implemented' },
  { table: 'permissions', domain: 'identity', cell: 'core', shared: true, consumers: ['admin-tenant','admin-master'], operations: ['read'], status: 'implemented' },
  { table: 'role_permissions', domain: 'identity', cell: 'core', shared: true, consumers: ['admin-tenant','admin-master'], operations: ['read','write'], status: 'implemented' },
  { table: 'role_assignments', domain: 'identity', cell: 'core', shared: true, consumers: ['admin-tenant','admin-master'], operations: ['read','write'], status: 'implemented' },
  { table: 'first_login_state', domain: 'identity', cell: 'core', shared: true, consumers: ['core'], operations: ['read','write'], status: 'implemented' },
  { table: 'legal_acceptances', domain: 'identity', cell: 'core', shared: true, consumers: ['core'], operations: ['read','write'], status: 'implemented' },
  { table: 'consents', domain: 'identity', cell: 'core', shared: true, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'sessions', domain: 'identity', cell: 'core', shared: true, consumers: ['core'], operations: ['read'], status: 'implemented' },
  { table: 'password_policies', domain: 'identity', cell: 'core', shared: true, consumers: ['core'], operations: ['read'], status: 'partial' },

  // === CANDIDATO ===
  { table: 'candidates', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato','recrutamento'], operations: ['read','write'], status: 'implemented' },
  { table: 'candidate_courses', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'candidate_documents', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato','recrutamento'], operations: ['read','write'], status: 'partial' },
  { table: 'candidate_education', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'candidate_experiences', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'candidate_job_alerts', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'candidate_languages', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'candidate_portal_modules', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read'], status: 'partial' },
  { table: 'candidate_preferences', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'candidate_processes', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato','recrutamento'], operations: ['read'], status: 'partial' },
  { table: 'candidate_profile_views', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato','recrutamento'], operations: ['read'], status: 'partial' },
  { table: 'candidate_skills', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'favorite_jobs', domain: 'candidato', cell: 'candidato', shared: false, consumers: ['candidato'], operations: ['read','write'], status: 'partial' },

  // === RECRUTAMENTO ===
  { table: 'jobs', domain: 'recrutamento', cell: 'recrutamento', shared: true, consumers: ['recrutamento','candidato','empresas'], operations: ['read','write'], status: 'implemented' },
  { table: 'job_skills', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'partial' },
  { table: 'job_matches', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento','candidato'], operations: ['read','write'], status: 'implemented' },
  { table: 'applications', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento','candidato'], operations: ['read','write'], status: 'implemented' },
  { table: 'application_profile_snapshots', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read'], status: 'partial' },
  { table: 'application_status_history', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read'], status: 'partial' },
  { table: 'recruitment_demands', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'partial' },
  { table: 'recruitment_kpis', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read'], status: 'partial' },
  { table: 'recruitment_processes', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'implemented' },
  { table: 'recruitment_stages', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'implemented' },
  { table: 'stage_templates', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'partial' },
  { table: 'talent_pool_memberships', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'implemented' },
  { table: 'interviews', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'partial' },
  { table: 'interview_feedback', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'partial' },
  { table: 'interview_followups', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'partial' },
  { table: 'interview_participants', domain: 'recrutamento', cell: 'recrutamento', shared: false, consumers: ['recrutamento'], operations: ['read','write'], status: 'partial' },

  // === EMPRESAS ===
  { table: 'companies', domain: 'empresas', cell: 'empresas', shared: true, consumers: ['empresas','recrutamento'], operations: ['read','write'], status: 'implemented' },
  { table: 'company_contacts', domain: 'empresas', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'company_locations', domain: 'empresas', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'company_relationship_types', domain: 'empresas', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read'], status: 'partial' },
  { table: 'company_relationships', domain: 'empresas', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'company_services', domain: 'empresas', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'company_social_links', domain: 'empresas', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'public_companies_by_type', domain: 'empresas', cell: 'empresas', shared: true, consumers: ['public'], operations: ['read'], status: 'partial' },

  // === SERVIÇOS ===
  { table: 'services', domain: 'servicos', cell: 'servicos', shared: true, consumers: ['servicos','empresas'], operations: ['read','write'], status: 'implemented' },
  { table: 'service_orders', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'service_order_items', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'service_order_status_history', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read'], status: 'partial' },
  { table: 'service_executions', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'service_occurrences', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'service_attachments', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'service_acceptances', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'service_sla', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'work_orders', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos','operacoes'], operations: ['read','write'], status: 'partial' },
  { table: 'work_order_acceptances', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'work_order_assignments', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'work_order_attachments', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'work_order_checklists', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'work_order_materials', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'work_order_occurrences', domain: 'servicos', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'public_services_v1', domain: 'servicos', cell: 'servicos', shared: true, consumers: ['public'], operations: ['read'], status: 'partial' },

  // === FINANCEIRO ===
  { table: 'financial_accounts', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'financial_categories', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'financial_transactions', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'financial_installments', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'financial_installment_payments', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'financial_installment_cancellations', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'financial_kpis', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read'], status: 'partial' },
  { table: 'accounts_payable', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'accounts_receivable', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'cash_flows', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'bank_accounts', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'bank_reconciliations', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'cost_centers', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'invoices', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'invoice_items', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'payments', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'quotes', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'quote_items', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'receipts', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'sales', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro','pos'], operations: ['read','write'], status: 'partial' },
  { table: 'sale_items', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro','pos'], operations: ['read','write'], status: 'partial' },
  { table: 'contracts', domain: 'financeiro', cell: 'financeiro', shared: true, consumers: ['financeiro','empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'contract_status_history', domain: 'financeiro', cell: 'financeiro', shared: false, consumers: ['financeiro'], operations: ['read'], status: 'partial' },
  { table: 'tax_rates', domain: 'financeiro', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read','write'], status: 'partial' },
  { table: 'tax_calculations', domain: 'financeiro', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read','write'], status: 'partial' },

  // === FISCAL ===
  { table: 'fiscal_documents', domain: 'fiscal', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read','write'], status: 'partial' },
  { table: 'fiscal_document_items', domain: 'fiscal', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read','write'], status: 'partial' },
  { table: 'fiscal_document_status_history', domain: 'fiscal', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read'], status: 'partial' },
  { table: 'fiscal_document_events', domain: 'fiscal', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read'], status: 'partial' },
  { table: 'fiscal_integrations', domain: 'fiscal', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read','write'], status: 'partial' },
  { table: 'fiscal_configurations', domain: 'fiscal', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read','write'], status: 'partial' },
  { table: 'fiscal_api_requests', domain: 'fiscal', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read'], status: 'partial' },
  { table: 'fiscal_api_responses', domain: 'fiscal', cell: 'fiscal', shared: false, consumers: ['fiscal'], operations: ['read'], status: 'partial' },

  // === ESTOQUE ===
  { table: 'products', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'product_categories', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'stock_balances', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read'], status: 'partial' },
  { table: 'stock_entries', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'stock_inventory', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'stock_inventory_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'stock_lots', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'stock_movements', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'warehouses', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'warehouse_locations', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'material_issues', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'material_issue_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'material_returns', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'material_return_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_orders', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_order_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_quotations', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_quotation_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_receipts', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_receipt_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_receipt_divergences', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_requests', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_request_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'purchase_status_history', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read'], status: 'partial' },
  { table: 'suppliers', domain: 'estoque', cell: 'estoque', shared: true, consumers: ['estoque','financeiro'], operations: ['read','write'], status: 'partial' },
  { table: 'epi_deliveries', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque','rh'], operations: ['read','write'], status: 'partial' },
  { table: 'epi_delivery_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'epi_returns', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },
  { table: 'epi_return_items', domain: 'estoque', cell: 'estoque', shared: false, consumers: ['estoque'], operations: ['read','write'], status: 'partial' },

  // === RH ===
  { table: 'employees', domain: 'rh', cell: 'rh', shared: false, consumers: ['rh'], operations: ['read','write'], status: 'partial' },
  { table: 'employee_contracts', domain: 'rh', cell: 'rh', shared: false, consumers: ['rh'], operations: ['read','write'], status: 'partial' },
  { table: 'employee_documents', domain: 'rh', cell: 'rh', shared: false, consumers: ['rh'], operations: ['read','write'], status: 'partial' },
  { table: 'employee_positions', domain: 'rh', cell: 'rh', shared: false, consumers: ['rh'], operations: ['read','write'], status: 'partial' },
  { table: 'employee_status_history', domain: 'rh', cell: 'rh', shared: false, consumers: ['rh'], operations: ['read'], status: 'partial' },
  { table: 'positions', domain: 'rh', cell: 'rh', shared: false, consumers: ['rh'], operations: ['read','write'], status: 'partial' },
  { table: 'departments', domain: 'rh', cell: 'rh', shared: false, consumers: ['rh'], operations: ['read','write'], status: 'partial' },

  // === POS ===
  { table: 'pos_terminals', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_cashiers', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_cashier_sessions', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_cash_movements', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_sales', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_sale_items', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_payments', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_returns', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_cancellations', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_daily_closures', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },
  { table: 'pos_operators', domain: 'pos', cell: 'pos', shared: false, consumers: ['pos'], operations: ['read','write'], status: 'partial' },

  // === SUPORTE ===
  { table: 'support_tickets', domain: 'suporte', cell: 'suporte', shared: false, consumers: ['suporte'], operations: ['read','write'], status: 'partial' },
  { table: 'support_ticket_categories', domain: 'suporte', cell: 'suporte', shared: false, consumers: ['suporte'], operations: ['read','write'], status: 'partial' },
  { table: 'support_ticket_messages', domain: 'suporte', cell: 'suporte', shared: false, consumers: ['suporte'], operations: ['read','write'], status: 'partial' },
  { table: 'support_ticket_status_history', domain: 'suporte', cell: 'suporte', shared: false, consumers: ['suporte'], operations: ['read'], status: 'partial' },
  { table: 'support_ticket_assignments', domain: 'suporte', cell: 'suporte', shared: false, consumers: ['suporte'], operations: ['read','write'], status: 'partial' },

  // === CURSOS / AVA ===
  { table: 'courses', domain: 'learning', cell: 'ava', shared: true, consumers: ['ava','candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'course_providers', domain: 'learning', cell: 'ava', shared: false, consumers: ['ava'], operations: ['read','write'], status: 'partial' },
  { table: 'course_lessons', domain: 'learning', cell: 'ava', shared: false, consumers: ['ava'], operations: ['read','write'], status: 'partial' },
  { table: 'course_enrollments', domain: 'learning', cell: 'ava', shared: false, consumers: ['ava','candidato'], operations: ['read','write'], status: 'partial' },
  { table: 'course_lesson_progress', domain: 'learning', cell: 'ava', shared: false, consumers: ['ava'], operations: ['read','write'], status: 'partial' },
  { table: 'skills', domain: 'learning', cell: 'core', shared: true, consumers: ['candidato','recrutamento'], operations: ['read','write'], status: 'partial' },

  // === BLOG / CONTEÚDO ===
  { table: 'blog_posts', domain: 'conteudo', cell: 'servicos', shared: true, consumers: ['public','admin-master'], operations: ['read','write'], status: 'partial' },
  { table: 'blog_categories', domain: 'conteudo', cell: 'servicos', shared: true, consumers: ['public','admin-master'], operations: ['read','write'], status: 'partial' },
  { table: 'faqs', domain: 'conteudo', cell: 'servicos', shared: true, consumers: ['public'], operations: ['read','write'], status: 'partial' },
  { table: 'page_templates', domain: 'conteudo', cell: 'servicos', shared: false, consumers: ['servicos'], operations: ['read','write'], status: 'partial' },
  { table: 'footer_configs', domain: 'conteudo', cell: 'core', shared: true, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'global_navigation_links', domain: 'conteudo', cell: 'core', shared: true, consumers: ['core'], operations: ['read','write'], status: 'partial' },

  // === MÍDIA ===
  { table: 'media_assets', domain: 'media', cell: 'media', shared: true, consumers: ['media','candidato','empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'files', domain: 'media', cell: 'media', shared: true, consumers: ['media','core'], operations: ['read','write'], status: 'partial' },
  { table: 'file_uploads', domain: 'media', cell: 'media', shared: true, consumers: ['media'], operations: ['read','write'], status: 'partial' },
  { table: 'document_links', domain: 'media', cell: 'media', shared: true, consumers: ['media'], operations: ['read','write'], status: 'partial' },
  { table: 'document_versions', domain: 'media', cell: 'media', shared: true, consumers: ['media'], operations: ['read','write'], status: 'partial' },
  { table: 'file_access_logs', domain: 'media', cell: 'media', shared: false, consumers: ['media'], operations: ['read'], status: 'partial' },

  // === NOTIFICAÇÕES / COMUNICAÇÃO ===
  { table: 'notifications', domain: 'notificacoes', cell: 'core', shared: true, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'notification_deliveries', domain: 'notificacoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'notification_preferences', domain: 'notificacoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'email_messages', domain: 'notificacoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'email_templates', domain: 'notificacoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'chat_rooms', domain: 'notificacoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'chat_messages', domain: 'notificacoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'chat_participants', domain: 'notificacoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'chat_handoffs', domain: 'notificacoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },

  // === AUDITORIA / SEGURANÇA ===
  { table: 'audit_logs', domain: 'seguranca', cell: 'core', shared: true, consumers: ['core','admin-tenant','admin-master'], operations: ['read'], status: 'partial' },
  { table: 'activity_logs', domain: 'seguranca', cell: 'core', shared: true, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'security_events', domain: 'seguranca', cell: 'core', shared: true, consumers: ['core','admin-tenant'], operations: ['read'], status: 'partial' },
  { table: 'validation_results', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'domain_events', domain: 'seguranca', cell: 'core', shared: true, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'event_outbox', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'event_deliveries', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'file_access_logs', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },

  // === INTEGRAÇÕES ===
  { table: 'integration_connections', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'integration_credentials', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'integration_errors', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'integration_events', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'integration_sync_jobs', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'integration_sync_runs', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'integration_webhooks', domain: 'integracoes', cell: 'integracoes', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'webhook_deliveries', domain: 'integracoes', cell: 'integracoes', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'provider_configs', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'providers', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'automation_jobs', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'automation_executions', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'automation_templates', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'calendar_events', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'calendar_integrations', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'calendars', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'meeting_rooms', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'meeting_room_reservations', domain: 'integracoes', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },

  // === AI ===
  { table: 'ai_conversations', domain: 'ai', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'ai_messages', domain: 'ai', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'ai_usage', domain: 'ai', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },

  // === TASKS ===
  { table: 'tasks', domain: 'tarefas', cell: 'core', shared: true, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'task_attachments', domain: 'tarefas', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'task_comments', domain: 'tarefas', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'task_status_history', domain: 'tarefas', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },

  // === LEADS / CUSTOMERS ===
  { table: 'leads', domain: 'comercial', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'customers', domain: 'comercial', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'customer_feedback', domain: 'comercial', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'customer_ratings', domain: 'comercial', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'interactions', domain: 'comercial', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },

  // === ADMINISTRATIVO ===
  { table: 'administrative_requests', domain: 'admin', cell: 'admin-master', shared: false, consumers: ['admin-master'], operations: ['read','write'], status: 'partial' },
  { table: 'administrative_approvals', domain: 'admin', cell: 'admin-master', shared: false, consumers: ['admin-master'], operations: ['read','write'], status: 'partial' },
  { table: 'administrative_documents', domain: 'admin', cell: 'admin-master', shared: false, consumers: ['admin-master'], operations: ['read','write'], status: 'partial' },
  { table: 'administrative_tasks', domain: 'admin', cell: 'admin-master', shared: false, consumers: ['admin-master'], operations: ['read','write'], status: 'partial' },

  // === PRIVACIDADE / DADOS ===
  { table: 'privacy_requests', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'data_deletion_requests', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'data_export_requests', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'data_retention_policies', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },

  // === REPORTS ===
  { table: 'report_definitions', domain: 'analytics', cell: 'core', shared: true, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'report_executions', domain: 'analytics', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'report_schedules', domain: 'analytics', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'dashboard_layouts', domain: 'analytics', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },
  { table: 'dashboard_widgets', domain: 'analytics', cell: 'core', shared: false, consumers: ['core'], operations: ['read','write'], status: 'partial' },

  // === TERCEIROS / CUSTÓDIA ===
  { table: 'third_party_custody', domain: 'operacoes', cell: 'operacoes', shared: false, consumers: ['operacoes'], operations: ['read','write'], status: 'partial' },
  { table: 'third_party_custody_items', domain: 'operacoes', cell: 'operacoes', shared: false, consumers: ['operacoes'], operations: ['read','write'], status: 'partial' },
  { table: 'event_participants', domain: 'seguranca', cell: 'core', shared: false, consumers: ['core'], operations: ['read'], status: 'partial' },
  { table: 'feedback', domain: 'comercial', cell: 'empresas', shared: false, consumers: ['empresas'], operations: ['read','write'], status: 'partial' },
  { table: 'public_jobs_v1', domain: 'recrutamento', cell: 'recrutamento', shared: true, consumers: ['public'], operations: ['read'], status: 'partial' },
];

export function getTablesByCell(cell: string): TableDomainEntry[] {
  return DATABASE_DOMAIN_REGISTRY.filter(e => e.cell === cell);
}

export function getTablesByDomain(domain: string): TableDomainEntry[] {
  return DATABASE_DOMAIN_REGISTRY.filter(e => e.domain === domain);
}

export function getUnmappedTables(allTables: string[]): string[] {
  const mapped = new Set(DATABASE_DOMAIN_REGISTRY.map(e => e.table));
  return allTables.filter(t => !mapped.has(t));
}
