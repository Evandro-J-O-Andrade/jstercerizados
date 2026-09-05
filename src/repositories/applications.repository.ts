import { SupabaseRepository } from './supabase.repository';
import type {
  Application,
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ApplicationStatusHistory,
} from '@/types/domain/application';
import type { Database } from '@/types/database';
import { mapApplication } from '@/types/domain/mappers';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type CandidateRow = Database['public']['Tables']['candidates']['Row'];

export class ApplicationsRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: {
      jobId?: string;
      candidateId?: string;
      stage?: string;
      source?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<Application[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('applications')
      .select(
        `
        *,
        job:jobs(
          *
        ),
        candidate:candidates(
          *,
          person:people(*)
        )
      `,
      )
      .eq('tenant_id', tenantId)
      .order('applied_at', { ascending: false });

    if (filters?.jobId) query = query.eq('job_id', filters.jobId);
    if (filters?.candidateId)
      query = query.eq('candidate_id', filters.candidateId);
    if (filters?.stage) query = query.eq('current_stage', filters.stage);
    if (filters?.source) query = query.eq('source', filters.source);

    if (filters?.search) {
      query = query.or(
        `notes.ilike.%${filters.search}%,job.title.ilike.%${filters.search}%`,
      );
    }

    if (filters?.dateFrom) query = query.gte('applied_at', filters.dateFrom);
    if (filters?.dateTo) query = query.lte('applied_at', filters.dateTo);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row) => {
      const job = (row.job || null) as JobRow | null;
      const candidate = (row.candidate || null) as CandidateRow | null;
      return mapApplication(row as Application, {
        job: job ?? undefined,
        candidate: candidate ?? undefined,
      });
    });
  }

  async findById(id: string, tenantId: string): Promise<Application | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('applications')
      .select(
        `
        *,
        job:jobs(
          *
        ),
        candidate:candidates(
          *,
          person:people(*)
        )
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const job = (data.job || null) as JobRow | null;
    const candidate = (data.candidate || null) as CandidateRow | null;
    return mapApplication(data as Application, {
      job: job ?? undefined,
      candidate: candidate ?? undefined,
    });
  }

  async findHistory(
    applicationId: string,
    _tenantId: string,
  ): Promise<ApplicationStatusHistory[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('application_status_history')
      .select('*')
      .eq('application_id', applicationId)
      .order('changed_at', { ascending: true });

    if (error) throw error;
    return (data || []) as ApplicationStatusHistory[];
  }

  async create(input: ApplicationCreateInput): Promise<Application | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {
      tenant_id: input.tenant_id,
      job_id: input.job_id,
      candidate_id: input.candidate_id,
      current_stage: 'submitted',
      source: input.source ?? 'website',
      profile_snapshot: input.profile_snapshot ?? null,
      match_score: input.match_score ?? null,
      match_details: input.match_details ?? null,
      notes: input.notes ?? null,
      created_by: input.created_by ?? null,
    };

    const { data, error } = await this.supabase
      .from('applications')
      .insert(payload)
      .select(
        `
        *,
        job:jobs(
          *
        ),
        candidate:candidates(
          *,
          person:people(*)
        )
      `,
      )
      .single();

    if (error) throw error;
    if (!data) return null;

    const job = (data.job || null) as JobRow | null;
    const candidate = (data.candidate || null) as CandidateRow | null;
    return mapApplication(data as Application, {
      job: job ?? undefined,
      candidate: candidate ?? undefined,
    });
  }

  async update(
    id: string,
    tenantId: string,
    input: ApplicationUpdateInput,
  ): Promise<Application | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.job_id !== undefined) payload.job_id = input.job_id;
    if (input.candidate_id !== undefined)
      payload.candidate_id = input.candidate_id;
    if (input.source !== undefined) payload.source = input.source;
    if (input.current_stage !== undefined)
      payload.current_stage = input.current_stage;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('applications')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(
        `
        *,
        job:jobs(
          *
        ),
        candidate:candidates(
          *,
          person:people(*)
        )
      `,
      )
      .single();

    if (error) throw error;
    if (!data) return null;

    const job = (data.job || null) as JobRow | null;
    const candidate = (data.candidate || null) as CandidateRow | null;
    return mapApplication(data as Application, {
      job: job ?? undefined,
      candidate: candidate ?? undefined,
    });
  }

  async addHistoryEntry(input: {
    applicationId: string;
    tenantId: string;
    stage:
      | 'submitted'
      | 'screening'
      | 'interview'
      | 'technical_interview'
      | 'presentation'
      | 'reference_check'
      | 'offer'
      | 'hired'
      | 'rejected'
      | 'withdrawn'
      | 'on_hold';
    previousStage?: string | null;
    nextStage?: string | null;
    changedBy?: string | null;
    reason?: string | null;
  }): Promise<ApplicationStatusHistory | null> {
    if (!this.supabase) return null;

    const application = await this.findById(
      input.applicationId,
      input.tenantId,
    );
    if (!application) return null;

    const payload: Record<string, unknown> = {
      application_id: input.applicationId,
      stage: input.stage,
      previous_stage: input.previousStage ?? null,
      next_stage: input.nextStage ?? null,
      changed_by: input.changedBy ?? null,
      reason: input.reason ?? null,
    };

    const { data, error } = await this.supabase
      .from('application_status_history')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return (data as ApplicationStatusHistory) ?? null;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const applicationsRepository = new ApplicationsRepository();
