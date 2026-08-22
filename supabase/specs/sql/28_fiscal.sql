-- 28_fiscal.sql
-- Fiscal domain: fiscal documents, tax rates, SEFAZ integration

-- ============================================================
-- FISCAL CONFIGURATIONS
-- ============================================================

create table if not exists public.fiscal_configurations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  regime_tributario text not null,
  ambiente text not null default 'homologacao' check (ambiente in ('homologacao', 'producao')),
  serie_nf text,
  serie_nfce text,
  ultimo_numero_nf integer not null default 0,
  ultimo_numero_nfce integer not null default 0,
  certificado_digital text,
  senha_certificado text,
  webservice_url text,
  timeout integer not null default 30,
  status text not null default 'active',
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_fiscal_configurations_tenant unique (tenant_id)
);

-- ============================================================
-- TAX RATES
-- ============================================================

create table if not exists public.tax_rates (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  name text not null,
  type text not null check (type in ('icms', 'ipi', 'pis', 'cofins', 'iss', 'outro')),
  rate numeric not null,
  effective_date date not null,
  expiration_date date,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_tax_rates_tenant_type_date unique (tenant_id, type, effective_date)
);

-- ============================================================
-- TAX CALCULATIONS
-- ============================================================

create table if not exists public.tax_calculations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  tax_rate_id uuid not null references public.tax_rates(id),
  base_amount numeric not null,
  tax_amount numeric not null,
  calculation_type text not null,
  reference_type text,
  reference_id uuid,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FISCAL DOCUMENTS
-- ============================================================

create table if not exists public.fiscal_documents (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  type text not null check (type in ('nf_e', 'nfce', 'nfs_e', 'ct_e', 'mdf_e')),
  serie text not null,
  number text not null,
  key text unique,
  status text not null default 'draft' check (status in ('draft', 'issued', 'authorized', 'cancelled', 'rejected')),
  issued_at timestamptz,
  authorized_at timestamptz,
  cancelled_at timestamptz,
  rejection_reason text,
  xml_content text,
  pdf_url text,
  origin_document_type text,
  origin_document_id uuid,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_fiscal_documents_tenant_type_number unique (tenant_id, type, number)
);

-- ============================================================
-- FISCAL DOCUMENT ITEMS
-- ============================================================

create table if not exists public.fiscal_document_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  fiscal_document_id uuid not null references public.fiscal_documents(id),
  product_id uuid references public.products(id),
  description text not null,
  quantity numeric not null,
  unit_price numeric not null,
  discount numeric not null default 0,
  total numeric not null,
  tax_icms numeric not null default 0,
  tax_ipi numeric not null default 0,
  tax_pis numeric not null default 0,
  tax_cofins numeric not null default 0,
  tax_iss numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FISCAL DOCUMENT STATUS HISTORY
-- ============================================================

create table if not exists public.fiscal_document_status_history (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  fiscal_document_id uuid not null references public.fiscal_documents(id),
  status text not null,
  reason text,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- FISCAL API REQUESTS
-- ============================================================

create table if not exists public.fiscal_api_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  fiscal_document_id uuid references public.fiscal_documents(id),
  operation text not null,
  request_url text not null,
  request_headers jsonb not null default '{}'::jsonb,
  request_body jsonb not null default '{}'::jsonb,
  response_status integer,
  response_headers jsonb not null default '{}'::jsonb,
  response_body jsonb not null default '{}'::jsonb,
  error_message text,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FISCAL API RESPONSES
-- ============================================================

create table if not exists public.fiscal_api_responses (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  fiscal_api_request_id uuid not null references public.fiscal_api_requests(id),
  status text not null,
  protocol text,
  receipt text,
  xml_content text,
  pdf_url text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FISCAL DOCUMENT EVENTS
-- ============================================================

create table if not exists public.fiscal_document_events (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  fiscal_document_id uuid not null references public.fiscal_documents(id),
  event_type text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  actor_person_id uuid references public.people(id),
  correlation_id uuid,
  created_at timestamptz not null default now()
);
