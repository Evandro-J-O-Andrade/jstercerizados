import { SupabaseRepository } from './supabase.repository';
import type { Person } from '@/types/domain/person';

export class UsersRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Person[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('people')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Person | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }
}

export const usersRepository = new UsersRepository();
