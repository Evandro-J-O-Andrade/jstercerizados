import { SupabaseRepository } from './supabase.repository';
import type {
  EmployeeLanguage,
  EmployeeLanguageCreateInput,
  EmployeeLanguageUpdateInput,
} from '@/types/domain/employee-language';
import type { Database } from '@/types/database';
import { mapEmployeeLanguage } from '@/types/domain/mappers';

type EmployeeLanguageRow =
  Database['public']['Tables']['employee_languages']['Row'];

export class EmployeeLanguagesRepository extends SupabaseRepository {
  async findAll(
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeLanguage[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('employee_languages')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .order('language', { ascending: true });

    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployeeLanguage(row as EmployeeLanguageRow),
    );
  }

  async findById(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeLanguage | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_languages')
      .select('*')
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeLanguage(data as EmployeeLanguageRow);
  }

  async create(
    input: EmployeeLanguageCreateInput,
    tenantId: string,
  ): Promise<EmployeeLanguage | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_languages')
      .insert({
        ...input,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeLanguage(data as EmployeeLanguageRow);
  }

  async update(
    id: string,
    employeeId: string,
    tenantId: string,
    input: EmployeeLanguageUpdateInput,
  ): Promise<EmployeeLanguage | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.language !== undefined) payload.language = input.language;
    if (input.proficiency !== undefined)
      payload.proficiency = input.proficiency;
    if (input.is_primary !== undefined) payload.is_primary = input.is_primary;

    const { data, error } = await this.supabase
      .from('employee_languages')
      .update(payload)
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeLanguage(data as EmployeeLanguageRow);
  }

  async remove(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('employee_languages')
      .delete()
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const employeeLanguagesRepository = new EmployeeLanguagesRepository();
