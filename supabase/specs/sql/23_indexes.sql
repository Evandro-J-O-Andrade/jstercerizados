-- 23_indexes.sql
-- Performance indexes for V2.1 SaaS workload

-- ============================================================
-- CORE / TENANCY
-- ============================================================

create index idx_people_auth_user_id on public.people(auth_user_id);
create index idx_people_status on public.people(status);
create index idx_tenant_memberships_person_id on public.tenant_memberships(person_id);
create index idx_tenant_memberships_tenant_id on public.tenant_memberships(tenant_id);
create index idx_tenant_memberships_status on public.tenant_memberships(tenant_id, status);
create index idx_tenant_settings_tenant_id on public.tenant_settings(tenant_id);

-- ============================================================
-- RBAC
-- ============================================================

create index idx_roles_scope on public.roles(scope);
create index idx_role_permissions_role_id on public.role_permissions(role_id);
create index idx_role_permissions_permission_id on public.role_permissions(permission_id);
create index idx_role_assignments_person_id on public.role_assignments(person_id);
create index idx_role_assignments_tenant_id on public.role_assignments(tenant_id);
create index idx_role_assignments_person_tenant on public.role_assignments(person_id, tenant_id);

-- ============================================================
-- CRM
-- ============================================================

create index idx_companies_tenant_id on public.companies(tenant_id);
create index idx_companies_status on public.companies(tenant_id, status);
create index idx_companies_document on public.companies(document);
create index idx_company_relationships_company_id on public.company_relationships(company_id);
create index idx_company_relationships_status on public.company_relationships(company_id, status);
create index idx_company_contacts_company_id on public.company_contacts(company_id);

-- ============================================================
-- RH / RECRUITMENT
-- ============================================================

create index idx_candidates_tenant_id on public.candidates(tenant_id);
create index idx_candidates_status on public.candidates(tenant_id, status);
create index idx_candidates_person_id on public.candidates(person_id);
create index idx_jobs_tenant_id on public.jobs(tenant_id);
create index idx_jobs_status on public.jobs(tenant_id, status);
create index idx_jobs_company_id on public.jobs(company_id);
create index idx_jobs_published_at on public.jobs(tenant_id, published_at);
create index idx_applications_candidate_id on public.applications(candidate_id);
create index idx_applications_job_id on public.applications(job_id);
create index idx_applications_status on public.applications(status);
create index idx_application_status_history_application_id on public.application_status_history(application_id);
create index idx_application_status_history_changed_at on public.application_status_history(application_id, changed_at);
create index idx_interviews_application_id on public.interviews(application_id);
create index idx_interviews_scheduled_at on public.interviews(application_id, scheduled_at);
create index idx_interviews_status on public.interviews(status);

-- ============================================================
-- SERVICES / CONTRACTS
-- ============================================================

create index idx_services_tenant_id on public.services(tenant_id);
create index idx_services_status on public.services(tenant_id, status);

-- service_orders indexes moved to 45_indexes.sql (tables created in 04b_service_orders.sql)

create index idx_contracts_tenant_id on public.contracts(tenant_id);
create index idx_contracts_status on public.contracts(tenant_id, status);
create index idx_contracts_company_id on public.contracts(company_id);
create index idx_contracts_dates on public.contracts(tenant_id, start_date, end_date);
create index idx_contract_status_history_contract_id on public.contract_status_history(contract_id);
create index idx_contract_status_history_changed_at on public.contract_status_history(contract_id, changed_at);

-- ============================================================
-- SUPPLIERS / PURCHASING
-- ============================================================

create index idx_suppliers_tenant_id on public.suppliers(tenant_id);
create index idx_suppliers_status on public.suppliers(tenant_id, status);
create index idx_suppliers_company_id on public.suppliers(company_id);
create index idx_purchase_orders_tenant_id on public.purchase_orders(tenant_id);
create index idx_purchase_orders_status on public.purchase_orders(tenant_id, status);
create index idx_purchase_orders_supplier_id on public.purchase_orders(supplier_id);
create index idx_purchase_orders_dates on public.purchase_orders(tenant_id, order_date, expected_delivery_date);
create index idx_purchase_orders_number on public.purchase_orders(tenant_id, number);
create index idx_purchase_order_items_purchase_order_id on public.purchase_order_items(purchase_order_id);
create index idx_purchase_order_items_product_id on public.purchase_order_items(product_id);
create index idx_purchase_receipts_purchase_order_id on public.purchase_receipts(purchase_order_id);
create index idx_purchase_receipts_status on public.purchase_receipts(tenant_id, status);
create index idx_purchase_receipts_received_at on public.purchase_receipts(received_at);
create index idx_purchase_receipt_items_receipt_id on public.purchase_receipt_items(receipt_id);
create index idx_purchase_receipt_items_product_id on public.purchase_receipt_items(product_id);

-- ============================================================
-- INVENTORY / STOCK
-- ============================================================

create index idx_products_tenant_id on public.products(tenant_id);
create index idx_products_status on public.products(tenant_id, status);
create index idx_products_category on public.products(tenant_id, category);
create index idx_stock_movements_tenant_product on public.stock_movements(tenant_id, product_id);
create index idx_stock_movements_created_at on public.stock_movements(tenant_id, created_at);
create index idx_stock_movements_type on public.stock_movements(tenant_id, product_id, movement_type);
create index idx_stock_movements_reference on public.stock_movements(reference_id);
create index idx_stock_balances_tenant_product on public.stock_balances(tenant_id, product_id);
create index idx_stock_entries_tenant_product on public.stock_entries(tenant_id, product_id);
create index idx_stock_entries_reference on public.stock_entries(reference_id, reference_type);
create index idx_stock_entries_movement_type on public.stock_entries(tenant_id, movement_type, created_at);

-- ============================================================
-- CUSTODY
-- ============================================================

create index idx_third_party_custody_tenant_id on public.third_party_custody(tenant_id);
create index idx_third_party_custody_status on public.third_party_custody(tenant_id, status);
create index idx_third_party_custody_company_id on public.third_party_custody(company_id);
create index idx_third_party_custody_expected_return on public.third_party_custody(expected_return_at);
create index idx_third_party_custody_items_custody_id on public.third_party_custody_items(custody_id);
create index idx_third_party_custody_items_product_id on public.third_party_custody_items(product_id);

-- ============================================================
-- TASKS
-- ============================================================

create index idx_tasks_tenant_id on public.tasks(tenant_id);
create index idx_tasks_status on public.tasks(tenant_id, status);
create index idx_tasks_assignee on public.tasks(assignee_person_id);
create index idx_tasks_related_entity on public.tasks(related_entity_type, related_entity_id);
create index idx_tasks_created_at on public.tasks(tenant_id, created_at);

-- ============================================================
-- SUPPORT
-- ============================================================

create index idx_support_tickets_tenant_id on public.support_tickets(tenant_id);
create index idx_support_tickets_status on public.support_tickets(tenant_id, status);
create index idx_support_tickets_priority on public.support_tickets(tenant_id, priority);
create index idx_support_tickets_assignee on public.support_tickets(assignee_person_id);
create index idx_support_tickets_sla on public.support_tickets(sla_due_at);
create index idx_support_ticket_status_history_ticket_id on public.support_ticket_status_history(ticket_id);
create index idx_support_ticket_status_history_changed_at on public.support_ticket_status_history(ticket_id, changed_at);

-- ============================================================
-- CHAT
-- ============================================================

create index idx_chat_rooms_tenant_id on public.chat_rooms(tenant_id);
create index idx_chat_rooms_status on public.chat_rooms(tenant_id, status);
create index idx_chat_participants_room_id on public.chat_participants(room_id);
create index idx_chat_participants_person_id on public.chat_participants(person_id);
create index idx_chat_messages_room_id on public.chat_messages(room_id);
create index idx_chat_messages_created_at on public.chat_messages(room_id, created_at);
create index idx_ai_conversations_tenant_id on public.ai_conversations(tenant_id);
create index idx_ai_conversations_status on public.ai_conversations(tenant_id, status);
create index idx_ai_messages_conversation_id on public.ai_messages(conversation_id);
create index idx_ai_messages_created_at on public.ai_messages(conversation_id, created_at);
create index idx_chat_handoffs_room_id on public.chat_handoffs(room_id);
create index idx_chat_handoffs_status on public.chat_handoffs(room_id, status);

-- ============================================================
-- NOTIFICATIONS / EVENTS / OUTBOX
-- ============================================================

create index idx_notifications_tenant_id on public.notifications(tenant_id);
create index idx_notifications_recipient on public.notifications(tenant_id, recipient_person_id, status);
create index idx_notifications_status on public.notifications(tenant_id, status, created_at);
create index idx_notification_deliveries_notification_id on public.notification_deliveries(notification_id);
create index idx_notification_deliveries_idempotency_key on public.notification_deliveries(idempotency_key);
create index idx_domain_events_tenant_id on public.domain_events(tenant_id);
create index idx_domain_events_aggregate on public.domain_events(aggregate_type, aggregate_id);
create index idx_domain_events_correlation_id on public.domain_events(correlation_id);
create index idx_domain_events_created_at on public.domain_events(tenant_id, created_at);
create index idx_domain_events_idempotency_key on public.domain_events(idempotency_key);
create index idx_event_outbox_status_available_at on public.event_outbox(status, available_at, attempts);
create index idx_event_outbox_event_id on public.event_outbox(event_id);
create index idx_event_outbox_correlation_id on public.event_outbox(correlation_id);
create index idx_event_outbox_tenant_id on public.event_outbox(tenant_id);
create index idx_event_deliveries_outbox_id on public.event_deliveries(outbox_id);
create index idx_event_deliveries_destination on public.event_deliveries(destination, status);
create index idx_event_deliveries_idempotency_key on public.event_deliveries(idempotency_key);

-- ============================================================
-- STORAGE / DOCUMENTS
-- ============================================================

create index idx_files_tenant_id on public.files(tenant_id);
create index idx_files_bucket on public.files(bucket);
create index idx_files_entity on public.files(entity_type, entity_id);
create index idx_files_uploaded_by on public.files(uploaded_by_person_id);
create index idx_file_access_logs_file_id on public.file_access_logs(file_id);
create index idx_file_access_logs_person_id on public.file_access_logs(person_id);
create index idx_file_access_logs_occurred_at on public.file_access_logs(occurred_at);
create index idx_document_versions_entity on public.document_versions(tenant_id, entity_type, entity_id, version);
create index idx_document_versions_changed_at on public.document_versions(changed_at);
create index idx_document_links_file_id on public.document_links(file_id);
create index idx_document_links_entity on public.document_links(entity_type, entity_id);
create index idx_administrative_requests_tenant_id on public.administrative_requests(tenant_id);
create index idx_administrative_requests_status on public.administrative_requests(tenant_id, status);
create index idx_administrative_requests_requester on public.administrative_requests(requester_person_id);
create index idx_administrative_tasks_request_id on public.administrative_tasks(request_id);
create index idx_administrative_tasks_assignee on public.administrative_tasks(assignee_person_id);
create index idx_administrative_tasks_status on public.administrative_tasks(tenant_id, status);
create index idx_administrative_approvals_task_id on public.administrative_approvals(task_id);
create index idx_administrative_documents_request_id on public.administrative_documents(request_id);
create index idx_administrative_documents_file_id on public.administrative_documents(file_id);

-- ============================================================
-- AUDIT / SECURITY
-- ============================================================

create index idx_audit_logs_actor_person_id on public.audit_logs(actor_person_id);
create index idx_audit_logs_tenant_id on public.audit_logs(tenant_id);
create index idx_audit_logs_entity on public.audit_logs(tenant_id, entity_type, entity_id);
create index idx_audit_logs_created_at on public.audit_logs(tenant_id, created_at);
create index idx_audit_logs_correlation_id on public.audit_logs(correlation_id);
create index idx_security_events_person_id on public.security_events(person_id);
create index idx_security_events_tenant_id on public.security_events(tenant_id);
create index idx_security_events_created_at on public.security_events(tenant_id, created_at);
create index idx_security_events_event_type on public.security_events(tenant_id, event_type, created_at);
create index idx_first_login_state_person_id on public.first_login_state(person_id);
create index idx_legal_acceptances_tenant_id on public.legal_acceptances(tenant_id);
create index idx_legal_acceptances_person_id on public.legal_acceptances(person_id);

-- ============================================================
-- LGPD
-- ============================================================

create index idx_consents_tenant_id on public.consents(tenant_id);
create index idx_consents_person_id on public.consents(person_id);
create index idx_consents_person_purpose on public.consents(person_id, purpose, term_version);
create index idx_consents_granted on public.consents(tenant_id, granted, granted_at);
create index idx_privacy_requests_tenant_id on public.privacy_requests(tenant_id);
create index idx_privacy_requests_person_id on public.privacy_requests(person_id);
create index idx_privacy_requests_status on public.privacy_requests(tenant_id, status);
create index idx_privacy_requests_idempotency_key on public.privacy_requests(idempotency_key);
create index idx_privacy_requests_correlation_id on public.privacy_requests(correlation_id);
create index idx_data_export_requests_tenant_id on public.data_export_requests(tenant_id);
create index idx_data_export_requests_status on public.data_export_requests(tenant_id, status);
create index idx_data_export_requests_idempotency_key on public.data_export_requests(idempotency_key);
create index idx_data_deletion_requests_tenant_id on public.data_deletion_requests(tenant_id);
create index idx_data_deletion_requests_status on public.data_deletion_requests(tenant_id, status);
create index idx_data_deletion_requests_legal_hold on public.data_deletion_requests(tenant_id, legal_hold, status);
create index idx_data_deletion_requests_idempotency_key on public.data_deletion_requests(idempotency_key);
create index idx_data_retention_policies_tenant_domain on public.data_retention_policies(tenant_id, data_domain);
create index idx_data_retention_policies_enabled on public.data_retention_policies(enabled) where enabled = true;

-- ============================================================
