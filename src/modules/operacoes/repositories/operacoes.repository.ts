import { SupabaseRepository } from '@/repositories/supabase.repository';
import type { WorkOrder, WorkOrderAssignment } from '@/types/domain/service';

export class OperacoesRepository extends SupabaseRepository {
  async findWorkOrders(tenantId: string): Promise<WorkOrder[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('work_orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as WorkOrder[];
  }

  async createWorkOrder(
    tenantId: string,
    input: Omit<WorkOrder, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>,
  ): Promise<WorkOrder> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('work_orders')
      .insert({ ...input, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;
    return data as WorkOrder;
  }

  async updateWorkOrder(
    tenantId: string,
    id: string,
    input: Partial<WorkOrder>,
  ): Promise<WorkOrder> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('work_orders')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as WorkOrder;
  }

  async deleteWorkOrder(tenantId: string, id: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('work_orders')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }

  async findWorkOrderAssignments(
    tenantId: string,
    workOrderId: string,
  ): Promise<WorkOrderAssignment[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('work_order_assignments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('work_order_id', workOrderId)
      .order('assigned_at', { ascending: true });
    if (error) throw error;
    return (data || []) as WorkOrderAssignment[];
  }

  async createWorkOrderAssignment(
    tenantId: string,
    input: Omit<WorkOrderAssignment, 'id' | 'tenant_id' | 'created_at'>,
  ): Promise<WorkOrderAssignment> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('work_order_assignments')
      .insert({ ...input, tenant_id: tenantId })
      .select()
      .single();
    if (error) throw error;
    return data as WorkOrderAssignment;
  }

  async updateWorkOrderAssignment(
    tenantId: string,
    id: string,
    input: Partial<WorkOrderAssignment>,
  ): Promise<WorkOrderAssignment> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('work_order_assignments')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data as WorkOrderAssignment;
  }

  async deleteWorkOrderAssignment(
    tenantId: string,
    id: string,
  ): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('work_order_assignments')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }
}

export const operacoesRepository = new OperacoesRepository();
