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
      .select(
        `
        *,
        person:people(*),
        skills:candidate_skills(*),
        experiences:candidate_experiences(*),
        education:candidate_education(*),
        courses:candidate_courses(*),
        languages:candidate_languages(*),
        documents:candidate_documents(*),
        profileViews:candidate_profile_views(*)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      const term = filters.search.trim();
      query = query.or(`headline.ilike.%${term}%,source.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Candidate[];
  }

  async findById(id: string, tenantId: string): Promise<Candidate | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('candidates')
      .select(
        `
        *,
        person:people(*),
        skills:candidate_skills(*),
        experiences:candidate_experiences(*),
        education:candidate_education(*),
        courses:candidate_courses(*),
        languages:candidate_languages(*),
        documents:candidate_documents(*),
        profileViews:candidate_profile_views(*)
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as Candidate | null;
  }

  async create(input: CandidateCreateInput): Promise<Candidate> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      person_id: input.person_id,
      tenant_id: input.tenant_id,
      status: input.status ?? 'active',
      metadata: input.metadata ?? {},
    };

    if (input.headline !== undefined) payload.headline = input.headline;
    if (input.salary_expectation_min !== undefined)
      payload.salary_expectation_min = input.salary_expectation_min;
    if (input.salary_expectation_max !== undefined)
      payload.salary_expectation_max = input.salary_expectation_max;
    if (input.salary_type !== undefined)
      payload.salary_type = input.salary_type;
    if (input.availability !== undefined)
      payload.availability = input.availability;
    if (input.source !== undefined) payload.source = input.source;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('candidates')
      .insert(payload)
      .select(
        `
        *,
        person:people(*),
        skills:candidate_skills(*),
        experiences:candidate_experiences(*),
        education:candidate_education(*),
        courses:candidate_courses(*),
        languages:candidate_languages(*),
        documents:candidate_documents(*),
        profileViews:candidate_profile_views(*)
      `,
      )
      .single();

    if (error) throw error;
    return data as Candidate;
  }

  async update(
    id: string,
    tenantId: string,
    input: CandidateUpdateInput,
  ): Promise<Candidate> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.person_id !== undefined) payload.person_id = input.person_id;
    if (input.tenant_id !== undefined) payload.tenant_id = input.tenant_id;
    if (input.headline !== undefined) payload.headline = input.headline;
    if (input.salary_expectation_min !== undefined)
      payload.salary_expectation_min = input.salary_expectation_min;
    if (input.salary_expectation_max !== undefined)
      payload.salary_expectation_max = input.salary_expectation_max;
    if (input.salary_type !== undefined)
      payload.salary_type = input.salary_type;
    if (input.availability !== undefined)
      payload.availability = input.availability;
    if (input.source !== undefined) payload.source = input.source;
    if (input.status !== undefined) payload.status = input.status;
    if (input.metadata !== undefined) payload.metadata = input.metadata;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('candidates')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(
        `
        *,
        person:people(*),
        skills:candidate_skills(*),
        experiences:candidate_experiences(*),
        education:candidate_education(*),
        courses:candidate_courses(*),
        languages:candidate_languages(*),
        documents:candidate_documents(*),
        profileViews:candidate_profile_views(*)
      `,
      )
      .single();

    if (error) throw error;
    return data as Candidate;
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
