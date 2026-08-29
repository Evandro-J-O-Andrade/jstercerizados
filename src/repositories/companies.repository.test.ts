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

const defaultRelationshipBuilder = createQueryBuilder({
  data: [],
  error: null,
});
const defaultCompanyBuilder = createQueryBuilder({
  data: [],
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
    defaultRelationshipBuilder.select = () => defaultRelationshipBuilder;
    defaultRelationshipBuilder.eq = () => defaultRelationshipBuilder;
    defaultRelationshipBuilder.maybeSingle = () => defaultRelationshipBuilder;
    defaultRelationshipBuilder.limit = () => defaultRelationshipBuilder;
    defaultRelationshipBuilder.then = (resolve: any) =>
      resolve({ data: [], error: null });

    defaultCompanyBuilder.select = () => defaultCompanyBuilder;
    defaultCompanyBuilder.eq = () => defaultCompanyBuilder;
    defaultCompanyBuilder.in = () => defaultCompanyBuilder;
    defaultCompanyBuilder.or = () => defaultCompanyBuilder;
    defaultCompanyBuilder.order = () => defaultCompanyBuilder;
    defaultCompanyBuilder.maybeSingle = () => defaultCompanyBuilder;
    defaultCompanyBuilder.single = () => defaultCompanyBuilder;
    defaultCompanyBuilder.then = (resolve: any) =>
      resolve({ data: [], error: null });

    repository = new CompaniesRepository(mockSupabase as any);
  });

  describe('findAll', () => {
    it('should return companies scoped by tenant via company_relationships', async () => {
      const mockRelationships = [
        { company_id: 'comp-1' },
        { company_id: 'comp-2' },
      ];
      const mockCompanies: Company[] = [
        {
          id: 'comp-1',
          name: 'Empresa Teste',
          legal_name: 'Teste LTDA',
          document: '12345678000100',
          status: 'active',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'comp-2',
          name: 'Empresa B',
          legal_name: null,
          document: null,
          status: 'inactive',
          created_at: '2026-01-02T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ];

      defaultRelationshipBuilder.then = (resolve: any) =>
        resolve({ data: mockRelationships, error: null });
      defaultCompanyBuilder.then = (resolve: any) =>
        resolve({ data: mockCompanies, error: null });

      const result = await repository.findAll('tenant-1');
      expect(result).toEqual(mockCompanies);
    });

    it('should return empty array when no relationships exist', async () => {
      defaultRelationshipBuilder.then = (resolve: any) =>
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

      defaultRelationshipBuilder.then = (resolve: any) =>
        resolve({ data: [{ company_id: 'comp-1' }], error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'company_relationships') {
          return defaultRelationshipBuilder;
        }
        return companyBuilder;
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

      defaultRelationshipBuilder.then = (resolve: any) =>
        resolve({ data: [{ company_id: 'comp-1' }], error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'company_relationships') {
          return defaultRelationshipBuilder;
        }
        return companyBuilder;
      });

      await repository.findAll('tenant-1', { search: 'teste' });
      expect(orSpy).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a company when relationship exists', async () => {
      const mockCompany: Company = {
        id: 'comp-1',
        name: 'Empresa Teste',
        legal_name: 'Teste LTDA',
        document: '12345678000100',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const relBuilder = createQueryBuilder({
        data: { company_id: 'comp-1' },
        error: null,
      });
      const companyBuilder = createQueryBuilder({
        data: mockCompany,
        error: null,
      });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'company_relationships') return relBuilder;
        return companyBuilder;
      });

      const result = await repository.findById('comp-1', 'tenant-1');
      expect(result).toEqual(mockCompany);
    });

    it('should return null when relationship does not exist', async () => {
      const relBuilder = createQueryBuilder({ data: null, error: null });
      const companyBuilder = createQueryBuilder({
        data: null,
        error: null,
      });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'company_relationships') return relBuilder;
        return companyBuilder;
      });

      const result = await repository.findById('comp-999', 'tenant-1');
      expect(result).toBeNull();
    });

    it('should return null when company not found after relationship check', async () => {
      const relBuilder = createQueryBuilder({
        data: { company_id: 'comp-1' },
        error: null,
      });
      const companyBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'company_relationships') return relBuilder;
        return companyBuilder;
      });

      const result = await repository.findById('comp-1', 'tenant-1');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a company without tenant_id and create relationship', async () => {
      const input: CompanyCreateInput = {
        name: 'Empresa Teste',
        legal_name: 'Teste LTDA',
        document: '12345678000100',
        status: 'active',
      };

      const mockCompany: Company = {
        id: 'comp-new',
        name: 'Empresa Teste',
        legal_name: 'Teste LTDA',
        document: '12345678000100',
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

    it('should throw raw Supabase error when document already exists', async () => {
      const input: CompanyCreateInput = {
        name: 'Empresa Teste',
        legal_name: 'Teste LTDA',
        document: '12345678000100',
        status: 'active',
      };

      const companyInsertBuilder = createQueryBuilder({
        data: null,
        error: {
          code: '23505',
          message:
            'duplicate key value violates unique constraint "companies_document_key"',
        },
      });

      mockSupabase.from = vi.fn(() => companyInsertBuilder);

      await expect(repository.create(input, 'tenant-1')).rejects.toThrow(
        'duplicate key value violates unique constraint "companies_document_key"',
      );
    });
  });

  describe('update', () => {
    it('should update a company when relationship exists', async () => {
      const input: CompanyUpdateInput = {
        name: 'Empresa Atualizada',
      };

      const mockCompany: Company = {
        id: 'comp-1',
        name: 'Empresa Atualizada',
        legal_name: 'Teste LTDA',
        document: '12345678000100',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      const relBuilder = createQueryBuilder({
        data: { company_id: 'comp-1' },
        error: null,
      });
      const companyUpdateBuilder = createQueryBuilder({
        data: mockCompany,
        error: null,
      });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'company_relationships') return relBuilder;
        return companyUpdateBuilder;
      });

      const result = await repository.update('comp-1', 'tenant-1', input);
      expect(result).toEqual(mockCompany);
    });

    it('should return null when relationship does not exist', async () => {
      const relBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn(() => relBuilder);

      const result = await repository.update('comp-999', 'tenant-1', {
        name: 'Teste',
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove company_relationships for the tenant', async () => {
      const relBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn(() => relBuilder);

      const result = await repository.delete('comp-1', 'tenant-1');
      expect(result).toBeUndefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('company_relationships');
    });

    it('should return undefined when relationship does not exist', async () => {
      const relBuilder = createQueryBuilder({ data: null, error: null });

      mockSupabase.from = vi.fn(() => relBuilder);

      const result = await repository.delete('comp-999', 'tenant-1');
      expect(result).toBeUndefined();
    });
  });

  describe('tenant scoping', () => {
    it('should query company_relationships for tenant scoping', async () => {
      const relBuilder = createQueryBuilder({ data: [], error: null });
      const eqSpy = vi.fn(() => relBuilder);
      relBuilder.eq = eqSpy;
      relBuilder.select = () => relBuilder;
      relBuilder.maybeSingle = () => relBuilder;
      relBuilder.limit = () => relBuilder;
      relBuilder.then = (resolve: any) => resolve({ data: [], error: null });

      const companyBuilder = createQueryBuilder({ data: [], error: null });
      companyBuilder.select = () => companyBuilder;
      companyBuilder.in = () => companyBuilder;
      companyBuilder.eq = () => companyBuilder;
      companyBuilder.order = () => companyBuilder;
      companyBuilder.maybeSingle = () => companyBuilder;
      companyBuilder.then = (resolve: any) =>
        resolve({ data: [], error: null });

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'company_relationships') return relBuilder;
        return companyBuilder;
      });

      await repository.findAll('tenant-1');
      expect(eqSpy).toHaveBeenCalledWith('tenant_id', 'tenant-1');
    });
  });
});
