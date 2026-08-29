import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompaniesRepository } from './companies.repository';
import type { Company, CompanyCreateInput } from '@/types/domain/company';

function createQueryBuilder(returnValue: { data: any; error: any }) {
  const builder: Record<string, any> = {};
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'in', 'or', 'is', 'order', 'limit', 'range', 'single', 'maybeSingle']) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve: (value: { data: any; error: any }) => void) => resolve(returnValue);
  return builder;
}

const mockSupabase = { from: vi.fn() };

const company: Company = {
  id: 'company-1',
  legal_name: 'Teste LTDA',
  trading_name: 'Teste',
  cnpj: '12345678000100',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('CompaniesRepository — canonical global companies', () => {
  let repository: CompaniesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new CompaniesRepository(mockSupabase as any);
  });

  it('findAll resolves companies through tenant-scoped relationships', async () => {
    const relationships = createQueryBuilder({ data: [{ company_id: 'company-1' }], error: null });
    const companies = createQueryBuilder({ data: [company], error: null });
    mockSupabase.from.mockReturnValueOnce(relationships).mockReturnValueOnce(companies);

    const result = await repository.findAll('tenant-1');

    expect(result).toEqual([company]);
    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'company_relationships');
    expect(relationships.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
    expect(companies.in).toHaveBeenCalledWith('id', ['company-1']);
  });

  it('findAll returns empty when tenant has no active relationships', async () => {
    mockSupabase.from.mockReturnValueOnce(
      createQueryBuilder({ data: [], error: null }),
    );

    expect(await repository.findAll('tenant-1')).toEqual([]);
    expect(mockSupabase.from).toHaveBeenCalledTimes(1);
  });

  it('findAll applies canonical company filters', async () => {
    const relationships = createQueryBuilder({ data: [{ company_id: 'company-1' }], error: null });
    const companies = createQueryBuilder({ data: [company], error: null });
    mockSupabase.from.mockReturnValueOnce(relationships).mockReturnValueOnce(companies);

    await repository.findAll('tenant-1', { status: 'active', search: 'teste' });

    expect(companies.eq).toHaveBeenCalledWith('status', 'active');
    expect(companies.or).toHaveBeenCalledWith(
      'legal_name.ilike.%teste%,trading_name.ilike.%teste%,cnpj.ilike.%teste%',
    );
  });

  it('findById validates the tenant relationship before reading the global company', async () => {
    const relationship = createQueryBuilder({ data: { company_id: 'company-1' }, error: null });
    const companies = createQueryBuilder({ data: company, error: null });
    mockSupabase.from.mockReturnValueOnce(relationship).mockReturnValueOnce(companies);

    expect(await repository.findById('company-1', 'tenant-1')).toEqual(company);
    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'company_relationships');
    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'companies');
    expect(companies.eq).toHaveBeenCalledWith('id', 'company-1');
  });

  it('findById returns null when the tenant has no active relationship', async () => {
    mockSupabase.from.mockReturnValueOnce(
      createQueryBuilder({ data: null, error: null }),
    );

    expect(await repository.findById('company-1', 'tenant-2')).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledTimes(1);
  });

  it('create inserts the global company without tenant_id, then creates the relationship', async () => {
    const companyInsert = createQueryBuilder({ data: company, error: null });
    const relationshipInsert = createQueryBuilder({ data: { id: 'rel-1' }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(companyInsert)
      .mockReturnValueOnce(relationshipInsert);

    const input: CompanyCreateInput = {
      tenant_id: 'tenant-1',
      relationship_type_id: 'relationship-client',
      legal_name: 'Teste LTDA',
      trading_name: 'Teste',
      cnpj: '12345678000100',
    };

    expect(await repository.create(input)).toEqual(company);
    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'companies');
    expect(companyInsert.insert).toHaveBeenCalledWith({
      legal_name: 'Teste LTDA',
      trading_name: 'Teste',
      cnpj: '12345678000100',
    });
    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'company_relationships');
    expect(relationshipInsert.insert).toHaveBeenCalledWith({
      company_id: 'company-1',
      tenant_id: 'tenant-1',
      relationship_type_id: 'relationship-client',
      status: 'active',
    });
  });

  it('create does not add tenant_id to the companies payload', async () => {
    const companyInsert = createQueryBuilder({ data: company, error: null });
    const typeQuery = createQueryBuilder({ data: { id: 'relationship-client' }, error: null });
    const relationshipInsert = createQueryBuilder({ data: { id: 'rel-1' }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(companyInsert)
      .mockReturnValueOnce(typeQuery)
      .mockReturnValueOnce(relationshipInsert);

    await repository.create({ tenant_id: 'tenant-1', legal_name: 'Teste LTDA' });

    expect(companyInsert.insert.mock.calls[0][0]).not.toHaveProperty('tenant_id');
  });

  it('update checks tenant relationship and updates only the global company', async () => {
    const relationship = createQueryBuilder({ data: { company_id: 'company-1' }, error: null });
    const existing = createQueryBuilder({ data: company, error: null });
    const update = createQueryBuilder({ data: { ...company, legal_name: 'Atualizada LTDA' }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(relationship)
      .mockReturnValueOnce(existing)
      .mockReturnValueOnce(update);

    const result = await repository.update('company-1', 'tenant-1', {
      legal_name: 'Atualizada LTDA',
      tenant_id: 'tenant-2',
    });

    expect(result?.legal_name).toBe('Atualizada LTDA');
    expect(update.update).toHaveBeenCalledWith({ legal_name: 'Atualizada LTDA' });
    expect(update.update.mock.calls[0][0]).not.toHaveProperty('tenant_id');
  });

  it('delete deactivates only the tenant relationship and never deletes the global company', async () => {
    const relationshipUpdate = createQueryBuilder({ data: null, error: null });
    mockSupabase.from.mockReturnValueOnce(relationshipUpdate);

    await expect(repository.delete('company-1', 'tenant-1')).resolves.toBeUndefined();
    expect(mockSupabase.from).toHaveBeenCalledWith('company_relationships');
    expect(relationshipUpdate.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'inactive' }));
    expect(relationshipUpdate.delete).not.toHaveBeenCalled();
  });

  it('propagates Supabase errors from the relationship lookup', async () => {
    const error = new Error('relationship query failed');
    mockSupabase.from.mockReturnValueOnce(createQueryBuilder({ data: null, error }));

    await expect(repository.findAll('tenant-1')).rejects.toThrow('relationship query failed');
  });

  it('never queries companies.tenant_id', async () => {
    const relationships = createQueryBuilder({ data: [{ company_id: 'company-1' }], error: null });
    const companies = createQueryBuilder({ data: [company], error: null });
    mockSupabase.from.mockReturnValueOnce(relationships).mockReturnValueOnce(companies);

    await repository.findAll('tenant-1');

    expect(companies.eq.mock.calls.flat()).not.toContain('tenant_id');
    expect(companies.in).toHaveBeenCalledWith('id', ['company-1']);
  });
});
