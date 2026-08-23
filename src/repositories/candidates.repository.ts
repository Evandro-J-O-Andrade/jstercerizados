import { SupabaseRepository } from './supabase.repository';
import type {
  Candidate,
  CandidateCreateInput,
  CandidateUpdateInput,
} from '@/types/domain/candidate';

export class CandidatesRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: { status?: string; search?: string },
  ): Promise<Candidate[]> {
    if (!this.supabase) return [];
    let query = this.supabase
      .from('candidates')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) {
      query = query.or(
        `person_id.in.(select id from people where full_name.ilike.%${filters.search}%))`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Candidate | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async create(input: CandidateCreateInput): Promise<Candidate> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidates')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    tenantId: string,
    input: CandidateUpdateInput,
  ): Promise<Candidate> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('candidates')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('candidates')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }
}

export const candidatesRepository = new CandidatesRepository();
