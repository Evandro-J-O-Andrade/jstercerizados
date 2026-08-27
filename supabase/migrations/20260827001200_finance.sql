-- =============================================================================
-- GATE-DATA-04.012 — FINANCE: Core tables
-- =============================================================================
-- Domínios: Contas a pagar, contas a receber, fluxo de caixa,
--           faturamento, bancos, centros de custo, pagamentos e recebimentos.
-- Schema: public
-- Ordem: 12
-- Dependencies: 001_core, 002_identity, 003_companies, 005_rbac
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. accounts_payable — Contas a pagar
-- =============================================================================

create table public.accounts_payable (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  company_id          uuid
    references public.companies(id)
    on delete set null,

  description         varchar(255) not null,
  amount              numeric(12,2) not null,
  due_date            date not null,
  paid_date           date,
  status              varchar(20) not null default 'open'
    check (status in ('open','paid','overdue','cancelled','partially_paid')),

  payment_method      varchar(50),
  payment_reference   varchar(255),
  notes               text,

  created_by          uuid references public.people(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_accounts_payable_tenant on public.accounts_payable(tenant_id);
create index idx_accounts_payable_company on public.accounts_payable(company_id);
create index idx_accounts_payable_status on public.accounts_payable(status);
create index idx_accounts_payable_due_date on public.accounts_payable(due_date);

create trigger update_accounts_payable_updated_at
  before update on public.accounts_payable
  for each row execute procedure public.update_updated_at();

-- =============================================================================
-- 2. accounts_receivable — Contas a receber
-- =============================================================================

create table public.accounts_receivable (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  company_id          uuid
    references public.companies(id)
    on delete set null,

  description         varchar(255) not null,
  amount              numeric(12,2) not null,
  due_date            date not null,
  received_date       date,
  status              varchar(20) not null default 'open'
    check (status in ('open','received','overdue','cancelled','partially_received')),

  payment_method      varchar(50),
  payment_reference   varchar(255),
  notes               text,

  created_by          uuid references public.people(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_accounts_receivable_tenant on public.accounts_receivable(tenant_id);
create index idx_accounts_receivable_company on public.accounts_receivable(company_id);
create index idx_accounts_receivable_status on public.accounts_receivable(status);
create index idx_accounts_receivable_due_date on public.accounts_receivable(due_date);

create trigger update_accounts_receivable_updated_at
  before update on public.accounts_receivable
  for each row execute procedure public.update_updated_at();

-- =============================================================================
-- 3. cash_flows — Fluxo de caixa
-- =============================================================================

create table public.cash_flows (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  company_id          uuid
    references public.companies(id)
    on delete set null,

  type                varchar(20) not null
    check (type in ('income','expense','transfer')),

  amount              numeric(12,2) not null,
  date                date not null,
  category            varchar(100),
  subcategory         varchar(100),
  description         varchar(255),
  reference           varchar(255),

  related_account_payable_id    uuid
    references public.accounts_payable(id) on delete set null,
  related_account_receivable_id uuid
    references public.accounts_receivable(id) on delete set null,

  notes               text,

  created_by          uuid references public.people(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_cash_flows_tenant on public.cash_flows(tenant_id);
create index idx_cash_flows_company on public.cash_flows(company_id);
create index idx_cash_flows_type on public.cash_flows(type);
create index idx_cash_flows_date on public.cash_flows(date);

create trigger update_cash_flows_updated_at
  before update on public.cash_flows
  for each row execute procedure public.update_updated_at();

-- =============================================================================
-- 4. bank_accounts — Contas bancárias
-- =============================================================================

create table public.bank_accounts (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  company_id          uuid
    references public.companies(id)
    on delete set null,

  bank                varchar(100) not null,
  agency              varchar(20),
  account_number      varchar(30),
  account_type        varchar(20)
    check (account_type in ('checking','savings','investment')),

  current_balance     numeric(14,2) not null default 0,
  available_balance   numeric(14,2) not null default 0,
  status              varchar(20) not null default 'active'
    check (status in ('active','inactive','blocked')),

  notes               text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_bank_accounts_tenant on public.bank_accounts(tenant_id);
create index idx_bank_accounts_company on public.bank_accounts(company_id);

create trigger update_bank_accounts_updated_at
  before update on public.bank_accounts
  for each row execute procedure public.update_updated_at();

-- =============================================================================
-- 5. cost_centers — Centros de custo
-- =============================================================================

create table public.cost_centers (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  company_id          uuid
    references public.companies(id)
    on delete set null,

  name                varchar(100) not null,
  code                varchar(50),
  parent_id           uuid
    references public.cost_centers(id) on delete set null,

  status              varchar(20) not null default 'active'
    check (status in ('active','inactive')),

  notes               text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_cost_centers_tenant on public.cost_centers(tenant_id);
create index idx_cost_centers_company on public.cost_centers(company_id);

create trigger update_cost_centers_updated_at
  before update on public.cost_centers
  for each row execute procedure public.update_updated_at();

-- =============================================================================
-- 6. payments — Pagamentos
-- =============================================================================

create table public.payments (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  company_id          uuid
    references public.companies(id)
    on delete set null,

  account_payable_id  uuid
    references public.accounts_payable(id) on delete set null,

  amount              numeric(12,2) not null,
  payment_date        date not null,
  payment_method      varchar(50),
  payment_reference   varchar(255),
  notes               text,

  created_by          uuid references public.people(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_payments_tenant on public.payments(tenant_id);
create index idx_payments_account_payable on public.payments(account_payable_id);

create trigger update_payments_updated_at
  before update on public.payments
  for each row execute procedure public.update_updated_at();

-- =============================================================================
-- 7. receipts — Recebimentos
-- =============================================================================

create table public.receipts (
  id                  uuid primary key default gen_random_uuid(),

  tenant_id           uuid not null
    references public.tenants(id)
    on delete cascade,

  company_id          uuid
    references public.companies(id)
    on delete set null,

  account_receivable_id uuid
    references public.accounts_receivable(id) on delete set null,

  amount              numeric(12,2) not null,
  received_date       date not null,
  payment_method      varchar(50),
  payment_reference   varchar(255),
  notes               text,

  created_by          uuid references public.people(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_receipts_tenant on public.receipts(tenant_id);
create index idx_receipts_account_receivable on public.receipts(account_receivable_id);

create trigger update_receipts_updated_at
  before update on public.receipts
  for each row execute procedure public.update_updated_at();

COMMIT;
