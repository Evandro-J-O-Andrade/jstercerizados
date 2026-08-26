import { SupabaseRepository } from './supabase.repository';
import type { Permission } from '@/types/domain/permission';

export class PermissionRepository extends SupabaseRepository {
  async findAll(_tenantId: string): Promise<Permission[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, _tenantId: string): Promise<Permission | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('permissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async findByResource(
    resource: string,
    _tenantId: string,
  ): Promise<Permission[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('permissions')
      .select('*')
      .eq('resource', resource)
      .order('action', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const permissionRepository = new PermissionRepository();
