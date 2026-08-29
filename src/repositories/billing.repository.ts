import { SupabaseRepository } from './supabase.repository';
import type {
  Invoice,
  InvoiceCreateInput,
  Sale,
  SaleCreateInput,
  Quote,
  QuoteCreateInput,
} from '@/types/domain/billing';

export class BillingRepository extends SupabaseRepository {
  async findInvoices(tenantId: string): Promise<Invoice[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('issue_date', { ascending: false });
    if (error) throw error;
    return (data || []) as Invoice[];
  }

  async createInvoice(input: InvoiceCreateInput): Promise<Invoice> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('invoices')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Invoice;
  }

  async findSales(tenantId: string): Promise<Sale[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('sales')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('issue_date', { ascending: false });
    if (error) throw error;
    return (data || []) as Sale[];
  }

  async createSale(input: SaleCreateInput): Promise<Sale> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('sales')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Sale;
  }

  async findQuotes(tenantId: string): Promise<Quote[]> {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('quotes')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Quote[];
  }

  async createQuote(input: QuoteCreateInput): Promise<Quote> {
    if (!this.supabase) throw new Error('Supabase não configurado');
    const { data, error } = await this.supabase
      .from('quotes')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Quote;
  }
}

export const billingRepository = new BillingRepository();
