import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';

type Candidate = Database['public']['Tables']['candidates']['Row'];
type CandidateInsert = Database['public']['Tables']['candidates']['Insert'];
type CandidateUpdate = Database['public']['Tables']['candidates']['Update'];

export class CandidatesRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Candidate[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('candidates')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }

    return data || [];
  }

  async findById(id: string): Promise<Candidate | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('candidates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch candidate: ${error.message}`);
    }

    return data;
  }

  async create(
    tenantId: string,
    candidate: CandidateInsert,
  ): Promise<Candidate> {
    const client = this.getClient();
    const { data, error } = await client
      .from('candidates')
      .insert({ ...candidate, tenant_id: tenantId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create candidate: ${error.message}`);
    }

    return data;
  }

  async update(id: string, candidate: CandidateUpdate): Promise<Candidate> {
    const client = this.getClient();
    const { data, error } = await client
      .from('candidates')
      .update(candidate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update candidate: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('candidates').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete candidate: ${error.message}`);
    }
  }
}

export const candidatesRepository = new CandidatesRepository();
