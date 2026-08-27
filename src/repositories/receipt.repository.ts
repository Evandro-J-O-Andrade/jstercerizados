import { SupabaseRepository } from './supabase.repository';
import type {
  Receipt,
  ReceiptCreateInput,
  ReceiptUpdateInput,
} from '@/types/domain/finance';

export class ReceiptRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Receipt[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('receipts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('received_date', { ascending: false });

    if (error) throw error;
    return (data || []) as Receipt[];
  }

  async findById(id: string, tenantId: string): Promise<Receipt | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as Receipt | null;
  }

  async create(input: ReceiptCreateInput): Promise<Receipt> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      tenant_id: input.tenant_id,
      amount: input.amount,
      received_date: input.received_date,
    };

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.account_receivable_id !== undefined)
      payload.account_receivable_id = input.account_receivable_id;
    if (input.payment_method !== undefined)
      payload.payment_method = input.payment_method;
    if (input.payment_reference !== undefined)
      payload.payment_reference = input.payment_reference;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('receipts')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as Receipt;
  }

  async update(
    id: string,
    tenantId: string,
    input: ReceiptUpdateInput,
  ): Promise<Receipt> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.account_receivable_id !== undefined)
      payload.account_receivable_id = input.account_receivable_id;
    if (input.amount !== undefined) payload.amount = input.amount;
    if (input.received_date !== undefined)
      payload.received_date = input.received_date;
    if (input.payment_method !== undefined)
      payload.payment_method = input.payment_method;
    if (input.payment_reference !== undefined)
      payload.payment_reference = input.payment_reference;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('receipts')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Receipt;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('receipts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const receiptRepository = new ReceiptRepository();
