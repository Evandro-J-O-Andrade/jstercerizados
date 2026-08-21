-- 27_finance.sql
-- Finance domain: accounts receivable/payable, payments, receipts, financial transactions

-- ============================================================
-- FINANCIAL CATEGORIES
-- ============================================================

create table if not exists public.financial_categories (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  type text not null check (type in ('revenue', 'expense', 'transfer')),
  parent_id uuid references public.financial_categories(id),
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_financial_categories_tenant_name unique (tenant_id, name, parent_id)
);

-- ============================================================
-- COST CENTERS
-- ============================================================

create table if not exists public.cost_centers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  code text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_cost_centers_tenant_code unique (tenant_id, code)
);

-- ============================================================
-- ACCOUNTS RECEIVABLE
-- ============================================================

create table if not exists public.accounts_receivable (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid references public.companies(id),
  contract_id uuid references public.contracts(id),
  service_order_id uuid references public.service_orders(id),
  invoice_id uuid,
  description text not null,
  amount numeric not null,
  discount numeric not null default 0,
  tax numeric not null default 0,
  net_amount numeric not null,
  due_date date not null,
  paid_at timestamptz,
  status text not null default 'open' check (status in ('open', 'partial', 'paid', 'overdue', 'cancelled')),
  origin_document_type text,
  origin_document_id uuid,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ACCOUNTS PAYABLE
-- ============================================================

create table if not exists public.accounts_payable (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  company_id uuid references public.companies(id),
  supplier_id uuid references public.suppliers(id),
  purchase_order_id uuid references public.purchase_orders(id),
  purchase_receipt_id uuid references public.purchase_receipts(id),
  description text not null,
  amount numeric not null,
  discount numeric not null default 0,
  tax numeric not null default 0,
  net_amount numeric not null,
  due_date date not null,
  paid_at timestamptz,
  status text not null default 'open' check (status in ('open', 'partial', 'paid', 'overdue', 'cancelled')),
  origin_document_type text,
  origin_document_id uuid,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  account_payable_id uuid not null references public.accounts_payable(id),
  amount numeric not null,
  payment_method text not null,
  payment_date date not null,
  reference text,
  bank_account text,
  notes text,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RECEIPTS
-- ============================================================

create table if not exists public.receipts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  account_receivable_id uuid not null references public.accounts_receivable(id),
  amount numeric not null,
  payment_method text not null,
  payment_date date not null,
  reference text,
  bank_account text,
  notes text,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FINANCIAL TRANSACTIONS
-- ============================================================

create table if not exists public.financial_transactions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  cost_center_id uuid references public.cost_centers(id),
  category_id uuid references public.financial_categories(id),
  type text not null check (type in ('debit', 'credit', 'transfer')),
  amount numeric not null,
  competence_date date not null,
  payment_date date,
  bank_account text,
  description text not null,
  reference text,
  origin_document_type text,
  origin_document_id uuid,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BANK RECONCILIATIONS
-- ============================================================

create table if not exists public.bank_reconciliations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  bank_account text not null,
  statement_date date not null,
  statement_balance numeric not null,
  reconciled_balance numeric not null,
  difference numeric not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'discrepancy')),
  notes text,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FINANCIAL INSTALLMENTS
-- ============================================================

create table if not exists public.financial_installments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  account_receivable_id uuid references public.accounts_receivable(id),
  account_payable_id uuid references public.accounts_payable(id),
  installment_number integer not null,
  total_installments integer not null,
  amount numeric not null,
  due_date date not null,
  paid_at timestamptz,
  status text not null default 'open' check (status in ('open', 'paid', 'cancelled', 'overdue')),
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FINANCIAL INSTALLMENT PAYMENTS
-- ============================================================

create table if not exists public.financial_installment_payments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  installment_id uuid not null references public.financial_installments(id),
  amount numeric not null,
  payment_method text not null,
  payment_date date not null,
  reference text,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FINANCIAL INSTALLMENT CANCELLATIONS
-- ============================================================

create table if not exists public.financial_installment_cancellations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  installment_id uuid not null references public.financial_installments(id),
  reason text not null,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
