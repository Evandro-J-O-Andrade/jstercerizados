import { SupabaseRepository } from './supabase.repository';
import type {
  Warehouse,
  WarehouseCreateInput,
  WarehouseEntry,
  WarehouseEntryCreateInput,
  WarehouseIssue,
  WarehouseIssueCreateInput,
  WarehouseReturn,
  WarehouseReturnCreateInput,
} from '@/types/domain/warehouse';

export class WarehouseRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Warehouse[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('warehouses')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data || []) as Warehouse[];
  }

  async findById(id: string, tenantId: string): Promise<Warehouse | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('warehouses')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as Warehouse | null;
  }

  async create(input: WarehouseCreateInput): Promise<Warehouse> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('warehouses')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Warehouse;
  }

  async update(id: string, input: Partial<WarehouseCreateInput>, tenantId: string): Promise<Warehouse> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('warehouses')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data as Warehouse;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('warehouses')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }

  async findEntries(tenantId: string): Promise<WarehouseEntry[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('warehouse_entries')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('received_at', { ascending: false });
    if (error) throw error;
    return (data || []) as WarehouseEntry[];
  }

  async createEntry(input: WarehouseEntryCreateInput): Promise<WarehouseEntry> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('warehouse_entries')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as WarehouseEntry;
  }

  async findIssues(tenantId: string): Promise<WarehouseIssue[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('warehouse_issues')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('issued_at', { ascending: false });
    if (error) throw error;
    return (data || []) as WarehouseIssue[];
  }

  async createIssue(input: WarehouseIssueCreateInput): Promise<WarehouseIssue> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('warehouse_issues')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as WarehouseIssue;
  }

  async findReturns(tenantId: string): Promise<WarehouseReturn[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('warehouse_returns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('returned_at', { ascending: false });
    if (error) throw error;
    return (data || []) as WarehouseReturn[];
  }

  async createReturn(input: WarehouseReturnCreateInput): Promise<WarehouseReturn> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('warehouse_returns')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as WarehouseReturn;
  }
}

export const warehouseRepository = new WarehouseRepository();
