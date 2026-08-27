import { SupabaseRepository } from './supabase.repository';
import type {
  CandidateDocument,
  CandidateDocumentCreateInput,
  CandidateDocumentUpdateInput,
} from '@/types/domain/candidate';

export class CandidateDocumentsRepository extends SupabaseRepository {
  async findByCandidate(candidateId: string): Promise<CandidateDocument[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CandidateDocument[];
  }

  async findById(
    id: string,
    candidateId: string,
  ): Promise<CandidateDocument | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidate_documents')
      .select('*')
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return data as CandidateDocument | null;
  }

  async create(
    input: CandidateDocumentCreateInput,
  ): Promise<CandidateDocument> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      candidate_id: input.candidate_id,
      type: input.type,
      url: input.url,
    };

    if (input.name !== undefined) payload.name = input.name;

    const { data, error } = await this.supabase
      .from('candidate_documents')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateDocument;
  }

  async update(
    id: string,
    candidateId: string,
    input: CandidateDocumentUpdateInput,
  ): Promise<CandidateDocument> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.type !== undefined) payload.type = input.type;
    if (input.url !== undefined) payload.url = input.url;
    if (input.name !== undefined) payload.name = input.name;

    const { data, error } = await this.supabase
      .from('candidate_documents')
      .update(payload)
      .eq('id', id)
      .eq('candidate_id', candidateId)
      .select('*')
      .single();

    if (error) throw error;
    return data as CandidateDocument;
  }

  async delete(id: string, candidateId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('candidate_documents')
      .delete()
      .eq('id', id)
      .eq('candidate_id', candidateId);

    if (error) throw error;
  }
}

export const candidateDocumentsRepository = new CandidateDocumentsRepository();
