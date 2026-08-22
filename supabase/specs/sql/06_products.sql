-- 06_products.sql
-- Products catalog

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
