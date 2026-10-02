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
  const client = await pool.connect();
  const res = await client.query(sql).catch((e) => ({ rows: [{ ERRO: e.message }] }));
  client.release();
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(res.rows));
}

async function main() {
  await q(
    `SELECT r.name, r.status,
            COALESCE(COUNT(rp.id),0)::int AS perms
     FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id
     GROUP BY r.id
     HAVING COALESCE(COUNT(rp.id),0) > 0
     ORDER BY perms DESC, r.name`,
    'A. ROLES COM >0 PERMISSOES'
  );

  await q(
    `SELECT r.name, r.status
     FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id
     GROUP BY r.id
     HAVING COALESCE(COUNT(rp.id),0) = 0
     ORDER BY r.name`,
    'B. ROLES COM 0 PERMISSOES'
  );

  await q(
    `SELECT count(*)::int AS roles_total,
            count(*) FILTER (WHERE p.c = 0)::int AS roles_zero,
            count(*) FILTER (WHERE p.c > 0)::int AS roles_com_perm
     FROM (
       SELECT r.id, COUNT(rp.id) AS c
       FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id
       GROUP BY r.id
     ) p`,
    'C. RESUMO'
  );

  await q(
    `SELECT t.tgname, t.tgenabled, pg_get_triggerdef(t.oid) AS def
     FROM pg_trigger t
     WHERE t.tgrelid = 'auth.users'::regclass AND NOT t.tgisinternal`,
    'D. TRIGGERS EM auth.users'
  );

  await q(
    `SELECT t.tgname, t.tgrelid::regclass::text AS tabela, t.tgenabled,
            pg_get_triggerdef(t.oid) AS def
     FROM pg_trigger t
     WHERE NOT t.tgisinternal
       AND t.tgrelid::regclass::text IN
           ('people','tenant_memberships','role_assignments','candidates')
     ORDER BY 2, 1`,
    'E. TRIGGERS bootstrap'
  );

  await q(
    `SELECT column_name, is_nullable
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name='people'
       AND column_name IN ('email','auth_user_id','cpf','full_name')`,
    'F. people COLUNAS-CHAVE'
  );

  await q(
    `SELECT
       (SELECT count(*) FROM people WHERE email IS NULL)::int AS people_email_null,
       (SELECT count(*) FROM people p2 WHERE p2.email IS NOT NULL
          AND (SELECT count(*) FROM people p3 WHERE lower(p3.email)=lower(p2.email)) > 1)::int AS emails_duplicados,
       (SELECT count(*) FROM people p WHERE NOT EXISTS
          (SELECT 1 FROM auth.users u WHERE u.id = p.auth_user_id)
          AND p.email LIKE '%@jsempregos.com.br')::int as js_pessoas_sem_auth`,
    'G. people.email DADOS'
  );

  await q(
    `SELECT r.name AS role, COUNT(rp.id)::int AS perms,
            string_agg(DISTINCT p.resource, ', ' ORDER BY p.resource) AS resources
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE r.name IN ('tenant_admin','finance_manager','rh','support_manager','support_agent',
                      'accountant','lawyer','commercial','recruiter','rh_manager','rh_assistant')
     GROUP BY r.id
     ORDER BY perms DESC`,
    'H. PERMISSOES DAS ROLES DA MATRIZ'
  );

  await q('select 1', 'FIM');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });
