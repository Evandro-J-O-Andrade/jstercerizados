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
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_order_id uuid not null references public.purchase_orders(id),
  product_id uuid,
  quantity numeric not null,
  value numeric,
  created_at timestamptz not null default now()
);
