import { SupabaseRepository } from './supabase.repository';
import type {
  FiscalDocument,
  FiscalDocumentCreateInput,
  FiscalConfiguration,
  FiscalConfigurationCreateInput,
} from '@/types/domain/fiscal';

export class FiscalRepository extends SupabaseRepository {
  async findAllDocuments(tenantId: string): Promise<FiscalDocument[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('fiscal_documents')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('issue_date', { ascending: false });
    if (error) throw error;
    return (data || []) as FiscalDocument[];
  }

  async findDocumentById(id: string, tenantId: string): Promise<FiscalDocument | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('fiscal_documents')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as FiscalDocument | null;
  }

  async createDocument(input: FiscalDocumentCreateInput): Promise<FiscalDocument> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('fiscal_documents')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as FiscalDocument;
  }

  async updateDocument(id: string, input: Partial<FiscalDocumentCreateInput>, tenantId: string): Promise<FiscalDocument> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('fiscal_documents')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data as FiscalDocument;
  }

  async deleteDocument(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('fiscal_documents')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }

  async findConfiguration(tenantId: string): Promise<FiscalConfiguration | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('fiscal_configurations')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as FiscalConfiguration | null;
  }

  async createConfiguration(input: FiscalConfigurationCreateInput): Promise<FiscalConfiguration> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('fiscal_configurations')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as FiscalConfiguration;
  }

  async updateConfiguration(id: string, input: Partial<FiscalConfigurationCreateInput>, tenantId: string): Promise<FiscalConfiguration> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('fiscal_configurations')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data as FiscalConfiguration;
  }
}

export const fiscalRepository = new FiscalRepository();
