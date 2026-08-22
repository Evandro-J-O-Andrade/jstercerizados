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
-- INVOICES
-- ============================================================

create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  number text not null,
  company_id uuid references public.companies(id),
  customer_id uuid references public.companies(id),
  issue_date date not null,
  due_date date not null,
  amount numeric not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_invoices_tenant_number unique (tenant_id, number)
);

create table if not exists public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  invoice_id uuid not null references public.invoices(id),
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null,
  total numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  invoice_id uuid references public.invoices(id) on delete set null,
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

-- ============================================================
-- FINANCIAL ACCOUNTS
-- ============================================================

create table if not exists public.financial_accounts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  bank text,
  agency text,
  account_number text,
  account_type text not null default 'checking',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_financial_accounts_tenant_name unique (tenant_id, name)
);

-- EXTEND financial_transactions
alter table public.financial_transactions alter column cost_center_id set not null;

-- ============================================================
-- FUNCTIONS
-- ============================================================

create or replace function public.financial_reversal(
  p_transaction_id uuid
)
returns void as $$
declare
  v_transaction public.financial_transactions%rowtype;
  v_actor uuid;
begin
  select auth.uid() into v_actor;

  if not public.is_tenant_member((select tenant_id from public.financial_transactions where id = p_transaction_id)) then
    raise exception 'not allowed';
  end if;

  if not public.user_has_permission(v_actor, 'financial_transactions.update') then
    raise exception 'not allowed';
  end if;

  select * into v_transaction from public.financial_transactions where id = p_transaction_id;
  if not found then
    raise exception 'transaction not found';
  end if;

  insert into public.financial_transactions (
    tenant_id, cost_center_id, category_id, type, amount, competence_date, payment_date,
    bank_account, description, reference, origin_document_type, origin_document_id,
    actor_person_id, correlation_id
  )
  values (
    v_transaction.tenant_id, v_transaction.cost_center_id, v_transaction.category_id,
    case when v_transaction.type = 'debit' then 'credit' else 'debit' end,
    v_transaction.amount, v_transaction.competence_date, v_transaction.payment_date,
    v_transaction.bank_account, v_transaction.description || ' (reversal)',
    v_transaction.reference, v_transaction.origin_document_type, v_transaction.origin_document_id,
    v_actor, gen_random_uuid()
  );
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace view public.financial_kpis as
select
  tenant_id,
  sum(amount) filter (where type = 'credit') as total_credit,
  sum(amount) filter (where type = 'debit') as total_debit,
  sum(amount) filter (where type = 'credit') - sum(amount) filter (where type = 'debit') as balance
from public.financial_transactions
where tenant_id in (select public.user_tenant_ids())
group by tenant_id;
