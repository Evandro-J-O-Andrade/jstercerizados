import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

export type ReportDefinition =
  Database['public']['Tables']['report_definitions']['Row'];

export class ReportsRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<ReportDefinition[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('report_definitions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<ReportDefinition | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('report_definitions')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const reportsRepository = new ReportsRepository();
