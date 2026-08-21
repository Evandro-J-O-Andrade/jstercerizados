-- 22_rls.sql
-- Row Level Security policies for all tenant-scoped tables

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

create policy people_self_read on public.people
  for select
  using (
    public.is_admin_master()
    or id = auth.uid()
    or exists (
      select 1 from public.tenant_memberships tm
      where tm.person_id = people.id
        and tm.tenant_id in (select * from public.user_tenant_ids())
    )
  );

create policy people_admin_write on public.people
  for update
  using (public.is_admin_master())
  with check (public.is_admin_master());

alter table public.tenants enable row level security;

create policy tenants_admin_all on public.tenants
  for all
  using (public.is_admin_master())
  with check (public.is_admin_master());

alter table public.tenant_memberships enable row level security;

create policy tenant_memberships_member_read on public.tenant_memberships
  for select
  using (
    public.is_admin_master()
    or tenant_id in (select * from public.user_tenant_ids())
  );

create policy tenant_memberships_admin_write on public.tenant_memberships
  for insert
  with check (
    public.is_admin_master()
    or tenant_id in (select * from public.user_tenant_ids())
  );

create policy tenant_memberships_admin_update on public.tenant_memberships
  for update
  using (
    public.is_admin_master()
    or tenant_id in (select * from public.user_tenant_ids())
  )
  with check (
    public.is_admin_master()
    or tenant_id in (select * from public.user_tenant_ids())
  );

alter table public.tenant_settings enable row level security;

create policy tenant_settings_member_read on public.tenant_settings
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tenant_settings_admin_write on public.tenant_settings
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tenant_settings_admin_update on public.tenant_settings
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

create policy roles_admin_all on public.roles
  for all
  using (public.is_admin_master())
  with check (public.is_admin_master());

alter table public.permissions enable row level security;

create policy permissions_admin_all on public.permissions
  for all
  using (public.is_admin_master())
  with check (public.is_admin_master());

alter table public.role_permissions enable row level security;

create policy role_permissions_admin_all on public.role_permissions
  for all
  using (public.is_admin_master())
  with check (public.is_admin_master());

alter table public.role_assignments enable row level security;

create policy role_assignments_admin_read on public.role_assignments
  for select
  using (
    public.is_admin_master()
    or person_id = auth.uid()
    or tenant_id in (select * from public.user_tenant_ids())
  );

create policy role_assignments_admin_write on public.role_assignments
  for insert
  with check (
    public.is_admin_master()
    or tenant_id in (select * from public.user_tenant_ids())
  );

create policy role_assignments_admin_update on public.role_assignments
  for update
  using (
    public.is_admin_master()
    or tenant_id in (select * from public.user_tenant_ids())
  )
  with check (
    public.is_admin_master()
    or tenant_id in (select * from public.user_tenant_ids())
  );

-- ============================================================
-- CRM
-- ============================================================

alter table public.companies enable row level security;

create policy companies_member_read on public.companies
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy companies_member_write on public.companies
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy companies_member_update on public.companies
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.company_relationships enable row level security;

create policy company_relationships_member_read on public.company_relationships
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1
      from public.companies c
      join public.tenant_memberships tm on tm.tenant_id = c.tenant_id
      where c.id = company_relationships.company_id
        and tm.person_id = auth.uid()
        and tm.status = 'active'
    )
  );

create policy company_relationships_member_write on public.company_relationships
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1
      from public.companies c
      join public.tenant_memberships tm on tm.tenant_id = c.tenant_id
      where c.id = company_relationships.company_id
        and tm.person_id = auth.uid()
        and tm.status = 'active'
    )
  );

create policy company_relationships_member_update on public.company_relationships
  for update
  using (
    public.is_admin_master()
    or exists (
      select 1
      from public.companies c
      join public.tenant_memberships tm on tm.tenant_id = c.tenant_id
      where c.id = company_relationships.company_id
        and tm.person_id = auth.uid()
        and tm.status = 'active'
    )
  )
  with check (
    public.is_admin_master()
    or exists (
      select 1
      from public.companies c
      join public.tenant_memberships tm on tm.tenant_id = c.tenant_id
      where c.id = company_relationships.company_id
        and tm.person_id = auth.uid()
        and tm.status = 'active'
    )
  );

alter table public.company_contacts enable row level security;

create policy company_contacts_member_read on public.company_contacts
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1
      from public.companies c
      join public.tenant_memberships tm on tm.tenant_id = c.tenant_id
      where c.id = company_contacts.company_id
        and tm.person_id = auth.uid()
        and tm.status = 'active'
    )
  );

create policy company_contacts_member_write on public.company_contacts
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1
      from public.companies c
      join public.tenant_memberships tm on tm.tenant_id = c.tenant_id
      where c.id = company_contacts.company_id
        and tm.person_id = auth.uid()
        and tm.status = 'active'
    )
  );

create policy company_contacts_member_update on public.company_contacts
  for update
  using (
    public.is_admin_master()
    or exists (
      select 1
      from public.companies c
      join public.tenant_memberships tm on tm.tenant_id = c.tenant_id
      where c.id = company_contacts.company_id
        and tm.person_id = auth.uid()
        and tm.status = 'active'
    )
  )
  with check (
    public.is_admin_master()
    or exists (
      select 1
      from public.companies c
      join public.tenant_memberships tm on tm.tenant_id = c.tenant_id
      where c.id = company_contacts.company_id
        and tm.person_id = auth.uid()
        and tm.status = 'active'
    )
  );

-- ============================================================
-- RH / RECRUITMENT
-- ============================================================

alter table public.candidates enable row level security;

create policy candidates_member_read on public.candidates
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy candidates_member_write on public.candidates
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy candidates_member_update on public.candidates
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.jobs enable row level security;

create policy jobs_member_read on public.jobs
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy jobs_member_write on public.jobs
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy jobs_member_update on public.jobs
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.applications enable row level security;

create policy applications_member_read on public.applications
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.candidates c where c.id = applications.candidate_id and is_tenant_member(c.tenant_id)
    )
    or exists (
      select 1 from public.jobs j where j.id = applications.job_id and is_tenant_member(j.tenant_id)
    )
  );

create policy applications_member_write on public.applications
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.candidates c where c.id = applications.candidate_id and is_tenant_member(c.tenant_id)
    )
    or exists (
      select 1 from public.jobs j where j.id = applications.job_id and is_tenant_member(j.tenant_id)
    )
  );

alter table public.application_status_history enable row level security;

create policy application_status_history_member_read on public.application_status_history
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.applications a
      join public.candidates c on c.id = a.candidate_id
      where a.id = application_status_history.application_id
        and is_tenant_member(c.tenant_id)
    )
  );

create policy application_status_history_member_write on public.application_status_history
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.applications a
      join public.candidates c on c.id = a.candidate_id
      where a.id = application_status_history.application_id
        and is_tenant_member(c.tenant_id)
    )
  );

alter table public.interviews enable row level security;

create policy interviews_member_read on public.interviews
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.applications a
      join public.candidates c on c.id = a.candidate_id
      where a.id = interviews.application_id
        and is_tenant_member(c.tenant_id)
    )
  );

create policy interviews_member_write on public.interviews
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.applications a
      join public.candidates c on c.id = a.candidate_id
      where a.id = interviews.application_id
        and is_tenant_member(c.tenant_id)
    )
  );

-- ============================================================
-- SERVICES / CONTRACTS
-- ============================================================

alter table public.services enable row level security;

create policy services_member_read on public.services
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy services_member_write on public.services
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy services_member_update on public.services
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.service_orders enable row level security;

create policy service_orders_member_read on public.service_orders
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy service_orders_member_write on public.service_orders
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy service_orders_member_update on public.service_orders
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.service_order_status_history enable row level security;

create policy service_order_status_history_member_read on public.service_order_status_history
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.service_orders so
      where so.id = service_order_status_history.service_order_id
        and is_tenant_member(so.tenant_id)
    )
  );

create policy service_order_status_history_member_write on public.service_order_status_history
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.service_orders so
      where so.id = service_order_status_history.service_order_id
        and is_tenant_member(so.tenant_id)
    )
  );

alter table public.contracts enable row level security;

create policy contracts_member_read on public.contracts
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy contracts_member_write on public.contracts
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy contracts_member_update on public.contracts
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.contract_status_history enable row level security;

create policy contract_status_history_member_read on public.contract_status_history
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.contracts c
      where c.id = contract_status_history.contract_id
        and is_tenant_member(c.tenant_id)
    )
  );

create policy contract_status_history_member_write on public.contract_status_history
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.contracts c
      where c.id = contract_status_history.contract_id
        and is_tenant_member(c.tenant_id)
    )
  );

-- ============================================================
-- SUPPLIERS / PURCHASING
-- ============================================================

alter table public.suppliers enable row level security;

create policy suppliers_member_read on public.suppliers
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy suppliers_member_write on public.suppliers
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy suppliers_member_update on public.suppliers
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.purchase_orders enable row level security;

create policy purchase_orders_member_read on public.purchase_orders
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy purchase_orders_member_write on public.purchase_orders
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy purchase_orders_member_update on public.purchase_orders
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.purchase_order_items enable row level security;

create policy purchase_order_items_member_read on public.purchase_order_items
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.purchase_orders po
      where po.id = purchase_order_items.purchase_order_id
        and is_tenant_member(po.tenant_id)
    )
  );

create policy purchase_order_items_member_write on public.purchase_order_items
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.purchase_orders po
      where po.id = purchase_order_items.purchase_order_id
        and is_tenant_member(po.tenant_id)
    )
  );

alter table public.purchase_receipts enable row level security;

create policy purchase_receipts_member_read on public.purchase_receipts
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy purchase_receipts_member_write on public.purchase_receipts
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.purchase_receipt_items enable row level security;

create policy purchase_receipt_items_member_read on public.purchase_receipt_items
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.purchase_receipts pr
      where pr.id = purchase_receipt_items.receipt_id
        and is_tenant_member(pr.tenant_id)
    )
  );

create policy purchase_receipt_items_member_write on public.purchase_receipt_items
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.purchase_receipts pr
      where pr.id = purchase_receipt_items.receipt_id
        and is_tenant_member(pr.tenant_id)
    )
  );

-- ============================================================
-- INVENTORY / STOCK
-- ============================================================

alter table public.products enable row level security;

create policy products_member_read on public.products
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy products_member_write on public.products
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy products_member_update on public.products
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.stock_movements enable row level security;

create policy stock_movements_member_read on public.stock_movements
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy stock_movements_member_write on public.stock_movements
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.stock_balances enable row level security;

create policy stock_balances_member_read on public.stock_balances
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.stock_entries enable row level security;

create policy stock_entries_member_read on public.stock_entries
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

-- ============================================================
-- CUSTODY
-- ============================================================

alter table public.third_party_custody enable row level security;

create policy third_party_custody_member_read on public.third_party_custody
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy third_party_custody_member_write on public.third_party_custody
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy third_party_custody_member_update on public.third_party_custody
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.third_party_custody_items enable row level security;

create policy third_party_custody_items_member_read on public.third_party_custody_items
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.third_party_custody tpc
      where tpc.id = third_party_custody_items.custody_id
        and is_tenant_member(tpc.tenant_id)
    )
  );

create policy third_party_custody_items_member_write on public.third_party_custody_items
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.third_party_custody tpc
      where tpc.id = third_party_custody_items.custody_id
        and is_tenant_member(tpc.tenant_id)
    )
  );

-- ============================================================
-- TASKS
-- ============================================================

alter table public.tasks enable row level security;

create policy tasks_member_read on public.tasks
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tasks_member_write on public.tasks
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy tasks_member_update on public.tasks
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
-- SUPPORT
-- ============================================================

alter table public.support_tickets enable row level security;

create policy support_tickets_member_read on public.support_tickets
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy support_tickets_member_write on public.support_tickets
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy support_tickets_member_update on public.support_tickets
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.support_ticket_status_history enable row level security;

create policy support_ticket_status_history_member_read on public.support_ticket_status_history
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.support_tickets st
      where st.id = support_ticket_status_history.ticket_id
        and is_tenant_member(st.tenant_id)
    )
  );

create policy support_ticket_status_history_member_write on public.support_ticket_status_history
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.support_tickets st
      where st.id = support_ticket_status_history.ticket_id
        and is_tenant_member(st.tenant_id)
    )
  );

-- ============================================================
-- CHAT
-- ============================================================

alter table public.chat_rooms enable row level security;

create policy chat_rooms_member_read on public.chat_rooms
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy chat_rooms_member_write on public.chat_rooms
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy chat_rooms_member_update on public.chat_rooms
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.chat_participants enable row level security;

create policy chat_participants_member_read on public.chat_participants
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.chat_rooms cr
      where cr.id = chat_participants.room_id
        and is_tenant_member(cr.tenant_id)
    )
  );

create policy chat_participants_member_write on public.chat_participants
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.chat_rooms cr
      where cr.id = chat_participants.room_id
        and is_tenant_member(cr.tenant_id)
    )
  );

alter table public.chat_messages enable row level security;

create policy chat_messages_member_read on public.chat_messages
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.chat_rooms cr
      where cr.id = chat_messages.room_id
        and is_tenant_member(cr.tenant_id)
    )
  );

create policy chat_messages_member_write on public.chat_messages
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.chat_rooms cr
      where cr.id = chat_messages.room_id
        and is_tenant_member(cr.tenant_id)
    )
  );

alter table public.ai_conversations enable row level security;

create policy ai_conversations_member_read on public.ai_conversations
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy ai_conversations_member_write on public.ai_conversations
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy ai_conversations_member_update on public.ai_conversations
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.ai_messages enable row level security;

create policy ai_messages_member_read on public.ai_messages
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.ai_conversations ac
      where ac.id = ai_messages.conversation_id
        and is_tenant_member(ac.tenant_id)
    )
  );

create policy ai_messages_member_write on public.ai_messages
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.ai_conversations ac
      where ac.id = ai_messages.conversation_id
        and is_tenant_member(ac.tenant_id)
    )
  );

alter table public.chat_handoffs enable row level security;

create policy chat_handoffs_member_read on public.chat_handoffs
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.chat_rooms cr
      where cr.id = chat_handoffs.room_id
        and is_tenant_member(cr.tenant_id)
    )
  );

create policy chat_handoffs_member_write on public.chat_handoffs
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.chat_rooms cr
      where cr.id = chat_handoffs.room_id
        and is_tenant_member(cr.tenant_id)
    )
  );

-- ============================================================
-- NOTIFICATIONS / EVENTS / OUTBOX
-- ============================================================

alter table public.notifications enable row level security;

create policy notifications_member_read on public.notifications
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy notifications_member_write on public.notifications
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.notification_deliveries enable row level security;

create policy notification_deliveries_member_read on public.notification_deliveries
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.notifications n
      where n.id = notification_deliveries.notification_id
        and is_tenant_member(n.tenant_id)
    )
  );

alter table public.domain_events enable row level security;

create policy domain_events_admin_read on public.domain_events
  for select
  using (public.is_admin_master());

alter table public.event_outbox enable row level security;

create policy event_outbox_admin_read on public.event_outbox
  for select
  using (public.is_admin_master());

create policy event_outbox_admin_write on public.event_outbox
  for update
  using (public.is_admin_master())
  with check (public.is_admin_master());

alter table public.event_deliveries enable row level security;

create policy event_deliveries_admin_read on public.event_deliveries
  for select
  using (public.is_admin_master());

create policy event_deliveries_admin_write on public.event_deliveries
  for update
  using (public.is_admin_master())
  with check (public.is_admin_master());

-- ============================================================
-- STORAGE / DOCUMENTS
-- ============================================================

alter table public.files enable row level security;

create policy files_member_read on public.files
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy files_member_write on public.files
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.file_access_logs enable row level security;

create policy file_access_logs_member_read on public.file_access_logs
  for select
  using (
    public.is_admin_master()
    or exists (
      select 1 from public.files f
      where f.id = file_access_logs.file_id
        and is_tenant_member(f.tenant_id)
    )
  );

create policy file_access_logs_member_write on public.file_access_logs
  for insert
  with check (
    public.is_admin_master()
    or exists (
      select 1 from public.files f
      where f.id = file_access_logs.file_id
        and is_tenant_member(f.tenant_id)
    )
  );

alter table public.document_versions enable row level security;

create policy document_versions_member_read on public.document_versions
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy document_versions_member_write on public.document_versions
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.document_links enable row level security;

create policy document_links_member_read on public.document_links
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy document_links_member_write on public.document_links
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.administrative_requests enable row level security;

create policy administrative_requests_member_read on public.administrative_requests
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy administrative_requests_member_write on public.administrative_requests
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy administrative_requests_member_update on public.administrative_requests
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.administrative_tasks enable row level security;

create policy administrative_tasks_member_read on public.administrative_tasks
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy administrative_tasks_member_write on public.administrative_tasks
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy administrative_tasks_member_update on public.administrative_tasks
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.administrative_approvals enable row level security;

create policy administrative_approvals_member_read on public.administrative_approvals
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy administrative_approvals_member_write on public.administrative_approvals
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.administrative_documents enable row level security;

create policy administrative_documents_member_read on public.administrative_documents
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy administrative_documents_member_write on public.administrative_documents
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

-- ============================================================
-- AUDIT / SECURITY
-- ============================================================

alter table public.audit_logs enable row level security;

create policy audit_logs_admin_read on public.audit_logs
  for select
  using (public.is_admin_master());

alter table public.security_events enable row level security;

create policy security_events_admin_read on public.security_events
  for select
  using (public.is_admin_master());

alter table public.first_login_state enable row level security;

create policy first_login_state_self_read on public.first_login_state
  for select
  using (
    public.is_admin_master()
    or person_id = auth.uid()
  );

create policy first_login_state_admin_write on public.first_login_state
  for update
  using (public.is_admin_master())
  with check (public.is_admin_master());

alter table public.legal_acceptances enable row level security;

create policy legal_acceptances_member_read on public.legal_acceptances
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

-- ============================================================
-- LGPD
-- ============================================================

alter table public.consents enable row level security;

create policy consents_member_read on public.consents
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy consents_member_write on public.consents
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy consents_member_update on public.consents
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.privacy_requests enable row level security;

create policy privacy_requests_member_read on public.privacy_requests
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy privacy_requests_member_write on public.privacy_requests
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy privacy_requests_member_update on public.privacy_requests
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.data_export_requests enable row level security;

create policy data_export_requests_member_read on public.data_export_requests
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy data_export_requests_member_write on public.data_export_requests
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy data_export_requests_member_update on public.data_export_requests
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.data_deletion_requests enable row level security;

create policy data_deletion_requests_member_read on public.data_deletion_requests
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy data_deletion_requests_member_write on public.data_deletion_requests
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy data_deletion_requests_member_update on public.data_deletion_requests
  for update
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  )
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

alter table public.data_retention_policies enable row level security;

create policy data_retention_policies_member_read on public.data_retention_policies
  for select
  using (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy data_retention_policies_member_write on public.data_retention_policies
  for insert
  with check (
    public.is_admin_master()
    or is_tenant_member(tenant_id)
  );

create policy data_retention_policies_member_update on public.data_retention_policies
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
-- CRM / SERVICES
-- ============================================================

alter table public.company_services enable row level security;
alter table public.service_orders enable row level security;
alter table public.service_order_items enable row level security;
alter table public.service_acceptances enable row level security;
alter table public.service_executions enable row level security;
alter table public.service_attachments enable row level security;
alter table public.interactions enable row level security;

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

-- ============================================================
-- RECRUITMENT / TALENT POOL
-- ============================================================

alter table public.recruitment_demands enable row level security;
alter table public.talent_pool_memberships enable row level security;
alter table public.job_matches enable row level security;
alter table public.candidate_profile_views enable row level security;

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
  using (exists (select 1 from public.stock_inventory si where si.id = inventory_id and is_tenant_member(si.tenant_id)));

create policy stock_inventory_items_member_write on public.stock_inventory_items
  for insert
  with check (exists (select 1 from public.stock_inventory si where si.id = inventory_id and is_tenant_member(si.tenant_id)));

create policy stock_inventory_items_member_update on public.stock_inventory_items
  for update
  using (exists (select 1 from public.stock_inventory si where si.id = inventory_id and is_tenant_member(si.tenant_id)))
  with check (exists (select 1 from public.stock_inventory si where si.id = inventory_id and is_tenant_member(si.tenant_id)));

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

create policy purchase_quotation_items_member_update on public.purchase_quotation_items
  for update
  using (exists (select 1 from public.purchase_quotations pq where pq.id = quotation_id and is_tenant_member(pq.tenant_id)))
  with check (exists (select 1 from public.purchase_quotations pq where pq.id = quotation_id and is_tenant_member(pq.tenant_id)));

create policy purchase_status_history_member_read on public.purchase_status_history
  for select
  using (is_tenant_member(tenant_id));

create policy purchase_status_history_member_write on public.purchase_status_history
  for insert
  with check (is_tenant_member(tenant_id));

create policy purchase_receipt_divergences_member_read on public.purchase_receipt_divergences
  for select
  using (is_tenant_member(tenant_id));

create policy purchase_receipt_divergences_member_write on public.purchase_receipt_divergences
  for insert
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- FINANCE
-- ============================================================

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.financial_accounts enable row level security;

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
-- POS
-- ============================================================

alter table public.pos_operators enable row level security;

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

-- ============================================================
-- TASKS / SUPPORT
-- ============================================================

alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.task_status_history enable row level security;
alter table public.support_ticket_categories enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.support_ticket_assignments enable row level security;

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

create policy task_status_history_member_read on public.task_status_history
  for select
  using (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

create policy task_status_history_member_write on public.task_status_history
  for insert
  with check (exists (select 1 from public.tasks t where t.id = task_id and is_tenant_member(t.tenant_id)));

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

create policy support_ticket_assignments_member_read on public.support_ticket_assignments
  for select
  using (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

create policy support_ticket_assignments_member_write on public.support_ticket_assignments
  for insert
  with check (exists (select 1 from public.support_tickets st where st.id = ticket_id and is_tenant_member(st.tenant_id)));

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
-- AUTOMATION / NOTIFICATIONS
-- ============================================================

alter table public.automation_templates enable row level security;
alter table public.notification_preferences enable row level security;

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
-- REPORTS / DASHBOARDS
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
-- FINANCEIRO
-- ============================================================

alter table public.financial_transactions enable row level security;
alter table public.bank_reconciliations enable row level security;
alter table public.financial_installments enable row level security;
alter table public.financial_installment_payments enable row level security;
alter table public.financial_installment_cancellations enable row level security;

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
  using (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_api_requests_member_write on public.fiscal_api_requests
  for insert
  with check (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_api_requests_member_update on public.fiscal_api_requests
  for update
  using (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)))
  with check (exists (select 1 from public.fiscal_documents fd where fd.id = fiscal_document_id and is_tenant_member(fd.tenant_id)));

create policy fiscal_api_responses_member_read on public.fiscal_api_responses
  for select
  using (exists (select 1 from public.fiscal_api_requests far where far.id = fiscal_api_request_id and exists (select 1 from public.fiscal_documents fd where fd.id = far.fiscal_document_id and is_tenant_member(fd.tenant_id))));

create policy fiscal_api_responses_member_write on public.fiscal_api_responses
  for insert
  with check (exists (select 1 from public.fiscal_api_requests far where far.id = fiscal_api_request_id and exists (select 1 from public.fiscal_documents fd where fd.id = far.fiscal_document_id and is_tenant_member(fd.tenant_id))));

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

create policy pos_returns_member_read on public.pos_returns
  for select
  using (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_returns_member_write on public.pos_returns
  for insert
  with check (exists (select 1 from public.pos_sales ps where ps.id = sale_id and is_tenant_member(ps.tenant_id)));

create policy pos_cash_movements_member_read on public.pos_cash_movements
  for select
  using (exists (select 1 from public.pos_cashier_sessions pcs where pcs.id = session_id and is_tenant_member(pcs.tenant_id)));

create policy pos_cash_movements_member_write on public.pos_cash_movements
  for insert
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
-- RECRUITMENT / EMPLOYEES
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
alter table public.employee_positions enable row level security;
alter table public.employee_contracts enable row level security;
alter table public.employee_documents enable row level security;
alter table public.employee_status_history enable row level security;
alter table public.company_relationships enable row level security;
alter table public.company_contacts enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.interviews enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_messages enable row level security;
alter table public.chat_handoffs enable row level security;

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
  using (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_documents_member_write on public.candidate_documents
  for insert
  with check (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_experiences_member_read on public.candidate_experiences
  for select
  using (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_experiences_member_write on public.candidate_experiences
  for insert
  with check (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_education_member_read on public.candidate_education
  for select
  using (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_education_member_write on public.candidate_education
  for insert
  with check (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_courses_member_read on public.candidate_courses
  for select
  using (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_courses_member_write on public.candidate_courses
  for insert
  with check (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_languages_member_read on public.candidate_languages
  for select
  using (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_languages_member_write on public.candidate_languages
  for insert
  with check (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_skills_member_read on public.candidate_skills
  for select
  using (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy candidate_skills_member_write on public.candidate_skills
  for insert
  with check (exists (select 1 from public.candidates c where c.id = candidate_id and is_tenant_member(c.tenant_id)));

create policy job_skills_member_read on public.job_skills
  for select
  using (exists (select 1 from public.jobs j where j.id = job_id and is_tenant_member(j.tenant_id)));

create policy job_skills_member_write on public.job_skills
  for insert
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
  using (exists (select 1 from public.applications a where a.id = application_id and is_tenant_member(a.tenant_id)));

create policy application_profile_snapshots_member_write on public.application_profile_snapshots
  for insert
  with check (exists (select 1 from public.applications a where a.id = application_id and is_tenant_member(a.tenant_id)));

create policy interview_participants_member_read on public.interview_participants
  for select
  using (exists (select 1 from public.interviews i where i.id = interview_id and is_tenant_member(i.tenant_id)));

create policy interview_participants_member_write on public.interview_participants
  for insert
  with check (exists (select 1 from public.interviews i where i.id = interview_id and is_tenant_member(i.tenant_id)));

create policy interview_feedback_member_read on public.interview_feedback
  for select
  using (exists (select 1 from public.interviews i where i.id = interview_id and is_tenant_member(i.tenant_id)));

create policy interview_feedback_member_write on public.interview_feedback
  for insert
  with check (exists (select 1 from public.interviews i where i.id = interview_id and is_tenant_member(i.tenant_id)));

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

create policy chat_rooms_member_read on public.chat_rooms
  for select
  using (exists (select 1 from public.ai_conversations ac where ac.id = ai_conversation_id and is_tenant_member(ac.tenant_id)));

create policy chat_rooms_member_write on public.chat_rooms
  for insert
  with check (exists (select 1 from public.ai_conversations ac where ac.id = ai_conversation_id and is_tenant_member(ac.tenant_id)));

create policy chat_participants_member_read on public.chat_participants
  for select
  using (exists (select 1 from public.chat_rooms cr where cr.id = room_id and exists (select 1 from public.ai_conversations ac where ac.id = cr.ai_conversation_id and is_tenant_member(ac.tenant_id))));

create policy chat_participants_member_write on public.chat_participants
  for insert
  with check (exists (select 1 from public.chat_rooms cr where cr.id = room_id and exists (select 1 from public.ai_conversations ac where ac.id = cr.ai_conversation_id and is_tenant_member(ac.tenant_id))));

create policy chat_messages_member_read on public.chat_messages
  for select
  using (exists (select 1 from public.chat_rooms cr where cr.id = room_id and exists (select 1 from public.ai_conversations ac where ac.id = cr.ai_conversation_id and is_tenant_member(ac.tenant_id))));

create policy chat_messages_member_write on public.chat_messages
  for insert
  with check (exists (select 1 from public.chat_rooms cr where cr.id = room_id and exists (select 1 from public.ai_conversations ac where ac.id = cr.ai_conversation_id and is_tenant_member(ac.tenant_id))));

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

