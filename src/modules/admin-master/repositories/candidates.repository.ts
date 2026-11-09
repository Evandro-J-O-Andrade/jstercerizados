/**
 * Repositório administrativo de candidatos — Admin Master.
 *
 * Leitura/escrita autorizada pela RLS do Supabase (frontend não contorna
 * políticas). Diferente do repositório tenant-scoped do módulo Candidato,
 * este contrato não exige tenant_id explícito no cliente: o escopo efetivo
 * (global/perfis autorizados/tenant conforme RLS) é aplicado pelo banco.
 * Falhas de RLS/permissão são propagadas como erro para o chamador tratar.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

type CandidateRow = Database['public']['Tables']['candidates']['Row'];
type CandidateUpdate = Database['public']['Tables']['candidates']['Update'];

export interface AdminCandidatePersonRef {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
}

export interface AdminCandidateListItem extends CandidateRow {
  person: AdminCandidatePersonRef | null;
  applications_count: number;
}

export interface AdminCandidateDetail extends CandidateRow {
  person: AdminCandidatePersonRef | null;
  applications: Array<{
    id: string;
    job_id: string;
    current_stage: string;
    applied_at: string;
    updated_at: string;
    source: string | null;
  }>;
}

export interface AdminCandidateFilters {
  search?: string;
  status?: string;
  tenantId?: string;
}

export interface AdminCandidateRepository {
  list(filters?: AdminCandidateFilters): Promise<AdminCandidateListItem[]>;
  findById(id: string): Promise<AdminCandidateDetail | null>;
  update(
    id: string,
    payload: Pick<
      CandidateUpdate,
      | 'headline'
      | 'status'
      | 'source'
      | 'salary_expectation_min'
      | 'salary_expectation_max'
      | 'salary_type'
      | 'availability'
      | 'metadata'
    >,
  ): Promise<{ updated: CandidateRow } | { error: string }>;
}

export function createAdminCandidateRepository(): AdminCandidateRepository {
  return {
    async list(filters?: AdminCandidateFilters): Promise<AdminCandidateListItem[]> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      let query = supabase
        .from('candidates')
        .select(
          `
          *,
          person:people(id, full_name, email, phone, city, state, status),
          applications(id)
        `,
        )
        .order('created_at', { ascending: false })
        .limit(200);

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.tenantId) query = query.eq('tenant_id', filters.tenantId);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as Array<
        CandidateRow & {
          person?: AdminCandidatePersonRef | null;
          applications?: Array<{ id: string }>;
        }
      >;

      const term = filters?.search?.trim().toLowerCase();
      const mapped = rows.map((row) => {
        const { applications, ...rest } = row;
        return {
          ...rest,
          person: row.person ?? null,
          applications_count: Array.isArray(applications) ? applications.length : 0,
        };
      });

      if (!term) return mapped;
      return mapped.filter((row) => {
        const name = (row.person?.full_name ?? '').toLowerCase();
        const email = (row.person?.email ?? '').toLowerCase();
        const headline = (row.headline ?? '').toLowerCase();
        const source = (row.source ?? '').toLowerCase();
        return (
          name.includes(term) ||
          email.includes(term) ||
          headline.includes(term) ||
          source.includes(term)
        );
      });
    },

    async findById(id: string): Promise<AdminCandidateDetail | null> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      const { data, error } = await supabase
        .from('candidates')
        .select(
          `
          *,
          person:people(id, full_name, email, phone, city, state, status),
          applications(id, job_id, current_stage, applied_at, updated_at, source)
        `,
        )
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const row = data as CandidateRow & {
        person?: AdminCandidatePersonRef | null;
        applications?: AdminCandidateDetail['applications'];
      };
      const { applications, ...rest } = row;
      return {
        ...rest,
        person: row.person ?? null,
        applications: Array.isArray(applications) ? applications : [],
      };
    },

    async update(id, payload) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      const updates: Record<string, unknown> = {};
      if (payload.headline !== undefined) updates.headline = payload.headline;
      if (payload.status !== undefined) updates.status = payload.status;
      if (payload.source !== undefined) updates.source = payload.source;
      if (payload.salary_expectation_min !== undefined)
        updates.salary_expectation_min = payload.salary_expectation_min;
      if (payload.salary_expectation_max !== undefined)
        updates.salary_expectation_max = payload.salary_expectation_max;
      if (payload.salary_type !== undefined)
        updates.salary_type = payload.salary_type;
      if (payload.availability !== undefined)
        updates.availability = payload.availability;
      if (payload.metadata !== undefined) updates.metadata = payload.metadata;

      if (Object.keys(updates).length === 0) {
        return { error: 'Nenhum campo para atualizar.' };
      }

      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) return { error: error.message };
      return { updated: data as CandidateRow };
    },
  };
}
