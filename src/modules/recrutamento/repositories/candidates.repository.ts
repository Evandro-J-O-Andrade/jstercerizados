/**
 * Candidates Repository — Recrutamento
 *
 * Adapter sobre o repository tenant-scoped do módulo Candidato.
 * Existe apenas para manter o formato de retorno `{ data, error }` esperado
 * pelo RecrutamentoContext. NÃO há consulta própria neste arquivo: toda
 * operação é delegada a CandidatesRepository, que aplica
 * `.eq('tenant_id', ...)` em todas as leituras e exige tenantId nas escritas.
 *
 * Schema real de `public.candidates` (fonte: `src/types/database.ts`):
 *   id, person_id, tenant_id, headline, salary_expectation_min,
 *   salary_expectation_max, salary_type, availability, source, status,
 *   metadata, created_by, created_at, updated_at
 *
 * Colunas como `is_open_to_work`, `is_visible_in_pool`, `profile_completeness`,
 * `experience_years`, `current_role`, `summary` e `last_profile_update` NÃO
 * existem. Não as reintroduza aqui sem migration autorizada.
 */

import { candidatesRepository as tenantScopedCandidates } from '@/modules/candidato/repositories/candidates.repository';
import type {
  Candidate,
  CreateCandidateInput,
  UpdateCandidateInput,
  CandidateFilters,
  CandidateStats,
  RepositoryResult,
  RepositoryListResult,
} from '../types';

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

function startOfCurrentMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export const candidatesRepository = {
  /**
   * Lista candidatos do tenant. `tenant_id` é obrigatório — sem ele nada é
   * consultado, para que nenhuma leitura escape do escopo do usuário.
   */
  async list(
    filters: CandidateFilters = {},
  ): Promise<RepositoryListResult<Candidate>> {
    const tenantId = filters.tenant_id;

    if (!tenantId) {
      return {
        data: [],
        error: new Error(
          'tenant_id é obrigatório: listar candidatos sem escopo de tenant é proibido',
        ),
      };
    }

    try {
      let data = await tenantScopedCandidates.findAll(tenantId, {
        status: filters.status,
        search: filters.search,
      });

      if (filters.sort_order === 'asc') {
        data = [...data].reverse();
      }

      if (filters.limit !== undefined) {
        data = data.slice(0, filters.limit);
      }

      return { data, error: null, count: data.length };
    } catch (e) {
      return { data: [], error: toError(e) };
    }
  },

  async getById(
    id: string,
    tenantId: string,
  ): Promise<RepositoryResult<Candidate>> {
    if (!tenantId) {
      return {
        data: null,
        error: new Error(
          'tenantId é obrigatório: getById sem escopo de tenant é proibido',
        ),
      };
    }

    try {
      const data = await tenantScopedCandidates.findById(id, tenantId);
      if (!data) {
        return { data: null, error: new Error('Candidato não encontrado') };
      }
      return { data, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  },

  /**
   * Estatísticas derivadas apenas de colunas reais:
   * `status` e `created_at`. Não há no schema `is_open_to_work` nem
   * `is_visible_in_pool`, portanto essas métricas não são inventadas aqui.
   */
  async getStats(tenantId: string): Promise<RepositoryResult<CandidateStats>> {
    if (!tenantId) {
      return {
        data: null,
        error: new Error(
          'tenantId é obrigatório: getStats sem escopo de tenant é proibido',
        ),
      };
    }

    try {
      const all = await tenantScopedCandidates.findAll(tenantId);
      const monthStart = startOfCurrentMonth();

      return {
        data: {
          total: all.length,
          active: all.filter((c) => c.status === 'active').length,
          inactive: all.filter((c) => c.status === 'inactive').length,
          archived: all.filter((c) => c.status === 'archived').length,
          blacklisted: all.filter((c) => c.status === 'blacklisted').length,
          new_this_month: all.filter((c) => c.created_at >= monthStart).length,
        },
        error: null,
      };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  },

  async create(
    input: CreateCandidateInput,
  ): Promise<RepositoryResult<Candidate>> {
    if (!input?.tenant_id) {
      return {
        data: null,
        error: new Error('tenant_id é obrigatório para criar candidato'),
      };
    }

    try {
      const data = await tenantScopedCandidates.create(input);
      return { data, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  },

  async update(
    input: UpdateCandidateInput & { id: string; tenant_id: string },
  ): Promise<RepositoryResult<Candidate>> {
    if (!input?.tenant_id) {
      return {
        data: null,
        error: new Error('tenant_id é obrigatório para atualizar candidato'),
      };
    }

    try {
      const { id, tenant_id, ...updates } = input;
      const data = await tenantScopedCandidates.update(id, tenant_id, updates);
      if (!data) {
        return { data: null, error: new Error('Candidato não encontrado') };
      }
      return { data, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  },

  /**
   * Exclusão SEMPRE tenant-scoped. A assinatura exige tenantId para que não
   * exista caminho de chamada que apague registro de outro tenant.
   */
  async delete(
    id: string,
    tenantId: string,
  ): Promise<RepositoryResult<{ id: string }>> {
    if (!tenantId) {
      return {
        data: null,
        error: new Error(
          'tenantId é obrigatório: delete sem escopo de tenant é proibido',
        ),
      };
    }

    try {
      await tenantScopedCandidates.delete(id, tenantId);
      return { data: { id }, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  },
};
