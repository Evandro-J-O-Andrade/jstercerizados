-- 06_suppliers_purchasing.sql
-- Suppliers and purchase orders

create table if not exists public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  supplier_id uuid not null references public.suppliers(id),
  number text not null,
  status text not null default 'draft',
  order_date date,
  expected_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  purchase_order_id uuid not null references public.purchase_orders(id),
  product_id uuid not null references public.products(id),
  quantity numeric not null,
  unit_price numeric not null,
  total_price numeric not null,
  received_quantity numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
