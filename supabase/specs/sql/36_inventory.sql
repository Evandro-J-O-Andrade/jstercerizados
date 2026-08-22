-- 36_inventory.sql
-- Inventory, warehouses, locations, categories, lots, and physical inventory

create table if not exists public.warehouses (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  address text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_warehouses_tenant_name unique (tenant_id, name)
);

create table if not exists public.warehouse_locations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  warehouse_id uuid not null references public.warehouses(id),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_warehouse_locations_tenant_warehouse_name unique (tenant_id, warehouse_id, name)
);

create table if not exists public.product_categories (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  parent_id uuid references public.product_categories(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_product_categories_tenant_name unique (tenant_id, name)
);

create table if not exists public.stock_lots (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  product_id uuid not null references public.products(id),
  lot_code text not null,
  expiry_date date,
  quantity numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_stock_lots_tenant_product_lot unique (tenant_id, product_id, lot_code)
);

create table if not exists public.stock_inventory (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  warehouse_id uuid not null references public.warehouses(id),
  status text not null default 'open',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_inventory_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  inventory_id uuid not null references public.stock_inventory(id),
  product_id uuid not null references public.products(id),
  lot_id uuid references public.stock_lots(id),
  warehouse_location_id uuid references public.warehouse_locations(id),
  counted_quantity numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
