import { SupabaseRepository } from './supabase.repository';
import type {
  BankAccount,
  BankAccountCreateInput,
  BankAccountUpdateInput,
} from '@/types/domain/finance';

export class BankAccountRepository extends SupabaseRepository {
  async findAll(tenantId: string): Promise<BankAccount[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('bank_accounts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('bank', { ascending: true });

    if (error) throw error;
    return (data || []) as BankAccount[];
  }

  async findById(id: string, tenantId: string): Promise<BankAccount | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data as BankAccount | null;
  }

  async create(input: BankAccountCreateInput): Promise<BankAccount> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {
      tenant_id: input.tenant_id,
      bank: input.bank,
    };

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.agency !== undefined) payload.agency = input.agency;
    if (input.account_number !== undefined)
      payload.account_number = input.account_number;
    if (input.account_type !== undefined)
      payload.account_type = input.account_type;
    if (input.current_balance !== undefined)
      payload.current_balance = input.current_balance;
    if (input.available_balance !== undefined)
      payload.available_balance = input.available_balance;
    if (input.status !== undefined) payload.status = input.status;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('bank_accounts')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as BankAccount;
  }

  async update(
    id: string,
    tenantId: string,
    input: BankAccountUpdateInput,
  ): Promise<BankAccount> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const payload: Record<string, unknown> = {};

    if (input.company_id !== undefined) payload.company_id = input.company_id;
    if (input.bank !== undefined) payload.bank = input.bank;
    if (input.agency !== undefined) payload.agency = input.agency;
    if (input.account_number !== undefined)
      payload.account_number = input.account_number;
    if (input.account_type !== undefined)
      payload.account_type = input.account_type;
    if (input.current_balance !== undefined)
      payload.current_balance = input.current_balance;
    if (input.available_balance !== undefined)
      payload.available_balance = input.available_balance;
    if (input.status !== undefined) payload.status = input.status;
    if (input.notes !== undefined) payload.notes = input.notes;

    const { data, error } = await this.supabase
      .from('bank_accounts')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data as BankAccount;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const bankAccountRepository = new BankAccountRepository();
