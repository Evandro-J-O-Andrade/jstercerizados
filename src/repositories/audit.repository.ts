import { SupabaseRepository } from './supabase.repository';
import type { AuditLog } from '@/types/domain/security';

export class AuditLogRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<AuditLog[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<AuditLog | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const auditLogRepository = new AuditLogRepository();
