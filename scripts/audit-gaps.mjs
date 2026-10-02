import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  host: 'db.okxqfyoqbhcmflpurfrw.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  options: '-c default_transaction_read_only=on -c statement_timeout=30000',
});

// onde as 32 nao cobertas realmente pertencem
const DESTINO = {
  'administrative_approvals':'administrativo (sem dono no mapa)',
  'administrative_documents':'administrativo (sem dono no mapa)',
  'administrative_requests':'administrativo (sem dono no mapa)',
  'administrative_tasks':'administrativo (sem dono no mapa)',
  'ai_conversations':'platform/ai? ou modules/sistema/ai',
  'ai_messages':'platform/ai? ou modules/sistema/ai',
  'ai_usage':'platform/ai? ou modules/sistema/ai',
  'calendars':'platform/calendar',
  'meeting_rooms':'platform/calendar',
  'meeting_room_reservations':'platform/calendar',
  'event_participants':'platform/calendar',
  'email_messages':'platform/communication',
  'email_templates':'platform/communication',
  'report_definitions':'platform/reports',
  'report_executions':'platform/reports',
  'report_schedules':'platform/reports',
  'security_events':'platform/security',
  'password_policies':'platform/security',
  'legal_acceptances':'platform/security',
  'file_access_logs':'platform/security',
  'file_uploads':'platform/files',
  'first_login_state':'platform/auth',
  'providers':'platform/integrations',
  'provider_configs':'platform/integrations',
  'activity_logs':'platform/audit',
  'domain_events':'platform/events',
  'event_outbox':'platform/events',
  'notifications':'platform/notifications',
  'cost_centers':'modules/financeiro (existe cost_center.repository.ts)',
  'faqs':'modules/operacoes/support OU public',
  'feedback':'modules/empresas/feedback OU public',
  'stage_templates':'modules/rh/recruitment (citado no mapa)',
};

async function main() {
  const c = await pool.connect();
  try {
    // stage_templates: existe e pertence a RH?
    const st = await c.query(`
      SELECT c.relname AS tabela, c.relrowsecurity AS rls
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname='stage_templates'`);
    console.log('=== stage_templates ===');
    console.log(JSON.stringify(st.rows, null, 2));

    // administrative_* : tem FK para people/tenant? sao RH ou plataforma?
    const adm = await c.query(`
      SELECT c.relname AS tabela,
             (SELECT count(*)::int FROM pg_constraint co
               WHERE co.contype='f' AND co.conrelid=c.oid
                 AND co.confrelid='people'::regclass) AS fk_people,
             (SELECT count(*)::int FROM pg_constraint co
               WHERE co.contype='f' AND co.conrelid=c.oid) AS fk_total
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname LIKE 'administrative_%'
      ORDER BY c.relname`);
    console.log('\n=== administrative_* (FKs) ===');
    console.log(JSON.stringify(adm.rows, null, 2));

    // domain_events / event_outbox / activity_logs: plataforma?
    const ev = await c.query(`
      SELECT c.relname AS tabela, (SELECT count(*)::int FROM pg_trigger t
        WHERE t.tgrelid=c.oid AND NOT t.tgisinternal) AS triggers
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public'
        AND c.relname IN ('domain_events','event_outbox','activity_logs','audit_logs',
                          'security_events','notifications','cost_centers')
      ORDER BY c.relname`);
    console.log('\n=== eventos / auditoria / notif / custos ===');
    console.log(JSON.stringify(ev.rows, null, 2));

    // contabilidade: existe ALGUMA tabela accounting_* ou chart_*?
    const acc = await c.query(`
      SELECT c.relname AS tabela FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND (c.relname LIKE 'accounting%' OR c.relname LIKE 'chart%'
        OR c.relname LIKE 'ledger%' OR c.relname LIKE 'trial%') ORDER BY c.relname`);
    console.log('\n=== contabilidade: tabelas com accounting_/chart_/ledger_/trial_ ===');
    console.log(acc.rows.length ? JSON.stringify(acc.rows) : '  NENHUMA');

    // permissoes accounting sem tabela
    const pa = await c.query(`
      SELECT name FROM permissions WHERE resource='accounting' ORDER BY name`);
    console.log('\n=== permissoes accounting (6) ===');
    console.log(pa.rows.map((r) => '  ' + r.name).join('\n'));

    // permissoes finance: quais tem tabela correspondente?
    const pf = await c.query(`
      SELECT name FROM permissions WHERE resource='finance' ORDER BY name`);
    console.log('\n=== permissoes finance (17) ===');
    console.log(pf.rows.map((r) => '  ' + r.name).join('\n'));
  } finally {
    c.release();
  }
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });