/**
 * Contrato canônico da entidade `people`.
 *
 * Derivado diretamente do schema real do Supabase (tabela `public.people`).
 * Campos e tipos devem permanecer alinhados ao banco; aqui documentamos
 * apenas o contrato de uso no frontend (leitura, atualização e permissões).
 */

/** Campos que um usuário autenticado pode atualizar no próprio perfil. */
export const UPDATABLE_PERSON_FIELDS = [
  'full_name',
  'phone',
  'email',
] as const;

export type UpdatablePersonField = (typeof UPDATABLE_PERSON_FIELDS)[number];

/** Campos que NUNCA devem entrar em payload de atualização pelo próprio usuário. */
export const PROTECTED_PERSON_FIELDS = [
  'id',
  'auth_user_id',
  'status',
  'created_at',
  'updated_at',
  'metadata',
] as const;

/**
 * Contrato completo de leitura da tabela `people`, alinhado ao schema real:
 * id (UUID), auth_user_id (UUID, opcional), full_name, email, phone, status,
 * created_at, updated_at, metadata (JSONB).
 */
export interface PersonContract {
  /** Identificador canônico (PK da tabela). */
  id: string;
  /** Vínculo com a identidade do Supabase Auth. */
  auth_user_id: string | null;
  /** Nome de exibição. */
  full_name: string;
  /** E-mail registrado. */
  email: string;
  /** Telefone. */
  phone: string | null;
  /** Situação da pessoa; padrão `active`. */
  status: string;
  /** Data de criação. */
  created_at: string;
  /** Data de atualização. */
  updated_at: string;
  /** Metadados adicionais. */
  metadata: Record<string, unknown> | null;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string | null;
  email?: string;
}

export interface UpdateProfileResult {
  error?: string;
  updated?: PersonContract;
}

export interface PeopleRepository {
  /** Busca a pessoa pelo `auth_user_id` da sessão atual. */
  findByAuthUserId(authUserId: string): Promise<PersonContract | null>;
  /** Atualiza apenas os campos autorizados do perfil próprio. */
  updateProfile(
    authUserId: string,
    payload: UpdateProfilePayload,
  ): Promise<UpdateProfileResult>;
}