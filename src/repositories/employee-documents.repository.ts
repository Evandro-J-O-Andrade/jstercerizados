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
  async findAll(employeeId: string): Promise<EmployeeDocument[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('document_type', { ascending: true });

    if (error) throw error;
    return (data || []).map((row) =>
      mapEmployeeDocument(row as EmployeeDocumentRow),
    );
  }

  async findById(
    id: string,
    employeeId: string,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('employee_documents')
      .select('*')
      .eq('id', id)
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeDocument(data as EmployeeDocumentRow);
  }

  async create(
    input: EmployeeDocumentCreateInput,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;

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
    employeeId: string,
    input: EmployeeDocumentUpdateInput,
  ): Promise<EmployeeDocument | null> {
    if (!this.supabase) return null;
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
      .eq('employee_id', employeeId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapEmployeeDocument(data as EmployeeDocumentRow);
  }

  async remove(id: string, employeeId: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('employee_documents')
      .delete()
      .eq('id', id)
      .eq('employee_id', employeeId);

    if (error) throw error;
  }
}

export const employeeDocumentsRepository = new EmployeeDocumentsRepository();
