import { SupabaseRepository } from './supabase.repository';
import type {
  Company,
  CompanySocials,
  CompanyCreateInput,
  CompanyUpdateInput,
} from '@/types/domain/company';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type RelationshipType = 'client' | 'partner' | 'supplier';

export type PublicSocials = {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  [platform: string]: string | undefined;
};

export interface PublicCompanyByType {
  company_id: string;
  company_name: string;
  legal_name: string | null;
  trading_name: string | null;
  logo_url: string | null;
  image_url: string | null;
  description: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  company_status: string;
  relationship_id: string;
  relationship_status: string;
  relationship_type: RelationshipType;
  relationship_type_name: string;
  relationship_metadata: {
    description?: string;
    website?: string;
    hero_image_url?: string;
    [key: string]: unknown;
  } | null;
  relationship_started_at: string | null;
  socials: PublicSocials | null;
}

export class CompaniesRepository extends SupabaseRepository {
  private async loadSocials(
    companyIds: string[],
  ): Promise<Record<string, CompanySocials>> {
    if (!this.supabase || companyIds.length === 0) return {};

    const { data, error } = await this.supabase
      .from('company_social_links')
      .select('company_id, platform, url')
      .in('company_id', companyIds)
      .eq('status', 'active');

    if (error || !data) return {};

    const grouped: Record<string, CompanySocials> = {};
    for (const row of data as Array<{
      company_id: string;
      platform: string;
      url: string | null;
    }>) {
      if (!grouped[row.company_id]) grouped[row.company_id] = {};
      if (row.url) {
        const platform = row.platform.toLowerCase() as keyof CompanySocials;
        grouped[row.company_id][platform] = row.url;
      }
    }
    return grouped;
  }

  async findAllPublic(): Promise<Company[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    const companies = data || [];

    const socialsMap = await this.loadSocials(companies.map((c) => c.id));

    return companies.map((c) => ({
      ...c,
      socials: socialsMap[c.id] || null,
    })) as Company[];
  }

  async findBySlug(slug: string): Promise<Company | null> {
    if (!this.supabase) return null;

    const all = await this.findAllPublic();
    const match = all.find((c) => toSlug(c.name) === slug || c.id === slug);
    return match || null;
  }

  /**
   * Fetch active companies filtered by their commercial relationship type
   * (customer / partner / supplier) using the public read-only view
   * `public_companies_by_type`.
   *
   * Returns rows already joined with relationship metadata, ready to be mapped
   * to `ClientVisual` (or future `PartnerVisual`/`SupplierVisual`).
   *
   * Public/anonymous access is allowed because the view runs with
   * security_invoker=false; underlying tables keep their tenant-scoped RLS.
   */
  async findPublicByRelationshipType(
    type: RelationshipType,
  ): Promise<PublicCompanyByType[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('public_companies_by_type')
      .select('*')
      .eq('relationship_type', type)
      .order('company_name', { ascending: true });

    if (error) throw error;
    return (data || []) as PublicCompanyByType[];
  }

  async findAll(
    tenantId: string,
    filters?: { status?: string; search?: string },
  ): Promise<Company[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('companies')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search)
      query = query.or(
        `name.ilike.%${filters.search}%,trading_name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`,
      );

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Company | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: relationship, error: relError } = await this.supabase
      .from('company_relationships')
      .select('company_id')
      .eq('company_id', id)
      .eq('relationship_type', 'client')
      .eq('status', 'active')
      .maybeSingle();

    if (relError) throw relError;
    if (!relationship) return null;

    return data as Company;
  }

  async create(input: CompanyCreateInput, tenantId: string): Promise<Company> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data: company, error: companyError } = await this.supabase
      .from('companies')
      .insert({
        tenant_id: tenantId,
        name: input.name,
        trading_name: input.trading_name ?? null,
        cnpj: input.cnpj ?? null,
        status: input.status ?? 'active',
      })
      .select('*')
      .single();

    if (companyError) throw companyError;

    const { error: relError } = await this.supabase
      .from('company_relationships')
      .insert({
        company_id: company.id,
        relationship_type: 'client',
        status: 'active',
      });

    if (relError) throw relError;

    return company as Company;
  }

  async update(
    id: string,
    tenantId: string,
    input: CompanyUpdateInput,
  ): Promise<Company> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data: existing, error: findError } = await this.supabase
      .from('companies')
      .select('id, tenant_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return null as any;

    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.trading_name !== undefined)
      payload.trading_name = input.trading_name;
    if (input.cnpj !== undefined) payload.cnpj = input.cnpj;
    if (input.status !== undefined) payload.status = input.status;

    const { data, error } = await this.supabase
      .from('companies')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Company;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data: existing, error: findError } = await this.supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return;

    const { error } = await this.supabase
      .from('company_relationships')
      .delete()
      .eq('company_id', id)
      .eq('relationship_type', 'client');
    if (error) throw error;
  }
}

export const companiesRepository = new CompaniesRepository();
