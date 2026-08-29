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

      mockSupabase.from
        .mockReturnValueOnce(
          createQueryBuilder({ data: mockRelationships, error: null }),
        )
        .mockReturnValueOnce(
          createQueryBuilder({ data: mockCompanies, error: null }),
        );

      const result = await repository.findAll('tenant-1');
      expect(result).toEqual(mockCompanies);
    });

    it('should return empty array when no relationships exist', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: [], error: null }),
      );

      const result = await repository.findAll('tenant-1');
      expect(result).toEqual([]);
    });

    it('should filter by status', async () => {
      const builder = createQueryBuilder({ data: [], error: null });
      const eqSpy = vi.fn(() => builder);
      builder.eq = eqSpy;

      mockSupabase.from
        .mockReturnValueOnce(createQueryBuilder({ data: [], error: null }))
        .mockReturnValueOnce(builder);

      await repository.findAll('tenant-1', { status: 'active' });
      expect(eqSpy).toHaveBeenCalledWith('status', 'active');
    });

    it('should search by name or document', async () => {
      const builder = createQueryBuilder({ data: [], error: null });
      const orSpy = vi.fn(() => builder);
      builder.or = orSpy;

      mockSupabase.from
        .mockReturnValueOnce(createQueryBuilder({ data: [], error: null }))
        .mockReturnValueOnce(builder);

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

      mockSupabase.from
        .mockReturnValueOnce(
          createQueryBuilder({ data: { company_id: 'comp-1' }, error: null }),
        )
        .mockReturnValueOnce(
          createQueryBuilder({ data: mockCompany, error: null }),
        );

      const result = await repository.findById('comp-1', 'tenant-1');
      expect(result).toEqual(mockCompany);
    });

    it('should return null when relationship does not exist', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      );

      const result = await repository.findById('comp-999', 'tenant-1');
      expect(result).toBeNull();
    });

    it('should return null when company not found', async () => {
      mockSupabase.from
        .mockReturnValueOnce(
          createQueryBuilder({ data: { company_id: 'comp-1' }, error: null }),
        )
        .mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

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

      mockSupabase.from
        .mockReturnValueOnce(
          createQueryBuilder({ data: mockCompany, error: null }),
        )
        .mockReturnValueOnce(createQueryBuilder({ data: null, error: null }));

      const result = await repository.create(input, 'tenant-1');
      expect(result).toEqual(mockCompany);

      const insertCall = mockSupabase.from.mock.calls[0];
      expect(insertCall[0]).toBe('companies');
    });

    it('should throw raw Supabase error when document already exists', async () => {
      const input: CompanyCreateInput = {
        name: 'Empresa Teste',
        legal_name: 'Teste LTDA',
        document: '12345678000100',
        status: 'active',
      };

      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({
          data: null,
          error: {
            code: '23505',
            message:
              'duplicate key value violates unique constraint "companies_document_key"',
          },
        }),
      );

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

      mockSupabase.from
        .mockReturnValueOnce(
          createQueryBuilder({ data: { company_id: 'comp-1' }, error: null }),
        )
        .mockReturnValueOnce(
          createQueryBuilder({ data: mockCompany, error: null }),
        );

      const result = await repository.update('comp-1', 'tenant-1', input);
      expect(result).toEqual(mockCompany);
    });

    it('should return null when relationship does not exist', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      );

      const result = await repository.update('comp-999', 'tenant-1', {
        name: 'Teste',
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove company_relationships for the tenant', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      );

      const result = await repository.delete('comp-1', 'tenant-1');
      expect(result).toBeUndefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('company_relationships');
    });

    it('should return undefined when relationship does not exist', async () => {
      mockSupabase.from.mockReturnValueOnce(
        createQueryBuilder({ data: null, error: null }),
      );

      const result = await repository.delete('comp-999', 'tenant-1');
      expect(result).toBeUndefined();
    });
  });

  describe('tenant scoping', () => {
    it('should query company_relationships for tenant scoping', async () => {
      const builder = createQueryBuilder({ data: [], error: null });
      const eqSpy = vi.fn(() => builder);
      builder.eq = eqSpy;

      mockSupabase.from
        .mockReturnValueOnce(builder)
        .mockReturnValueOnce(createQueryBuilder({ data: [], error: null }));

      await repository.findAll('tenant-1');
      expect(eqSpy).toHaveBeenCalledWith('tenant_id', 'tenant-1');
    });
  });
});
