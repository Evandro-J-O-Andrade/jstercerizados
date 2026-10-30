/**
 * Service de pessoas — camada de domínio para o Admin Master.
 *
 * Orquestra operações de CRUD sobre pessoas, aplicando regras de
 * negócio e delegando persistência ao Repository.
 */

import { createAdminPersonRepository, type AdminPersonRepository } from '../repositories/people.repository';
import type { PersonContract } from '@/platform/identity/people/people.contract';

export interface AdminPersonService {
  listPeople(filters?: { search?: string; status?: string; tenant_id?: string }): Promise<{
    items: { id: string; auth_user_id: string | null; full_name: string; email: string; phone: string | null; status: string; created_at: string; updated_at: string; tenant_count: number }[];
    error?: string;
  }>;
  getPerson(id: string): Promise<{ person: PersonContract | null; error?: string }>;
  createPerson(payload: { full_name: string; email: string; phone?: string | null; status?: string }): Promise<{ id: string } | { error: string }>;
  updatePerson(id: string, payload: { full_name?: string; email?: string; phone?: string | null; status?: string }): Promise<{ updated: PersonContract } | { error: string }>;
  activatePerson(id: string): Promise<{ updated: PersonContract } | { error: string }>;
  suspendPerson(id: string): Promise<{ updated: PersonContract } | { error: string }>;
}

export function createAdminPersonService(): AdminPersonService {
  const repo: AdminPersonRepository = createAdminPersonRepository();

  return {
    async listPeople(filters) {
      try {
        const items = await repo.list(filters);
        return { items };
      } catch (error) {
        return {
          items: [],
          error: error instanceof Error ? error.message : 'Erro ao listar pessoas.',
        };
      }
    },

    async getPerson(id) {
      try {
        const person = await repo.findById(id);
        return { person };
      } catch (error) {
        return {
          person: null,
          error: error instanceof Error ? error.message : 'Erro ao buscar pessoa.',
        };
      }
    },

    async createPerson(payload) {
      try {
        return await repo.create(payload);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Erro ao criar pessoa.',
        };
      }
    },

    async updatePerson(id, payload) {
      try {
        return await repo.update(id, payload);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Erro ao atualizar pessoa.',
        };
      }
    },

    async activatePerson(id) {
      try {
        return await repo.setStatus(id, 'active');
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Erro ao ativar pessoa.',
        };
      }
    },

    async suspendPerson(id) {
      try {
        return await repo.setStatus(id, 'suspended');
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Erro ao suspender pessoa.',
        };
      }
    },
  };
}
