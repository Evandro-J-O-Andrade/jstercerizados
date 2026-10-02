import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'db.okxqfyoqbhcmflpurfrw.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  options: '-c default_transaction_read_only=on -c statement_timeout=30000',
});

async function q(sql, label) {
  try {
    const client = await pool.connect();
    const res = await client.query(sql);
    client.release();
    console.log(`\n=== ${label} ===`);
    console.log(JSON.stringify(res.rows, null, 2));
    return res.rows;
  } catch (e) {
    console.log(`\n=== ${label} ===`);
    console.log(`ERRO: ${e.message}`);
    return [];
  }
}

async function main() {
  await q('SHOW transaction_read_only', '0. MODO READ-ONLY');

  // 1. role_permissions por role (TODAS as roles)
  await q(
    `SELECT r.name, r.scope, r.level, r.sector, r.status,
            r.replacement_role_id IS NOT NULL AS has_replacement,
            COUNT(rp.id)::int AS permission_count
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     GROUP BY r.id
     ORDER BY permission_count ASC, r.name`,
    '1. ROLE_PERMISSIONS POR ROLE (ordenado por menor)'
  );

  // 2. Totais
  await q(
    `SELECT (SELECT COUNT(*) FROM roles)::int AS roles,
            (SELECT COUNT(*) FROM permissions)::int AS permissions,
            (SELECT COUNT(*) FROM role_permissions)::int AS role_permissions,
            (SELECT COUNT(*) FROM role_assignments)::int AS role_assignments,
            (SELECT COUNT(*) FROM people)::int AS people,
            (SELECT COUNT(*) FROM tenant_memberships)::int AS memberships,
            (SELECT COUNT(*) FROM tenants)::int AS tenants,
            (SELECT COUNT(*) FROM auth.users)::int AS auth_users`,
    '2. TOTAIS'
  );

  // 3. Cadeia completa dos usuarios @jsempregos.com.br (sem credenciais)
  await q(
    `SELECT au.email,
            au.created_at           AS auth_created,
            au.email_confirmed_at,
            au.last_sign_in_at      AS ultimo_login,
            au.banned_until,
            p.full_name,
            p.status                AS person_status,
            t.name                  AS tenant,
            r.name                  AS role,
            r.status                AS role_status,
            (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id)::int AS role_perms,
            fls.must_change_password,
            fls.first_login_completed
     FROM auth.users au
     LEFT JOIN people p              ON p.auth_user_id = au.id
     LEFT JOIN tenant_memberships tm  ON tm.person_id = p.id
     LEFT JOIN tenants t              ON t.id = tm.tenant_id
     LEFT JOIN role_assignments ra    ON ra.person_id = p.id
     LEFT JOIN roles r                ON r.id = ra.role_id
     LEFT JOIN first_login_state fls  ON fls.person_id = p.id
     WHERE au.email LIKE '%@jsempregos.com.br'
     ORDER BY au.email`,
    '3. CADEIA @jsempregos.com.br'
  );

  // 4. Metadados das contas teste.* (sem credenciais)
  await q(
    `SELECT au.email,
            au.created_at           AS auth_created,
            au.email_confirmed_at,
            au.last_sign_in_at      AS ultimo_login,
            au.banned_until,
            p.full_name,
            p.status                AS person_status,
            t.name                  AS tenant,
            r.name                  AS role,
            fls.must_change_password,
            fls.first_login_completed
     FROM auth.users au
     LEFT JOIN people p              ON p.auth_user_id = au.id
     LEFT JOIN tenant_memberships tm  ON tm.person_id = p.id
     LEFT JOIN tenants t              ON t.id = tm.tenant_id
     LEFT JOIN role_assignments ra    ON ra.person_id = p.id
     LEFT JOIN roles r                ON r.id = ra.role_id
     LEFT JOIN first_login_state fls  ON fls.person_id = p.id
     WHERE au.email LIKE 'teste.%@jsempregos.com.br'
     ORDER BY au.email`,
    '4. CONTAS teste.* (metadados)'
  );

  // 5. PRE-CONDICAO 1: handle_new_auth_user
  await q(
    `SELECT tgname, tgenabled, pg_get_triggerdef(tg.oid) AS def
     FROM pg_trigger
     WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal`,
    '5.1 TRIGGERS EM auth.users (handle_new_auth_user)'
  );

  await q(
    `SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args,
            l.lanname AS language
     FROM pg_proc p JOIN pg_language l ON l.oid = p.prolang
     WHERE p.proname ILIKE '%new_auth_user%' OR p.proname ILIKE '%handle_new%'`,
    '5.2 FUNCOES handle_new_auth_user'
  );

  // 5.3. PRE-CONDICAO 2: first_login_state
  await q(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name='first_login_state'
     ORDER BY ordinal_position`,
    '5.3 first_login_state COLUNAS'
  );

  await q(
    `SELECT conname, contype, pg_get_constraintdef(oid) AS def
     FROM pg_constraint WHERE conrelid = 'public.first_login_state'::regclass`,
    '5.4 first_login_state CONSTRAINTS'
  );

  await q(
    `SELECT COUNT(*)::int AS first_login_state_rows FROM first_login_state`,
    '5.5 first_login_state LINHAS'
  );

  // 5.6. PRE-CONDICAO 3/4/5: uniques
  await q(
    `SELECT tc.table_name, tc.constraint_name, tc.constraint_type,
            string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS cols
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
     WHERE tc.table_schema='public'
       AND tc.table_name IN ('people','tenant_memberships','role_assignments','first_login_state')
       AND tc.constraint_type IN ('UNIQUE','PRIMARY KEY')
     GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
     ORDER BY tc.table_name, tc.constraint_type`,
    '5.6 UNIQUE / PK (constraints)'
  );

  await q(
    `SELECT tablename, indexname, indexdef
     FROM pg_indexes
     WHERE schemaname='public'
       AND tablename IN ('people','tenant_memberships','role_assignments','first_login_state')
       AND (indexdef ILIKE '%UNIQUE%')
     ORDER BY tablename, indexname`,
    '5.7 UNIQUE (indices, inclui parciais)'
  );

  // 5.8. triggers de bootstrap automatico
  await q(
    `SELECT tgname, tgrelid::regclass::text AS tabela, tgenabled, pg_get_triggerdef(tg.oid) AS def
     FROM pg_trigger
     WHERE NOT tgisinternal
       AND tgrelid::regclass::text IN ('people','tenant_memberships','role_assignments','candidates')
     ORDER BY tgrelid::regclass::text, tgname`,
    '5.8 TRIGGERS bootstrap em people/membership/role_assignments/candidates'
  );

  await pool.end();
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });
