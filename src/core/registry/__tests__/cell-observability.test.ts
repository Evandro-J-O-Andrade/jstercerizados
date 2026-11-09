import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CellRegistry } from '../CellRegistryContract';
import type { CellContract } from '../../types';

const healthyCell: CellContract = {
  id: 'obs/healthy',
  name: 'Healthy',
  routes: [{ path: '/h', label: 'H' }],
  permissions: ['h.read'],
  enabled: true,
  lifecycle: { status: 'active', health: 'healthy' },
};

describe('CellRegistry observability', () => {
  let registry: CellRegistry;

  beforeEach(() => {
    registry = new CellRegistry();
  });

  it('observa célula com probes locais e evidência de registro em memória (não heartbeat funcional)', async () => {
    registry.register(healthyCell);
    const obs = await registry.observe('obs/healthy');
    expect(obs).not.toBeNull();
    expect(obs?.cellId).toBe('obs/healthy');
    expect(obs?.probes.length).toBeGreaterThan(0);
    expect(obs?.heartbeat?.source).toBe('registry.registered_in_memory');
    expect(obs?.heartbeat?.healthy).toBe(true);
    expect(obs?.health).toBe('healthy');
    expect(obs?.notes.join(' ')).toContain('registro local em memória');
    expect(obs?.notes.join(' ')).not.toContain('Heartbeat real OK');
  });

  it('isola falha de probe customizado sem quebrar observeAll', async () => {
    registry.register(healthyCell);
    registry.register(
      { ...healthyCell, id: 'obs/broken', name: 'Broken' },
      undefined,
      {
        probes: [
          () => {
            throw new Error('boom');
          },
        ],
      },
    );
    const all = await registry.observeAll();
    expect(all).toHaveLength(2);
    const broken = all.find((o) => o.cellId === 'obs/broken');
    expect(broken?.health).toBe('unknown');
    expect(broken?.notes.join(' ')).toContain('Falha isolada');
  });

  it('usa heartbeat explícito de fonte real quando fornecido', async () => {
    registry.register(healthyCell, undefined, {
      heartbeat: () => ({
        source: 'process.local',
        at: '2026-01-01T00:00:00.000Z',
        healthy: false,
        detail: 'test',
      }),
    });
    const obs = await registry.observe('obs/healthy');
    expect(obs?.heartbeat?.source).toBe('process.local');
    expect(obs?.heartbeat?.healthy).toBe(false);
    expect(obs?.health).toBe('degraded');
  });

  it('preserva observability ao re-registrar célula sem novo contrato de observabilidade', async () => {
    registry.register(healthyCell, undefined, {
      heartbeat: () => ({
        source: 'real.source',
        at: '2026-01-01T00:00:00.000Z',
        healthy: true,
      }),
    });
    registry.register({ ...healthyCell, name: 'Updated' });
    const obs = await registry.observe('obs/healthy');
    expect(obs?.cell.name).toBe('Updated');
    expect(obs?.heartbeat?.source).toBe('real.source');
  });

  it('permite setObservability e usa evidência de registro local quando heartbeat funcional não existe', async () => {
    registry.register(healthyCell);
    registry.setObservability('obs/healthy', undefined);
    const obs = await registry.observe('obs/healthy');
    expect(obs?.heartbeat?.source).toBe('registry.registered_in_memory');
  });
});
