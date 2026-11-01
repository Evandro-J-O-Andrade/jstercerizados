import { describe, it, expect } from 'vitest';
import { coreCellContract } from '@/cells/core';
import { integracoesCellContract } from '@/cells/integracoes';
import { cellRegistry } from '@/core/registry/CellRegistryContract';
import { registerAllCells } from '@/core/cells/register-cells';

describe('Phase 2 — Core & Integracoes cell integration', () => {
  it('core cell contract has valid id and is enabled', () => {
    expect(coreCellContract.id).toBe('core');
    expect(coreCellContract.enabled).toBe(true);
  });

  it('integracoes cell contract has valid id and is enabled', () => {
    expect(integracoesCellContract.id).toBe('integracoes');
    expect(integracoesCellContract.enabled).toBe(true);
  });

  it('registers all cells without throwing', () => {
    expect(() => registerAllCells()).not.toThrow();
  });

  it('core and integracoes cells are registered', () => {
    registerAllCells();
    expect(cellRegistry.has('core')).toBe(true);
    expect(cellRegistry.has('integracoes')).toBe(true);
  });

  it('no duplicate cell ids among registered cells', () => {
    registerAllCells();
    const all = cellRegistry.getAll();
    const ids = all.map((e) => e.cell.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});