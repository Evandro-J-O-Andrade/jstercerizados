const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const probes = [
    { table: 'people', sample: 'SELECT * FROM people LIMIT 1' },
    { table: 'tenants', sample: 'SELECT * FROM tenants LIMIT 1' },
    { table: 'tenant_memberships', sample: 'SELECT * FROM tenant_memberships LIMIT 1' },
    { table: 'roles', sample: 'SELECT * FROM roles LIMIT 1' },
    { table: 'role_assignments', sample: 'SELECT * FROM role_assignments LIMIT 1' },
    { table: 'role_permissions', sample: 'SELECT * FROM role_permissions LIMIT 1' },
    { table: 'permissions', sample: 'SELECT * FROM permissions LIMIT 1' },
    { table: 'first_login_state', sample: 'SELECT * FROM first_login_state LIMIT 1' },
    { table: 'legal_acceptances', sample: 'SELECT * FROM legal_acceptances LIMIT 1' },
    { table: 'companies', sample: 'SELECT * FROM companies LIMIT 1' },
    { table: 'products', sample: 'SELECT * FROM products LIMIT 1' },
    { table: 'stock_movements', sample: 'SELECT * FROM stock_movements LIMIT 1' },
    { table: 'purchase_orders', sample: 'SELECT * FROM purchase_orders LIMIT 1' },
    { table: 'purchase_receipts', sample: 'SELECT * FROM purchase_receipts LIMIT 1' },
    { table: 'service_orders', sample: 'SELECT * FROM service_orders LIMIT 1' },
    { table: 'contracts', sample: 'SELECT * FROM contracts LIMIT 1' },
    { table: 'tasks', sample: 'SELECT * FROM tasks LIMIT 1' },
    { table: 'support_tickets', sample: 'SELECT * FROM support_tickets LIMIT 1' },
    { table: 'notifications', sample: 'SELECT * FROM notifications LIMIT 1' },
    { table: 'files', sample: 'SELECT * FROM files LIMIT 1' },
    { table: 'audit_logs', sample: 'SELECT * FROM audit_logs LIMIT 1' },
    { table: 'security_events', sample: 'SELECT * FROM security_events LIMIT 1' },
    { table: 'jobs', sample: 'SELECT * FROM jobs LIMIT 1' },
    { table: 'candidates', sample: 'SELECT * FROM candidates LIMIT 1' },
    { table: 'applications', sample: 'SELECT * FROM applications LIMIT 1' },
    { table: 'recruitment_demands', sample: 'SELECT * FROM recruitment_demands LIMIT 1' },
    { table: 'domain_events', sample: 'SELECT * FROM domain_events LIMIT 1' },
    { table: 'sessions', sample: 'SELECT * FROM sessions LIMIT 1' },
  ];

  const schema = {};
  for (const probe of probes) {
    const { data, error } = await supabase.from(probe.table).select('*').limit(1);
    const sample = data && data.length > 0 ? data[0] : null;
    const columns = sample ? Object.keys(sample) : [];
    schema[probe.table] = {
      exists: !error,
      error: error ? error.message : null,
      sample,
      columns,
    };
  }

  const outPath = path.join(process.cwd(), 'docs', 'SUPABASE-REAL-SCHEMA-INVENTORY.json');
  fs.writeFileSync(outPath, JSON.stringify(schema, null, 2));
  console.log('Schema inspection written to', outPath);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
