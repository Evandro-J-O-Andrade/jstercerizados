import { SupabaseRepository } from './supabase.repository';
import type {
  EmployeeEducation,
  EmployeeEducationCreateInput,
  EmployeeEducationUpdateInput,
} from '@/types/domain/employee-education';
import type { Database } from '@/types/database';
import { mapEmployeeEducation } from '@/types/domain/mappers';

type EmployeeEducationRow =
  Database['public']['Tables']['employee_education']['Row'];

export class EmployeeEducationsRepository extends SupabaseRepository {
  async findAll(employeeId: string): Promise<EmployeeEducation[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('employee_education')
      .select('*')
      .eq('employee_id', employeeId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployeeEducation(row as EmployeeEducationRow),
    );
  }

  async findById(
    id: string,
    employeeId: string,
  ): Promise<EmployeeEducation | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('employee_education')
      .select('*')
      .eq('id', id)
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeEducation(data as EmployeeEducationRow);
  }

  async create(
    input: EmployeeEducationCreateInput,
  ): Promise<EmployeeEducation | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('employee_education')
      .insert({
        employee_id: input.employee_id,
        institution: input.institution,
        course: input.course,
        degree_level: input.degree_level,
        field_of_study: input.field_of_study,
        start_date: input.start_date,
        end_date: input.end_date,
        is_completed: input.is_completed,
        notes: input.notes,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeEducation(data as EmployeeEducationRow);
  }

  async update(
    id: string,
    employeeId: string,
    input: EmployeeEducationUpdateInput,
  ): Promise<EmployeeEducation | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.institution !== undefined)
      payload.institution = input.institution;
    if (input.course !== undefined) payload.course = input.course;
    if (input.degree_level !== undefined)
      payload.degree_level = input.degree_level;
    if (input.field_of_study !== undefined)
      payload.field_of_study = input.field_of_study;
    if (input.start_date !== undefined) payload.start_date = input.start_date;
    if (input.end_date !== undefined) payload.end_date = input.end_date;
    if (input.is_completed !== undefined)
      payload.is_completed = input.is_completed;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('employee_education')
      .update(payload)
      .eq('id', id)
      .eq('employee_id', employeeId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeEducation(data as EmployeeEducationRow);
  }

  async remove(id: string, employeeId: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('employee_education')
      .delete()
      .eq('id', id)
      .eq('employee_id', employeeId);

    if (error) throw error;
  }
}

export const employeeEducationsRepository = new EmployeeEducationsRepository();
