import { getSupabaseClient } from '@/lib/supabase';

export class SupabaseRepository {
  protected supabase = getSupabaseClient();
}
