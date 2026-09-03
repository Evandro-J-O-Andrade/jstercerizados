import { getSupabaseClient } from '@/lib/supabase';

export class SupabaseRepository {
  protected supabase: ReturnType<typeof getSupabaseClient> | null = null;

  constructor(supabase?: ReturnType<typeof getSupabaseClient>) {
    if (supabase === null) {
      this.supabase = null;
    } else if (supabase) {
      this.supabase = supabase;
    } else {
      this.supabase = getSupabaseClient();
    }
  }
}
