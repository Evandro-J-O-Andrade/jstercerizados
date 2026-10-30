import { SupabaseRepository } from './supabase.repository';
import type { RoleAssignment } from '@/types/auth';

export interface RoleAssignmentCreateInput {
  person_id: string;
  role_id: string;
  tenant_id?: string | null;
  assigned_by?: string | null;
  expires_at?: string | null;
}

export interface RoleAssignmentUpdateInput {
  role_id?: string;
  tenant_id?: string | null;
  expires_at?: string | null;
}

export class RoleAssignmentRepository extends SupabaseRepository {
  async findByPerson(personId: string): Promise<RoleAssignment[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('role_assignments')
      .select('*')
      .eq('person_id', personId)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    return (data || []) as RoleAssignment[];
  }

  async findAll(_tenantId?: string): Promise<RoleAssignment[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('role_assignments')
      .select('*')
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    return (data || []) as RoleAssignment[];
  }

  async assign(input: RoleAssignmentCreateInput): Promise<RoleAssignment> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('role_assignments')
      .insert({
        person_id: input.person_id,
        role_id: input.role_id,
        tenant_id: input.tenant_id ?? null,
        assigned_by: input.assigned_by ?? null,
        expires_at: input.expires_at ?? null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as RoleAssignment;
  }

  async remove(personId: string, roleId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('role_assignments')
      .delete()
      .eq('person_id', personId)
      .eq('role_id', roleId);

    if (error) throw error;
  }

  async removeById(id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('role_assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async update(
    id: string,
    input: RoleAssignmentUpdateInput,
  ): Promise<RoleAssignment> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('role_assignments')
      .update({
        ...(input.role_id !== undefined && { role_id: input.role_id }),
        ...(input.tenant_id !== undefined && { tenant_id: input.tenant_id }),
        ...(input.expires_at !== undefined && { expires_at: input.expires_at }),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as RoleAssignment;
  }
}

export const roleAssignmentRepository = new RoleAssignmentRepository();
