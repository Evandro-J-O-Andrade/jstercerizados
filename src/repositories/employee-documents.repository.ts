import { SupabaseRepository } from './supabase.repository';
import type {
  EmployeeDocument,
  EmployeeDocumentCreateInput,
  EmployeeDocumentUpdateInput,
} from '@/types/domain/employee-document';
import type { Database } from '@/types/database';
import { mapEmployeeDocument } from '@/types/domain/mappers';

type EmployeeDocumentRow =
  Database['public']['Tables']['employee_documents']['Row'];

export class EmployeeDocumentsRepository extends SupabaseRepository {
  async findAll(
    tenantId: string,
    employeeId?: string,
  ): Promise<EmployeeDocument[]> {
    if (!this.supabase) return [];

    let empQuery = this.supabase
      .from('employees')
      .select('id')
      .eq('tenant_id', tenantId);

    if (employeeId) {
      empQuery = empQuery.eq('id', employeeId);
    }

    const { data: employees, error: empError } = await empQuery;
    if (empError) throw empError;
    if (!employees || employees.length === 0) return [];

    const query = this.supabase
      .from('employee_documents')
      .select('*')
      .in(
        'employee_id',
        employees.map((e) => e.id),
      )
      .order('document_type', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployeeDocument(row as EmployeeDocumentRow),
    );
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('employee_documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    await this.verifyEmployeeInTenant(tenantId, data.employee_id);

    return mapEmployeeDocument(data as EmployeeDocumentRow);
  }

  async create(
    input: EmployeeDocumentCreateInput,
    tenantId: string,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;

    await this.verifyEmployeeInTenant(tenantId, input.employee_id);

    const { data, error } = await this.supabase
      .from('employee_documents')
      .insert({
        employee_id: input.employee_id,
        document_type: input.document_type,
        file_url: input.file_url,
        issue_date: input.issue_date,
        expiry_date: input.expiry_date,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeDocument(data as EmployeeDocumentRow);
  }

  async update(
    id: string,
    tenantId: string,
    input: EmployeeDocumentUpdateInput,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;

    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    const payload: Record<string, unknown> = {};
    if (input.document_type !== undefined)
      payload.document_type = input.document_type;
    if (input.file_url !== undefined) payload.file_url = input.file_url;
    if (input.issue_date !== undefined) payload.issue_date = input.issue_date;
    if (input.expiry_date !== undefined)
      payload.expiry_date = input.expiry_date;

    const { data, error } = await this.supabase
      .from('employee_documents')
      .update(payload)
      .eq('id', id)
      .eq('employee_id', existing.employee_id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeDocument(data as EmployeeDocumentRow);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;

    const existing = await this.findById(id, tenantId);
    if (!existing) return;

    const { error } = await this.supabase
      .from('employee_documents')
      .delete()
      .eq('id', id)
      .eq('employee_id', existing.employee_id);

    if (error) throw error;
  }

  private async verifyEmployeeInTenant(
    tenantId: string,
    employeeId: string,
  ): Promise<void> {
    if (!this.supabase) return;

    const { data, error } = await this.supabase
      .from('employees')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('id', employeeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error(
        'Acesso negado: funcionário não pertence ao tenant atual',
      );
    }
  }
}

export const employeeDocumentsRepository = new EmployeeDocumentsRepository();
