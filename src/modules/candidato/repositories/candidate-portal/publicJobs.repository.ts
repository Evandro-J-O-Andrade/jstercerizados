import { SupabaseRepository } from '@/repositories/supabase.repository';

export interface PublishedJobListItem {
  id: string;
  title: string;
  slug: string;
  city: string | null;
  state: string | null;
  work_mode: string | null;
  contract_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  seniority: string | null;
  published_at: string | null;
  applications_count: number;
}

export interface JobSkillItem {
  id: string;
  skill_id: string;
  skill_name?: string;
  required: boolean;
  level?: string | null;
}

export interface PublishedJobWithSkills extends PublishedJobListItem {
  skills?: JobSkillItem[];
}

export class PublicJobsRepository extends SupabaseRepository {
  async findPublished(tenantId: string, limit = 50): Promise<PublishedJobListItem[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('jobs')
      .select(
        `
        id, title, slug, city, state, work_mode, contract_type,
        salary_min, salary_max, salary_type, seniority,
        published_at, applications_count
      `,
      )
      .eq('tenant_id', tenantId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as PublishedJobListItem[];
  }

  async findPublishedWithSkills(
    tenantId: string,
    limit = 50,
  ): Promise<PublishedJobWithSkills[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('jobs')
      .select(
        `
        id, title, slug, city, state, work_mode, contract_type,
        salary_min, salary_max, salary_type, seniority,
        published_at, applications_count,
        skills:job_skills(
          id, skill_id, required, level
        )
      `,
      )
      .eq('tenant_id', tenantId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as unknown as PublishedJobWithSkills[];
  }

  async findPublishedBySlugWithSkills(
    slug: string,
  ): Promise<PublishedJobWithSkills | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('jobs')
      .select(
        `
        id, title, slug, city, state, work_mode, contract_type,
        salary_min, salary_max, salary_type, seniority,
        published_at, applications_count,
        skills:job_skills(
          id, skill_id, required, level
        )
      `,
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as PublishedJobWithSkills | null) ?? null;
  }
}

export const publicJobsRepository = new PublicJobsRepository();
