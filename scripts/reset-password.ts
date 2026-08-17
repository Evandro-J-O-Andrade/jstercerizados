import https from 'https';
import fs from 'fs';

const env: Record<string, string> = {};
fs.readFileSync('.env.local', 'utf8')
  .split('\n')
  .forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  });

const SECRET_KEY = env.SUPABASE_SECRET_KEY;
const data = JSON.stringify({ password: 'JsEmpregos_2026!' });

const options = {
  hostname: 'okxqfyoqbhcmflpurfrw.supabase.co',
  path: '/auth/v1/admin/users/a78ddef1-5659-404f-9c7c-940c5df0abf1',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    apikey: SECRET_KEY,
  },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Password reset successful');
      console.log('User ID:', 'a78ddef1-5659-404f-9c7c-940c5df0abf1');
    } else {
      console.error('❌ Reset failed:', res.statusCode, body);
    }
  });
});

req.on('error', (e) => console.error('Failed:', e.message));
req.write(data);
req.end();
