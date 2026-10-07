import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompaniesRepository } from '@/repositories/companies.repository';
import type { Company, CompanyCreateInput } from '@/types/domain/company';

type QueryResult = { data: unknown; error: unknown };

function createThenable(value: QueryResult) {
  const promise: any = Promise.resolve(value);
  promise.select = vi.fn(() => promise);
  promise.eq = vi.fn(() => promise);
  promise.neq = vi.fn(() => promise);
  promise.maybeSingle = vi.fn(() => Promise.resolve(value));
  promise.single = vi.fn(() => Promise.resolve(value));
  promise.order = vi.fn(() => promise);
  promise.limit = vi.fn(() => promise);
  promise.insert = vi.fn(() => promise);
  promise.update = vi.fn(() => promise);
  promise.delete = vi.fn(() => promise);
  promise.in = vi.fn(() => promise);
  promise.or = vi.fn(() => promise);
  promise.then = promise.then.bind(promise);
  return promise;
}

describe('CompaniesRepository', () => {
  let repository: CompaniesRepository;
  let mockSupabase: ReturnType<typeof vi.fn>;
  let mockFrom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = vi.fn(() => createThenable({ data: null, error: null }));
    mockSupabase = { from: mockFrom };
    repository = new CompaniesRepository(mockSupabase as Parameters<typeof CompaniesRepository>[0]);
  });

  describe('findAll', () => {
    it('deve retornar empresas do tenant', async () => {
      const companies: Company[] = [
        {
          id: '1',
          tenant_id: 'tenant-1',
          name: 'Empresa A',
          trading_name: 'Empresa A LTDA',
          cnpj: '12345678000100',
          status: 'active',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          legal_name: null,
          document: null,
          cnpj_root: null,
          state_registration: null,
          municipal_registration: null,
          company_type_id: null,
          industry: null,
          phone: null,
          email: null,
          website: null,
          linkedin_url: null,
          logo_url: null,
          address: null,
          size: null,
          metadata: {},
          created_by: null,
          description: null,
          short_description: null,
          company_segment: null,
          socials: null,
        },
      ];

      mockFrom.mockReturnValueOnce(
        createThenable({ data: companies, error: null }),
      );

      const result = await repository.findAll('tenant-1');

      expect(mockFrom).toHaveBeenCalledWith('companies');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Empresa A');
    });

    it('deve aplicar filtros de status e busca', async () => {
      mockFrom.mockReturnValueOnce(
        createThenable({ data: [], error: null }),
      );

      await repository.findAll('tenant-1', { status: 'active', search: 'teste' });

      const query = mockFrom.mock.results[0].value;
      expect(query.eq).toHaveBeenCalledWith('status', 'active');
      expect(query.or).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('deve criar empresa e relacionamento', async () => {
      const newCompany: Company = {
        id: 'new-id',
        tenant_id: 'tenant-1',
        name: 'Nova Empresa',
        trading_name: null,
        cnpj: null,
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        legal_name: null,
        document: null,
        cnpj_root: null,
        state_registration: null,
        municipal_registration: null,
        company_type_id: null,
        industry: null,
        phone: null,
        email: null,
        website: null,
        linkedin_url: null,
        logo_url: null,
        address: null,
        size: null,
        metadata: {},
        created_by: null,
        description: null,
        short_description: null,
        company_segment: null,
        socials: null,
      };

      mockFrom
        .mockReturnValueOnce(createThenable({ data: newCompany, error: null }))
        .mockReturnValueOnce(createThenable({ data: null, error: null }));

      const input: CompanyCreateInput = {
        name: 'Nova Empresa',
        status: 'active',
      };

      const result = await repository.create(input, 'tenant-1');

      expect(result.id).toBe('new-id');
      expect(mockFrom).toHaveBeenCalledTimes(2);
      expect(mockFrom).toHaveBeenNthCalledWith(1, 'companies');
      expect(mockFrom).toHaveBeenNthCalledWith(2, 'company_relationships');
    });
  });

  describe('update', () => {
    it('deve atualizar empresa existente', async () => {
      const updatedCompany: Company = {
        id: '1',
        tenant_id: 'tenant-1',
        name: 'Empresa Atualizada',
        trading_name: null,
        cnpj: null,
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        legal_name: null,
        document: null,
        cnpj_root: null,
        state_registration: null,
        municipal_registration: null,
        company_type_id: null,
        industry: null,
        phone: null,
        email: null,
        website: null,
        linkedin_url: null,
        logo_url: null,
        address: null,
        size: null,
        metadata: {},
        created_by: null,
        description: null,
        short_description: null,
        company_segment: null,
        socials: null,
      };

      mockFrom
        .mockReturnValueOnce(
          createThenable({ data: { id: '1', tenant_id: 'tenant-1' }, error: null }),
        )
        .mockReturnValueOnce(createThenable({ data: updatedCompany, error: null }));

      const result = await repository.update('1', 'tenant-1', {
        name: 'Empresa Atualizada',
      });

      expect(result.name).toBe('Empresa Atualizada');
    });
  });

  describe('delete', () => {
    it('deve remover relacionamento e retornar sem erro', async () => {
      mockFrom
        .mockReturnValueOnce(
          createThenable({ data: { id: '1', tenant_id: 'tenant-1' }, error: null }),
        )
        .mockReturnValueOnce(createThenable({ data: null, error: null }));

      await expect(
        repository.delete('1', 'tenant-1'),
      ).resolves.toBeUndefined();

      const findQuery = mockFrom.mock.results[0].value;
      const deleteQuery = mockFrom.mock.results[1].value;

      expect(findQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(findQuery.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
      expect(deleteQuery.delete).toHaveBeenCalled();
      expect(deleteQuery.eq).toHaveBeenCalledWith('company_id', '1');
      expect(deleteQuery.eq).toHaveBeenCalledWith('relationship_type', 'client');
    });
  });
});
