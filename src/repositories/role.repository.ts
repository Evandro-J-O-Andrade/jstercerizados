import { SupabaseRepository } from './supabase.repository';
import type { Role } from '@/types/domain/role';
import type { RoleCreateInput, RoleUpdateInput } from '@/types/domain/role';

export class RoleRepository extends SupabaseRepository {
  async findAll(_tenantId: string): Promise<Role[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, _tenantId: string): Promise<Role | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async create(input: RoleCreateInput, _tenantId: string): Promise<Role> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('roles')
      .insert({
        name: input.name,
        description: input.description ?? null,
        scope: input.scope,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    input: RoleUpdateInput,
    _tenantId: string,
  ): Promise<Role> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('roles')
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.scope !== undefined && { scope: input.scope }),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string, _tenantId: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase.from('roles').delete().eq('id', id);

    if (error) throw error;
  }
}

export const roleRepository = new RoleRepository();
