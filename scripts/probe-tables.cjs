const baseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
const headers = {
  'apikey': apiKey,
  'Authorization': `Bearer ${apiKey}`,
  'Accept': 'application/json',
};

async function probeTable(table) {
  const url = `${baseUrl}/rest/v1/${table}?select=*&limit=0`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    return { table, exists: false, error: await res.text() };
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { table, exists: true, data };
}

async function main() {
  const candidates = [
    'people',
    'tenants',
    'tenant_memberships',
    'roles',
    'role_assignments',
    'role_permissions',
    'permissions',
    'first_login_state',
    'legal_acceptances',
    'companies',
    'products',
    'stock_movements',
    'purchase_orders',
    'purchase_receipts',
    'service_orders',
    'contracts',
    'tasks',
    'support_tickets',
    'chat',
    'notifications',
    'files',
    'documents',
    'audit_logs',
    'security_events',
    'lgpd',
    'reports',
    'jobs',
    'candidates',
    'applications',
    'talent_pool',
    'recruitment_demands',
    'ai',
    'automations',
    'billing',
    'integrations',
    'finance',
    'fiscal',
    'accounting',
    'domain_events',
    'tenant',
    'users',
    'profiles',
    'sessions',
    'auth.users',
  ];

  const results = [];
  for (const table of candidates) {
    const result = await probeTable(table);
    results.push(result);
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
