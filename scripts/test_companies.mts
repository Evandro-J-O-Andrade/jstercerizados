import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  const contents = readFileSync('.env', 'utf-8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
console.log('URL:', url ? 'PRESENTE' : 'AUSENTE');
console.log('KEY:', key ? 'PRESENTE' : 'AUSENTE');
if (!url || !key) process.exit(1);

const supabase = createClient(url, key);
(async () => {
  // Test public_companies_by_type
  const { data, error, count } = await supabase
    .from('public_companies_by_type')
    .select('*', { count: 'exact' })
    .limit(5);

  console.log('\n=== public_companies_by_type ===');
  console.log('COUNT:', count);
  console.log('ERROR:', error?.message);
  if (data && data.length > 0) {
    console.log('FIRST:', JSON.stringify(data[0], null, 2));
  }

  // Test companies table (public read)
  const { data: companiesData, error: companiesError, count: companiesCount } = await supabase
    .from('companies')
    .select('id, name, trading_name, logo_url, website, industry, status', { count: 'exact' })
    .eq('status', 'active')
    .limit(5);

  console.log('\n=== companies (active) ===');
  console.log('COUNT:', companiesCount);
  console.log('ERROR:', companiesError?.message);
  if (companiesData && companiesData.length > 0) {
    console.log('FIRST:', JSON.stringify(companiesData[0], null, 2));
  }
})();