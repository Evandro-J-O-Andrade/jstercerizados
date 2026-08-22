-- 03b_crm_commercial.sql
-- Commercial CRM: leads, customers, quotes, quote_items, sales, sales_items

-- ============================================================
-- LEADS
-- ============================================================

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid references public.companies(id),
  person_id uuid references public.people(id),
  name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================

create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid references public.companies(id),
  person_id uuid references public.people(id),
  name text not null,
  email text,
  phone text,
  document text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- QUOTES
-- ============================================================

create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  company_id uuid references public.companies(id),
  person_id uuid references public.people(id),
  quote_number text not null,
  status text not null default 'draft',
  issue_date date not null default current_date,
  valid_until date,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  notes text,
  version integer not null default 1,
  parent_quote_id uuid references public.quotes(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_quotes_tenant_number unique (tenant_id, quote_number)
);

-- ============================================================
-- QUOTE ITEMS
-- ============================================================

create table if not exists public.quote_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  service_id uuid references public.services(id),
  product_id uuid references public.products(id),
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SALES
-- ============================================================

create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  customer_id uuid not null references public.customers(id),
  company_id uuid references public.companies(id),
  person_id uuid references public.people(id),
  quote_id uuid references public.quotes(id),
  sale_number text not null,
  status text not null default 'draft',
  issue_date date not null default current_date,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_sales_tenant_number unique (tenant_id, sale_number)
);

-- ============================================================
-- SALE ITEMS
-- ============================================================

create table if not exists public.sale_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  sale_id uuid not null references public.sales(id) on delete cascade,
  quote_item_id uuid references public.quote_items(id),
  service_id uuid references public.services(id),
  product_id uuid references public.products(id),
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);