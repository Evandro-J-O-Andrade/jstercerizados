import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmployeeDocumentsRepository } from './employee-documents.repository';

function createBuilder(returnValue: { data: any; error: any }) {
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
  builder.ilike = () => builder;
  builder.single = () => builder;
  builder.maybeSingle = () => builder;
  builder.then = (resolve: (value: { data: any; error: any }) => void) =>
    resolve(returnValue);
  return builder;
}

const employeesBuilder = createBuilder({ data: [], error: null });
const docsBuilder = createBuilder({ data: [], error: null });

const mockSupabase = {
  from: vi.fn((table: string) => {
    if (table === 'employees') return employeesBuilder;
    if (table === 'employee_documents') return docsBuilder;
    return createBuilder({ data: [], error: null });
  }),
};

describe('EmployeeDocumentsRepository — IDOR Protection', () => {
  let repository: EmployeeDocumentsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    employeesBuilder.select = () => employeesBuilder;
    employeesBuilder.eq = () => employeesBuilder;
    employeesBuilder.maybeSingle = () => employeesBuilder;
    employeesBuilder.then = (resolve: any) =>
      resolve({ data: [], error: null });

    docsBuilder.select = () => docsBuilder;
    docsBuilder.eq = () => docsBuilder;
    docsBuilder.in = () => docsBuilder;
    docsBuilder.order = () => docsBuilder;
    docsBuilder.maybeSingle = () => docsBuilder;
    docsBuilder.update = () => docsBuilder;
    docsBuilder.delete = () => docsBuilder;
    docsBuilder.insert = () => docsBuilder;
    docsBuilder.single = () => docsBuilder;
    docsBuilder.then = (resolve: any) => resolve({ data: [], error: null });

    repository = new EmployeeDocumentsRepository(mockSupabase as any);
  });

  describe('findAll — tenant isolation', () => {
    it('queries employees table for tenant-scoped employee IDs', async () => {
      const eqSpy = vi.fn(() => employeesBuilder);
      employeesBuilder.eq = eqSpy;
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: [{ id: 'emp-1' }, { id: 'emp-2' }], error: null });
      docsBuilder.then = (resolve: any) => resolve({ data: [], error: null });

      await repository.findAll('tenant-A');

      expect(eqSpy).toHaveBeenCalledWith('tenant_id', 'tenant-A');
      expect(mockSupabase.from).toHaveBeenCalledWith('employees');
    });

    it('filters documents by employee IDs belonging to the tenant', async () => {
      const inSpy = vi.fn(() => docsBuilder);
      docsBuilder.in = inSpy;
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: [{ id: 'emp-1' }, { id: 'emp-2' }], error: null });
      docsBuilder.then = (resolve: any) => resolve({ data: [], error: null });

      await repository.findAll('tenant-A');

      expect(inSpy).toHaveBeenCalledWith('employee_id', ['emp-1', 'emp-2']);
      expect(mockSupabase.from).toHaveBeenCalledWith('employee_documents');
    });

    it('when employeeId provided, also filters employees query by that ID', async () => {
      const eqSpy = vi.fn(() => employeesBuilder);
      employeesBuilder.eq = eqSpy;
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: [{ id: 'emp-1' }], error: null });
      docsBuilder.then = (resolve: any) => resolve({ data: [], error: null });

      await repository.findAll('tenant-A', 'emp-1');

      expect(eqSpy).toHaveBeenCalledWith('tenant_id', 'tenant-A');
      expect(eqSpy).toHaveBeenCalledWith('id', 'emp-1');
    });

    it('returns empty array when no employees exist for tenant', async () => {
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: [], error: null });

      const result = await repository.findAll('tenant-B');
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalledWith('employee_documents');
    });

    it('BLOCKED: does NOT call employee_documents without tenant-scoped employee IDs', async () => {
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: [], error: null });

      await repository.findAll('tenant-A');
      await repository.findAll('tenant-B');

      const docsCalls = mockSupabase.from.mock.calls.filter(
        (c) => c[0] === 'employee_documents',
      );
      expect(docsCalls).toHaveLength(0);
    });

    it('returns empty array when supabase client is unavailable', async () => {
      const repo = new EmployeeDocumentsRepository(null as any);
      const result = await repo.findAll('tenant-A');
      expect(result).toEqual([]);
    });
  });

  describe('findById — tenant ownership check', () => {
    it('returns document when employee belongs to tenant', async () => {
      const mockDoc = {
        id: 'doc-1',
        employee_id: 'emp-1',
        document_type: 'RG',
      };
      docsBuilder.then = (resolve: any) =>
        resolve({ data: mockDoc, error: null });
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: { id: 'emp-1' }, error: null });

      const result = await repository.findById('doc-1', 'tenant-A');
      expect(result).toMatchObject({ id: 'doc-1', document_type: 'RG' });
      expect(mockSupabase.from).toHaveBeenCalledWith('employees');
    });

    it('BLOCKED: throws when employee does not belong to tenant', async () => {
      const mockDoc = {
        id: 'doc-1',
        employee_id: 'emp-2',
        document_type: 'CPF',
      };
      docsBuilder.then = (resolve: any) =>
        resolve({ data: mockDoc, error: null });
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: null, error: null });

      await expect(repository.findById('doc-1', 'tenant-A')).rejects.toThrow(
        'não pertence ao tenant',
      );
    });

    it('BLOCKED: throws when employee does not belong to tenant (update path)', async () => {
      docsBuilder.then = (resolve: any) => resolve({ data: null, error: null });

      const result = await repository.findById('doc-999', 'tenant-A');
      expect(result).toBeNull();
    });

    it('returns null when document does not exist', async () => {
      docsBuilder.then = (resolve: any) => resolve({ data: null, error: null });

      const result = await repository.findById('doc-999', 'tenant-A');
      expect(result).toBeNull();
    });

    it('queries employee_documents by id first, then validates employee', async () => {
      const maybeSingleSpy = vi.fn(() => docsBuilder);
      docsBuilder.maybeSingle = maybeSingleSpy;
      docsBuilder.then = (resolve: any) =>
        resolve({ data: { id: 'doc-1', employee_id: 'emp-1' }, error: null });
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: { id: 'emp-1' }, error: null });

      await repository.findById('doc-1', 'tenant-A');

      expect(maybeSingleSpy).toHaveBeenCalled();
    });
  });

  describe('create — tenant ownership check', () => {
    it('creates document when employee belongs to tenant', async () => {
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: { id: 'emp-1' }, error: null });
      docsBuilder.then = (resolve: any) =>
        resolve({
          data: { id: 'doc-1', employee_id: 'emp-1', document_type: 'RG' },
          error: null,
        });

      const result = await repository.create(
        {
          employee_id: 'emp-1',
          document_type: 'RG',
          file_url: 'https://example.com/rg.pdf',
        },
        'tenant-A',
      );

      expect(result).toMatchObject({ id: 'doc-1', document_type: 'RG' });
    });

    it('BLOCKED: throws when employee does not belong to tenant', async () => {
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: null, error: null });

      await expect(
        repository.create(
          {
            employee_id: 'emp-999',
            document_type: 'RG',
            file_url: 'https://example.com/rg.pdf',
          },
          'tenant-A',
        ),
      ).rejects.toThrow('não pertence ao tenant');
    });
  });

  describe('update — tenant ownership check', () => {
    it('updates document when employee belongs to tenant', async () => {
      docsBuilder.then = (resolve: any) =>
        resolve({ data: { id: 'doc-1', employee_id: 'emp-1' }, error: null });
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: { id: 'emp-1' }, error: null });

      const updateBuilder = createBuilder({
        data: { id: 'doc-1', employee_id: 'emp-1', document_type: 'CPF' },
        error: null,
      });

      const originalFrom = mockSupabase.from;
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'employees') return employeesBuilder;
        if (table === 'employee_documents') {
          // First call is findById (maybeSingle), second is update (single)
          if (docsBuilder.single === updateBuilder.single) return docsBuilder;
          return updateBuilder;
        }
        return createBuilder({ data: [], error: null });
      });

      const result = await repository.update('doc-1', 'tenant-A', {
        document_type: 'CPF',
      });

      expect(result).toMatchObject({ document_type: 'CPF' });

      mockSupabase.from = originalFrom;
    });

    it('BLOCKED: returns null when document not found (no cross-tenant update)', async () => {
      docsBuilder.then = (resolve: any) => resolve({ data: null, error: null });
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: null, error: null });

      const result = await repository.update('doc-999', 'tenant-A', {
        document_type: 'CPF',
      });

      expect(result).toBeNull();
    });
  });

  describe('remove — tenant ownership check', () => {
    it('removes document when employee belongs to tenant', async () => {
      docsBuilder.then = (resolve: any) =>
        resolve({ data: { id: 'doc-1', employee_id: 'emp-1' }, error: null });
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: { id: 'emp-1' }, error: null });
      docsBuilder.delete = () => docsBuilder;

      await repository.remove('doc-1', 'tenant-A');

      expect(mockSupabase.from).toHaveBeenCalledWith('employee_documents');
    });

    it('BLOCKED: does nothing when document not found (no cross-tenant delete)', async () => {
      docsBuilder.then = (resolve: any) => resolve({ data: null, error: null });
      employeesBuilder.then = (resolve: any) =>
        resolve({ data: null, error: null });

      const deleteSpy = vi.fn();
      const deleteBuilder = createBuilder({ data: null, error: null });
      deleteBuilder.delete = deleteSpy;

      const originalFrom = mockSupabase.from;
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'employee_documents') return deleteBuilder;
        return employeesBuilder;
      });

      await repository.remove('doc-999', 'tenant-A');

      expect(deleteSpy).not.toHaveBeenCalled();

      mockSupabase.from = originalFrom;
    });
  });
});
