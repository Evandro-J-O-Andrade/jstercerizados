-- 29_pos.sql
-- PDV domain: terminals, cashiers, sessions, sales, payments, cancellations, returns, cash movements, daily closures

-- ============================================================
-- POS TERMINALS
-- ============================================================

create table if not exists public.pos_terminals (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  serial_number text,
  model text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_pos_terminals_tenant_serial unique (tenant_id, serial_number)
);

-- ============================================================
-- POS CASHIERS
-- ============================================================

create table if not exists public.pos_cashiers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  terminal_id uuid not null references public.pos_terminals(id),
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POS OPERATORS
-- ============================================================

create table if not exists public.pos_operators (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  person_id uuid not null references public.people(id),
  cashier_id uuid not null references public.pos_cashiers(id),
  pin text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_pos_operators_tenant_person unique (tenant_id, person_id)
);

-- ============================================================
-- POS CASHIER SESSIONS
-- ============================================================

create table if not exists public.pos_cashier_sessions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  cashier_id uuid not null references public.pos_cashiers(id),
  operator_id uuid not null references public.pos_operators(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opening_amount numeric not null default 0,
  closing_amount numeric,
  expected_amount numeric,
  difference numeric,
  status text not null default 'open' check (status in ('open', 'closed', 'reopened')),
  notes text,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POS SALES
-- ============================================================

create table if not exists public.pos_sales (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  session_id uuid not null references public.pos_cashier_sessions(id),
  operator_id uuid not null references public.pos_operators(id),
  number text not null,
  subtotal numeric not null,
  discount numeric not null default 0,
  total numeric not null,
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'cancelled', 'returned')),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_pos_sales_tenant_number unique (tenant_id, number)
);

-- ============================================================
-- POS SALE ITEMS
-- ============================================================

create table if not exists public.pos_sale_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  sale_id uuid not null references public.pos_sales(id),
  product_id uuid not null references public.products(id),
  quantity numeric not null,
  unit_price numeric not null,
  discount numeric not null default 0,
  total numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POS PAYMENTS
-- ============================================================

create table if not exists public.pos_payments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  sale_id uuid not null references public.pos_sales(id),
  amount numeric not null,
  payment_method text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  confirmed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POS CANCELLATIONS
-- ============================================================

create table if not exists public.pos_cancellations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  sale_id uuid not null references public.pos_sales(id),
  requested_by uuid not null references public.people(id),
  approved_by uuid references public.people(id),
  reason text not null,
  status text not null default 'requested' check (status in ('requested', 'approved', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POS RETURNS
-- ============================================================

create table if not exists public.pos_returns (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  sale_id uuid not null references public.pos_sales(id),
  reason text not null,
  status text not null default 'requested' check (status in ('requested', 'received', 'closed')),
  received_at timestamptz,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POS CASH MOVEMENTS
-- ============================================================

create table if not exists public.pos_cash_movements (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  session_id uuid not null references public.pos_cashier_sessions(id),
  type text not null check (type in ('sangria', 'suprimento', 'despesa')),
  amount numeric not null,
  reason text,
  approved_by uuid references public.people(id),
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POS DAILY CLOSURES
-- ============================================================

create table if not exists public.pos_daily_closures (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  session_id uuid not null references public.pos_cashier_sessions(id),
  closure_date date not null,
  expected_amount numeric not null,
  actual_amount numeric not null,
  difference numeric not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'discrepancy')),
  notes text,
  approved_by uuid references public.people(id),
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
