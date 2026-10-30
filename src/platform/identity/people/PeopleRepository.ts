/**
 * Repositório canônico da entidade `people`.
 *
 * Camada fina sobre o cliente Supabase. Não contém regras de negócio;
 * apenas traduz consultas e comandos em contratos definidos em
 * `people.contract.ts`. A autorização (RLS) é responsabilidade do banco.
 */

import { getSupabaseClient } from '@/lib/supabase';
import {
  UPDATABLE_PERSON_FIELDS,
  PROTECTED_PERSON_FIELDS,
} from './people.contract';
import type {
  PersonContract,
  PeopleRepository,
  UpdateProfilePayload,
  UpdateProfileResult,
} from './people.contract';

const SELECT_COLUMNS =
  'id, auth_user_id, full_name, email, phone, status, created_at, updated_at, metadata';

/**
 * Garante que nenhum campo protegido entra no payload de atualização.
 */
function sanitizePayload(
  payload: UpdateProfilePayload,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (
      (UPDATABLE_PERSON_FIELDS as readonly string[]).includes(key) &&
      value !== undefined
    ) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function assertNoProtectedFields(payload: Record<string, unknown>): void {
  for (const key of Object.keys(payload)) {
    if ((PROTECTED_PERSON_FIELDS as readonly string[]).includes(key)) {
      throw new Error(
        `[people] campo protegido "${key}" não deve ser atualizado pelo próprio usuário`,
      );
    }
  }
}

export function createPeopleRepository(): PeopleRepository {
  return {
    async findByAuthUserId(authUserId: string): Promise<PersonContract | null> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      const { data, error } = await supabase
        .from('people')
        .select(SELECT_COLUMNS)
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data as PersonContract) ?? null;
    },

    async updateProfile(
      authUserId: string,
      payload: UpdateProfilePayload,
    ): Promise<UpdateProfileResult> {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase não configurado.');
      }

      // Valida primeiro no payload original: campos protegidos nunca
      // devem chegar ao banco, mesmo que o sanitize tente removê-los.
      assertNoProtectedFields(payload as Record<string, unknown>);

      const sanitized = sanitizePayload(payload);

      if (Object.keys(sanitized).length === 0) {
        return {};
      }

      const { data: updatedRows, error } = await supabase
        .from('people')
        .update(sanitized)
        .eq('auth_user_id', authUserId)
        .select('id, full_name, email, phone');

      if (error) {
        throw error;
      }

      if (!updatedRows || updatedRows.length === 0) {
        // Atualização negada pelo RLS ou linha inexistente — não é sucesso.
        return {
          error:
            'Não foi possível atualizar o perfil. Verifique se o cadastro está completo ou contate o administrador.',
        };
      }

      return { updated: updatedRows[0] as PersonContract };
    },
  };
}