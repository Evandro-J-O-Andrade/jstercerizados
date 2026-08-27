import { SupabaseRepository } from './supabase.repository';
import type {
  CashFlow,
  CashFlowCreateInput,
  CashFlowUpdateInput,
} from '@/types/domain/finance';

export class CashFlowRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<CashFlow[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('cash_flows')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []) as CashFlow[];
  }

  async findById(id: string, tenantId: string): Promise<CashFlow | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('cash_flows')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as CashFlow | null;
  }

  async create(input: CashFlowCreateInput): Promise<CashFlow> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      tenant_id: input.tenant_id,
      type: input.type,
      amount: input.amount,
      date: input.date,
    };

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.category !== undefined) payload.category = input.category;
    if (input.subcategory !== undefined)
      payload.subcategory = input.subcategory;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.reference !== undefined) payload.reference = input.reference;
    if (input.related_account_payable_id !== undefined)
      payload.related_account_payable_id = input.related_account_payable_id;
    if (input.related_account_receivable_id !== undefined)
      payload.related_account_receivable_id =
        input.related_account_receivable_id;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('cash_flows')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as CashFlow;
  }

  async update(
    id: string,
    tenantId: string,
    input: CashFlowUpdateInput,
  ): Promise<CashFlow> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.type !== undefined) payload.type = input.type;
    if (input.amount !== undefined) payload.amount = input.amount;
    if (input.date !== undefined) payload.date = input.date;
    if (input.category !== undefined) payload.category = input.category;
    if (input.subcategory !== undefined)
      payload.subcategory = input.subcategory;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.reference !== undefined) payload.reference = input.reference;
    if (input.related_account_payable_id !== undefined)
      payload.related_account_payable_id = input.related_account_payable_id;
    if (input.related_account_receivable_id !== undefined)
      payload.related_account_receivable_id =
        input.related_account_receivable_id;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('cash_flows')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data as CashFlow;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('cash_flows')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  async getKPIs(tenantId: string) {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('financial_kpis')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;

    return (
      data ?? {
        total_credit: 0,
        total_debit: 0,
        balance: 0,
      }
    );
  }
}

export const cashFlowRepository = new CashFlowRepository();
