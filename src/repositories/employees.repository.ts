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
      department?: string;
      companyId?: string;
      search?: string;
    },
  ): Promise<Employee[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('employees')
      .select(
        `
        *,
        person:people(*),
        company:companies(*),
        manager:employees!manager_id(*)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('hire_date', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.department) query = query.eq('department', filters.department);
    if (filters?.companyId) query = query.eq('company_id', filters.companyId);
    if (filters?.search)
      query = query.or(
        `job_title.ilike.%${filters.search}%,registration.ilike.%${filters.search}%,person.full_name.ilike.%${filters.search}%`,
      );

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployee(row as EmployeeRow, {
        person: row.person,
        company: row.company,
        manager: row.manager,
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
        person:people(*),
        company:companies(*),
        manager:employees!manager_id(*)
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployee(data as EmployeeRow, {
      person: data.person,
      company: data.company,
      manager: data.manager,
    });
  }

  async create(input: EmployeeCreateInput): Promise<Employee | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employees')
      .insert({
        tenant_id: input.tenant_id,
        person_id: input.person_id,
        company_id: input.company_id ?? null,
        registration: input.registration ?? null,
        job_title: input.job_title ?? null,
        department: input.department ?? null,
        cost_center: input.cost_center ?? null,
        hire_date: input.hire_date ?? null,
        termination_date: input.termination_date ?? null,
        probation_end_date: input.probation_end_date ?? null,
        employment_type: input.employment_type ?? null,
        work_mode: input.work_mode ?? null,
        salary: input.salary ?? null,
        salary_currency: input.salary_currency ?? null,
        salary_frequency: input.salary_frequency ?? null,
        status: input.status ?? 'active',
        manager_id: input.manager_id ?? null,
        notes: input.notes ?? null,
      })
      .select(
        `
        *,
        person:people(*),
        company:companies(*),
        manager:employees!manager_id(*)
      `,
      )
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployee(data as EmployeeRow, {
      person: data.person,
      company: data.company,
      manager: data.manager,
    });
  }

  async update(
    id: string,
    tenantId: string,
    input: EmployeeUpdateInput,
  ): Promise<Employee | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.person_id !== undefined) payload.person_id = input.person_id;
    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.registration !== undefined)
      payload.registration = input.registration;
    if (input.job_title !== undefined) payload.job_title = input.job_title;
    if (input.department !== undefined) payload.department = input.department;
    if (input.cost_center !== undefined)
      payload.cost_center = input.cost_center;
    if (input.hire_date !== undefined) payload.hire_date = input.hire_date;
    if (input.termination_date !== undefined)
      payload.termination_date = input.termination_date;
    if (input.probation_end_date !== undefined)
      payload.probation_end_date = input.probation_end_date;
    if (input.employment_type !== undefined)
      payload.employment_type = input.employment_type;
    if (input.work_mode !== undefined) payload.work_mode = input.work_mode;
    if (input.salary !== undefined) payload.salary = input.salary;
    if (input.salary_currency !== undefined)
      payload.salary_currency = input.salary_currency;
    if (input.salary_frequency !== undefined)
      payload.salary_frequency = input.salary_frequency;
    if (input.status !== undefined) payload.status = input.status;
    if (input.manager_id !== undefined) payload.manager_id = input.manager_id;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('employees')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(
        `
        *,
        person:people(*),
        company:companies(*),
        manager:employees!manager_id(*)
      `,
      )
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployee(data as EmployeeRow, {
      person: data.person,
      company: data.company,
      manager: data.manager,
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
