import { config } from 'dotenv';
config({ path: '.env' });
import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const email = process.argv[2] || 'evandro_j.o.a@hotmail.com';
const newPwd = process.argv[3] || 'Auditoria@2026';
const { data: list } = await admin.auth.admin.listUsers({ perPage: 100 });
const user = list?.users?.find((u) => u.email === email);
if (!user) { console.error('NOT FOUND:', email); process.exit(1); }
const { error } = await admin.auth.admin.updateUserById(user.id, { password: newPwd });
if (error) { console.error('FAIL:', error.message); process.exit(1); }
console.log('OK — password updated for', email, '->', newPwd, 'user_id:', user.id);
