import { config } from 'dotenv';
config({ path: '.env' });
import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const cands = await admin.auth.admin.listUsers({ perPage: 50 });
const out = cands.data?.users?.map((u) => ({ id: u.id, email: u.email, lastSignIn: u.last_sign_in_at, created: u.created_at })) ?? [];
console.log('Users:', out);
