-- 07_inventory_custody.sql
-- Inventory and products

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  unit text,
  category text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  product_id uuid not null references public.products(id),
  movement_type text not null,
  quantity numeric not null,
  reference_id uuid,
  notes text,
  created_at timestamptz not null default now()
);
