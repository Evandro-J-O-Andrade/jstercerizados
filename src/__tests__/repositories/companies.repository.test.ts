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
    it('deve criar empresa e vínculo (relationship_type_id quando tipo disponível)', async () => {
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

      // 1) insert companies, 2) select company_relationship_types, 3) insert company_relationships
      mockFrom
        .mockReturnValueOnce(createThenable({ data: newCompany, error: null }))
        .mockReturnValueOnce(createThenable({ data: { id: 'type-1' }, error: null }))
        .mockReturnValueOnce(createThenable({ data: null, error: null }));

      const input: CompanyCreateInput = { name: 'Nova Empresa', status: 'active' };
      const result = await repository.create(input, 'tenant-1');

      expect(result.id).toBe('new-id');
      expect(mockFrom).toHaveBeenCalledTimes(3);
      expect(mockFrom).toHaveBeenNthCalledWith(1, 'companies');
      expect(mockFrom).toHaveBeenNthCalledWith(2, 'company_relationship_types');
      expect(mockFrom).toHaveBeenNthCalledWith(3, 'company_relationships');
      const relInsert = mockFrom.mock.results[2].value;
      expect(relInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: 'new-id',
          tenant_id: 'tenant-1',
          relationship_type_id: 'type-1',
          status: 'active',
        }),
      );
    });

    it('deve usar fallback relationship_type quando tipo não encontrado', async () => {
      const newCompany = { id: 'new-id', name: 'Nova Empresa' } as Company;
      mockFrom
        .mockReturnValueOnce(createThenable({ data: newCompany, error: null }))
        .mockReturnValueOnce(createThenable({ data: null, error: null }))
        .mockReturnValueOnce(createThenable({ data: null, error: null }));

      await repository.create({ name: 'Nova Empresa' }, 'tenant-1');
      const relInsert = mockFrom.mock.results[2].value;
      expect(relInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: 'new-id',
          tenant_id: 'tenant-1',
          relationship_type: 'client',
          status: 'active',
        }),
      );
    });

    it('deve falhar e reverter empresa quando vínculo obrigatório falhar', async () => {
      const newCompany = { id: 'new-id', name: 'Nova Empresa' } as Company;
      mockFrom
        .mockReturnValueOnce(createThenable({ data: newCompany, error: null })) // companies insert
        .mockReturnValueOnce(createThenable({ data: { id: 'type-1' }, error: null })) // type lookup
        .mockReturnValueOnce(createThenable({ data: null, error: { message: 'rel insert failed' } })) // rel insert
        .mockReturnValueOnce(createThenable({ data: null, error: null })); // rollback delete company

      await expect(repository.create({ name: 'Nova Empresa' }, 'tenant-1')).rejects.toThrow(
        /vínculo obrigatório/i,
      );
      expect(mockFrom).toHaveBeenCalledTimes(4);
      expect(mockFrom).toHaveBeenNthCalledWith(4, 'companies');
      const rollback = mockFrom.mock.results[3].value;
      expect(rollback.delete).toHaveBeenCalled();
      expect(rollback.eq).toHaveBeenCalledWith('id', 'new-id');
      expect(rollback.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
    });

    it('deve propagar erro real de vínculo mesmo se rollback compensatório falhar', async () => {
      const newCompany = { id: 'new-id', name: 'Nova Empresa' } as Company;
      mockFrom
        .mockReturnValueOnce(createThenable({ data: newCompany, error: null }))
        .mockReturnValueOnce(createThenable({ data: { id: 'type-1' }, error: null }))
        .mockReturnValueOnce(createThenable({ data: null, error: { message: 'rel insert failed' } }))
        .mockReturnValueOnce(createThenable({ data: null, error: { message: 'rollback failed' } }));

      await expect(repository.create({ name: 'Nova Empresa' }, 'tenant-1')).rejects.toThrow(
        /rel insert failed/i,
      );
      // não declara integridade transacional garantida; estado pode ficar parcial se rollback falhar
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
