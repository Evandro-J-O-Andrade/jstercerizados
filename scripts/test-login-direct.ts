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

// First: verify user details
async function verifyUser() {
  return new Promise<void>((resolve) => {
    const options = {
      hostname: 'okxqfyoqbhcmflpurfrw.supabase.co',
      path: '/auth/v1/admin/users/a78ddef1-5659-404f-9c7c-940c5df0abf1',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: SECRET_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const user = JSON.parse(body);
        console.log('User verified:');
        console.log('  email:', user.email);
        console.log('  confirmed_at:', user.email_confirmed_at);
        console.log('  updated_at:', user.updated_at);
        resolve();
      });
    });
    req.on('error', (e) => {
      console.error('Failed:', e.message);
      resolve();
    });
    req.end();
  });
}

// Then: login test
async function testLogin() {
  return new Promise<void>((resolve) => {
    const data = JSON.stringify({
      email: 'evandro_j.o.a@hotmail.com',
      password: 'JsEmpregos_2026!',
    });

    const options = {
      hostname: 'okxqfyoqbhcmflpurfrw.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        apikey: 'sb_publishable_8BqjHyGkcIvLYeOjKg4q8g_WT8l3xqE',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const result = JSON.parse(body);
        if (res.statusCode === 200) {
          console.log('\n✅ Login OK');
          console.log('User:', result.user?.email);
          console.log('Session present:', !!result.session);
          console.log(
            'Access token:',
            result.session?.access_token?.substring(0, 30) + '...',
          );
          console.log('Full result keys:', Object.keys(result));
        } else {
          console.error('\n❌ Login failed:', res.statusCode);
          console.error('Error:', result.msg || result.message || body);
        }
        resolve();
      });
    });
    req.on('error', (e) => {
      console.error('Failed:', e.message);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

async function main() {
  await verifyUser();
  await testLogin();
}
main();
