/**
 * Repositório administrativo de pessoas — ROOT global.
 *
 * Operações de leitura e escrita sobre a tabela `people` para a
 * Central de Cadastros do Admin Master. A autorização (RLS) é
 * responsabilidade do banco; o frontend nunca contorna políticas.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { PersonContract } from '@/platform/identity/people/people.contract';

export interface AdminPersonListItem {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  tenant_count: number;
}

export interface AdminPersonFilters {
  search?: string;
  status?: string;
  tenant_id?: string;
}

export interface AdminPersonCreatePayload {
  full_name: string;
  email: string;
  phone?: string | null;
  status?: string;
}

export interface AdminPersonUpdatePayload {
  full_name?: string;
  email?: string;
  phone?: string | null;
  status?: string;
}

export interface AdminPersonRepository {
  list(filters?: AdminPersonFilters): Promise<AdminPersonListItem[]>;
  findById(id: string): Promise<PersonContract | null>;
  create(payload: AdminPersonCreatePayload): Promise<{ id: string } | { error: string }>;
  update(id: string, payload: AdminPersonUpdatePayload): Promise<{ updated: PersonContract } | { error: string }>;
  setStatus(id: string, status: string): Promise<{ updated: PersonContract } | { error: string }>;
}

export function createAdminPersonRepository(): AdminPersonRepository {
  return {
    async list(filters?: AdminPersonFilters): Promise<AdminPersonListItem[]> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      let query = supabase
        .from('people')
        .select(
          'id, auth_user_id, full_name, email, phone, status, created_at, updated_at, tenant_memberships(tenant_id)',
        )
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (
        (data ?? []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          auth_user_id: row.auth_user_id as string | null,
          full_name: row.full_name as string,
          email: row.email as string,
          phone: row.phone as string | null,
          status: row.status as string,
          created_at: row.created_at as string,
          updated_at: row.updated_at as string,
          tenant_count: (row.tenant_memberships as unknown[] ?? []).length,
        })) ?? []
      );
    },

    async findById(id: string): Promise<PersonContract | null> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      const { data, error } = await supabase
        .from('people')
        .select('id, auth_user_id, full_name, email, phone, status, created_at, updated_at, metadata')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data as PersonContract) ?? null;
    },

    async create(payload: AdminPersonCreatePayload): Promise<{ id: string } | { error: string }> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      const { data, error } = await supabase
        .from('people')
        .insert({
          full_name: payload.full_name,
          email: payload.email,
          phone: payload.phone ?? null,
          status: payload.status ?? 'active',
        })
        .select('id')
        .single();

      if (error) {
        return { error: error.message };
      }

      return { id: data.id };
    },

    async update(
      id: string,
      payload: AdminPersonUpdatePayload,
    ): Promise<{ updated: PersonContract } | { error: string }> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      const updates: Record<string, unknown> = {};
      if (payload.full_name !== undefined) updates.full_name = payload.full_name;
      if (payload.email !== undefined) updates.email = payload.email;
      if (payload.phone !== undefined) updates.phone = payload.phone;
      if (payload.status !== undefined) updates.status = payload.status;

      if (Object.keys(updates).length === 0) {
        return { error: 'Nenhum campo para atualizar.' };
      }

      const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', id)
        .select('id, auth_user_id, full_name, email, phone, status, created_at, updated_at, metadata')
        .single();

      if (error) {
        return { error: error.message };
      }

      return { updated: data as PersonContract };
    },

    async setStatus(
      id: string,
      status: string,
    ): Promise<{ updated: PersonContract } | { error: string }> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      const { data, error } = await supabase
        .from('people')
        .update({ status })
        .eq('id', id)
        .select('id, auth_user_id, full_name, email, phone, status, created_at, updated_at, metadata')
        .single();

      if (error) {
        return { error: error.message };
      }

      return { updated: data as PersonContract };
    },
  };
}
