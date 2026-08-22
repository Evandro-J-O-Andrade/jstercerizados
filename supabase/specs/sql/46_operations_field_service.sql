-- 46_operations_field_service.sql
-- Operational domain: work orders, field service, materials, EPI, customer feedback, SLA, FAQ

-- ============================================================
-- COMPANY LOCATIONS
-- ============================================================

create table if not exists public.company_locations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  name text not null,
  address jsonb,
  contact_name text,
  contact_phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_company_locations_tenant_company_name unique (tenant_id, company_id, name)
);

alter table public.company_locations enable row level security;

create policy company_locations_member_read on public.company_locations
  for select
  using (is_tenant_member(tenant_id));

create policy company_locations_member_write on public.company_locations
  for insert
  with check (is_tenant_member(tenant_id));

create policy company_locations_member_update on public.company_locations
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy company_locations_member_delete on public.company_locations
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- WORK ORDERS
-- ============================================================

create table if not exists public.work_orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  service_order_id uuid references public.service_orders(id),
  contract_id uuid references public.contracts(id),
  customer_id uuid references public.customers(id),
  location_id uuid references public.company_locations(id),
  assigned_employee_id uuid references public.employees(id),
  title text not null,
  description text,
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  status text not null default 'pending' check (status in ('pending','scheduled','in_progress','completed','cancelled','on_hold')),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  completion_notes text,
  created_by uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_orders enable row level security;

create policy work_orders_member_read on public.work_orders
  for select
  using (is_tenant_member(tenant_id));

create policy work_orders_member_write on public.work_orders
  for insert
  with check (is_tenant_member(tenant_id));

create policy work_orders_member_update on public.work_orders
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy work_orders_member_delete on public.work_orders
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- WORK ORDER ASSIGNMENTS
-- ============================================================

create table if not exists public.work_order_assignments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  employee_id uuid not null references public.employees(id),
  role text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  status text not null default 'assigned' check (status in ('assigned','confirmed','in_progress','completed','absent','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_work_order_assignments_order_employee unique (tenant_id, work_order_id, employee_id)
);

alter table public.work_order_assignments enable row level security;

create policy work_order_assignments_member_read on public.work_order_assignments
  for select
  using (is_tenant_member(tenant_id));

create policy work_order_assignments_member_write on public.work_order_assignments
  for insert
  with check (is_tenant_member(tenant_id));

create policy work_order_assignments_member_update on public.work_order_assignments
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy work_order_assignments_member_delete on public.work_order_assignments
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- WORK ORDER MATERIALS
-- ============================================================

create table if not exists public.work_order_materials (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  stock_lot_id uuid references public.stock_lots(id),
  planned_quantity numeric not null default 0,
  used_quantity numeric not null default 0,
  returned_quantity numeric not null default 0,
  unit_cost numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_order_materials enable row level security;

create policy work_order_materials_member_read on public.work_order_materials
  for select
  using (is_tenant_member(tenant_id));

create policy work_order_materials_member_write on public.work_order_materials
  for insert
  with check (is_tenant_member(tenant_id));

create policy work_order_materials_member_update on public.work_order_materials
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy work_order_materials_member_delete on public.work_order_materials
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- WORK ORDER CHECKLISTS
-- ============================================================

create table if not exists public.work_order_checklists (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  item_text text not null,
  is_checked boolean not null default false,
  checked_by uuid references public.people(id),
  checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_order_checklists enable row level security;

create policy work_order_checklists_member_read on public.work_order_checklists
  for select
  using (is_tenant_member(tenant_id));

create policy work_order_checklists_member_write on public.work_order_checklists
  for insert
  with check (is_tenant_member(tenant_id));

create policy work_order_checklists_member_update on public.work_order_checklists
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy work_order_checklists_member_delete on public.work_order_checklists
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- WORK ORDER ATTACHMENTS
-- ============================================================

create table if not exists public.work_order_attachments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  mime_type text,
  category text,
  uploaded_by uuid references public.people(id),
  created_at timestamptz not null default now()
);

alter table public.work_order_attachments enable row level security;

create policy work_order_attachments_member_read on public.work_order_attachments
  for select
  using (is_tenant_member(tenant_id));

create policy work_order_attachments_member_write on public.work_order_attachments
  for insert
  with check (is_tenant_member(tenant_id));

create policy work_order_attachments_member_delete on public.work_order_attachments
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- WORK ORDER OCCURRENCES
-- ============================================================

create table if not exists public.work_order_occurrences (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  occurrence_type text not null,
  description text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  reported_by uuid references public.people(id),
  resolved_by uuid references public.people(id),
  resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_order_occurrences enable row level security;

create policy work_order_occurrences_member_read on public.work_order_occurrences
  for select
  using (is_tenant_member(tenant_id));

create policy work_order_occurrences_member_write on public.work_order_occurrences
  for insert
  with check (is_tenant_member(tenant_id));

create policy work_order_occurrences_member_update on public.work_order_occurrences
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy work_order_occurrences_member_delete on public.work_order_occurrences
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- WORK ORDER ACCEPTANCES
-- ============================================================

create table if not exists public.work_order_acceptances (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  customer_id uuid references public.customers(id),
  approved_by uuid references public.people(id),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_at timestamptz,
  rejected_at timestamptz,
  comments text,
  signature_document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_work_order_acceptances_order unique (tenant_id, work_order_id)
);

alter table public.work_order_acceptances enable row level security;

create policy work_order_acceptances_member_read on public.work_order_acceptances
  for select
  using (is_tenant_member(tenant_id));

create policy work_order_acceptances_member_write on public.work_order_acceptances
  for insert
  with check (is_tenant_member(tenant_id));

create policy work_order_acceptances_member_update on public.work_order_acceptances
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

-- ============================================================
-- MATERIAL ISSUES
-- ============================================================

create table if not exists public.material_issues (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  work_order_id uuid references public.work_orders(id),
  employee_id uuid references public.employees(id),
  warehouse_id uuid references public.warehouses(id),
  issue_number text not null,
  status text not null default 'pending' check (status in ('pending','issued','cancelled')),
  issued_at timestamptz,
  notes text,
  created_by uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_material_issues_tenant_issue_number unique (tenant_id, issue_number)
);

alter table public.material_issues enable row level security;

create policy material_issues_member_read on public.material_issues
  for select
  using (is_tenant_member(tenant_id));

create policy material_issues_member_write on public.material_issues
  for insert
  with check (is_tenant_member(tenant_id));

create policy material_issues_member_update on public.material_issues
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy material_issues_member_delete on public.material_issues
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- MATERIAL ISSUE ITEMS
-- ============================================================

create table if not exists public.material_issue_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  material_issue_id uuid not null references public.material_issues(id) on delete cascade,
  product_id uuid not null references public.products(id),
  stock_lot_id uuid references public.stock_lots(id),
  warehouse_location_id uuid references public.warehouse_locations(id),
  quantity numeric not null,
  unit_cost numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.material_issue_items enable row level security;

create policy material_issue_items_member_read on public.material_issue_items
  for select
  using (is_tenant_member(tenant_id));

create policy material_issue_items_member_write on public.material_issue_items
  for insert
  with check (is_tenant_member(tenant_id));

create policy material_issue_items_member_update on public.material_issue_items
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy material_issue_items_member_delete on public.material_issue_items
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- MATERIAL RETURNS
-- ============================================================

create table if not exists public.material_returns (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  work_order_id uuid references public.work_orders(id),
  employee_id uuid references public.employees(id),
  warehouse_id uuid references public.warehouses(id),
  return_number text not null,
  status text not null default 'pending' check (status in ('pending','received','cancelled')),
  received_at timestamptz,
  notes text,
  created_by uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_material_returns_tenant_return_number unique (tenant_id, return_number)
);

alter table public.material_returns enable row level security;

create policy material_returns_member_read on public.material_returns
  for select
  using (is_tenant_member(tenant_id));

create policy material_returns_member_write on public.material_returns
  for insert
  with check (is_tenant_member(tenant_id));

create policy material_returns_member_update on public.material_returns
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy material_returns_member_delete on public.material_returns
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- MATERIAL RETURN ITEMS
-- ============================================================

create table if not exists public.material_return_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  material_return_id uuid not null references public.material_returns(id) on delete cascade,
  product_id uuid not null references public.products(id),
  stock_lot_id uuid references public.stock_lots(id),
  warehouse_location_id uuid references public.warehouse_locations(id),
  quantity numeric not null,
  condition text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.material_return_items enable row level security;

create policy material_return_items_member_read on public.material_return_items
  for select
  using (is_tenant_member(tenant_id));

create policy material_return_items_member_write on public.material_return_items
  for insert
  with check (is_tenant_member(tenant_id));

create policy material_return_items_member_update on public.material_return_items
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy material_return_items_member_delete on public.material_return_items
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- EPI DELIVERIES
-- ============================================================

create table if not exists public.epi_deliveries (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  employee_id uuid not null references public.employees(id),
  work_order_id uuid references public.work_orders(id),
  delivery_number text not null,
  reason text,
  delivered_by uuid references public.people(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_epi_deliveries_tenant_delivery_number unique (tenant_id, delivery_number)
);

alter table public.epi_deliveries enable row level security;

create policy epi_deliveries_member_read on public.epi_deliveries
  for select
  using (is_tenant_member(tenant_id));

create policy epi_deliveries_member_write on public.epi_deliveries
  for insert
  with check (is_tenant_member(tenant_id));

create policy epi_deliveries_member_update on public.epi_deliveries
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy epi_deliveries_member_delete on public.epi_deliveries
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- EPI DELIVERY ITEMS
-- ============================================================

create table if not exists public.epi_delivery_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  epi_delivery_id uuid not null references public.epi_deliveries(id) on delete cascade,
  product_id uuid not null references public.products(id),
  stock_lot_id uuid references public.stock_lots(id),
  quantity numeric not null,
  size text,
  serial_number text,
  condition text not null default 'new' check (condition in ('new','used','damaged')),
  employee_acknowledgement boolean not null default false,
  signature text,
  document_id uuid,
  returned_at timestamptz,
  return_condition text check (return_condition in ('good','used','damaged','lost')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.epi_delivery_items enable row level security;

create policy epi_delivery_items_member_read on public.epi_delivery_items
  for select
  using (is_tenant_member(tenant_id));

create policy epi_delivery_items_member_write on public.epi_delivery_items
  for insert
  with check (is_tenant_member(tenant_id));

create policy epi_delivery_items_member_update on public.epi_delivery_items
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy epi_delivery_items_member_delete on public.epi_delivery_items
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- EPI RETURNS
-- ============================================================

create table if not exists public.epi_returns (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  employee_id uuid not null references public.employees(id),
  work_order_id uuid references public.work_orders(id),
  return_number text not null,
  received_by uuid references public.people(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_epi_returns_tenant_return_number unique (tenant_id, return_number)
);

alter table public.epi_returns enable row level security;

create policy epi_returns_member_read on public.epi_returns
  for select
  using (is_tenant_member(tenant_id));

create policy epi_returns_member_write on public.epi_returns
  for insert
  with check (is_tenant_member(tenant_id));

create policy epi_returns_member_update on public.epi_returns
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy epi_returns_member_delete on public.epi_returns
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- EPI RETURN ITEMS
-- ============================================================

create table if not exists public.epi_return_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  epi_return_id uuid not null references public.epi_returns(id) on delete cascade,
  product_id uuid not null references public.products(id),
  stock_lot_id uuid references public.stock_lots(id),
  quantity numeric not null,
  condition text not null default 'used' check (condition in ('good','used','damaged','lost')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.epi_return_items enable row level security;

create policy epi_return_items_member_read on public.epi_return_items
  for select
  using (is_tenant_member(tenant_id));

create policy epi_return_items_member_write on public.epi_return_items
  for insert
  with check (is_tenant_member(tenant_id));

create policy epi_return_items_member_update on public.epi_return_items
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy epi_return_items_member_delete on public.epi_return_items
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- SERVICE SLA
-- ============================================================

create table if not exists public.service_sla (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  service_id uuid references public.services(id),
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  response_due_hours numeric not null default 24,
  resolution_due_hours numeric not null default 72,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_service_sla_tenant_service_priority unique (tenant_id, service_id, priority)
);

alter table public.service_sla enable row level security;

create policy service_sla_member_read on public.service_sla
  for select
  using (is_tenant_member(tenant_id));

create policy service_sla_member_write on public.service_sla
  for insert
  with check (is_tenant_member(tenant_id));

create policy service_sla_member_update on public.service_sla
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy service_sla_member_delete on public.service_sla
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- CUSTOMER FEEDBACK
-- ============================================================

create table if not exists public.customer_feedback (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  service_order_id uuid references public.service_orders(id),
  work_order_id uuid references public.work_orders(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_feedback enable row level security;

create policy customer_feedback_member_read on public.customer_feedback
  for select
  using (is_tenant_member(tenant_id));

create policy customer_feedback_member_write on public.customer_feedback
  for insert
  with check (is_tenant_member(tenant_id));

create policy customer_feedback_member_update on public.customer_feedback
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy customer_feedback_member_delete on public.customer_feedback
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- FEEDBACK
-- ============================================================

create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  entity_type text not null,
  entity_id uuid not null,
  person_id uuid references public.people(id),
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy feedback_member_read on public.feedback
  for select
  using (is_tenant_member(tenant_id));

create policy feedback_member_write on public.feedback
  for insert
  with check (is_tenant_member(tenant_id));

create policy feedback_member_update on public.feedback
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy feedback_member_delete on public.feedback
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- FAQS
-- ============================================================

create table if not exists public.faqs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  question text not null,
  answer text not null,
  category text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy faqs_member_read on public.faqs
  for select
  using (is_tenant_member(tenant_id));

create policy faqs_member_write on public.faqs
  for insert
  with check (is_tenant_member(tenant_id));

create policy faqs_member_update on public.faqs
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy faqs_member_delete on public.faqs
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- SERVICE OCCURRENCES
-- ============================================================

create table if not exists public.service_occurrences (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  service_order_id uuid references public.service_orders(id),
  work_order_id uuid references public.work_orders(id),
  occurrence_type text not null,
  description text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  reported_by uuid references public.people(id),
  resolved_by uuid references public.people(id),
  resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_occurrences enable row level security;

create policy service_occurrences_member_read on public.service_occurrences
  for select
  using (is_tenant_member(tenant_id));

create policy service_occurrences_member_write on public.service_occurrences
  for insert
  with check (is_tenant_member(tenant_id));

create policy service_occurrences_member_update on public.service_occurrences
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy service_occurrences_member_delete on public.service_occurrences
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- CUSTOMER RATINGS
-- ============================================================

create table if not exists public.customer_ratings (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  service_order_id uuid references public.service_orders(id),
  work_order_id uuid references public.work_orders(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_ratings enable row level security;

create policy customer_ratings_member_read on public.customer_ratings
  for select
  using (is_tenant_member(tenant_id));

create policy customer_ratings_member_write on public.customer_ratings
  for insert
  with check (is_tenant_member(tenant_id));

create policy customer_ratings_member_update on public.customer_ratings
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy customer_ratings_member_delete on public.customer_ratings
  for delete
  using (is_tenant_member(tenant_id));

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_company_locations_tenant_id on public.company_locations(tenant_id);
create index idx_company_locations_company_id on public.company_locations(company_id);

create index idx_work_orders_tenant_id on public.work_orders(tenant_id);
create index idx_work_orders_customer_id on public.work_orders(customer_id);
create index idx_work_orders_location_id on public.work_orders(location_id);
create index idx_work_orders_status on public.work_orders(tenant_id, status);
create index idx_work_orders_scheduled_start on public.work_orders(tenant_id, scheduled_start);

create index idx_work_order_assignments_tenant_id on public.work_order_assignments(tenant_id);
create index idx_work_order_assignments_work_order_id on public.work_order_assignments(work_order_id);
create index idx_work_order_assignments_employee_id on public.work_order_assignments(employee_id);

create index idx_work_order_materials_tenant_id on public.work_order_materials(tenant_id);
create index idx_work_order_materials_work_order_id on public.work_order_materials(work_order_id);
create index idx_work_order_materials_product_id on public.work_order_materials(product_id);

create index idx_work_order_checklists_tenant_id on public.work_order_checklists(tenant_id);
create index idx_work_order_checklists_work_order_id on public.work_order_checklists(work_order_id);

create index idx_work_order_attachments_tenant_id on public.work_order_attachments(tenant_id);
create index idx_work_order_attachments_work_order_id on public.work_order_attachments(work_order_id);

create index idx_work_order_occurrences_tenant_id on public.work_order_occurrences(tenant_id);
create index idx_work_order_occurrences_work_order_id on public.work_order_occurrences(work_order_id);

create index idx_work_order_acceptances_tenant_id on public.work_order_acceptances(tenant_id);
create index idx_work_order_acceptances_work_order_id on public.work_order_acceptances(work_order_id);

create index idx_material_issues_tenant_id on public.material_issues(tenant_id);
create index idx_material_issues_work_order_id on public.material_issues(work_order_id);
create index idx_material_issues_warehouse_id on public.material_issues(warehouse_id);

create index idx_material_issue_items_tenant_id on public.material_issue_items(tenant_id);
create index idx_material_issue_items_material_issue_id on public.material_issue_items(material_issue_id);
create index idx_material_issue_items_product_id on public.material_issue_items(product_id);

create index idx_material_returns_tenant_id on public.material_returns(tenant_id);
create index idx_material_returns_work_order_id on public.material_returns(work_order_id);

create index idx_material_return_items_tenant_id on public.material_return_items(tenant_id);
create index idx_material_return_items_material_return_id on public.material_return_items(material_return_id);

create index idx_epi_deliveries_tenant_id on public.epi_deliveries(tenant_id);
create index idx_epi_deliveries_employee_id on public.epi_deliveries(employee_id);
create index idx_epi_deliveries_work_order_id on public.epi_deliveries(work_order_id);

create index idx_epi_delivery_items_tenant_id on public.epi_delivery_items(tenant_id);
create index idx_epi_delivery_items_epi_delivery_id on public.epi_delivery_items(epi_delivery_id);
create index idx_epi_delivery_items_product_id on public.epi_delivery_items(product_id);

create index idx_epi_returns_tenant_id on public.epi_returns(tenant_id);
create index idx_epi_returns_employee_id on public.epi_returns(employee_id);
create index idx_epi_returns_work_order_id on public.epi_returns(work_order_id);

create index idx_epi_return_items_tenant_id on public.epi_return_items(tenant_id);
create index idx_epi_return_items_epi_return_id on public.epi_return_items(epi_return_id);

create index idx_service_sla_tenant_id on public.service_sla(tenant_id);
create index idx_service_sla_service_id on public.service_sla(service_id);

create index idx_customer_feedback_tenant_id on public.customer_feedback(tenant_id);
create index idx_customer_feedback_customer_id on public.customer_feedback(customer_id);
create index idx_customer_feedback_work_order_id on public.customer_feedback(work_order_id);

create index idx_feedback_tenant_id on public.feedback(tenant_id);
create index idx_feedback_entity on public.feedback(entity_type, entity_id);

create index idx_faqs_tenant_id on public.faqs(tenant_id);
create index idx_faqs_category on public.faqs(tenant_id, category);

create index idx_service_occurrences_tenant_id on public.service_occurrences(tenant_id);
create index idx_service_occurrences_work_order_id on public.service_occurrences(work_order_id);

create index idx_customer_ratings_tenant_id on public.customer_ratings(tenant_id);
create index idx_customer_ratings_customer_id on public.customer_ratings(customer_id);
create index idx_customer_ratings_work_order_id on public.customer_ratings(work_order_id);
