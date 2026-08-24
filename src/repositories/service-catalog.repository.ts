import { SupabaseRepository } from './supabase.repository';
import type { Service } from '@/types/domain/recruitment';

export class ServiceCatalogRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Service[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Service | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async findBySlug(slug: string, tenantId: string): Promise<Service | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const serviceCatalogRepository = new ServiceCatalogRepository();
