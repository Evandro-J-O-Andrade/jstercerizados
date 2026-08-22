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
declare
  v_invoice public.invoices%rowtype;
  v_tenant_id uuid;
begin
  select * into v_invoice from public.invoices where id = p_invoice_id;
  if not found then
    raise exception 'invoice not found';
  end if;

  v_tenant_id := v_invoice.tenant_id;

  if not public.is_tenant_member(v_tenant_id) then
    raise exception 'not a member of the invoice tenant';
  end if;

  if not public.user_has_permission(auth.uid(), 'invoices', 'update', v_tenant_id) then
    raise exception 'permission denied: invoices.update required';
  end if;

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
declare
  v_invoice public.invoices%rowtype;
  v_tenant_id uuid;
begin
  select * into v_invoice from public.invoices where id = p_invoice_id;
  if not found then
    raise exception 'invoice not found';
  end if;

  v_tenant_id := v_invoice.tenant_id;

  if not public.is_tenant_member(v_tenant_id) then
    raise exception 'not a member of the invoice tenant';
  end if;

  if not public.user_has_permission(auth.uid(), 'invoices', 'update', v_tenant_id) then
    raise exception 'permission denied: invoices.update required';
  end if;

  update public.invoices
  set status = 'cancelled'
  where id = p_invoice_id;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;
