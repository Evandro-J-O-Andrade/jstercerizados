/**
 * Testes do repositório canônico `PeopleRepository`.
 *
 * Cobre: busca por auth_user_id, atualização com whitelist, rejeição de
 * campos protegidos e detecção de atualização negada pelo RLS.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from '@/lib/supabase';
import { createPeopleRepository } from '../PeopleRepository';

describe('PeopleRepository', () => {
  let supabaseMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock = {
      from: vi.fn(),
    };
    vi.mocked(getSupabaseClient).mockReturnValue(supabaseMock);
  });

  it('busca a pessoa pelo auth_user_id', async () => {
    const maybeSingleMock = vi.fn(() =>
      Promise.resolve({
        data: {
          id: 'p-1',
          auth_user_id: 'u-1',
          full_name: 'Test',
          email: 'test@test.com',
          phone: null,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: null,
        },
        error: null,
      }),
    );

    supabaseMock.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: maybeSingleMock,
        })),
      })),
    }));

    const repo = createPeopleRepository();
    const person = await repo.findByAuthUserId('u-1');

    expect(person).not.toBeNull();
    expect(person?.full_name).toBe('Test');
    expect(supabaseMock.from).toHaveBeenCalledWith('people');
  });

  it('atualiza apenas campos autorizados do perfil próprio', async () => {
    const selectChain = vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 'p-1',
            full_name: 'Novo Nome',
            email: 'novo@test.com',
            phone: '11999999999',
          },
        ],
        error: null,
      }),
    );

    supabaseMock.from = vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ select: selectChain })),
      })),
    }));

    const repo = createPeopleRepository();
    const result = await repo.updateProfile('u-1', {
      full_name: 'Novo Nome',
      email: 'novo@test.com',
      phone: '11999999999',
    });

    expect(result.error).toBeUndefined();
    expect(result.updated?.full_name).toBe('Novo Nome');
    expect(supabaseMock.from).toHaveBeenCalledWith('people');
  });

  it('rejeita atualização com campos protegidos', async () => {
    const repo = createPeopleRepository();
    await expect(
      repo.updateProfile('u-1', {
        id: 'hacked',
      } as any),
    ).rejects.toThrow('campo protegido');
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('detecta atualização negada pelo RLS (nenhuma row afetada)', async () => {
    const selectChain = vi.fn(() =>
      Promise.resolve({ data: null, error: null }),
    );

    supabaseMock.from = vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ select: selectChain })),
      })),
    }));

    const repo = createPeopleRepository();
    const result = await repo.updateProfile('u-1', {
      full_name: 'Test',
    });

    expect(result.error).toBeDefined();
    expect(result.updated).toBeUndefined();
  });

  it('lança erro quando a consulta falha', async () => {
    supabaseMock.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({ data: null, error: { message: 'db error' } }),
          ),
        })),
      })),
    }));

    const repo = createPeopleRepository();
    await expect(repo.findByAuthUserId('u-1')).rejects.toEqual({
      message: 'db error',
    });
  });
});