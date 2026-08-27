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
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeDocument[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployeeDocument(row as EmployeeDocumentRow),
    );
  }

  async findById(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_documents')
      .select('*')
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeDocument(data as EmployeeDocumentRow);
  }

  async create(
    input: EmployeeDocumentCreateInput,
    tenantId: string,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('employee_documents')
      .insert({
        ...input,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeDocument(data as EmployeeDocumentRow);
  }

  async update(
    id: string,
    employeeId: string,
    tenantId: string,
    input: EmployeeDocumentUpdateInput,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;

    const payload: Record<string, unknown> = {};
    if (input.document_type !== undefined)
      payload.document_type = input.document_type;
    if (input.document_name !== undefined)
      payload.document_name = input.document_name;
    if (input.document_url !== undefined)
      payload.document_url = input.document_url;
    if (input.issue_date !== undefined) payload.issue_date = input.issue_date;
    if (input.expiry_date !== undefined)
      payload.expiry_date = input.expiry_date;
    if (input.is_verified !== undefined)
      payload.is_verified = input.is_verified;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('employee_documents')
      .update(payload)
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeDocument(data as EmployeeDocumentRow);
  }

  async remove(
    id: string,
    employeeId: string,
    tenantId: string,
  ): Promise<void> {
    if (!this.supabase) return;
    const { error } = await this.supabase
      .from('employee_documents')
      .delete()
      .eq('id', id)
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const employeeDocumentsRepository = new EmployeeDocumentsRepository();
