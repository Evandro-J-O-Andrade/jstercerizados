import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

export type TenantSetting =
  Database['public']['Tables']['tenant_settings']['Row'];

export class SettingsRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<TenantSetting[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('tenant_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<TenantSetting | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('tenant_settings')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const settingsRepository = new SettingsRepository();
