import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MediaAsset } from '@/components/media/MediaUploader.types';

const mocks = vi.hoisted(() => ({
  tenantId: 'tenant-a' as string | null,
  listVideoAssets: vi.fn(),
  findVideoAssetForTutorial: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ currentTenantId: mocks.tenantId }),
}));

vi.mock('../repositories/tutorials.repository', () => ({
  tutorialsRepository: {
    listVideoAssets: mocks.listVideoAssets,
    findVideoAssetForTutorial: mocks.findVideoAssetForTutorial,
  },
}));

import { AvaProvider, useAva } from '../context/AvaContext';
import type { Tutorial } from '../types';

function makeAsset(tutorial: Partial<Tutorial> & { id: string; slug: string; module: Tutorial['module']; title?: string }): MediaAsset {
  return {
    id: `asset-${tutorial.id}`,
    tenant_id: mocks.tenantId ?? 'tenant-a',
    entity_type: 'ava',
    entity_id: tutorial.module,
    purpose: 'ava',
    file_url: `https://example.test/${tutorial.slug}.mp4`,
    file_name: `${tutorial.slug}.mp4`,
    file_size: 1,
    mime_type: 'video/mp4',
    metadata: {
      tutorial: {
        id: tutorial.id,
        slug: tutorial.slug,
        module: tutorial.module,
        title: tutorial.title ?? tutorial.slug,
        summary: 'sum',
        description: 'desc',
        videoUrl: `https://example.test/${tutorial.slug}.mp4`,
        videoKind: 'short',
        videoDurationSeconds: 30,
        tags: [],
        status: 'published',
        audience: ['admin'],
        steps: [],
        faq: [],
        relatedTutorialIds: [],
        lastUpdatedAt: '2026-01-01T00:00:00Z',
      },
    },
    created_by: 'p1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  } as unknown as MediaAsset;
}

function Probe() {
  const { isLoading, error, filteredTutorials, availableModules, refresh } = useAva();
  return (
    <div>
      <output data-testid="loading">{String(isLoading)}</output>
      <output data-testid="error">{error ?? ''}</output>
      <output data-testid="count">{filteredTutorials.length}</output>
      <output data-testid="modules">{availableModules.join(',')}</output>
      <button type="button" onClick={() => void refresh()}>refresh</button>
    </div>
  );
}

describe('AvaProvider — tenant/contexto (Fase A+C)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tenantId = 'tenant-a';
  });

  it('carrega tutoriais com tenant válido', async () => {
    mocks.listVideoAssets.mockResolvedValue([
      makeAsset({ id: 't1', slug: 't1', module: 'rh', title: 'RH 1' }),
    ]);

    render(
      <AvaProvider>
        <Probe />
      </AvaProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(mocks.listVideoAssets).toHaveBeenCalledWith('tenant-a');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('modules')).toHaveTextContent('rh');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('sem tenant: fail-closed (não consulta, encerra loading, limpa estado)', async () => {
    mocks.tenantId = null;

    render(
      <AvaProvider>
        <Probe />
      </AvaProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(mocks.listVideoAssets).not.toHaveBeenCalled();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('modules')).toHaveTextContent('');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('troca de tenant: ignora resposta antiga e limpa dados do tenant anterior', async () => {
    const pendingA: Array<(v: MediaAsset[]) => void> = [];
    mocks.listVideoAssets.mockImplementation(
      (tenantId: string) =>
        tenantId === 'tenant-a'
          ? new Promise<MediaAsset[]>((resolve) => pendingA.push(resolve))
          : Promise.resolve([makeAsset({ id: 't2', slug: 't2', module: 'sistema', title: 'Sys' })]),
    );

    const view = render(
      <AvaProvider>
        <Probe />
      </AvaProvider>,
    );
    await waitFor(() => expect(pendingA.length).toBeGreaterThan(0));

    mocks.tenantId = 'tenant-b';
    view.rerender(
      <AvaProvider>
        <Probe />
      </AvaProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('modules')).toHaveTextContent('sistema'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    pendingA.forEach((resolve) =>
      resolve([makeAsset({ id: 't1', slug: 't1', module: 'rh', title: 'RH stale' })]),
    );
    await waitFor(() => expect(screen.getByTestId('modules')).toHaveTextContent('sistema'));
    expect(screen.getByTestId('modules')).not.toHaveTextContent('rh');
  });

  it('erro real do repositório: encerra loading e expõe mensagem', async () => {
    mocks.listVideoAssets.mockRejectedValue(new Error('falha supabase'));

    render(
      <AvaProvider>
        <Probe />
      </AvaProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('error')).toHaveTextContent('falha supabase');
  });
});
