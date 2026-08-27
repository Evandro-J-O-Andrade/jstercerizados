import { SupabaseRepository } from './supabase.repository';
import type {
  EmployeeCourse,
  EmployeeCourseCreateInput,
  EmployeeCourseUpdateInput,
} from '@/types/domain/employee-course';
import type { Database } from '@/types/database';
import { mapEmployeeCourse } from '@/types/domain/mappers';

type EmployeeCourseRow =
  Database['public']['Tables']['employee_courses']['Row'];

export class EmployeeCoursesRepository extends SupabaseRepository {
  async findAll(
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeCourse[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('employee_courses')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .order('completion_date', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployeeCourse(row as EmployeeCourseRow),
    );
  }

  async findById(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeCourse | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_courses')
      .select('*')
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeCourse(data as EmployeeCourseRow);
  }

  async create(
    input: EmployeeCourseCreateInput,
    tenantId: string,
  ): Promise<EmployeeCourse | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_courses')
      .insert({
        ...input,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeCourse(data as EmployeeCourseRow);
  }

  async update(
    id: string,
    employeeId: string,
    tenantId: string,
    input: EmployeeCourseUpdateInput,
  ): Promise<EmployeeCourse | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.course_name !== undefined)
      payload.course_name = input.course_name;
    if (input.institution !== undefined)
      payload.institution = input.institution;
    if (input.completion_date !== undefined)
      payload.completion_date = input.completion_date;
    if (input.expiry_date !== undefined)
      payload.expiry_date = input.expiry_date;
    if (input.certificate_url !== undefined)
      payload.certificate_url = input.certificate_url;
    if (input.hours !== undefined) payload.hours = input.hours;

    const { data, error } = await this.supabase
      .from('employee_courses')
      .update(payload)
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeCourse(data as EmployeeCourseRow);
  }

  async remove(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('employee_courses')
      .delete()
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const employeeCoursesRepository = new EmployeeCoursesRepository();
