-- 37_purchasing.sql
-- Purchase requests, quotations, status history, and divergences

create table if not exists public.purchase_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  requester_id uuid not null references public.people(id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_request_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  request_id uuid not null references public.purchase_requests(id),
  product_id uuid references public.products(id),
  description text not null,
  quantity numeric not null,
  unit_price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_quotations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  request_id uuid not null references public.purchase_requests(id),
  supplier_id uuid not null references public.suppliers(id),
  total_value numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_quotation_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  quotation_id uuid not null references public.purchase_quotations(id),
  product_id uuid references public.products(id),
  description text not null,
  quantity numeric not null,
  unit_price numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_status_history (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  purchase_order_id uuid not null references public.purchase_orders(id),
  status text not null,
  changed_by uuid references public.people(id),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_receipt_divergences (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  purchase_receipt_id uuid not null references public.purchase_receipts(id),
  item_id uuid not null references public.purchase_order_items(id),
  expected_quantity numeric not null,
  received_quantity numeric not null,
  notes text,
  created_at timestamptz not null default now()
);
