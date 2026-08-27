import { SupabaseRepository } from './supabase.repository';
import type {
  AccountingEntry,
  AccountingEntryCreateInput,
  ChartOfAccount,
  ChartOfAccountCreateInput,
} from '@/types/domain/accounting';

export class AccountingRepository extends SupabaseRepository {
  async findEntries(tenantId: string): Promise<AccountingEntry[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('accounting_entries')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []) as AccountingEntry[];
  }

  async findEntryById(id: string, tenantId: string): Promise<AccountingEntry | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase
      .from('accounting_entries')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as AccountingEntry | null;
  }

  async createEntry(input: AccountingEntryCreateInput): Promise<AccountingEntry> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('accounting_entries')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as AccountingEntry;
  }

  async updateEntry(id: string, input: Partial<AccountingEntryCreateInput>, tenantId: string): Promise<AccountingEntry> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('accounting_entries')
      .update(input)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();
    if (error) throw error;
    return data as AccountingEntry;
  }

  async deleteEntry(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { error } = await this.supabase
      .from('accounting_entries')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    if (error) throw error;
  }

  async findChartOfAccounts(tenantId: string): Promise<ChartOfAccount[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('code', { ascending: true });
    if (error) throw error;
    return (data || []) as ChartOfAccount[];
  }

  async createChartOfAccount(input: ChartOfAccountCreateInput): Promise<ChartOfAccount> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('chart_of_accounts')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as ChartOfAccount;
  }
}

export const accountingRepository = new AccountingRepository();
