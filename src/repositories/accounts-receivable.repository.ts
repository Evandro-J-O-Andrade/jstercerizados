import { SupabaseRepository } from './supabase.repository';
import type {
  AccountReceivable,
  AccountReceivableCreateInput,
  AccountReceivableUpdateInput,
} from '@/types/domain/finance';

export class AccountsReceivableRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<AccountReceivable[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('accounts_receivable')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []) as AccountReceivable[];
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<AccountReceivable | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('accounts_receivable')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as AccountReceivable | null;
  }

  async create(
    input: AccountReceivableCreateInput,
  ): Promise<AccountReceivable> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      tenant_id: input.tenant_id,
      description: input.description,
      amount: input.amount,
      due_date: input.due_date,
    };

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.received_date !== undefined)
      payload.received_date = input.received_date;
    if (input.status !== undefined) payload.status = input.status;
    if (input.payment_method !== undefined)
      payload.payment_method = input.payment_method;
    if (input.payment_reference !== undefined)
      payload.payment_reference = input.payment_reference;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.created_by !== undefined) payload.created_by = input.created_by;

    const { data, error } = await this.supabase
      .from('accounts_receivable')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as AccountReceivable;
  }

  async update(
    id: string,
    tenantId: string,
    input: AccountReceivableUpdateInput,
  ): Promise<AccountReceivable> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.amount !== undefined) payload.amount = input.amount;
    if (input.due_date !== undefined) payload.due_date = input.due_date;
    if (input.received_date !== undefined)
      payload.received_date = input.received_date;
    if (input.status !== undefined) payload.status = input.status;
    if (input.payment_method !== undefined)
      payload.payment_method = input.payment_method;
    if (input.payment_reference !== undefined)
      payload.payment_reference = input.payment_reference;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('accounts_receivable')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data as AccountReceivable;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('accounts_receivable')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const accountsReceivableRepository = new AccountsReceivableRepository();
