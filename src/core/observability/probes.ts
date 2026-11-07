/**
 * Probes locais por célula: apenas evidência de contrato/registro local.
 * Sem acesso remoto. Falhas são capturadas pelo chamador para isolamento.
 */

import type { CellContract } from '@/core/types';
import type { CellProbeResult } from './contracts';

function nowIso(): string {
  return new Date().toISOString();
}

export function probeContractShape(cell: CellContract): CellProbeResult {
  const missing: string[] = [];
  if (!cell.id?.trim()) missing.push('id');
  if (!cell.name?.trim()) missing.push('name');
  if (!Array.isArray(cell.routes)) missing.push('routes');
  if (!Array.isArray(cell.permissions)) missing.push('permissions');
  if (typeof cell.enabled !== 'boolean') missing.push('enabled');
  return missing.length === 0
    ? {
        name: 'contract',
        status: 'healthy',
        evidence:
          'Contrato mínimo válido (id/name/routes/permissions/enabled).',
        checkedAt: nowIso(),
      }
    : {
        name: 'contract',
        status: 'degraded',
        evidence: `Contrato incompleto: ${missing.join(', ')}.`,
        checkedAt: nowIso(),
      };
}

export function probeRoutesDeclared(cell: CellContract): CellProbeResult {
  const count = Array.isArray(cell.routes) ? cell.routes.length : 0;
  if (count === 0) {
    return {
      name: 'routes',
      status: 'degraded',
      evidence: 'Nenhuma rota declarada no contrato.',
      checkedAt: nowIso(),
    };
  }
  const invalid = cell.routes.filter((r) => !r?.path || !r?.label).length;
  if (invalid > 0) {
    return {
      name: 'routes',
      status: 'degraded',
      evidence: `${invalid}/${count} rota(s) sem path/label.`,
      checkedAt: nowIso(),
    };
  }
  return {
    name: 'routes',
    status: 'healthy',
    evidence: `${count} rota(s) declarada(s) com path/label.`,
    checkedAt: nowIso(),
  };
}

export function probeEnabledFlag(cell: CellContract): CellProbeResult {
  return cell.enabled
    ? {
        name: 'enabled',
        status: 'healthy',
        evidence: 'Célula habilitada no contrato.',
        checkedAt: nowIso(),
      }
    : {
        name: 'enabled',
        status: 'unavailable',
        evidence: 'Célula desabilitada no contrato.',
        checkedAt: nowIso(),
      };
}

/**
 * Probe conservador de lifecycle declarado: não promove saúde além do contrato.
 * `healthy` declarado só é aceito como evidência de declaração, não prova runtime.
 */
export function probeLifecycleDeclared(cell: CellContract): CellProbeResult {
  const declared = cell.lifecycle?.health;
  if (!declared) {
    return {
      name: 'lifecycle',
      status: 'unknown',
      evidence: 'Lifecycle/health não declarado no contrato.',
      checkedAt: nowIso(),
    };
  }
  if (declared === 'unavailable') {
    return {
      name: 'lifecycle',
      status: 'unavailable',
      evidence: 'Lifecycle declara indisponível.',
      checkedAt: nowIso(),
    };
  }
  if (declared === 'degraded') {
    return {
      name: 'lifecycle',
      status: 'degraded',
      evidence: 'Lifecycle declara degradado.',
      checkedAt: nowIso(),
    };
  }
  if (declared === 'healthy') {
    return {
      name: 'lifecycle',
      status: 'healthy',
      evidence:
        'Lifecycle declara healthy (declaração de contrato; sem telemetria real).',
      checkedAt: nowIso(),
    };
  }
  return {
    name: 'lifecycle',
    status: 'unknown',
    evidence: `Lifecycle desconhecido: ${String(declared)}.`,
    checkedAt: nowIso(),
  };
}

/** Conjunto padrão de probes locais aplicável a qualquer célula registrada. */
export function defaultCellProbes(cell: CellContract): CellProbeResult[] {
  return [
    probeContractShape(cell),
    probeRoutesDeclared(cell),
    probeEnabledFlag(cell),
    probeLifecycleDeclared(cell),
  ];
}
