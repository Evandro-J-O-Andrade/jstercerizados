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
  const { data, error } = await supabase
    .from('public_jobs_v1')
    .select('*')
    .order('published_at', { ascending: false });

  console.log('COUNT:', data?.length);
  console.log('ERROR:', error?.message);
  if (data && data.length > 0) {
    console.log('FIRST:', JSON.stringify({
      slug: data[0].slug,
      title: data[0].title,
      company_name: data[0].company_name,
      salary_text: data[0].salary_text,
      salary_min: data[0].salary_min,
      salary_max: data[0].salary_max,
      salary_type: data[0].salary_type,
      contract_type: data[0].contract_type,
      work_mode: data[0].work_mode,
      location: data[0].location,
      city: data[0].city,
      state: data[0].state,
      published_at: data[0].published_at,
      expires_at: data[0].expires_at,
      benefits: data[0].benefits,
      requirements: data[0].requirements,
      responsibilities: data[0].responsibilities,
      description: data[0].description,
      seniority: data[0].seniority,
      work_hours: data[0].work_hours,
      area: data[0].area,
      work_schedule: data[0].work_schedule,
      metadata: data[0].metadata,
      views_count: data[0].views_count,
      tenant_id: data[0].tenant_id,
    }, null, 2));
  }
})();