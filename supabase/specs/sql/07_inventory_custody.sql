-- 07_inventory_custody.sql
-- Inventory and custody

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
