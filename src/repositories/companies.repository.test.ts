import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompaniesRepository } from './companies.repository';
import type {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
} from '@/types/domain/company';

function createQueryBuilder(returnValue: { data: any; error: any }) {
  const builder: Record<string, any> = () => builder;
  builder.select = () => builder;
  builder.insert = () => builder;
  builder.update = () => builder;
  builder.delete = () => builder;
  builder.eq = () => builder;
  builder.neq = () => builder;
  builder.or = () => builder;
  builder.in = () => builder;
  builder.is = () => builder;
  builder.order = () => builder;
  builder.limit = () => builder;
  builder.range = () => builder;
  builder.single = () => builder;
  builder.maybeSingle = () => builder;
  builder.then = (resolve: (value: { data: any; error: any }) => void) =>
    resolve(returnValue);
  return builder;
}

const defaultCompanyBuilder = createQueryBuilder({
  data: [],
  error: null,
});
const defaultRelationshipBuilder = createQueryBuilder({
  data: null,
  error: null,
});

const mockSupabase = {
  from: vi.fn((table: string) => {
    if (table === 'company_relationships') {
      return defaultRelationshipBuilder;
    }
    return defaultCompanyBuilder;
  }),
};

describe('CompaniesRepository', () => {
  let repository: CompaniesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    defaultCompanyBuilder.select = () => defaultCompanyBuilder;
    defaultCompanyBuilder.eq = () => defaultCompanyBuilder;
    defaultCompanyBuilder.in = () => defaultCompanyBuilder;
    defaultCompanyBuilder.or = () => defaultCompanyBuilder;
    defaultCompanyBuilder.order = () => defaultCompanyBuilder;
    defaultCompanyBuilder.maybeSingle = () => defaultCompanyBuilder;
    defaultCompanyBuilder.single = () => defaultCompanyBuilder;
    defaultCompanyBuilder.then = (resolve: any) =>
      resolve({ data: [], error: null });

    defaultRelationshipBuilder.select = () => defaultRelationshipBuilder;
    defaultRelationshipBuilder.eq = () => defaultRelationshipBuilder;
    defaultRelationshipBuilder.maybeSingle = () => defaultRelationshipBuilder;
    defaultRelationshipBuilder.then = (resolve: any) =>
      resolve({ data: null, error: null });

    repository = new CompaniesRepository(mockSupabase as any);
  });

  describe('findAll', () => {
    it('should return companies for tenant', async () => {
      const mockCompanies: Company[] = [
        {
          id: 'comp-1',
          name: 'Empresa Teste',
          trading_name: 'Teste LTDA',
          cnpj: '12345678000100',
          status: 'active',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ];

      defaultCompanyBuilder.then = (resolve: any) =>
        resolve({ data: mockCompanies, error: null });

      const result = await repository.findAll('tenant-1');
      expect(result).toEqual(mockCompanies);
      expect(mockSupabase.from).toHaveBeenCalledWith('companies');
    });

    it('should return empty array when no companies exist', async () => {
      defaultCompanyBuilder.then = (resolve: any) =>
        resolve({ data: [], error: null });

      const result = await repository.findAll('tenant-1');
      expect(result).toEqual([]);
    });

    it('should filter by status', async () => {
      const companyBuilder = createQueryBuilder({ data: [], error: null });
      const eqSpy = vi.fn(() => companyBuilder);
      companyBuilder.eq = eqSpy;
      companyBuilder.select = () => companyBuilder;
      companyBuilder.in = () => companyBuilder;
      companyBuilder.or = () => companyBuilder;
      companyBuilder.order = () => companyBuilder;
      companyBuilder.maybeSingle = () => companyBuilder;
      companyBuilder.then = (resolve: any) =>
        resolve({ data: [], error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'companies') return companyBuilder;
        return defaultRelationshipBuilder;
      });

      await repository.findAll('tenant-1', { status: 'active' });
      expect(eqSpy).toHaveBeenCalledWith('status', 'active');
    });

    it('should search by name or document', async () => {
      const companyBuilder = createQueryBuilder({ data: [], error: null });
      const orSpy = vi.fn(() => companyBuilder);
      companyBuilder.or = orSpy;
      companyBuilder.select = () => companyBuilder;
      companyBuilder.eq = () => companyBuilder;
      companyBuilder.in = () => companyBuilder;
      companyBuilder.order = () => companyBuilder;
      companyBuilder.maybeSingle = () => companyBuilder;
      companyBuilder.then = (resolve: any) =>
        resolve({ data: [], error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'companies') return companyBuilder;
        return defaultRelationshipBuilder;
      });

      await repository.findAll('tenant-1', { search: 'teste' });
      expect(orSpy).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a company when found for tenant', async () => {
      const mockCompany: Company = {
        id: 'comp-1',
        name: 'Empresa Teste',
        trading_name: 'Teste LTDA',
        cnpj: '12345678000100',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const companyBuilder = createQueryBuilder({
        data: mockCompany,
        error: null,
      });
      const relBuilder = createQueryBuilder({
        data: { company_id: 'comp-1' },
        error: null,
      });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'companies') return companyBuilder;
        return relBuilder;
      });

      const result = await repository.findById('comp-1', 'tenant-1');
      expect(result).toEqual(mockCompany);
    });

    it('should return null when company not found for tenant', async () => {
      const companyBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn(() => companyBuilder);

      const result = await repository.findById('comp-999', 'tenant-1');
      expect(result).toBeNull();
    });

    it('should return null when relationship does not exist', async () => {
      const companyBuilder = createQueryBuilder({
        data: { id: 'comp-1', tenant_id: 'tenant-1' },
        error: null,
      });
      const relBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'companies') return companyBuilder;
        return relBuilder;
      });

      const result = await repository.findById('comp-1', 'tenant-1');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a company with tenant_id and relationship', async () => {
      const input: CompanyCreateInput = {
        name: 'Empresa Teste',
        trading_name: 'Teste LTDA',
        cnpj: '12345678000100',
        status: 'active',
      };

      const mockCompany: Company = {
        id: 'comp-new',
        name: 'Empresa Teste',
        trading_name: 'Teste LTDA',
        cnpj: '12345678000100',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const companyInsertBuilder = createQueryBuilder({
        data: mockCompany,
        error: null,
      });
      const relInsertBuilder = createQueryBuilder({
        data: null,
        error: null,
      });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'companies') return companyInsertBuilder;
        return relInsertBuilder;
      });

      const result = await repository.create(input, 'tenant-1');
      expect(result).toEqual(mockCompany);
    });

    it('should throw raw Supabase error when cnpj already exists', async () => {
      const input: CompanyCreateInput = {
        name: 'Empresa Teste',
        trading_name: 'Teste LTDA',
        cnpj: '12345678000100',
        status: 'active',
      };

      const companyInsertBuilder = createQueryBuilder({
        data: null,
        error: {
          code: '23505',
          message:
            'duplicate key value violates unique constraint "companies_cnpj_key"',
        },
      });

      mockSupabase.from = vi.fn(() => companyInsertBuilder);

      await expect(repository.create(input, 'tenant-1')).rejects.toThrow(
        'duplicate key value violates unique constraint "companies_cnpj_key"',
      );
    });
  });

  describe('update', () => {
    it('should update a company when found for tenant', async () => {
      const input: CompanyUpdateInput = {
        name: 'Empresa Atualizada',
      };

      const mockCompany: Company = {
        id: 'comp-1',
        name: 'Empresa Atualizada',
        trading_name: 'Teste LTDA',
        cnpj: '12345678000100',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      const companyBuilder = createQueryBuilder({
        data: { id: 'comp-1', tenant_id: 'tenant-1' },
        error: null,
      });
      const companyUpdateBuilder = createQueryBuilder({
        data: mockCompany,
        error: null,
      });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'companies') return companyUpdateBuilder;
        return companyBuilder;
      });

      const result = await repository.update('comp-1', 'tenant-1', input);
      expect(result).toEqual(mockCompany);
    });

    it('should return null when company not found for tenant', async () => {
      const companyBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn(() => companyBuilder);

      const result = await repository.update('comp-999', 'tenant-1', {
        name: 'Teste',
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove company when found for tenant', async () => {
      const companyBuilder = createQueryBuilder({
        data: { id: 'comp-1' },
        error: null,
      });
      const relBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'companies') return companyBuilder;
        return relBuilder;
      });

      const result = await repository.delete('comp-1', 'tenant-1');
      expect(result).toBeUndefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('company_relationships');
    });

    it('should return undefined when company not found for tenant', async () => {
      const companyBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn(() => companyBuilder);

      const result = await repository.delete('comp-999', 'tenant-1');
      expect(result).toBeUndefined();
    });
  });
});
