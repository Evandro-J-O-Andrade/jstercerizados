/**
 * Contratos de observabilidade local das células (CHECK BOULER 24H).
 * Sem telemetria remota, sem heartbeat fictício. Probes locais avaliam apenas
 * evidência disponível em runtime (contrato registrado, rotas, flags, lifecycle).
 * Qualquer falha de probe é isolada por célula e reportada como `unknown/unavailable`.
 */

import type { CellContract, CellLifecycle } from '@/core/types';

export type CellHealthState = NonNullable<CellLifecycle['health']>;

export type CellOperationalState =
  | 'registrada'
  | 'habilitada'
  | 'operacional_saudavel'
  | 'degradada'
  | 'indisponivel'
  | 'desconhecida';

export interface CellProbeResult {
  /** Nome lógico do probe (ex.: contract, routes). */
  name: string;
  status: CellHealthState;
  /** Evidência local resumida; nunca inventar fonte externa. */
  evidence: string;
  checkedAt: string;
}

export interface CellHeartbeatSnapshot {
  /** Fonte do sinal: `registry.registered_in_memory` = registro local (não funcional); outra fonte explícita = heartbeat declarado. */
  source: string;
  at: string;
  /** Boolean do sinal declarado; interpretação funcional depende da fonte (registro em memória ≠ serviço saudável). */
  healthy: boolean;
  detail?: string;
}

/**
 * Probe local puro: recebe contrato já conhecido e retorna evidência local.
 * Não faz rede, DB, storage ou chamadas remotas.
 */
export type CellHealthProbe = (
  cell: CellContract,
) => CellProbeResult | Promise<CellProbeResult>;

export interface CellObservabilityContract {
  /** Probes locais declarados para a célula. */
  probes?: CellHealthProbe[];
  /**
   * Heartbeat funcional apenas quando houver fonte real/comprovada.
   * `undefined` quando não existir fonte confiável.
   * `registry.registered_in_memory` é evidência de registro local, não heartbeat funcional.
   */
  heartbeat?: () =>
    CellHeartbeatSnapshot | null | Promise<CellHeartbeatSnapshot | null>;
}

export interface CellObservationSnapshot {
  cellId: string;
  cell: CellContract;
  enabledState: 'habilitada' | 'desabilitada';
  health: CellHealthState;
  operationalState: CellOperationalState;
  probes: CellProbeResult[];
  heartbeat: CellHeartbeatSnapshot | null;
  notes: string[];
  checkedAt: string;
  source: 'cell-registry-local';
}

export function normalizeCellHealth(
  value: string | undefined,
): CellHealthState {
  if (
    value === 'healthy' ||
    value === 'degraded' ||
    value === 'unavailable' ||
    value === 'unknown'
  ) {
    return value;
  }
  return 'unknown';
}

export function deriveOperationalState(
  enabled: boolean,
  health: CellHealthState,
): CellOperationalState {
  if (!enabled) return 'registrada';
  if (health === 'healthy') return 'operacional_saudavel';
  if (health === 'degraded') return 'degradada';
  if (health === 'unavailable') return 'indisponivel';
  return 'desconhecida';
}

export function worstHealth(states: CellHealthState[]): CellHealthState {
  if (states.includes('unavailable')) return 'unavailable';
  if (states.includes('degraded')) return 'degraded';
  if (states.includes('unknown')) return 'unknown';
  return 'healthy';
}
