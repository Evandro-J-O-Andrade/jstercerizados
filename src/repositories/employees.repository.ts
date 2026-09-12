import { SupabaseRepository } from './supabase.repository';
import type {
  Employee,
  EmployeeCreateInput,
  EmployeeUpdateInput,
} from '@/types/domain/employee';
import type { Database } from '@/types/database';
import { mapEmployee } from '@/types/domain/mappers';

type EmployeeRow = Database['public']['Tables']['employees']['Row'];

export class EmployeesRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    filters?: {
      status?: string;
      search?: string;
    },
  ): Promise<Employee[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('employees')
      .select(
        `
        *,
        person:people(*)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('hire_date', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search)
      query = query.or(
        `employee_code.ilike.%${filters.search}%,person.full_name.ilike.%${filters.search}%`,
      );

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployee(row as EmployeeRow, {
        person: row.person,
      }),
    );
  }

  async findById(id: string, tenantId: string): Promise<Employee | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employees')
      .select(
        `
        *,
        person:people(*)
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployee(data as EmployeeRow, {
      person: data.person,
    });
  }

  async create(input: EmployeeCreateInput): Promise<Employee | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employees')
      .insert({
        tenant_id: input.tenant_id,
        employee_code: input.employee_code,
        hire_date: input.hire_date,
        termination_date: input.termination_date ?? null,
        salary: input.salary ?? null,
        status: input.status ?? 'active',
      })
      .select(
        `
        *,
        person:people(*)
      `,
      )
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployee(data as EmployeeRow, {
      person: data.person,
    });
  }

  async update(
    id: string,
    tenantId: string,
    input: EmployeeUpdateInput,
  ): Promise<Employee | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.employee_code !== undefined) payload.employee_code = input.employee_code;
    if (input.hire_date !== undefined) payload.hire_date = input.hire_date;
    if (input.termination_date !== undefined)
      payload.termination_date = input.termination_date;
    if (input.salary !== undefined) payload.salary = input.salary;
    if (input.status !== undefined) payload.status = input.status;

    const { data, error } = await this.supabase
      .from('employees')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(
        `
        *,
        person:people(*)
      `,
      )
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployee(data as EmployeeRow, {
      person: data.person,
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const employeesRepository = new EmployeesRepository();
