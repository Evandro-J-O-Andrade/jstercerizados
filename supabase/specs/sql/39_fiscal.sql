-- 39_fiscal.sql
-- Fiscal integrations and RPCs

create table if not exists public.fiscal_integrations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  provider text not null,
  api_key text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.fiscal_emit_invoice(
  p_invoice_id uuid
)
returns void as $$
begin
  update public.invoices
  set status = 'emitted'
  where id = p_invoice_id;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.fiscal_cancel_invoice(
  p_invoice_id uuid
)
returns void as $$
begin
  update public.invoices
  set status = 'cancelled'
  where id = p_invoice_id;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;
