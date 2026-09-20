const SUPABASE_URL = 'https://okxpfyoqbhcmflpurfrw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reHFmeW9xYmhjbWZscHVyZnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MTQ4NzEsImV4cCI6MjEwMjQ5MDg3MX0.CXlB3b9YKkENWn8FMsmrOnz2A8ADNIHYkk8eRncZ1cU';

console.log('=== Quick DB State Check ===');

// Check company_representative role
const r = await fetch(`${SUPABASE_URL}/rest/v1/roles?name=eq.company_representative&select=name`, {
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
});
const roles = await r.json();
console.log('1. company_representative role:',
  r.ok && roles?.length > 0 ? 'EXISTS' :
  r.ok ? 'MISSING (table empty)' :
  `ERROR ${r.status}: ${JSON.stringify(roles).substring(0,200)}`
);

// Check signup_origin values in first_login_state
const r2 = await fetch(`${SUPABASE_URL}/rest/v1/first_login_state?select=signup_origin`, {
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
});
const fls = await r2.json();
if (r2.ok && Array.isArray(fls)) {
  const origins = [...new Set(fls.map(f => f.signup_origin || 'null'))];
  console.log('2. first_login_state signup_origin values:', origins);
} else {
  console.log('2. first_login_state query:', r2.status, JSON.stringify(fls).substring(0,200));
}

process.exit(0);
