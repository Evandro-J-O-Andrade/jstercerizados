/**
 * Tipos canônicos da entidade `people`.
 *
 * Reexporta a interface Person do módulo de auth para evitar duplicação
 * de contratos entre Core e módulos de negócio.
 */

export type { Person } from '@/types/auth';

export type {
  PersonContract,
  UpdateProfilePayload,
  UpdateProfileResult,
  PeopleRepository,
  UpdatablePersonField,
} from '../people/people.contract';