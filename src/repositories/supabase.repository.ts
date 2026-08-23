import { getSupabaseClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseRepository {
  protected client: SupabaseClient | null = null;

  protected getClient(): SupabaseClient {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not initialized');
    }
    return client;
  }
}
