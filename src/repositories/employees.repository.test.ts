import { describe, expect, it, vi } from 'vitest';
import type { getSupabaseClient } from '@/lib/supabase';
import { EmployeesRepository } from './employees.repository';

type SupabaseClient = ReturnType<typeof getSupabaseClient>;

describe('EmployeesRepository — contrato de identidade compartilhada', () => {
  it('usa people.id como employees.id e nunca envia person_id', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        tenant_id: '22222222-2222-4222-8222-222222222222',
        employee_code: 'COL-001',
        hire_date: '2026-11-09',
        termination_date: null,
        salary: null,
        status: 'active',
        created_at: '2026-11-09T12:00:00Z',
        updated_at: '2026-11-09T12:00:00Z',
        person: null,
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    const repository = new EmployeesRepository({ from } as unknown as SupabaseClient);

    await repository.create({
      id: '11111111-1111-4111-8111-111111111111',
      tenant_id: '22222222-2222-4222-8222-222222222222',
      employee_code: 'COL-001',
      hire_date: '2026-11-09',
    });

    expect(from).toHaveBeenCalledWith('employees');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '11111111-1111-4111-8111-111111111111',
        tenant_id: '22222222-2222-4222-8222-222222222222',
      }),
    );
    expect(insert.mock.calls[0]?.[0]).not.toHaveProperty('person_id');
  });

  it('lista somente pessoas ativas do tenant ainda sem vínculo funcional', async () => {
    const membershipsEqStatus = vi.fn().mockResolvedValue({
      data: [
        {
          person: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              full_name: 'Ana Silva',
              email: 'ana@example.com',
              status: 'active',
            },
          ],
        },
        {
          person: [
            {
              id: '33333333-3333-4333-8333-333333333333',
              full_name: 'Bruno Souza',
              email: 'bruno@example.com',
              status: 'active',
            },
          ],
        },
      ],
      error: null,
    });
    const membershipsEqTenant = vi.fn(() => ({ eq: membershipsEqStatus }));
    const membershipsSelect = vi.fn(() => ({ eq: membershipsEqTenant }));
    const employeesEqTenant = vi.fn().mockResolvedValue({
      data: [{ id: '33333333-3333-4333-8333-333333333333' }],
      error: null,
    });
    const employeesSelect = vi.fn(() => ({ eq: employeesEqTenant }));
    const from = vi.fn((table: string) =>
      table === 'tenant_memberships'
        ? { select: membershipsSelect }
        : { select: employeesSelect },
    );
    const repository = new EmployeesRepository({ from } as unknown as SupabaseClient);

    const result = await repository.findEligiblePeople(
      '22222222-2222-4222-8222-222222222222',
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: '11111111-1111-4111-8111-111111111111',
        full_name: 'Ana Silva',
      }),
    ]);
  });
});
