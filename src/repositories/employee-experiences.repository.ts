import { SupabaseRepository } from './supabase.repository';
import type {
  EmployeeExperience,
  EmployeeExperienceCreateInput,
  EmployeeExperienceUpdateInput,
} from '@/types/domain/employee-experience';
import type { Database } from '@/types/database';
import { mapEmployeeExperience } from '@/types/domain/mappers';

type EmployeeExperienceRow =
  Database['public']['Tables']['employee_experiences']['Row'];

export class EmployeeExperiencesRepository extends SupabaseRepository {
  async findAll(
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeExperience[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('employee_experiences')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployeeExperience(row as EmployeeExperienceRow),
    );
  }

  async findById(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeExperience | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_experiences')
      .select('*')
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeExperience(data as EmployeeExperienceRow);
  }

  async create(
    input: EmployeeExperienceCreateInput,
    tenantId: string,
  ): Promise<EmployeeExperience | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_experiences')
      .insert({
        ...input,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeExperience(data as EmployeeExperienceRow);
  }

  async update(
    id: string,
    employeeId: string,
    tenantId: string,
    input: EmployeeExperienceUpdateInput,
  ): Promise<EmployeeExperience | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.company_name !== undefined)
      payload.company_name = input.company_name;
    if (input.job_title !== undefined) payload.job_title = input.job_title;
    if (input.start_date !== undefined) payload.start_date = input.start_date;
    if (input.end_date !== undefined) payload.end_date = input.end_date;
    if (input.is_current !== undefined) payload.is_current = input.is_current;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.achievements !== undefined)
      payload.achievements = input.achievements;

    const { data, error } = await this.supabase
      .from('employee_experiences')
      .update(payload)
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeExperience(data as EmployeeExperienceRow);
  }

  async remove(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('employee_experiences')
      .delete()
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const employeeExperiencesRepository =
  new EmployeeExperiencesRepository();
