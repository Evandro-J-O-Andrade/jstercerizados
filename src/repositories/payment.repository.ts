import { SupabaseRepository } from './supabase.repository';
import type {
  Payment,
  PaymentCreateInput,
  PaymentUpdateInput,
} from '@/types/domain/finance';

export class PaymentRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<Payment[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return (data || []) as Payment[];
  }

  async findById(id: string, tenantId: string): Promise<Payment | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as Payment | null;
  }

  async create(input: PaymentCreateInput): Promise<Payment> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      tenant_id: input.tenant_id,
      amount: input.amount,
      payment_date: input.payment_date,
    };

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.account_payable_id !== undefined)
      payload.account_payable_id = input.account_payable_id;
    if (input.payment_method !== undefined)
      payload.payment_method = input.payment_method;
    if (input.payment_reference !== undefined)
      payload.payment_reference = input.payment_reference;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('payments')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as Payment;
  }

  async update(
    id: string,
    tenantId: string,
    input: PaymentUpdateInput,
  ): Promise<Payment> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.account_payable_id !== undefined)
      payload.account_payable_id = input.account_payable_id;
    if (input.amount !== undefined) payload.amount = input.amount;
    if (input.payment_date !== undefined)
      payload.payment_date = input.payment_date;
    if (input.payment_method !== undefined)
      payload.payment_method = input.payment_method;
    if (input.payment_reference !== undefined)
      payload.payment_reference = input.payment_reference;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('payments')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Payment;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const paymentRepository = new PaymentRepository();
