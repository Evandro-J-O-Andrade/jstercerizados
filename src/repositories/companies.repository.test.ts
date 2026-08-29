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

const mockSupabase = {
  from: vi.fn(() => createQueryBuilder({ data: null, error: null })),
};

describe('CompaniesRepository', () => {
  let repository: CompaniesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new CompaniesRepository(mockSupabase as any);
  });

  describe('findAll', () => {
    it('should return companies scoped by tenant_id', async () => {
      const mockCompanies: Company[] = [
        {
          id: '1',
          tenant_id: 'tenant-1',
          legal_name: 'Empresa Teste',
          trading_name: 'Teste',
          cnpj: '12345678000100',
          status: 'active',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: mockCompanies, error: null }),
      );

      const result = await repository.findAll('tenant-1');
      expect(result).toEqual(mockCompanies);
    });

    it('should filter by status', async () => {
      const builder = createQueryBuilder({ data: [], error: null });
      const eqSpy = vi.fn(() => builder);
      builder.eq = eqSpy;

      mockSupabase.from.mockReturnValueOnce(builder);

      await repository.findAll('tenant-1', { status: 'active' });
      expect(eqSpy).toHaveBeenCalledWith('status', 'active');
    });

    it('should search by legal_name or cnpj', async () => {
      const builder = createQueryBuilder({ data: [], error: null });
      const orSpy = vi.fn(() => builder);
      builder.or = orSpy;

      mockSupabase.from.mockReturnValueOnce(builder);

      await repository.findAll('tenant-1', { search: 'teste' });
      expect(orSpy).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a company by id and tenant_id', async () => {
      const mockCompany: Company = {
        id: '1',
        tenant_id: 'tenant-1',
        legal_name: 'Empresa Teste',
        trading_name: 'Teste',
        cnpj: '12345678000100',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: mockCompany, error: null }),
      );

      const result = await repository.findById('1', 'tenant-1');
      expect(result).toEqual(mockCompany);
    });

    it('should return null when company not found', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      );

      const result = await repository.findById('999', 'tenant-1');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a company with tenant_id', async () => {
      const input: CompanyCreateInput = {
        tenant_id: 'tenant-1',
        legal_name: 'Empresa Teste',
        trading_name: 'Teste',
        cnpj: '12345678000100',
        status: 'active',
      };

      const mockCompany: Company = {
        id: '1',
        ...input,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: mockCompany, error: null }),
      );

      const result = await repository.create(input);
      expect(result).toEqual(mockCompany);
    });

    it('should throw raw Supabase error when cnpj already exists', async () => {
      const input: CompanyCreateInput = {
        tenant_id: 'tenant-1',
        legal_name: 'Empresa Teste',
        trading_name: 'Teste',
        cnpj: '12345678000100',
        status: 'active',
      };

      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({
          data: null,
          error: {
            code: '23505',
            message:
              'duplicate key value violates unique constraint "companies_cnpj_key"',
          },
        }),
      );

      await expect(repository.create(input)).rejects.toThrow(
        'duplicate key value violates unique constraint "companies_cnpj_key"',
      );
    });
  });

  describe('update', () => {
    it('should update a company preserving tenant_id', async () => {
      const input: CompanyUpdateInput = {
        legal_name: 'Empresa Atualizada',
      };

      const mockCompany: Company = {
        id: '1',
        tenant_id: 'tenant-1',
        legal_name: 'Empresa Atualizada',
        trading_name: 'Teste',
        cnpj: '12345678000100',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: mockCompany, error: null }),
      );

      const result = await repository.update('1', 'tenant-1', input);
      expect(result).toEqual(mockCompany);
    });

    it('should return null when updating non-existent company', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      );

      const result = await repository.update('999', 'tenant-1', {
        legal_name: 'Teste',
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a company', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: { id: '1' }, error: null }),
      );

      const result = await repository.delete('1', 'tenant-1');
      expect(result).toBeUndefined();
    });

    it('should return undefined when deleting non-existent company', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      );

      const result = await repository.delete('999', 'tenant-1');
      expect(result).toBeUndefined();
    });
  });

  describe('RBAC', () => {
    it('should only return companies for the tenant', async () => {
      const builder = createQueryBuilder({ data: [], error: null });
      const eqSpy = vi.fn(() => builder);
      builder.eq = eqSpy;

      mockSupabase.from.mockReturnValueOnce(builder);

      await repository.findAll('tenant-1');
      expect(eqSpy).toHaveBeenCalledWith('tenant_id', 'tenant-1');
    });
  });
});
