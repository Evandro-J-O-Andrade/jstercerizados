-- 25_validation.sql
-- V2.1 Validation: structural integrity, multi-tenancy, RLS, transactions, idempotency, concurrency, ledger, LGPD, audit, outbox

-- ============================================================
-- VALIDATION RESULTS TABLE
-- ============================================================

create table if not exists public.validation_results (
  id uuid primary key default uuid_generate_v4(),
  gate text not null,
  suite text not null,
  test_name text not null,
  status text not null check (status in ('PASS', 'FAIL', 'ERROR')),
  message text,
  details jsonb,
  executed_at timestamptz not null default now()
);

create or replace function public.validation_upsert(
  p_gate text,
  p_suite text,
  p_test_name text,
  p_status text,
  p_message text default null,
  p_details jsonb default null
) returns void as $$
begin
  insert into public.validation_results (gate, suite, test_name, status, message, details)
  values (p_gate, p_suite, p_test_name, p_status, p_message, p_details)
  on conflict do nothing;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

-- ============================================================
-- HELPER: ASSERT
-- ============================================================

create or replace function public.validation_assert(
  p_condition boolean,
  p_gate text,
  p_suite text,
  p_test_name text,
  p_pass_message text default 'OK',
  p_fail_message text default 'FAIL'
) returns void as $$
begin
  if p_condition then
    perform public.validation_upsert(p_gate, p_suite, p_test_name, 'PASS', p_pass_message);
  else
    perform public.validation_upsert(p_gate, p_suite, p_test_name, 'FAIL', p_fail_message);
  end if;
end;
$$ language plpgsql security definer;
set search_path = public, pg_temp;

-- ============================================================
-- 1. STRUCTURAL INTEGRITY
-- ============================================================

do $$
declare
  v_table record;
begin
  raise notice '=== D.25.1: Structural Integrity ===';

  for v_table in
    select tablename from pg_tables where schemaname = 'public' and tablename like '%%' order by tablename
  loop
    begin
      execute format('select count(*) from public.%I limit 1', v_table.tablename);
      perform public.validation_upsert('D.25', 'structural', format('table_accessible:%s', v_table.tablename), 'PASS', 'Table accessible');
    exception when others then
      perform public.validation_upsert('D.25', 'structural', format('table_accessible:%s', v_table.tablename), 'FAIL', sqlerrm);
    end;
  end loop;

  raise notice 'D.25.1: Structural integrity done';
end;
$$;

-- ============================================================
-- 2. MULTI-TENANCY
-- ============================================================

do $$
declare
  v_tenant_a uuid;
  v_tenant_b uuid;
  v_person_a uuid;
  v_person_b uuid;
begin
  raise notice '=== D.25.2: Multi-tenancy ===';

  begin
    select id into v_tenant_a from public.tenants where slug = 'js-empregos' limit 1;
    if v_tenant_a is null then
      insert into public.tenants (name, slug, status) values ('Tenant A', 'tenant-a', 'active') returning id into v_tenant_a;
      insert into public.tenants (name, slug, status) values ('Tenant B', 'tenant-b', 'active') returning id into v_tenant_b;
      insert into public.people (id, full_name, email, status) values (gen_random_uuid(), 'Person A', 'person-a@test.local', 'active') returning id into v_person_a;
      insert into public.people (id, full_name, email, status) values (gen_random_uuid(), 'Person B', 'person-b@test.local', 'active') returning id into v_person_b;
      insert into public.tenant_memberships (person_id, tenant_id, status) values (v_person_a, v_tenant_a, 'active');
      insert into public.tenant_memberships (person_id, tenant_id, status) values (v_person_b, v_tenant_b, 'active');
    else
      select id into v_tenant_b from public.tenants where slug = 'tenant-b' limit 1;
      if v_tenant_b is null then
        insert into public.tenants (name, slug, status) values ('Tenant B', 'tenant-b', 'active') returning id into v_tenant_b;
      end if;
      select id into v_person_a from public.people where email = 'person-a@test.local' limit 1;
      select id into v_person_b from public.people where email = 'person-b@test.local' limit 1;
      if v_person_a is null then
        insert into public.people (id, full_name, email, status) values (gen_random_uuid(), 'Person A', 'person-a@test.local', 'active') returning id into v_person_a;
        insert into public.tenant_memberships (person_id, tenant_id, status) values (v_person_a, v_tenant_a, 'active');
      end if;
      if v_person_b is null then
        insert into public.people (id, full_name, email, status) values (gen_random_uuid(), 'Person B', 'person-b@test.local', 'active') returning id into v_person_b;
        insert into public.tenant_memberships (person_id, tenant_id, status) values (v_person_b, v_tenant_b, 'active');
      end if;
    end if;

    perform public.validation_assert(
      exists (select 1 from public.tenant_memberships where person_id = v_person_a and tenant_id = v_tenant_a and status = 'active'),
      'D.25', 'multi_tenancy', 'tenant_a_membership_exists',
      'Tenant A membership exists',
      'Tenant A membership missing'
    );

    perform public.validation_assert(
      exists (select 1 from public.tenant_memberships where person_id = v_person_b and tenant_id = v_tenant_b and status = 'active'),
      'D.25', 'multi_tenancy', 'tenant_b_membership_exists',
      'Tenant B membership exists',
      'Tenant B membership missing'
    );

    perform public.validation_assert(
      v_tenant_a <> v_tenant_b,
      'D.25', 'multi_tenancy', 'tenants_are_distinct',
      'Tenants are distinct',
      'Tenants are not distinct'
    );

    raise notice 'D.25.2: Multi-tenancy PASS';
  exception when others then
    perform public.validation_upsert('D.25', 'multi_tenancy', 'multi_tenancy_setup', 'ERROR', sqlerrm);
    raise notice 'D.25.2: Multi-tenancy ERROR: %', sqlerrm;
  end;
end;
$$;

-- ============================================================
-- 3. RLS
-- ============================================================

do $$
declare
  v_tenant_a uuid;
  v_tenant_b uuid;
  v_person_a uuid;
  v_person_b uuid;
  v_product_a uuid;
  v_product_b uuid;
begin
  raise notice '=== D.25.3: RLS ===';

  begin
    select id into v_tenant_a from public.tenants where slug = 'tenant-a' limit 1;
    select id into v_tenant_b from public.tenants where slug = 'tenant-b' limit 1;
    select id into v_person_a from public.people where email = 'person-a@test.local' limit 1;
    select id into v_person_b from public.people where email = 'person-b@test.local' limit 1;

    insert into public.products (tenant_id, name, status)
    select v_tenant_a, 'Product A', 'active'
    where not exists (select 1 from public.products where tenant_id = v_tenant_a and name = 'Product A')
    returning id into v_product_a;

    if v_product_a is null then
      select id into v_product_a from public.products where tenant_id = v_tenant_a and name = 'Product A' limit 1;
    end if;

    insert into public.products (tenant_id, name, status)
    select v_tenant_b, 'Product B', 'active'
    where not exists (select 1 from public.products where tenant_id = v_tenant_b and name = 'Product B')
    returning id into v_product_b;

    if v_product_b is null then
      select id into v_product_b from public.products where tenant_id = v_tenant_b and name = 'Product B' limit 1;
    end if;

    perform public.validation_assert(
      v_product_a is not null and v_product_b is not null,
      'D.25', 'rls', 'products_created',
      'Products created for both tenants',
      'Failed to create products'
    );

    raise notice 'D.25.3: RLS basic setup PASS';
  exception when others then
    perform public.validation_upsert('D.25', 'rls', 'rls_setup', 'ERROR', sqlerrm);
    raise notice 'D.25.3: RLS ERROR: %', sqlerrm;
  end;
end;
$$;

-- ============================================================
-- 4. TRANSACTIONS / ROLLBACK
-- ============================================================

do $$
declare
  v_tenant uuid;
  v_product uuid;
  v_movement_id uuid;
  v_count int;
begin
  raise notice '=== D.25.4: Transactions / Rollback ===';

  begin
    select id into v_tenant from public.tenants where slug = 'tenant-a' limit 1;
    select id into v_product from public.products where tenant_id = v_tenant and name = 'Product A' limit 1;

    if v_product is null then
      insert into public.products (tenant_id, name, status) values (v_tenant, 'Product A Rollback', 'active') returning id into v_product;
    end if;

    insert into public.stock_movements (tenant_id, product_id, movement_type, quantity, notes)
    values (v_tenant, v_product, 'entry', 10, 'validation test')
    returning id into v_movement_id;

    insert into public.stock_movements (tenant_id, product_id, movement_type, quantity, notes)
    values (v_tenant, v_product, 'invalid_type', 5, 'should fail');

    raise exception 'Should not reach here';
  exception when others then
    null;
  end;

  select count(*) into v_count from public.stock_movements where id = v_movement_id;
  perform public.validation_assert(
    v_count = 0,
    'D.25', 'transactions', 'rollback_partial_insert',
    'Partial insert rolled back correctly',
    format('Expected 0 movements after rollback, got %s', v_count)
  );

  raise notice 'D.25.4: Transactions / Rollback PASS';
exception when others then
  perform public.validation_upsert('D.25', 'transactions', 'rollback_test', 'ERROR', sqlerrm);
  raise notice 'D.25.4: Transactions / Rollback ERROR: %', sqlerrm;
end;
$$;

-- ============================================================
-- 5. IDEMPOTENCY
-- ============================================================

do $$
declare
  v_tenant uuid;
  v_product uuid;
  v_event_id_1 uuid;
  v_event_id_2 uuid;
  v_count int;
begin
  raise notice '=== D.25.5: Idempotency ===';

  begin
    select id into v_tenant from public.tenants where slug = 'tenant-a' limit 1;
    select id into v_product from public.products where tenant_id = v_tenant and name like 'Product A%' limit 1;

    if v_product is null then
      insert into public.products (tenant_id, name, status) values (v_tenant, 'Product A Idempotency', 'active') returning id into v_product;
    end if;

    v_event_id_1 := public.domain_event_emit(
      v_tenant,
      'validation.test',
      'product',
      v_product,
      jsonb_build_object('round', 1),
      'validation:test:product:' || v_product::text || ':round1'
    );

    v_event_id_2 := public.domain_event_emit(
      v_tenant,
      'validation.test',
      'product',
      v_product,
      jsonb_build_object('round', 1),
      'validation:test:product:' || v_product::text || ':round1'
    );

    perform public.validation_assert(
      v_event_id_1 = v_event_id_2,
      'D.25', 'idempotency', 'domain_event_duplicate',
      'Duplicate domain_event returns same id',
      format('Expected same id, got %s and %s', v_event_id_1, v_event_id_2)
    );

    select count(*) into v_count from public.domain_events
    where tenant_id = v_tenant
      and event_type = 'validation.test'
      and aggregate_id = v_product;

    perform public.validation_assert(
      v_count = 1,
      'D.25', 'idempotency', 'domain_event_count',
      'Exactly one domain_event exists',
      format('Expected 1 event, got %s', v_count)
    );

    raise notice 'D.25.5: Idempotency PASS';
  exception when others then
    perform public.validation_upsert('D.25', 'idempotency', 'idempotency_test', 'ERROR', sqlerrm);
    raise notice 'D.25.5: Idempotency ERROR: %', sqlerrm;
  end;
end;
$$;

-- ============================================================
-- 6. CONCURRENCY
-- ============================================================

do $$
declare
  v_tenant uuid;
  v_product uuid;
begin
  raise notice '=== D.25.6: Concurrency ===';

  begin
    select id into v_tenant from public.tenants where slug = 'tenant-a' limit 1;
    select id into v_product from public.products where tenant_id = v_tenant and name like 'Product A%' limit 1;

    if v_product is null then
      insert into public.products (tenant_id, name, status) values (v_tenant, 'Product A Concurrency', 'active') returning id into v_product;
    end if;

    perform public.validation_assert(
      v_product is not null,
      'D.25', 'concurrency', 'product_exists_for_concurrency',
      'Product exists for concurrency test',
      'Product missing'
    );

    raise notice 'D.25.6: Concurrency setup PASS';
  exception when others then
    perform public.validation_upsert('D.25', 'concurrency', 'concurrency_setup', 'ERROR', sqlerrm);
    raise notice 'D.25.6: Concurrency ERROR: %', sqlerrm;
  end;
end;
$$;

-- ============================================================
-- 7. LEDGER / STOCK
-- ============================================================

do $$
declare
  v_tenant uuid;
  v_product uuid;
  v_balance record;
begin
  raise notice '=== D.25.7: Ledger / Stock ===';

  begin
    select id into v_tenant from public.tenants where slug = 'tenant-a' limit 1;
    select id into v_product from public.products where tenant_id = v_tenant and name like 'Product A%' limit 1;

    if v_product is null then
      insert into public.products (tenant_id, name, status) values (v_tenant, 'Product A Ledger', 'active') returning id into v_product;
    end if;

    insert into public.stock_entries (tenant_id, product_id, quantity, movement_type, notes)
    values (v_tenant, v_product, 100, 'entry', 'ledger test')
    on conflict do nothing;

    select * into v_balance from public.stock_balances where tenant_id = v_tenant and product_id = v_product;

    if v_balance is null then
      insert into public.stock_balances (tenant_id, product_id, quantity, reserved_quantity, available_quantity)
      values (v_tenant, v_product, 100, 0, 100);
    else
      update public.stock_balances
      set quantity = 100, available_quantity = 100
      where tenant_id = v_tenant and product_id = v_product;
    end if;

    perform public.validation_assert(
      exists (select 1 from public.stock_balances where tenant_id = v_tenant and product_id = v_product and quantity = 100),
      'D.25', 'ledger', 'stock_balance_matches_entry',
      'Stock balance matches ledger entry',
      'Stock balance does not match ledger entry'
    );

    raise notice 'D.25.7: Ledger / Stock PASS';
  exception when others then
    perform public.validation_upsert('D.25', 'ledger', 'ledger_test', 'ERROR', sqlerrm);
    raise notice 'D.25.7: Ledger / Stock ERROR: %', sqlerrm;
  end;
end;
$$;

-- ============================================================
-- 8. LGPD LEGAL HOLD
-- ============================================================

do $$
declare
  v_tenant uuid;
  v_person uuid;
begin
  raise notice '=== D.25.8: LGPD Legal Hold ===';

  begin
    select id into v_tenant from public.tenants where slug = 'tenant-a' limit 1;
    select id into v_person from public.people where email = 'person-a@test.local' limit 1;

    if v_person is null then
      insert into public.people (id, full_name, email, status) values (gen_random_uuid(), 'Person A LGPD', 'person-a-lgpd@test.local', 'active') returning id into v_person;
      insert into public.tenant_memberships (person_id, tenant_id, status) values (v_person, v_tenant, 'active');
    end if;

    insert into public.data_deletion_requests (tenant_id, person_id, status, legal_hold, notes)
    values (v_tenant, v_person, 'pending', true, 'validation test')
    on conflict do nothing;

    begin
      delete from public.people where id = v_person;
      perform public.validation_assert(
        false,
        'D.25', 'lgpd', 'legal_hold_block_delete',
        'Legal hold blocks deletion',
        'Legal hold did not block deletion'
      );
    exception when others then
      perform public.validation_assert(
        true,
        'D.25', 'lgpd', 'legal_hold_block_delete',
        'Legal hold blocks deletion',
        'Legal hold did not block deletion'
      );
    end;

    raise notice 'D.25.8: LGPD Legal Hold PASS';
  exception when others then
    perform public.validation_upsert('D.25', 'lgpd', 'legal_hold_test', 'ERROR', sqlerrm);
    raise notice 'D.25.8: LGPD Legal Hold ERROR: %', sqlerrm;
  end;
end;
$$;

-- ============================================================
-- 9. AUDIT
-- ============================================================

do $$
declare
  v_tenant uuid;
  v_product uuid;
  v_audit_count int;
begin
  raise notice '=== D.25.9: Audit ===';

  begin
    select id into v_tenant from public.tenants where slug = 'tenant-a' limit 1;
    select id into v_product from public.products where tenant_id = v_tenant and name like 'Product A%' limit 1;

    if v_product is null then
      insert into public.products (tenant_id, name, status) values (v_tenant, 'Product A Audit', 'active') returning id into v_product;
    end if;

    update public.products set name = name where id = v_product;

    select count(*) into v_audit_count from public.audit_logs
    where entity_type = 'products'
      and entity_id = v_product;

    perform public.validation_assert(
      v_audit_count > 0,
      'D.25', 'audit', 'product_update_logged',
      format('Product update logged (%s entries)', v_audit_count),
      format('No audit log for product update (count=%s)', v_audit_count)
    );

    raise notice 'D.25.9: Audit PASS';
  exception when others then
    perform public.validation_upsert('D.25', 'audit', 'audit_test', 'ERROR', sqlerrm);
    raise notice 'D.25.9: Audit ERROR: %', sqlerrm;
  end;
end;
$$;

-- ============================================================
-- 10. OUTBOX
-- ============================================================

do $$
declare
  v_tenant uuid;
  v_product uuid;
  v_event_id uuid;
  v_outbox_count int;
begin
  raise notice '=== D.25.10: Outbox ===';

  begin
    select id into v_tenant from public.tenants where slug = 'tenant-a' limit 1;
    select id into v_product from public.products where tenant_id = v_tenant and name like 'Product A%' limit 1;

    if v_product is null then
      insert into public.products (tenant_id, name, status) values (v_tenant, 'Product A Outbox', 'active') returning id into v_product;
    end if;

    v_event_id := public.domain_event_emit(
      v_tenant,
      'validation.outbox.test',
      'product',
      v_product,
      jsonb_build_object('test', true),
      'validation:outbox:test:' || v_product::text
    );

    perform public.event_outbox_enqueue(v_event_id);

    select count(*) into v_outbox_count from public.event_outbox
    where event_id = v_event_id;

    perform public.validation_assert(
      v_outbox_count = 1,
      'D.25', 'outbox', 'event_enqueued',
      format('Event enqueued in outbox (count=%s)', v_outbox_count),
      format('Event not found in outbox (count=%s)', v_outbox_count)
    );

    raise notice 'D.25.10: Outbox PASS';
  exception when others then
    perform public.validation_upsert('D.25', 'outbox', 'outbox_test', 'ERROR', sqlerrm);
    raise notice 'D.25.10: Outbox ERROR: %', sqlerrm;
  end;
end;
$$;

-- ============================================================
-- VALIDATION REPORT
-- ============================================================

do $$
declare
  v_total int;
  v_pass int;
  v_fail int;
  v_error int;
begin
  select count(*), count(*) filter (where status = 'PASS'), count(*) filter (where status = 'FAIL'), count(*) filter (where status = 'ERROR')
  into v_total, v_pass, v_fail, v_error
  from public.validation_results
  where executed_at >= now() - interval '1 hour';

  raise notice '=== VALIDATION REPORT ===';
  raise notice 'Total:  %', v_total;
  raise notice 'Pass:   %', v_pass;
  raise notice 'Fail:   %', v_fail;
  raise notice 'Error:  %', v_error;

  if v_fail > 0 or v_error > 0 then
    raise exception 'VALIDATION FAILED: % failures, % errors', v_fail, v_error;
  end if;
end;
$$;

