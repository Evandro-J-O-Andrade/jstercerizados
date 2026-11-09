/**
 * Serviço de candidatos — Admin Master.
 *
 * Camada de domínio para gestão administrativa de candidatos. A autorização
 * real é aplicada por RBAC na UI/rotas e por RLS no Supabase.
 */

import {
  createAdminCandidateRepository,
  type AdminCandidateDetail,
  type AdminCandidateFilters,
  type AdminCandidateListItem,
  type AdminCandidateRepository,
} from '../repositories/candidates.repository';
import type { Database } from '@/types/database';

type CandidateRow = Database['public']['Tables']['candidates']['Row'];
type CandidateUpdate = Database['public']['Tables']['candidates']['Update'];

export interface AdminCandidateService {
  listCandidates(
    filters?: AdminCandidateFilters,
  ): Promise<{ items: AdminCandidateListItem[]; error?: string }>;
  getCandidate(
    id: string,
  ): Promise<{ candidate: AdminCandidateDetail | null; error?: string }>;
  updateCandidate(
    id: string,
    payload: Pick<
      CandidateUpdate,
      | 'headline'
      | 'status'
      | 'source'
      | 'salary_expectation_min'
      | 'salary_expectation_max'
      | 'salary_type'
      | 'availability'
      | 'metadata'
    >,
  ): Promise<{ updated: CandidateRow } | { error: string }>;
}

export function createAdminCandidateService(): AdminCandidateService {
  const repo: AdminCandidateRepository = createAdminCandidateRepository();

  return {
    async listCandidates(filters) {
      try {
        const items = await repo.list(filters);
        return { items };
      } catch (error) {
        return {
          items: [],
          error:
            error instanceof Error
              ? error.message
              : 'Erro ao listar candidatos.',
        };
      }
    },

    async getCandidate(id) {
      try {
        const candidate = await repo.findById(id);
        return { candidate };
      } catch (error) {
        return {
          candidate: null,
          error:
            error instanceof Error
              ? error.message
              : 'Erro ao buscar candidato.',
        };
      }
    },

    async updateCandidate(id, payload) {
      try {
        return await repo.update(id, payload);
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'Erro ao atualizar candidato.',
        };
      }
    },
  };
}
