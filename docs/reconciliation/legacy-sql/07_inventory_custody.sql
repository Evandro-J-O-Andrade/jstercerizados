-- 07_inventory_custody.sql
-- Inventory and third-party custody

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

create table if not exists public.third_party_custody (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid not null references public.companies(id),
  status text not null default 'open',
  expected_return_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.third_party_custody_items (
  id uuid primary key default uuid_generate_v4(),
  custody_id uuid not null references public.third_party_custody(id),
  product_id uuid not null references public.products(id),
  quantity numeric not null,
  returned_quantity numeric not null default 0,
  created_at timestamptz not null default now()
);
