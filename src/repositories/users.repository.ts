import { SupabaseRepository } from './supabase.repository';
import type { Person } from '@/types/domain/person';

export interface UserCreateInput {
  full_name: string;
  email: string;
  phone?: string | null;
  document?: string | null;
  city?: string | null;
  state?: string | null;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
  phone?: string | null;
  document?: string | null;
  city?: string | null;
  state?: string | null;
  status?: 'active' | 'inactive' | 'pending';
}

export class UsersRepository extends SupabaseRepository {
  async findAll(_tenantId: string): Promise<Person[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, _tenantId: string): Promise<Person | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async create(input: UserCreateInput): Promise<Person> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('people')
      .insert({
        full_name: input.full_name,
        email: input.email,
        phone: input.phone ?? null,
        document: input.document ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        status: input.status ?? 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Person;
  }

  async update(id: string, input: UserUpdateInput): Promise<Person> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('people')
      .update({
        full_name: input.full_name,
        email: input.email,
        phone: input.phone ?? null,
        document: input.document ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        status: input.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Person;
  }

  async remove(id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase.from('people').delete().eq('id', id);

    if (error) throw error;
  }

  async toggleStatus(
    id: string,
    status: 'active' | 'inactive',
  ): Promise<Person> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('people')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Person;
  }
}

export const usersRepository = new UsersRepository();
