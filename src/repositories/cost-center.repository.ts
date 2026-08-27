import { SupabaseRepository } from './supabase.repository';
import type {
  CostCenter,
  CostCenterCreateInput,
  CostCenterUpdateInput,
} from '@/types/domain/finance';

export class CostCenterRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<CostCenter[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('cost_centers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []) as CostCenter[];
  }

  async findById(id: string, tenantId: string): Promise<CostCenter | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('cost_centers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as CostCenter | null;
  }

  async create(input: CostCenterCreateInput): Promise<CostCenter> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      tenant_id: input.tenant_id,
      name: input.name,
    };

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.code !== undefined) payload.code = input.code;
    if (input.parent_id !== undefined) payload.parent_id = input.parent_id;
    if (input.status !== undefined) payload.status = input.status;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('cost_centers')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CostCenter;
  }

  async update(
    id: string,
    tenantId: string,
    input: CostCenterUpdateInput,
  ): Promise<CostCenter> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.name !== undefined) payload.name = input.name;
    if (input.code !== undefined) payload.code = input.code;
    if (input.parent_id !== undefined) payload.parent_id = input.parent_id;
    if (input.status !== undefined) payload.status = input.status;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('cost_centers')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data as CostCenter;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('cost_centers')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const costCenterRepository = new CostCenterRepository();
