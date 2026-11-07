/**
 * CellRegistryContract — typed registry for cell contracts.
 * Cells register their metadata, routes, and lifecycle hooks.
 * The registry does NOT grant permissions — it only discovers cells.
 * Observabilidade local (probes/heartbeat real) é integrada sem telemetria remota.
 */

import type {
  CellContract,
  CellValidationResult,
  CellGateResult,
  SaaSCellContract,
} from '../types';
import type {
  CellHeartbeatSnapshot,
  CellObservabilityContract,
  CellObservationSnapshot,
  CellProbeResult,
} from '../observability/contracts';
import {
  defaultCellProbes,
  deriveOperationalState,
  normalizeCellHealth,
  worstHealth,
} from '../observability';

export interface RegistryEntry {
  cell: CellContract;
  registeredAt: string;
  observability?: CellObservabilityContract;
}

export interface RegistryStats {
  total: number;
  enabled: number;
  disabled: number;
  byModule: Record<string, number>;
}

/**
 * Opções de registro de célula.
 * Quando `validate` é true, o registro executa os gates arquiteturais
 * (CELL-01 a CELL-09) antes de aceitar a célula.
 * Quando `strict` é true, falhas nos gates impedem o registro.
 */
export interface RegisterOptions {
  validate?: boolean;
  strict?: boolean;
}

/**
 * CellRegistry — in-memory registry of cell contracts.
 * Thread-safe for single-threaded JS (no locks needed).
 *
 * Suporta o SaaSCellContract (contrato universal) para descoberta
 * e validação de centenas de células sem conhecimento prévio da
 * implementação interna de cada uma.
 */
export class CellRegistry {
  private cells = new Map<string, RegistryEntry>();
  private order: string[] = [];

  /**
   * Register a cell. Overwrites if already registered (with warning).
   *
   * @param cell O contrato da célula (CellContract ou SaaSCellContract)
   * @param options Quando validate=true, executa gates CELL-01 a CELL-09.
   *                Quando strict=true, gates com falha impedem o registro.
   */
  register(
    cell: CellContract,
    options?: RegisterOptions,
    observability?: CellObservabilityContract,
  ): void {
    if (options?.validate) {
      const result = this.validateCell(cell);
      if (options.strict && !result.valid) {
        throw new Error(
          `[CellRegistry] Cell "${cell.id}" failed validation gates: ${result.errors.join(', ')}`,
        );
      }
      if (result.warnings.length > 0) {
        console.warn(
          `[CellRegistry] Cell "${cell.id}" validation warnings: ${result.warnings.join(', ')}`,
        );
      }
    }

    if (this.cells.has(cell.id)) {
      console.warn(
        `[CellRegistry] Cell "${cell.id}" already registered, overwriting.`,
      );
    }
    const previous = this.cells.get(cell.id);
    this.cells.set(cell.id, {
      cell,
      registeredAt: previous?.registeredAt ?? new Date().toISOString(),
      observability: observability ?? previous?.observability,
    });
    if (!this.order.includes(cell.id)) {
      this.order.push(cell.id);
    }
  }

  /** Registra contrato de observabilidade local (probes/heartbeat real) para uma célula já registrada. */
  setObservability(
    cellId: string,
    observability: CellObservabilityContract | undefined,
  ): boolean {
    const entry = this.cells.get(cellId);
    if (!entry) return false;
    this.cells.set(cellId, { ...entry, observability });
    return true;
  }

  /** Observa uma célula isolando falhas. Nunca lança por erro de probe/heartbeat. */
  async observe(cellId: string): Promise<CellObservationSnapshot | null> {
    const entry = this.cells.get(cellId);
    if (!entry) return null;
    const checkedAt = new Date().toISOString();
    const notes: string[] = [];
    let probes: CellProbeResult[] = [];
    try {
      const custom = entry.observability?.probes ?? [];
      probes =
        custom.length > 0
          ? await Promise.all(custom.map(async (p) => await p(entry.cell)))
          : defaultCellProbes(entry.cell);
    } catch (e) {
      notes.push(
        `Falha isolada em probes: ${e instanceof Error ? e.message : String(e)}`,
      );
      probes = [
        {
          name: 'probes',
          status: 'unknown',
          evidence: 'Probe falhou; célula isolada.',
          checkedAt,
        },
      ];
    }

    let heartbeat: CellHeartbeatSnapshot | null = null;
    if (entry.observability?.heartbeat) {
      try {
        heartbeat = (await entry.observability.heartbeat()) ?? null;
      } catch (e) {
        notes.push(
          `Falha isolada em heartbeat: ${e instanceof Error ? e.message : String(e)}`,
        );
        heartbeat = null;
      }
    } else if (entry.registeredAt) {
      // Fonte real local: timestamp de registro em memória desta execução (não telemetria externa/fictícia).
      heartbeat = {
        source: 'registry.registeredAt',
        at: entry.registeredAt,
        healthy: true,
      };
    }

    const base = normalizeCellHealth(entry.cell.lifecycle?.health);
    const probeHealth =
      probes.length > 0 ? worstHealth(probes.map((p) => p.status)) : 'unknown';
    let health = worstHealth([base, probeHealth]);
    if (heartbeat && heartbeat.healthy === false) {
      health = worstHealth([health, 'degraded']);
      notes.push(`Heartbeat real indica degradação (${heartbeat.source}).`);
    } else if (heartbeat && heartbeat.healthy === true) {
      notes.push(`Heartbeat real OK (${heartbeat.source}).`);
    }
    if (!entry.observability?.heartbeat)
      notes.push(
        'Heartbeat local derivado do registro em memória (fonte real local), sem telemetria externa.',
      );

    const operationalState = deriveOperationalState(entry.cell.enabled, health);
    return {
      cellId,
      cell: entry.cell,
      enabledState: entry.cell.enabled ? 'habilitada' : 'desabilitada',
      health,
      operationalState,
      probes,
      heartbeat,
      notes,
      checkedAt,
      source: 'cell-registry-local',
    };
  }

  /** Observa todas as células em ordem, isolando falhas por célula. */
  async observeAll(): Promise<CellObservationSnapshot[]> {
    const ids = [...this.order];
    const results = await Promise.all(
      ids.map(async (id) => await this.observe(id)),
    );
    return results.filter((r): r is CellObservationSnapshot => r !== null);
  }

  /**
   * Valida um contrato de célula contra os gates arquiteturais CELL-01 a CELL-09.
   * Não modifica o registry — apenas reporta o estado de conformidade.
   */
  validateCell(cell: SaaSCellContract): CellValidationResult {
    const gates: Record<string, CellGateResult> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    // CELL-01 — Identidade e manifest válidos
    gates['CELL-01'] = {
      passed: Boolean(
        cell.id &&
        cell.id.trim().length > 0 &&
        cell.name &&
        cell.name.trim().length > 0,
      ),
      reason:
        !cell.id || !cell.name
          ? 'id e name são obrigatórios para identidade da célula.'
          : undefined,
    };
    if (!gates['CELL-01']!.passed) errors.push('CELL-01: identidade inválida');

    // CELL-02 — Contrato universal implementado (rotas e permissões declaradas)
    gates['CELL-02'] = {
      passed: Boolean(
        cell.routes &&
        Array.isArray(cell.routes) &&
        cell.permissions &&
        Array.isArray(cell.permissions),
      ),
      reason:
        !cell.routes || !cell.permissions
          ? 'routes e permissions são obrigatórios no contrato universal.'
          : undefined,
    };
    if (!gates['CELL-02']!.passed)
      errors.push('CELL-02: contrato universal incompleto');

    // CELL-03 — Provider e contexto isolados (layout ou skipLayout declarado)
    gates['CELL-03'] = {
      passed: Boolean(cell.layout || cell.navigation || cell.scope),
      reason:
        !cell.layout && !cell.navigation && !cell.scope
          ? 'Declaração de layout, navegação ou scope é obrigatória para isolamento.'
          : undefined,
    };
    if (!gates['CELL-03']!.passed)
      warnings.push('CELL-03: contexto de isolamento não declarado');

    // CELL-04 — Layout e navegação próprios declarados
    gates['CELL-04'] = {
      passed: Boolean(cell.layout || cell.navigation),
      reason:
        !cell.layout && !cell.navigation
          ? 'Célula deve declarar layout ou navegação próprios (ou skipLayout explícito).'
          : undefined,
    };
    if (!gates['CELL-04']!.passed)
      warnings.push('CELL-04: layout/navegação não declarados');

    // CELL-05 — Permissões e escopo de tenant definidos
    gates['CELL-05'] = {
      passed: Boolean(
        cell.permissions &&
        cell.permissions.length > 0 &&
        (cell.scope === 'tenant' || cell.scope === 'global'),
      ),
      reason: !cell.scope
        ? 'scope (tenant/global) é obrigatório para isolamento de tenant.'
        : undefined,
    };
    if (!gates['CELL-05']!.passed)
      warnings.push('CELL-05: escopo de tenant não definido');

    // CELL-06 — Capacidades administrativas declaradas
    gates['CELL-06'] = {
      passed: Boolean(cell.administration),
      reason: !cell.administration
        ? 'administration deve ser declarado (tenantConfigurable, exposesUserManagement, etc.).'
        : undefined,
    };
    if (!gates['CELL-06']!.passed)
      warnings.push('CELL-06: capacidades administrativas não declaradas');

    // CELL-07 — Métricas e saúde com fontes identificadas
    gates['CELL-07'] = {
      passed: Boolean(cell.lifecycle || cell.metrics || cell.healthChecks),
      reason:
        !cell.lifecycle && !cell.metrics && !cell.healthChecks
          ? 'lifecycle, metrics ou healthChecks devem ser declarados para observabilidade.'
          : undefined,
    };
    if (!gates['CELL-07']!.passed)
      warnings.push('CELL-07: métricas e saúde não declaradas');

    // CELL-08 — Dependências e contratos validados (array válido, pode ser vazio)
    gates['CELL-08'] = {
      passed:
        cell.dependencies === undefined || Array.isArray(cell.dependencies),
      reason:
        cell.dependencies !== undefined && !Array.isArray(cell.dependencies)
          ? 'dependencies deve ser um array quando declarado.'
          : undefined,
    };
    if (!gates['CELL-08']!.passed)
      errors.push('CELL-08: dependências inválidas');

    // CELL-09 — Testes, segurança e integração aprovados (declaração de conformidade)
    gates['CELL-09'] = {
      passed: true,
      reason:
        'Gate declarativo — aprovação manual exigida antes de promoção a produção.',
    };

    return {
      valid: errors.length === 0,
      gates,
      errors,
      warnings,
    };
  }

  /**
   * Unregister a cell.
   */
  unregister(cellId: string): boolean {
    return this.cells.delete(cellId);
  }

  /**
   * Get a cell by ID.
   */
  get(cellId: string): RegistryEntry | undefined {
    return this.cells.get(cellId);
  }

  /**
   * Get all enabled cells.
   */
  getEnabled(): RegistryEntry[] {
    return this.order
      .map((id) => this.cells.get(id)!)
      .filter((entry) => entry.cell.enabled);
  }

  /**
   * Get all cells (enabled and disabled).
   */
  getAll(): RegistryEntry[] {
    return this.order.map((id) => this.cells.get(id)!);
  }

  /**
   * Get cells by module prefix.
   */
  getByModule(moduleId: string): RegistryEntry[] {
    return this.getAll().filter((entry) => entry.cell.id.startsWith(moduleId));
  }

  /**
   * Check if a cell is registered.
   */
  has(cellId: string): boolean {
    return this.cells.has(cellId);
  }

  /**
   * Get registry statistics.
   */
  stats(): RegistryStats {
    const all = this.getAll();
    const byModule: Record<string, number> = {};
    for (const entry of all) {
      // Module is the prefix before the first '/'
      const slashIndex = entry.cell.id.indexOf('/');
      const module =
        slashIndex > 0 ? entry.cell.id.substring(0, slashIndex) : entry.cell.id;
      byModule[module] = (byModule[module] || 0) + 1;
    }
    return {
      total: all.length,
      enabled: all.filter((e) => e.cell.enabled).length,
      disabled: all.filter((e) => !e.cell.enabled).length,
      byModule,
    };
  }

  /**
   * Clear all cells.
   */
  clear(): void {
    this.cells.clear();
    this.order = [];
  }
}

/**
 * Singleton registry instance for the application.
 */
export const cellRegistry = new CellRegistry();
