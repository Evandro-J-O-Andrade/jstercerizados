import { SupabaseRepository } from './supabase.repository';
import type { Tenant } from '@/types/domain/tenant';

export class TenantRepository extends SupabaseRepository {
  async findAll(_tenantId: string): Promise<Tenant[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, _tenantId: string): Promise<Tenant | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async create(
    input: {
      name: string;
      slug: string;
      document?: string | null;
      status?: string;
    },
    _tenantId: string,
  ): Promise<Tenant> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('tenants')
      .insert({
        name: input.name,
        slug: input.slug,
        document: input.document ?? null,
        status: input.status ?? 'active',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    input: {
      name?: string;
      slug?: string;
      document?: string | null;
      status?: string;
    },
    _tenantId: string,
  ): Promise<Tenant> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('tenants')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.document !== undefined && { document: input.document }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string, _tenantId: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase.from('tenants').delete().eq('id', id);

    if (error) throw error;
  }
}

export const tenantRepository = new TenantRepository();
