import { SupabaseRepository } from './supabase.repository';
import type {
  EmployeeSkill,
  EmployeeSkillCreateInput,
  EmployeeSkillUpdateInput,
} from '@/types/domain/employee-skill';
import type { Database } from '@/types/database';
import { mapEmployeeSkill } from '@/types/domain/mappers';

type EmployeeSkillRow = Database['public']['Tables']['employee_skills']['Row'];

export class EmployeeSkillsRepository extends SupabaseRepository {
  async findAll(
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeSkill[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('employee_skills')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .order('skill_name', { ascending: true });

    if (error) throw error;
    return (data || []).map((row) => mapEmployeeSkill(row as EmployeeSkillRow));
  }

  async findById(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeSkill | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_skills')
      .select('*')
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeSkill(data as EmployeeSkillRow);
  }

  async create(
    input: EmployeeSkillCreateInput,
    tenantId: string,
  ): Promise<EmployeeSkill | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_skills')
      .insert({
        ...input,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeSkill(data as EmployeeSkillRow);
  }

  async update(
    id: string,
    employeeId: string,
    tenantId: string,
    input: EmployeeSkillUpdateInput,
  ): Promise<EmployeeSkill | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.skill_name !== undefined) payload.skill_name = input.skill_name;
    if (input.proficiency_level !== undefined)
      payload.proficiency_level = input.proficiency_level;
    if (input.years_experience !== undefined)
      payload.years_experience = input.years_experience;
    if (input.is_certified !== undefined)
      payload.is_certified = input.is_certified;
    if (input.certification_name !== undefined)
      payload.certification_name = input.certification_name;

    const { data, error } = await this.supabase
      .from('employee_skills')
      .update(payload)
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeSkill(data as EmployeeSkillRow);
  }

  async remove(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('employee_skills')
      .delete()
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const employeeSkillsRepository = new EmployeeSkillsRepository();
