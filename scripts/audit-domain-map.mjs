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

async function main() {
  const c = await pool.connect();
  try {
    const ro = await c.query('SHOW transaction_read_only');
    console.log('MODO transaction_read_only =', ro.rows[0].transaction_read_only);

    const exists = async (name) => {
      const r = await c.query(
        `SELECT n.nspname AS schema, c.relname AS name, c.relkind
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relname = $1 AND n.nspname NOT IN ('pg_catalog','information_schema')`,
        [name]
      );
      return r.rows;
    };

    const afirmarNao = [
      'warehouse_entries', 'warehouse_issues', 'warehouse_returns', 'warehouse_custodies',
      'bank_accounts', 'accounting_entries', 'chart_of_accounts', 'cash_flows', 'epis',
      'candidate_preferences', 'support_faqs', 'curriculos',
    ];

    const afirmarSim = [
      'candidates','candidate_courses','candidate_documents','candidate_education',
      'candidate_experiences','candidate_languages','candidate_skills','candidate_processes',
      'candidate_profile_views','favorite_jobs','candidate_job_alerts',
      'recruitment_demands','recruitment_processes','recruitment_stages','stage_templates',
      'applications','application_status_history','application_profile_snapshots','job_matches',
      'jobs','job_skills','skills',
      'interviews','interview_participants','interview_feedback','interview_followups',
      'employees','employee_positions','employee_contracts','employee_documents',
      'employee_status_history','positions','departments','talent_pool_memberships',
      'companies','company_contacts','company_locations','company_relationship_types',
      'company_relationships','company_services','company_social_links',
      'customers','leads','interactions','customer_feedback','customer_ratings','contracts',
      'services','service_orders','service_order_items','service_order_status_history',
      'service_executions','service_occurrences','service_acceptances','service_attachments','service_sla',
      'work_orders','work_order_assignments','work_order_acceptances','work_order_attachments',
      'work_order_checklists','work_order_materials','work_order_occurrences',
      'tasks','task_attachments','task_comments','task_status_history',
      'support_tickets','support_ticket_assignments','support_ticket_categories',
      'support_ticket_messages','support_ticket_status_history',
      'products','product_categories','warehouses','warehouse_locations',
      'stock_balances','stock_entries','stock_inventory','stock_inventory_items','stock_lots','stock_movements',
      'purchase_requests','purchase_request_items','purchase_quotations','purchase_quotation_items',
      'purchase_orders','purchase_order_items','purchase_receipts','purchase_receipt_items',
      'purchase_receipt_divergences','purchase_status_history','suppliers',
      'material_issues','material_issue_items','material_returns','material_return_items',
      'epi_deliveries','epi_delivery_items','epi_returns','epi_return_items',
      'third_party_custody','third_party_custody_items',
      'accounts_receivable','accounts_payable','payments','receipts',
      'financial_accounts','financial_categories','financial_installments',
      'financial_installment_payments','financial_installment_cancellations',
      'financial_transactions','bank_reconciliations','invoices','invoice_items',
      'fiscal_configurations','fiscal_documents','fiscal_document_items','fiscal_document_events',
      'fiscal_document_status_history','fiscal_integrations','fiscal_api_requests',
      'fiscal_api_responses','tax_calculations','tax_rates',
      'quotes','quote_items','sales','sale_items',
      'pos_terminals','pos_cashiers','pos_cashier_sessions','pos_operators','pos_sales',
      'pos_sale_items','pos_payments','pos_returns','pos_cancellations',
      'pos_cash_movements','pos_daily_closures',
      'contract_status_history',
      'blog_categories','blog_posts','page_templates','global_navigation_links',
      'footer_configs','media_assets',
      'people','tenants','tenant_memberships','roles','permissions',
      'role_permissions','role_assignments','dashboard_widgets','dashboard_layouts',
    ];

    const contrario = [];
    for (const t of afirmarNao) {
      const r = await exists(t);
      if (r.length) contrario.push(`${t} -> EXISTE (${r[0].schema}, relkind=${r[0].relkind})`);
    }
    console.log('\n=== A. AFIRMADAS COMO INEXISTENTES ===');
    console.log(contrario.length
      ? contrario.map((e) => '  !! CONTRARIA: ' + e).join('\n')
      : '  Todas confirmadas inexistentes.');

    const ok = [];
    const faltam = [];
    for (const t of [...new Set(afirmarSim)]) {
      const r = await exists(t);
      if (r.length) ok.push(t); else faltam.push(t);
    }
    console.log(`\n=== B. AFIRMADAS COMO EXISTENTES ===`);
    console.log(`  confirmadas: ${ok.length} / ${[...new Set(afirmarSim)].length}`);
    if (faltam.length) console.log('  NAO encontradas:\n' + faltam.map((t) => '    - ' + t).join('\n'));

    // contagens gerais
    const gen = await c.query(`
      SELECT
        (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE n.nspname='public' AND c.relkind='r') AS tabelas,
        (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE n.nspname='public' AND c.relkind='v') AS views,
        (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity) AS tabelas_rls,
        (SELECT count(*)::int FROM pg_policies WHERE schemaname='public') AS policies,
        (SELECT count(*)::int FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
          JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE NOT t.tgisinternal AND n.nspname='public') AS triggers_public,
        (SELECT count(*)::int FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
          WHERE n.nspname='public') AS funcoes
    `);
    console.log('\n=== C. CONTAGENS ===');
    console.log(JSON.stringify(gen.rows[0], null, 2));

    // people FK
    const fk = await c.query(`
      SELECT count(*)::int AS fks_para_people
      FROM pg_constraint co
      JOIN pg_class c ON c.oid = co.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE co.contype='f' AND n.nspname='public'
        AND co.confrelid = 'people'::regclass
    `);
    console.log('\n=== D. people ===');
    console.log(JSON.stringify(fk.rows[0], null, 2));

    // permissoes contabilidade/fiscal/financeiro
    const perm = await c.query(`
      SELECT resource, count(*)::int AS acoes
      FROM permissions
      WHERE resource IN ('accounting','finance','fiscal','bank','cash')
      GROUP BY resource ORDER BY resource
    `);
    console.log('\n=== E. PERMISSOES por recurso ===');
    console.log(JSON.stringify(perm.rows, null, 2));
  } finally {
    c.release();
  }
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });