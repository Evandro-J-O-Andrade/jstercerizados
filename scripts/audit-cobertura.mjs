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

// Domínios do mapa proposto -> prefixos/padrões de tabela
const DOMINIOS = {
  'rh': ['candidates','candidate_','favorite_jobs','recruitment_','applications','application_','job_matches','jobs','job_skills','skills','interviews','interview_','employees','employee_','positions','departments','talent_pool'],
  'empresas': ['companies','company_','customers','leads','interactions','customer_feedback','customer_ratings'],
  'operacoes': ['services','service_','work_orders','work_order_','tasks','task_','support_tickets','support_ticket_'],
  'suprimentos': ['products','product_categories','warehouses','warehouse_','stock_','purchase_','suppliers','material_','epi_','third_party_custody'],
  'vendas': ['quotes','quote_items','sales','sale_items'],
  'financeiro': ['accounts_receivable','accounts_payable','payments','receipts','financial_','bank_reconciliations','invoices','invoice_items'],
  'fiscal': ['fiscal_','tax_'],
  'pos': ['pos_'],
  'contratos': ['contracts','contract_status_history'],
  'platform (espinha)': ['people','tenants','tenant_memberships','roles','permissions','role_permissions','role_assignments','sessions','audit','notification_','files','document_','events','integration_','automation_','dashboard_','media_assets','consent','privacy_','data_','files','calendar_','chat_','event_deliveries','webhook_deliveries','page_templates','global_navigation_links','footer_configs','validation_results','tenant_settings','third_party_custody'],
  'public (site)': ['blog_','page_templates','global_navigation_links','footer_configs','media_assets'],
};

async function main() {
  const c = await pool.connect();
  try {
    const t = await c.query(`
      SELECT c.relname AS tabela
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r'
      ORDER BY c.relname
    `);
    const todas = t.rows.map((r) => r.tabela);
    console.log(`TOTAL tabelas public = ${todas.length}\n`);

    const cobertas = new Set();
    const porDominio = {};
    for (const [dom, pads] of Object.entries(DOMINIOS)) {
      porDominio[dom] = [];
      for (const tab of todas) {
        if (pads.some((p) => tab === p || tab.startsWith(p))) {
          cobertas.add(tab);
          porDominio[dom].push(tab);
        }
      }
    }
    const naoCobertas = todas.filter((t2) => !cobertas.has(t2));

    console.log('=== COBERTURA POR DOMINIO ===');
    for (const [dom, tabs] of Object.entries(porDominio)) {
      console.log(`  ${dom.padEnd(24)} ${String(new Set(tabs).size).padStart(4)} tabelas`);
    }

    console.log(`\n=== NAO COBERTAS PELO MAPA PROPOSTO: ${naoCobertas.length} ===`);
    naoCobertas.forEach((t2) => console.log('  - ' + t2));
  } finally {
    c.release();
  }
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });