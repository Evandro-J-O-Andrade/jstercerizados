-- 21_functions_triggers.sql
-- Functions and triggers for domain rules, auditing, stock, LGPD and outbox

-- ============================================================
-- TABLES COMPLEMENTARY TO D.21
-- ============================================================

create table if not exists public.stock_balances (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  product_id uuid not null references public.products(id),
  quantity numeric not null default 0,
  reserved_quantity numeric not null default 0,
  available_quantity numeric not null default 0,
  last_movement_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_stock_balances_tenant_product unique (tenant_id, product_id)
);

create table if not exists public.stock_entries (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  product_id uuid not null references public.products(id),
  quantity numeric not null,
  unit_cost numeric,
  movement_type text not null,
  reference_id uuid,
  reference_type text,
  notes text,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_receipts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  purchase_order_id uuid not null references public.purchase_orders(id),
  supplier_id uuid not null references public.suppliers(id),
  received_at timestamptz not null default now(),
  status text not null default 'pending',
  notes text,
  actor_person_id uuid references public.people(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_receipt_items (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id),
  receipt_id uuid not null references public.purchase_receipts(id),
  purchase_order_item_id uuid not null references public.purchase_order_items(id),
  product_id uuid not null references public.products(id),
  quantity numeric not null,
  unit_cost numeric,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.audit_log_insert()
returns trigger as $$
declare
  v_actor uuid := coalesce(
    current_setting('app.current_person_id', true)::uuid,
    auth.uid()
  );
  v_correlation uuid := coalesce(
    current_setting('app.correlation_id', true)::uuid,
    gen_random_uuid()
  );
  v_causation uuid := coalesce(
    current_setting('app.causation_id', true)::uuid,
    null
  );
begin
  insert into public.audit_logs (
    actor_person_id,
    tenant_id,
    scope,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data,
    correlation_id,
    causation_id
  ) values (
    v_actor,
    coalesce(new.tenant_id, old.tenant_id),
    tg_op,
    tg_op,
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op = 'DELETE' then row_to_json(old) else null end,
    case when tg_op = 'INSERT' or tg_op = 'UPDATE' then row_to_json(new) else null end,
    v_correlation,
    v_causation
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.domain_event_emit(
  p_tenant_id uuid,
  p_event_type text,
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_payload jsonb default '{}'::jsonb,
  p_idempotency_key text default null
)
returns uuid as $$
declare
  v_event_id uuid;
  v_actor uuid := coalesce(
    current_setting('app.current_person_id', true)::uuid,
    auth.uid()
  );
  v_correlation uuid := coalesce(
    current_setting('app.correlation_id', true)::uuid,
    gen_random_uuid()
  );
  v_causation uuid := coalesce(
    current_setting('app.causation_id', true)::uuid,
    null
  );
  v_idempotency_key text := coalesce(
    p_idempotency_key,
    p_event_type || ':' || p_aggregate_type || ':' || p_aggregate_id::text || ':' || to_char(now(), 'YYYYMMDDHH24MISSUS')
  );
begin
  insert into public.domain_events (
    tenant_id,
    event_type,
    aggregate_type,
    aggregate_id,
    actor_person_id,
    payload,
    correlation_id,
    causation_id,
    idempotency_key
  ) values (
    p_tenant_id,
    p_event_type,
    p_aggregate_type,
    p_aggregate_id,
    v_actor,
    p_payload,
    v_correlation,
    v_causation,
    v_idempotency_key
  )
  on conflict (idempotency_key) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select id into v_event_id from public.domain_events where idempotency_key = v_idempotency_key;
  end if;

  return v_event_id;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.event_outbox_enqueue(p_event_id uuid)
returns void as $$
declare
  v_correlation uuid;
begin
  select correlation_id into v_correlation from public.domain_events where id = p_event_id;

  insert into public.event_outbox (
    tenant_id,
    event_id,
    correlation_id,
    available_at,
    status
  )
  select
    de.tenant_id,
    de.id,
    de.correlation_id,
    now(),
    'pending'
  from public.domain_events de
  where de.id = p_event_id
  on conflict (event_id) do nothing;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.event_outbox_process_next(p_destination text)
returns void as $$
declare
  v_outbox record;
begin
  select * into v_outbox
  from public.event_outbox
  where status = 'pending'
    and available_at <= now()
    and attempts < 5
  order by available_at
  for update skip locked
  limit 1;

  if not found then
    return;
  end if;

  update public.event_outbox
  set status = 'processing',
      attempts = attempts + 1,
      updated_at = now()
  where id = v_outbox.id;

  begin
    insert into public.event_deliveries (
      tenant_id,
      outbox_id,
      destination,
      status,
      correlation_id,
      request_payload
    )
    select
      eo.tenant_id,
      eo.id,
      p_destination,
      'sent',
      eo.correlation_id,
      jsonb_build_object(
        'event_id', eo.event_id,
        'aggregate_type', de.aggregate_type,
        'aggregate_id', de.aggregate_id,
        'event_type', de.event_type,
        'payload', de.payload
      )
    from public.event_outbox eo
    join public.domain_events de on de.id = eo.event_id
    where eo.id = v_outbox.id
    on conflict (idempotency_key) do nothing;

    update public.event_outbox
    set status = 'processed',
        processed_at = now(),
        updated_at = now()
    where id = v_outbox.id;
  exception when others then
    update public.event_outbox
    set status = 'failed',
        last_error = sqlerrm,
        available_at = case when attempts + 1 >= 5 then null else now() + interval '1 minute' * power(2, attempts) end,
        updated_at = now()
    where id = v_outbox.id;
  end;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.stock_movement_insert()
returns trigger as $$
declare
  v_tenant_id uuid;
  v_product_id uuid;
  v_quantity numeric;
  v_movement_type text;
  v_actor uuid := coalesce(
    current_setting('app.current_person_id', true)::uuid,
    auth.uid()
  );
  v_correlation uuid := coalesce(
    current_setting('app.correlation_id', true)::uuid,
    gen_random_uuid()
  );
  v_causation uuid := coalesce(
    current_setting('app.causation_id', true)::uuid,
    null
  );
  v_event_id uuid;
begin
  v_tenant_id = new.tenant_id;
  v_product_id = new.product_id;
  v_quantity = new.quantity;
  v_movement_type = new.movement_type;

  if v_movement_type not in ('entry', 'exit', 'transfer', 'adjustment', 'inventory', 'return') then
    raise exception 'invalid movement_type: %', v_movement_type;
  end if;

  if v_movement_type = 'exit' or v_movement_type = 'transfer' or v_movement_type = 'adjustment' then
    if v_quantity > 0 then
      v_quantity = -abs(v_quantity);
    end if;
  elsif v_movement_type = 'entry' or v_movement_type = 'return' or v_movement_type = 'inventory' then
    if v_quantity < 0 then
      v_quantity = abs(v_quantity);
    end if;
  end if;

  insert into public.stock_entries (
    tenant_id,
    product_id,
    quantity,
    unit_cost,
    movement_type,
    reference_id,
    reference_type,
    notes,
    actor_person_id,
    created_at
  ) values (
    v_tenant_id,
    v_product_id,
    v_quantity,
    null,
    v_movement_type,
    new.reference_id,
    'stock_movement',
    new.notes,
    v_actor,
    now()
  );

  insert into public.stock_balances (
    tenant_id,
    product_id,
    quantity,
    reserved_quantity,
    available_quantity
  ) values (
    v_tenant_id,
    v_product_id,
    v_quantity,
    0,
    v_quantity
  )
  on conflict (tenant_id, product_id) do update
  set quantity = stock_balances.quantity + v_quantity,
      available_quantity = stock_balances.available_quantity + v_quantity,
      last_movement_at = now(),
      updated_at = now()
  where (stock_balances.quantity + v_quantity) >= 0;

  if not found then
    raise exception 'negative stock balance not allowed for tenant % product %', v_tenant_id, v_product_id;
  end if;

  v_event_id = public.domain_event_emit(
    v_tenant_id,
    'stock.movement_created',
    'stock',
    new.id,
    jsonb_build_object(
      'product_id', v_product_id,
      'movement_type', v_movement_type,
      'quantity', v_quantity,
      'movement_id', new.id
    )
  );

  if v_event_id is not null then
    perform public.event_outbox_enqueue(v_event_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.purchase_receipt_confirm()
returns trigger as $$
declare
  v_tenant_id uuid;
  v_actor uuid := coalesce(
    current_setting('app.current_person_id', true)::uuid,
    auth.uid()
  );
  v_correlation uuid := coalesce(
    current_setting('app.correlation_id', true)::uuid,
    gen_random_uuid()
  );
  v_causation uuid := coalesce(
    current_setting('app.causation_id', true)::uuid,
    null
  );
  v_event_id uuid;
begin
  if new.status = 'confirmed' and (old.status is null or old.status <> 'confirmed') then
    v_tenant_id = new.tenant_id;

    insert into public.stock_entries (
      tenant_id,
      product_id,
      quantity,
      unit_cost,
      movement_type,
      reference_id,
      reference_type,
      notes,
      actor_person_id,
      created_at
    )
    select
      pri.tenant_id,
      pri.product_id,
      pri.quantity,
      pri.unit_cost,
      'entry',
      new.id,
      'purchase_receipt',
      pri.notes,
      v_actor,
      now()
    from public.purchase_receipt_items pri
    where pri.receipt_id = new.id;

    insert into public.stock_balances (
      tenant_id,
      product_id,
      quantity,
      reserved_quantity,
      available_quantity
    )
    select
      pri.tenant_id,
      pri.product_id,
      pri.quantity,
      0,
      pri.quantity
    from public.purchase_receipt_items pri
    where pri.receipt_id = new.id
    on conflict (tenant_id, product_id) do update
    set quantity = stock_balances.quantity + excluded.quantity,
        available_quantity = stock_balances.available_quantity + excluded.quantity,
        last_movement_at = now(),
        updated_at = now();

    update public.purchase_order_items poi
    set received_quantity = poi.received_quantity + pri.quantity
    from public.purchase_receipt_items pri
    where pri.receipt_id = new.id
      and poi.id = pri.purchase_order_item_id;

    v_event_id = public.domain_event_emit(
      v_tenant_id,
      'purchase.receipt_confirmed',
      'purchase_receipt',
      new.id,
      jsonb_build_object(
        'purchase_order_id', new.purchase_order_id,
        'supplier_id', new.supplier_id,
        'received_at', new.received_at
      )
    );

    if v_event_id is not null then
      perform public.event_outbox_enqueue(v_event_id);
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.lgpd_legal_hold_check()
returns trigger as $$
begin
  if exists (
    select 1 from public.data_deletion_requests
    where person_id = old.person_id
      and status in ('pending', 'approved')
      and legal_hold = true
  ) then
    raise exception 'legal hold active for person %, deletion blocked', old.person_id;
  end if;
  return old;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.lgpd_consent_register()
returns trigger as $$
declare
  v_actor uuid := coalesce(
    current_setting('app.current_person_id', true)::uuid,
    auth.uid()
  );
  v_correlation uuid := coalesce(
    current_setting('app.correlation_id', true)::uuid,
    gen_random_uuid()
  );
begin
  if new.granted = true and old.granted = false then
    new.actor_person_id = v_actor;
    new.correlation_id = v_correlation;
  end if;
  return new;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

-- ============================================================
-- TRIGGERS
-- ============================================================

create trigger trg_set_updated_at_people
  before update on public.people
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_tenants
  before update on public.tenants
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_tenant_memberships
  before update on public.tenant_memberships
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_tenant_settings
  before update on public.tenant_settings
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_companies
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_products
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_suppliers
  before update on public.suppliers
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_purchase_orders
  before update on public.purchase_orders
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_purchase_order_items
  before update on public.purchase_order_items
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_stock_balances
  before update on public.stock_balances
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_stock_entries
  before update on public.stock_entries
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_purchase_receipts
  before update on public.purchase_receipts
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_purchase_receipt_items
  before update on public.purchase_receipt_items
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_third_party_custody
  before update on public.third_party_custody
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_third_party_custody_items
  before update on public.third_party_custody_items
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_roles
  before update on public.roles
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_permissions
  before update on public.permissions
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_tasks
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_support_tickets
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_chat_rooms
  before update on public.chat_rooms
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_ai_conversations
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_files
  before update on public.files
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_file_access_logs
  before update on public.file_access_logs
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_document_versions
  before update on public.document_versions
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_document_links
  before update on public.document_links
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_administrative_requests
  before update on public.administrative_requests
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_administrative_tasks
  before update on public.administrative_tasks
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_administrative_documents
  before update on public.administrative_documents
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_consents
  before update on public.consents
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_privacy_requests
  before update on public.privacy_requests
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_data_export_requests
  before update on public.data_export_requests
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_data_deletion_requests
  before update on public.data_deletion_requests
  for each row execute function public.set_updated_at();

create trigger trg_set_updated_at_data_retention_policies
  before update on public.data_retention_policies
  for each row execute function public.set_updated_at();

create trigger trg_audit_people
  after insert or update or delete on public.people
  for each row execute function public.audit_log_insert();

create trigger trg_audit_tenants
  after insert or update or delete on public.tenants
  for each row execute function public.audit_log_insert();

create trigger trg_audit_tenant_memberships
  after insert or update or delete on public.tenant_memberships
  for each row execute function public.audit_log_insert();

create trigger trg_audit_role_assignments
  after insert or update or delete on public.role_assignments
  for each row execute function public.audit_log_insert();

create trigger trg_audit_companies
  after insert or update or delete on public.companies
  for each row execute function public.audit_log_insert();

create trigger trg_audit_products
  after insert or update or delete on public.products
  for each row execute function public.audit_log_insert();

create trigger trg_audit_suppliers
  after insert or update or delete on public.suppliers
  for each row execute function public.audit_log_insert();

create trigger trg_audit_purchase_orders
  after insert or update or delete on public.purchase_orders
  for each row execute function public.audit_log_insert();

create trigger trg_audit_contracts
  after insert or update or delete on public.contracts
  for each row execute function public.audit_log_insert();

create trigger trg_audit_stock_movements
  after insert on public.stock_movements
  for each row execute function public.stock_movement_insert();

create trigger trg_audit_stock_balances
  after update on public.stock_balances
  for each row execute function public.audit_log_insert();

create trigger trg_audit_purchase_receipts
  after update on public.purchase_receipts
  for each row execute function public.purchase_receipt_confirm();

create trigger trg_audit_consents
  after update on public.consents
  for each row execute function public.lgpd_consent_register();

create trigger trg_domain_event_to_outbox
  after insert on public.domain_events
  for each row execute function public.event_outbox_enqueue(new.id);

create trigger trg_audit_data_deletion_requests
  before delete on public.people
  for each row execute function public.lgpd_legal_hold_check();

-- ============================================================
-- RBAC RPCs — Phase 01
-- ============================================================

create or replace function public.user_has_permission(
  p_auth_user_id uuid,
  p_resource text,
  p_action text,
  p_tenant_id uuid
)
returns boolean as $$
begin
  return exists (
    select 1
    from public.people pe
    join public.role_assignments ra on ra.person_id = pe.id and ra.tenant_id = p_tenant_id
    join public.role_permissions rp on rp.role_id = ra.role_id
    join public.permissions perm on perm.id = rp.permission_id
    where pe.auth_user_id = p_auth_user_id
      and perm.resource = p_resource
      and perm.action = p_action
  );
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

create or replace function public.user_permissions(
  p_auth_user_id uuid,
  p_tenant_id uuid
)
returns table (
  resource text,
  action text,
  description text
) as $$
begin
  return query
  select distinct perm.resource, perm.action, perm.description
  from public.people pe
  join public.role_assignments ra on ra.person_id = pe.id and ra.tenant_id = p_tenant_id
  join public.role_permissions rp on rp.role_id = ra.role_id
  join public.permissions perm on perm.id = rp.permission_id
  where pe.auth_user_id = p_auth_user_id;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

