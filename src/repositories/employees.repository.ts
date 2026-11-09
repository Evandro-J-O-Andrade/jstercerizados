import { SupabaseRepository } from './supabase.repository';
import type {
  Employee,
  EmployeeCreateInput,
  EmployeePersonOption,
  EmployeeUpdateInput,
} from '@/types/domain/employee';
import type { Database } from '@/types/database';
import { mapEmployee } from '@/types/domain/mappers';

type EmployeeRow = Database['public']['Tables']['employees']['Row'];

export interface EmployeesPageResult {
  data: Employee[];
  count: number;
  error: Error | null;
}

export class EmployeesRepository extends SupabaseRepository {
  async findEligiblePeople(tenantId: string): Promise<EmployeePersonOption[]> {
    if (!this.supabase) return [];

    const [
      { data: memberships, error: membershipsError },
      { data: employees, error: employeesError },
    ] = await Promise.all([
      this.supabase
        .from('tenant_memberships')
        .select('person:people!inner(id, full_name, email, status)')
        .eq('tenant_id', tenantId)
        .eq('status', 'active'),
      this.supabase.from('employees').select('id').eq('tenant_id', tenantId),
    ]);

    if (membershipsError) throw membershipsError;
    if (employeesError) throw employeesError;

    const linkedIds = new Set((employees || []).map((employee) => employee.id));
    return (memberships || [])
      .map((membership) =>
        Array.isArray(membership.person)
          ? membership.person[0]
          : membership.person,
      )
      .filter((person): person is EmployeePersonOption =>
        Boolean(person && !linkedIds.has(person.id)),
      )
      .sort((a, b) => a.full_name.localeCompare(b.full_name, 'pt-BR'));
  }

  private buildListQuery(
    tenantId: string,
    filters?: { status?: string; search?: string },
    options?: { count?: 'exact' },
  ) {
    if (!this.supabase) return null;

    let query = this.supabase
      .from('employees')
      .select(
        `
        *,
        person:people!employees_id_fkey(*),
        documents:employee_documents(*),
        positions:employee_positions(*),
        contracts:employee_contracts(*),
        status_history:employee_status_history(*)
      `,
        options?.count ? { count: options.count } : undefined,
      )
      .eq('tenant_id', tenantId)
      .order('hire_date', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) {
      const term = filters.search.replace(/,/g, ' ');
      query = query.or(
        `employee_code.ilike.%${term}%,person.full_name.ilike.%${term}%`,
      );
    }
    return query;
  }

  async findPage(
    tenantId: string,
    filters?: { status?: string; search?: string },
    pagination?: { limit?: number; offset?: number },
  ): Promise<EmployeesPageResult> {
    if (!this.supabase) return { data: [], count: 0, error: null };
    try {
      const query = this.buildListQuery(tenantId, filters, { count: 'exact' });
      if (!query) return { data: [], count: 0, error: null };
      const limit = Math.max(1, pagination?.limit ?? 20);
      const offset = Math.max(0, pagination?.offset ?? 0);
      const { data, error, count } = await query.range(offset, offset + limit - 1);
      if (error) return { data: [], count: 0, error: error as Error };
      return {
        data: (data || []).map((row) =>
          mapEmployee(row as EmployeeRow, {
            person: row.person,
            documents: row.documents,
            positions: row.positions,
            contracts: row.contracts,
            status_history: row.status_history,
          }),
        ),
        count: count ?? 0,
        error: null,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async findAll(
    tenantId: string,
    filters?: {
      status?: string;
      search?: string;
    },
  ): Promise<Employee[]> {
    if (!this.supabase) return [];
    const query = this.buildListQuery(tenantId, filters);
    if (!query) return [];
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployee(row as EmployeeRow, {
        person: row.person,
        documents: row.documents,
        positions: row.positions,
        contracts: row.contracts,
        status_history: row.status_history,
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
        person:people!employees_id_fkey(*),
        documents:employee_documents(*),
        positions:employee_positions(*),
        contracts:employee_contracts(*),
        status_history:employee_status_history(*)
      `,
      )
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployee(data as EmployeeRow, {
      person: data.person,
      documents: data.documents,
      positions: data.positions,
      contracts: data.contracts,
      status_history: data.status_history,
    });
  }

  async create(input: EmployeeCreateInput): Promise<Employee | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employees')
      .insert({
        id: input.id,
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
        person:people!employees_id_fkey(*)
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
    if (input.employee_code !== undefined)
      payload.employee_code = input.employee_code;
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
        person:people!employees_id_fkey(*)
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
