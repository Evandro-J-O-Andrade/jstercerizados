import { SupabaseRepository } from './supabase.repository';
import type {
  Candidate,
  TalentPoolMembership,
  CandidatePreference,
  JobMatch,
} from '@/types/domain/candidate';
import type { Database } from '@/types/database';

type TalentPoolMembershipRow =
  Database['public']['Tables']['talent_pool_memberships']['Row'];
type CandidatePreferenceRow =
  Database['public']['Tables']['candidate_preferences']['Row'];
type JobMatchRow = Database['public']['Tables']['job_matches']['Row'];

export class TalentPoolRepository extends SupabaseRepository {
  async findCandidates(
    tenantId: string,
    options?: {
      search?: string;
      status?: string;
      city?: string;
      state?: string;
      skill?: string;
      availability?: string;
      limit?: number;
      offset?: number;
    },
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

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.search) {
      const term = options.search.trim();
      query = query.or(`headline.ilike.%${term}%,source.ilike.%${term}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    let candidates = (data || []) as Candidate[];

    if (options?.skill) {
      const skillTerm = options.skill.toLowerCase();
      candidates = candidates.filter((candidate) =>
        candidate.skills?.some(
          (skill) =>
            skill.name?.toLowerCase().includes(skillTerm) ||
            skill.level?.toLowerCase().includes(skillTerm),
        ),
      );
    }

    return candidates;
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<
    | (Candidate & {
        talentPool?: TalentPoolMembership | null;
        preferences?: CandidatePreference | null;
        jobMatches?: JobMatch[];
      })
    | null
  > {
    if (!this.supabase) return null;

    const { data: candidate, error: candidateError } = await this.supabase
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

    if (candidateError) throw candidateError;
    if (!candidate) return null;

    const { data: membership } = await this.supabase
      .from('talent_pool_memberships')
      .select('*')
      .eq('candidate_id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    const { data: preferences } = await this.supabase
      .from('candidate_preferences')
      .select('*')
      .eq('candidate_id', id)
      .maybeSingle();

    const { data: jobMatches } = await this.supabase
      .from('job_matches')
      .select('*')
      .eq('candidate_id', id)
      .eq('tenant_id', tenantId)
      .order('score', { ascending: false });

    return {
      ...(candidate as Candidate),
      talentPool: (membership as TalentPoolMembershipRow) || null,
      preferences: (preferences as CandidatePreferenceRow) || null,
      jobMatches: ((jobMatches || []) as JobMatchRow[]) || [],
    };
  }

  async findTalentPoolMemberships(
    tenantId: string,
    options?: {
      status?: string;
      source?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<TalentPoolMembership[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('talent_pool_memberships')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('joined_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.source) {
      query = query.eq('source', options.source);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as TalentPoolMembership[];
  }

  async findJobMatches(
    candidateId: string,
    tenantId: string,
  ): Promise<JobMatch[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('job_matches')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('tenant_id', tenantId)
      .order('score', { ascending: false });

    if (error) throw error;
    return (data || []) as JobMatch[];
  }

  async getTalentPoolStats(tenantId: string) {
    if (!this.supabase)
      return {
        total: 0,
        active: 0,
        withExperience: 0,
        recentUpdates: 0,
        withDocuments: 0,
      };

    const { data: candidates, error: candidatesError } = await this.supabase
      .from('candidates')
      .select('id, status, updated_at')
      .eq('tenant_id', tenantId);

    if (candidatesError) throw candidatesError;

    const total = candidates?.length || 0;
    const active = candidates?.filter((c) => c.status === 'active').length || 0;

    const { data: candidatesWithExp } = await this.supabase
      .from('candidates')
      .select('id')
      .eq('tenant_id', tenantId)
      .not('id', 'in', `(select candidate_id from candidate_experiences)`);

    const withExperience =
      total - (candidatesWithExp?.filter((c) => !c.id).length || 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUpdates =
      candidates?.filter((c) => new Date(c.updated_at) >= thirtyDaysAgo)
        .length || 0;

    const { data: candidatesWithDocs } = await this.supabase
      .from('candidates')
      .select('id')
      .eq('tenant_id', tenantId)
      .not('id', 'in', `(select candidate_id from candidate_documents)`);

    const withDocuments =
      total - (candidatesWithDocs?.filter((c) => !c.id).length || 0);

    return {
      total,
      active,
      withExperience,
      recentUpdates,
      withDocuments,
    };
  }
}

export const talentPoolRepository = new TalentPoolRepository();
