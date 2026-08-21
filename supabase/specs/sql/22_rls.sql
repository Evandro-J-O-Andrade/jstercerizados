-- 22_rls.sql
-- Row Level Security policies for tenant-scoped tables created before this file

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.tenant_memberships tm
    where tm.person_id = auth.uid()
      and tm.tenant_id = p_tenant_id
      and tm.status = 'active'
  );
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.is_admin_master()
returns boolean as $$
begin
  return exists (
    select 1
    from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    where ra.person_id = auth.uid()
      and r.scope = 'global'
      and r.name = 'admin_master'
  );
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.user_tenant_ids()
returns setof uuid as $$
begin
  return query
  select tm.tenant_id
  from public.tenant_memberships tm
  where tm.person_id = auth.uid()
    and tm.status = 'active';
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

-- ============================================================
-- CORE
-- ============================================================

alter table public.people enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.tenant_settings enable row level security;

create policy people_member_read on public.people
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.tenant_memberships tm
      where tm.person_id = people.id and tm.status = 'active'
    )
  );

create policy tenant_memberships_member_read on public.tenant_memberships
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tenant_memberships_member_write on public.tenant_memberships
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tenant_memberships_member_update on public.tenant_memberships
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tenant_settings_member_read on public.tenant_settings
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tenant_settings_member_write on public.tenant_settings
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tenant_settings_member_update on public.tenant_settings
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

-- ============================================================
-- RBAC
-- ============================================================

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.role_assignments enable row level security;

create policy roles_member_read on public.roles
  for select
  using (
    public.is_admin_master()
    or scope = 'tenant'
  );

create policy permissions_member_read on public.permissions
  for select
  using (true);

create policy role_permissions_member_read on public.role_permissions
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.roles r
      where r.id = role_permissions.role_id and r.scope = 'tenant'
    )
  );

create policy role_assignments_member_read on public.role_assignments
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy role_assignments_member_write on public.role_assignments
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy role_assignments_member_update on public.role_assignments
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

-- ============================================================
-- CRM
-- ============================================================

alter table public.companies enable row level security;
alter table public.company_relationships enable row level security;
alter table public.company_contacts enable row level security;

create policy companies_member_read on public.companies
  for select
  using (is_tenant_member(tenant_id));

create policy companies_member_write on public.companies
  for insert
  with check (is_tenant_member(tenant_id));

create policy companies_member_update on public.companies
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy company_relationships_member_read on public.company_relationships
  for select
  using (exists (select 1 from public.companies c where c.id = company_id and is_tenant_member(c.tenant_id)));

create policy company_relationships_member_write on public.company_relationships
  for insert
  with check (exists (select 1 from public.companies c where c.id = company_id and is_tenant_member(c.tenant_id)));

create policy company_relationships_member_update on public.company_relationships
  for update
  using (exists (select 1 from public.companies c where c.id = company_id and is_tenant_member(c.tenant_id)))
  with check (exists (select 1 from public.companies c where c.id = company_id and is_tenant_member(c.tenant_id)));

create policy company_contacts_member_read on public.company_contacts
  for select
  using (exists (select 1 from public.companies c where c.id = company_id and is_tenant_member(c.tenant_id)));

create policy company_contacts_member_write on public.company_contacts
  for insert
  with check (exists (select 1 from public.companies c where c.id = company_id and is_tenant_member(c.tenant_id)));

create policy company_contacts_member_update on public.company_contacts
  for update
  using (exists (select 1 from public.companies c where c.id = company_id and is_tenant_member(c.tenant_id)))
  with check (exists (select 1 from public.companies c where c.id = company_id and is_tenant_member(c.tenant_id)));

-- ============================================================
-- RH / RECRUITMENT
-- ============================================================

alter table public.candidates enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.interviews enable row level security;

create policy candidates_member_read on public.candidates
  for select
  using (is_tenant_member(tenant_id));

create policy candidates_member_write on public.candidates
  for insert
  with check (is_tenant_member(tenant_id));

create policy candidates_member_update on public.candidates
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy jobs_member_read on public.jobs
  for select
  using (is_tenant_member(tenant_id));

create policy jobs_member_write on public.jobs
  for insert
  with check (is_tenant_member(tenant_id));

create policy jobs_member_update on public.jobs
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy applications_member_read on public.applications
  for select
  using (is_tenant_member(tenant_id));

create policy applications_member_write on public.applications
  for insert
  with check (is_tenant_member(tenant_id));

create policy applications_member_update on public.applications
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy application_status_history_member_read on public.application_status_history
  for select
  using (exists (select 1 from public.applications a where a.id = application_id and is_tenant_member(a.tenant_id)));

create policy application_status_history_member_write on public.application_status_history
  for insert
  with check (exists (select 1 from public.applications a where a.id = application_id and is_tenant_member(a.tenant_id)));

create policy interviews_member_read on public.interviews
  for select
  using (is_tenant_member(tenant_id));

create policy interviews_member_write on public.interviews
  for insert
  with check (is_tenant_member(tenant_id));

create policy interviews_member_update on public.interviews
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- SERVICES / CONTRACTS
-- ============================================================

alter table public.services enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_status_history enable row level security;

create policy services_member_read on public.services
  for select
  using (is_tenant_member(tenant_id));

create policy services_member_write on public.services
  for insert
  with check (is_tenant_member(tenant_id));

create policy services_member_update on public.services
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy contracts_member_read on public.contracts
  for select
  using (is_tenant_member(tenant_id));

create policy contracts_member_write on public.contracts
  for insert
  with check (is_tenant_member(tenant_id));

create policy contracts_member_update on public.contracts
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy contract_status_history_member_read on public.contract_status_history
  for select
  using (exists (select 1 from public.contracts c where c.id = contract_id and is_tenant_member(c.tenant_id)));

create policy contract_status_history_member_write on public.contract_status_history
  for insert
  with check (exists (select 1 from public.contracts c where c.id = contract_id and is_tenant_member(c.tenant_id)));

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

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================

alter table public.support_ticket_categories enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.support_ticket_assignments enable row level security;
alter table public.support_ticket_status_history enable row level security;

create policy support_ticket_categories_member_read on public.support_ticket_categories
  for select
  using (is_tenant_member(tenant_id));

create policy support_ticket_categories_member_write on public.support_ticket_categories
  for insert
  with check (is_tenant_member(tenant_id));

create policy support_ticket_categories_member_update on public.support_ticket_categories
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy support_tickets_member_read on public.support_tickets
  for select
  using (is_tenant_member(tenant_id));

create policy support_tickets_member_write on public.support_tickets
  for insert
  with check (is_tenant_member(tenant_id));

create policy support_tickets_member_update on public.support_tickets
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy support_ticket_messages_member_read on public.support_ticket_messages
  for select
  using (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

create policy support_ticket_messages_member_write on public.support_ticket_messages
  for insert
  with check (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

create policy support_ticket_messages_member_update on public.support_ticket_messages
  for update
  using (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)))
  with check (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

create policy support_ticket_assignments_member_read on public.support_ticket_assignments
  for select
  using (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

create policy support_ticket_assignments_member_write on public.support_ticket_assignments
  for insert
  with check (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

create policy support_ticket_assignments_member_update on public.support_ticket_assignments
  for update
  using (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)))
  with check (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

create policy support_ticket_status_history_member_read on public.support_ticket_status_history
  for select
  using (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

create policy support_ticket_status_history_member_write on public.support_ticket_status_history
  for insert
  with check (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

-- ============================================================
-- SUPPLIERS / PURCHASING
-- ============================================================

alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.purchase_receipts enable row level security;
alter table public.purchase_receipt_items enable row level security;

create policy suppliers_member_read on public.suppliers
  for select
  using (is_tenant_member(tenant_id));

create policy suppliers_member_write on public.suppliers
  for insert
  with check (is_tenant_member(tenant_id));

create policy suppliers_member_update on public.suppliers
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy purchase_orders_member_read on public.purchase_orders
  for select
  using (is_tenant_member(tenant_id));

create policy purchase_orders_member_write on public.purchase_orders
  for insert
  with check (is_tenant_member(tenant_id));

create policy purchase_orders_member_update on public.purchase_orders
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy purchase_order_items_member_read on public.purchase_order_items
  for select
  using (exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and is_tenant_member(po.tenant_id)));

create policy purchase_order_items_member_write on public.purchase_order_items
  for insert
  with check (exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and is_tenant_member(po.tenant_id)));

create policy purchase_receipts_member_read on public.purchase_receipts
  for select
  using (is_tenant_member(tenant_id));

create policy purchase_receipts_member_write on public.purchase_receipts
  for insert
  with check (is_tenant_member(tenant_id));

create policy purchase_receipt_items_member_read on public.purchase_receipt_items
  for select
  using (exists (select 1 from public.purchase_receipts pr where pr.id = purchase_receipt_id and is_tenant_member(pr.tenant_id)));

create policy purchase_receipt_items_member_write on public.purchase_receipt_items
  for insert
  with check (exists (select 1 from public.purchase_receipts pr where pr.id = purchase_receipt_id and is_tenant_member(pr.tenant_id)));

-- ============================================================
-- INVENTORY / STOCK
-- ============================================================

alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
alter table public.stock_balances enable row level security;
alter table public.stock_entries enable row level security;
alter table public.third_party_custody enable row level security;
alter table public.third_party_custody_items enable row level security;

create policy products_member_read on public.products
  for select
  using (is_tenant_member(tenant_id));

create policy products_member_write on public.products
  for insert
  with check (is_tenant_member(tenant_id));

create policy products_member_update on public.products
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy stock_movements_member_read on public.stock_movements
  for select
  using (is_tenant_member(tenant_id));

create policy stock_movements_member_write on public.stock_movements
  for insert
  with check (is_tenant_member(tenant_id));

create policy stock_balances_member_read on public.stock_balances
  for select
  using (is_tenant_member(tenant_id));

create policy stock_entries_member_read on public.stock_entries
  for select
  using (is_tenant_member(tenant_id));

create policy stock_entries_member_write on public.stock_entries
  for insert
  with check (is_tenant_member(tenant_id));

create policy third_party_custody_member_read on public.third_party_custody
  for select
  using (is_tenant_member(tenant_id));

create policy third_party_custody_member_write on public.third_party_custody
  for insert
  with check (is_tenant_member(tenant_id));

create policy third_party_custody_member_update on public.third_party_custody
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy third_party_custody_items_member_read on public.third_party_custody_items
  for select
  using (exists (select 1 from public.third_party_custody tpc where tpc.id = custody_id and is_tenant_member(tpc.tenant_id)));

create policy third_party_custody_items_member_write on public.third_party_custody_items
  for insert
  with check (exists (select 1 from public.third_party_custody tpc where tpc.id = custody_id and is_tenant_member(tpc.tenant_id)));

-- ============================================================
-- TASKS
-- ============================================================

alter table public.tasks enable row level security;

create policy tasks_member_read on public.tasks
  for select
  using (is_tenant_member(tenant_id));

create policy tasks_member_write on public.tasks
  for insert
  with check (is_tenant_member(tenant_id));

create policy tasks_member_update on public.tasks
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- CHAT
-- ============================================================

alter table public.chat_rooms enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.chat_handoffs enable row level security;

create policy chat_rooms_member_read on public.chat_rooms
  for select
  using (is_tenant_member(tenant_id));

create policy chat_rooms_member_write on public.chat_rooms
  for insert
  with check (is_tenant_member(tenant_id));

create policy chat_rooms_member_update on public.chat_rooms
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy chat_participants_member_read on public.chat_participants
  for select
  using (exists (select 1 from public.chat_rooms cr where cr.id = room_id and is_tenant_member(cr.tenant_id)));

create policy chat_participants_member_write on public.chat_participants
  for insert
  with check (exists (select 1 from public.chat_rooms cr where cr.id = room_id and is_tenant_member(cr.tenant_id)));

create policy chat_messages_member_read on public.chat_messages
  for select
  using (exists (select 1 from public.chat_rooms cr where cr.id = room_id and is_tenant_member(cr.tenant_id)));

create policy chat_messages_member_write on public.chat_messages
  for insert
  with check (exists (select 1 from public.chat_rooms cr where cr.id = room_id and is_tenant_member(cr.tenant_id)));

create policy ai_conversations_member_read on public.ai_conversations
  for select
  using (is_tenant_member(tenant_id));

create policy ai_conversations_member_write on public.ai_conversations
  for insert
  with check (is_tenant_member(tenant_id));

create policy ai_conversations_member_update on public.ai_conversations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy ai_messages_member_read on public.ai_messages
  for select
  using (exists (select 1 from public.ai_conversations ac where ac.id = conversation_id and is_tenant_member(ac.tenant_id)));

create policy ai_messages_member_write on public.ai_messages
  for insert
  with check (exists (select 1 from public.ai_conversations ac where ac.id = conversation_id and is_tenant_member(ac.tenant_id)));

create policy chat_handoffs_member_read on public.chat_handoffs
  for select
  using (exists (select 1 from public.ai_conversations ac where ac.id = conversation_id and is_tenant_member(ac.tenant_id)));

create policy chat_handoffs_member_write on public.chat_handoffs
  for insert
  with check (exists (select 1 from public.ai_conversations ac where ac.id = conversation_id and is_tenant_member(ac.tenant_id)));

-- ============================================================
-- NOTIFICATIONS / EVENTS / OUTBOX
-- ============================================================

alter table public.notifications enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.domain_events enable row level security;
alter table public.event_outbox enable row level security;
alter table public.event_deliveries enable row level security;

create policy notifications_member_read on public.notifications
  for select
  using (is_tenant_member(tenant_id));

create policy notifications_member_write on public.notifications
  for insert
  with check (is_tenant_member(tenant_id));

create policy notification_deliveries_member_read on public.notification_deliveries
  for select
  using (is_tenant_member(tenant_id));

create policy domain_events_admin_read on public.domain_events
  for select
  using (public.is_admin_master());

create policy event_outbox_admin_write on public.event_outbox
  for insert
  with check (public.is_admin_master());

create policy event_deliveries_admin_write on public.event_deliveries
  for insert
  with check (public.is_admin_master());

-- ============================================================
-- STORAGE / DOCUMENTS
-- ============================================================

alter table public.files enable row level security;
alter table public.file_access_logs enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_links enable row level security;

create policy files_member_read on public.files
  for select
  using (is_tenant_member(tenant_id));

create policy files_member_write on public.files
  for insert
  with check (is_tenant_member(tenant_id));

create policy file_access_logs_member_read on public.file_access_logs
  for select
  using (is_tenant_member(tenant_id));

create policy file_access_logs_member_write on public.file_access_logs
  for insert
  with check (is_tenant_member(tenant_id));

create policy document_versions_member_read on public.document_versions
  for select
  using (is_tenant_member(tenant_id));

create policy document_versions_member_write on public.document_versions
  for insert
  with check (is_tenant_member(tenant_id));

create policy document_links_member_read on public.document_links
  for select
  using (is_tenant_member(tenant_id));

create policy document_links_member_write on public.document_links
  for insert
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- AUDIT / SECURITY
-- ============================================================

alter table public.audit_logs enable row level security;
alter table public.security_events enable row level security;
alter table public.first_login_state enable row level security;

create policy audit_logs_admin_read on public.audit_logs
  for select
  using (public.is_admin_master());

create policy security_events_admin_read on public.security_events
  for select
  using (public.is_admin_master());

create policy security_events_admin_write on public.security_events
  for insert
  with check (public.is_admin_master());

create policy first_login_state_member_read on public.first_login_state
  for select
  using (is_tenant_member(tenant_id));

create policy first_login_state_member_write on public.first_login_state
  for insert
  with check (is_tenant_member(tenant_id));

create policy first_login_state_member_update on public.first_login_state
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- LGPD
-- ============================================================

alter table public.consents enable row level security;
alter table public.privacy_requests enable row level security;
alter table public.data_export_requests enable row level security;
alter table public.data_deletion_requests enable row level security;
alter table public.data_retention_policies enable row level security;
alter table public.legal_acceptances enable row level security;

create policy consents_member_read on public.consents
  for select
  using (is_tenant_member(tenant_id));

create policy consents_member_write on public.consents
  for insert
  with check (is_tenant_member(tenant_id));

create policy consents_member_update on public.consents
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy privacy_requests_member_read on public.privacy_requests
  for select
  using (is_tenant_member(tenant_id));

create policy privacy_requests_member_write on public.privacy_requests
  for insert
  with check (is_tenant_member(tenant_id));

create policy privacy_requests_member_update on public.privacy_requests
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy data_export_requests_member_read on public.data_export_requests
  for select
  using (is_tenant_member(tenant_id));

create policy data_export_requests_member_write on public.data_export_requests
  for insert
  with check (is_tenant_member(tenant_id));

create policy data_deletion_requests_member_read on public.data_deletion_requests
  for select
  using (is_tenant_member(tenant_id));

create policy data_deletion_requests_member_write on public.data_deletion_requests
  for insert
  with check (is_tenant_member(tenant_id));

create policy data_retention_policies_member_read on public.data_retention_policies
  for select
  using (is_tenant_member(tenant_id));

create policy data_retention_policies_member_write on public.data_retention_policies
  for insert
  with check (is_tenant_member(tenant_id));

create policy legal_acceptances_member_read on public.legal_acceptances
  for select
  using (is_tenant_member(tenant_id));

create policy legal_acceptances_member_write on public.legal_acceptances
  for insert
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- ADMINISTRATION
-- ============================================================

alter table public.administrative_requests enable row level security;
alter table public.administrative_tasks enable row level security;
alter table public.administrative_approvals enable row level security;
alter table public.administrative_documents enable row level security;

create policy administrative_requests_member_read on public.administrative_requests
  for select
  using (is_tenant_member(tenant_id));

create policy administrative_requests_member_write on public.administrative_requests
  for insert
  with check (is_tenant_member(tenant_id));

create policy administrative_requests_member_update on public.administrative_requests
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy administrative_tasks_member_read on public.administrative_tasks
  for select
  using (is_tenant_member(tenant_id));

create policy administrative_tasks_member_write on public.administrative_tasks
  for insert
  with check (is_tenant_member(tenant_id));

create policy administrative_approvals_member_read on public.administrative_approvals
  for select
  using (is_tenant_member(tenant_id));

create policy administrative_approvals_member_write on public.administrative_approvals
  for insert
  with check (is_tenant_member(tenant_id));

create policy administrative_documents_member_read on public.administrative_documents
  for select
  using (is_tenant_member(tenant_id));

create policy administrative_documents_member_write on public.administrative_documents
  for insert
  with check (is_tenant_member(tenant_id));


