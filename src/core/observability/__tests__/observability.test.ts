import { describe, it, expect } from 'vitest';
import { defaultCellProbes } from '../probes';
import {
  deriveOperationalState,
  normalizeCellHealth,
  worstHealth,
} from '../contracts';
import type { CellContract } from '@/core/types';

const baseCell: CellContract = {
  id: 'test/cell',
  name: 'Test Cell',
  routes: [{ path: '/x', label: 'X' }],
  permissions: ['x.read'],
  enabled: true,
  lifecycle: { status: 'active', health: 'healthy' },
};

describe('observability contracts', () => {
  it('normaliza health desconhecida para unknown', () => {
    expect(normalizeCellHealth('healthy')).toBe('healthy');
    expect(normalizeCellHealth('nope')).toBe('unknown');
    expect(normalizeCellHealth(undefined)).toBe('unknown');
  });

  it('deriva estados operacionais reais sem inventar telemetria', () => {
    expect(deriveOperationalState(false, 'healthy')).toBe('registrada');
    expect(deriveOperationalState(true, 'healthy')).toBe(
      'operacional_saudavel',
    );
    expect(deriveOperationalState(true, 'degraded')).toBe('degradada');
    expect(deriveOperationalState(true, 'unavailable')).toBe('indisponivel');
    expect(deriveOperationalState(true, 'unknown')).toBe('desconhecida');
  });

  it('calcula pior health de forma conservadora', () => {
    expect(worstHealth(['healthy'])).toBe('healthy');
    expect(worstHealth(['healthy', 'unknown'])).toBe('unknown');
    expect(worstHealth(['healthy', 'degraded'])).toBe('degraded');
    expect(worstHealth(['healthy', 'unavailable'])).toBe('unavailable');
  });
});

describe('probes locais', () => {
  it('retorna probes locais para célula válida', () => {
    const probes = defaultCellProbes(baseCell);
    expect(probes.length).toBeGreaterThan(0);
    expect(probes.every((p) => typeof p.checkedAt === 'string')).toBe(true);
    expect(probes.find((p) => p.name === 'contract')?.status).toBe('healthy');
  });

  it('marca célula desabilitada como indisponível no probe enabled', () => {
    const probes = defaultCellProbes({ ...baseCell, enabled: false });
    expect(probes.find((p) => p.name === 'enabled')?.status).toBe(
      'unavailable',
    );
  });

  it('marca ausência de rotas como degradada', () => {
    const probes = defaultCellProbes({ ...baseCell, routes: [] });
    expect(probes.find((p) => p.name === 'routes')?.status).toBe('degraded');
  });
});
