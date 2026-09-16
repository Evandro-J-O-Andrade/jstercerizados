import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const connectionString = process.env.SUPABASE_DB_URL ||
  `postgresql://postgres.okxqfyoqbhcmflpurfrw:%40An2907081831@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`;

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('=== CONECTADO AO SUPABASE REAL ===\n');

  const coreTables = [
    'people', 'tenants', 'tenant_memberships', 'tenant_settings',
    'roles', 'permissions', 'role_permissions', 'role_assignments',
    'auth.users'
  ];

  const results = { tables: {}, rls: {}, functions: {}, triggers: {}, views: {}, constraints: [] };

  // 1. SCHEMA: colunas, tipos, defaults, nullable
  for (const table of coreTables) {
    const schema = table.includes('.') ? table.split('.')[0] : 'public';
    const tableOnly = table.includes('.') ? table.split('.')[1] : table;
    const q = `
      select
        table_schema, table_name,
        ordinal_position, column_name, data_type,
        character_maximum_length, is_nullable, column_default,
        udt_name
      from information_schema.columns
      where table_schema = $1 and table_name = $2
      order by ordinal_position;
    `;
    const res = await client.query(q, [schema, tableOnly]);
    results.tables[table] = res.rows;
  }

  // 2. CONSTRAINTS: PK, FK, UNIQUE, CHECK
  const cq = `
    select
      tc.table_schema, tc.table_name,
      tc.constraint_name, tc.constraint_type,
      kcu.column_name, kcu.ordinal_position,
      ccu.table_schema as foreign_table_schema,
      ccu.table_name as foreign_table_name,
      ccu.column_name as foreign_column_name,
      pg_get_constraintdef(con.oid) as definition
    from information_schema.table_constraints tc
    join pg_constraint con on con.conname = tc.constraint_name
    left join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
      and tc.table_schema = kcu.table_schema
      and tc.table_name = kcu.table_name
    left join information_catalog_update_constraint as ccu_unused on false
    left join information_schema.constraint_column_usage ccu
      on tc.constraint_name = ccu.constraint_name
      and tc.table_schema = ccu.table_schema
    where tc.table_schema = 'public'
      and tc.table_name = any(array['people','tenants','tenant_memberships','tenant_settings','roles','permissions','role_permissions','role_assignments'])
    order by tc.table_name, tc.constraint_name, kcu.ordinal_position;
  `;
  const cq2 = `
    select
      tc.table_schema, tc.table_name,
      tc.constraint_name, tc.constraint_type,
      kcu.column_name,
      ccu.table_schema as foreign_table_schema,
      ccu.table_name as foreign_table_name,
      ccu.column_name as foreign_column_name
    from information_schema.table_constraints tc
    left join information_schema.key_column_usage kcu
      on tc.constraint_schema = kcu.constraint_schema
      and tc.constraint_name = kcu.constraint_name
    left join information_schema.constraint_column_usage ccu
      on tc.constraint_schema = ccu.constraint_schema
      and tc.constraint_name = ccu.constraint_name
    where tc.table_schema = 'public'
      and tc.table_name = any(array['people','tenants','tenant_memberships','tenant_settings','roles','permissions','role_permissions','role_assignments'])
    order by tc.table_name, tc.constraint_type, tc.constraint_name;
  `;
  const cres = await client.query(cq2);
  results.constraints = cres.rows;

  // 3. RLS enabled?
  const rlp = `
    select relname, relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and relname = any(array['people','tenants','tenant_memberships','tenant_settings','roles','permissions','role_permissions','role_assignments'])
    order by relname;
  `;
  const rres = await client.query(rlp);
  results.rls = rres.rows;

  // 4. RLS Policies
  const pp = `
    select
      schemaname, tablename, policyname,
      permissive, roles, cmd, qual
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array['people','tenants','tenant_memberships','tenant_settings','roles','permissions','role_permissions','role_assignments'])
    order by tablename, policyname;
  `;
  const pres = await client.query(pp);
  results.policies = pres.rows;

  // 5. Functions (RPCs)
  const fp = `
    select
      n.nspname as schema,
      p.proname as name,
      pg_catalog.pg_get_function_arguments(p.oid) as args,
      pg_catalog.pg_get_function_result(p.oid) as result,
      l.lanname as language,
      p.prosecdef as security_definer,
      p.provolatile as volatility
    from pg_proc p
    left join pg_namespace n on n.oid = p.pronamespace
    left join pg_language l ON l.oid = p.prolang
    where n.nspname = 'public'
      and p.proname in (
        'is_tenant_member','is_admin_master','user_tenant_ids',
        'user_has_permission','user_permissions',
        'repair_candidate_chain','emit_domain_event',
        'domain_event_emit','handle_new_auth_user',
        'handle_auth_user_updated','handle_auth_user_deleted',
        'bootstrap_candidate_identity','set_primary_media',
        'media_for_entity','normalize_cnpj','normalize_cpf',
        'is_valid_cnpj','is_valid_cpf','increment_job_views',
        'increment_application_count','update_updated_at'
      )
    order by p.proname;
  `;
  const fres = await client.query(fp);
  results.functions = fres.rows;

  // 6. Triggers
  const tp = `
    select
      tg.relname as table_name,
      trg.tgname as trigger_name,
      trg.tgtype,
      pg_get_triggerdef(trg.oid) as definition
    from pg_trigger trg
    join pg_class tg ON tg.oid = trg.tgrelid
    join pg_namespace n ON n.oid = tg.relnamespace
    where n.nspname = 'public'
      and NOT trg.tgisinternal
      and tg.relname = any(array['people','tenants','tenant_memberships','tenant_settings','roles','permissions','role_permissions','role_assignments'])
    order by tg.relname, trg.tgname;
  `;
  const tres = await client.query(tp);
  results.triggers = tres.rows;

  // 7. Views
  const vp = `
    select table_name, view_definition
    from information_schema.views
    where table_schema = 'public'
    order by table_name;
  `;
  const vres = await client.query(vp);
  results.views = vres.rows;

  // 8. Storage buckets
  const bp = `
    select name, public, file_size_limit, allowed_mime_types
    from storage.buckets
    order by name;
  `;
  const bres = await client.query(bp);
  results.buckets = bres.rows;

  // 9. All indexes
  const ip = `
    select
      i.relname as index_name,
      a.attname as column_name,
      ix.indisunique, ix.indisprimary
    from pg_index ix
    join pg_class c ON c.oid = ix.indrelid
    join pg_namespace n ON n.oid = c.relnamespace
    join pg_class i ON i.oid = ix.indexrelid
    left join pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(ix.indkey)
    where n.nspname = 'public'
      and c.relname = any(array['people','tenants','tenant_memberships','tenant_settings','roles','permissions','role_permissions','role_assignments'])
    order by c.relname, i.relname;
  `;
  const ires = await client.query(ip);
  results.indexes = ires.rows;

  // 10. Row counts for core tables
  const rcp = `
    select 'people' as tbl, count(*)::text as cnt from public.people
    union all select 'tenants', count(*)::text from public.tenants
    union all select 'tenant_memberships', count(*)::text from public.tenant_memberships
    union all select 'tenant_settings', count(*)::text from public.tenant_settings
    union all select 'roles', count(*)::text from public.roles
    union all select 'permissions', count(*)::text from public.permissions
    union all select 'role_permissions', count(*)::text from public.role_permissions
    union all select 'role_assignments', count(*)::text from public.role_assignments;
  `;
  const rcres = await client.query(rcp);
  results.rowCounts = rcres.rows;

  // 11. roles data (canonical roles)
  const rp = `select id, name, description, scope, created_at, updated_at from public.roles order by name;`;
  const rpres = await client.query(rp);
  results.rolesData = rpres.rows;

  // 12. Sample data from core tables
  const sp = `select * from public.people limit 3;`;
  const sres = await client.query(sp);
  results.peopleSample = sres.rows;

  const tmp = `select * from public.tenant_memberships limit 5;`;
  const mt = await client.query(tmp);
  results.tenantMembershipsSample = mt.rows;

  const trp = `select id, name, description, scope from public.roles limit 20;`;
  const rt = await client.query(trp);
  results.rolesSample = rt.rows;

  const rap = `select ra.*, r.name as role_name, p.full_name as person_name, t.name as tenant_name from public.role_assignments ra left join public.roles r on r.id = ra.role_id left join public.people p on p.id = ra.person_id left join public.tenants t on t.id = ra.tenant_id limit 10;`;
  const rat = await client.query(rap);
  results.roleAssignmentsSample = rat.rows;

  const pp2 = `select * from public.permissions limit 20;`;
  const pt = await client.query(pp2);
  results.permissionsSample = pt.rows;

  const rpp = `select rp.*, r.name as role_name, p.resource, p.action from public.role_permissions rp left join public.roles r on r.id = rp.role_id left join public.permissions p on p.id = rp.permission_id where r.name in ('candidate','admin_master','admin_tenant','manager','operator','recruiter') limit 30;`;
  const rpt = await client.query(rpp);
  results.rolePermissionsSample = rpt.rows;

  // 13. Function source code for key functions
  const sf = `
    select p.proname, pg_catalog.pg_get_functiondef(p.oid) as definition
    from pg_proc p
    join pg_namespace n ON n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('is_tenant_member','is_admin_master','user_has_permission','user_permissions','repair_candidate_chain','emit_domain_event','domain_event_emit','handle_new_auth_user','handle_auth_user_updated','handle_auth_user_deleted','bootstrap_candidate_identity','set_primary_media','media_for_entity','normalize_cnpj','normalize_cpf','is_valid_cnpj','is_valid_cpf','increment_job_views','increment_application_count','update_updated_at','user_tenant_ids')
    order by p.proname;
  `;
  const sfres = await client.query(sf);
  results.functionDefs = sfres.rows;

  // 14. All public tables list
  const tap = `
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name;
  `;
  const tapres = await client.query(tap);
  results.allTables = tapres.rows.map(r => r.table_name);

  // 15. Check if 'profiles' table exists
  const pp3 = `
    select table_name from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles';
  `;
  const pp3res = await client.query(pp3);
  results.profilesExists = pp3res.rows;

  // 16. Check if people has 'tenant_id' column
  const ptc = `
    select column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public' and table_name = 'people' and column_name = 'tenant_id';
  `;
  const ptres = await client.query(ptc);
  results.peopleTenantIdColumn = ptres.rows;

  // 17. Check auth.users columns
  const aup = `
    select column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'users'
    order by ordinal_position;
  `;
  const aupres = await client.query(aup);
  results.authUsersColumns = aupres.rows;

  fs.writeFileSync('supabase-real-schema-core.json', JSON.stringify(results, null, 2));
  console.log('Schema extraído e salvo em supabase-real-schema-core.json');
  console.log('Tabelas encontradas:', results.allTables.length);
  console.log('profiles existe:', results.profilesExists.length > 0);
  console.log('people.tenant_id existe:', results.peopleTenantIdColumn.length > 0);

  await client.end();
}

run().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
