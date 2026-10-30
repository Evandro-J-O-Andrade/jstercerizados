/**
 * DashboardMidia — dashboard próprio da célula de Mídia (CHECK BOULER 24H).
 *
 * Cada célula tem seu próprio dashboard, navegação e contexto. Este não é um
 * portal genérico "/dashboard". É a entrada canônica da célula de Mídia.
 *
 * Integra o MediaUploader existente de @/components/media em vez de duplicar
 * a implementação de upload.
 */

import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { Image, LayoutDashboard, Upload } from 'lucide-react';
import { MediaUploader } from '@/components/media';
import { GalleryGrid } from '@/components/media';
import type { MediaAsset } from '@/components/media/MediaUploader.types';
import { useMidia } from '@/modules/midia/MidiaContext';

const MIDIA_HOME = '/midia';

export default function DashboardMidia() {
  const { assets, stats, isLoading, error, refresh } = useMidia();

  const status = isLoading ? 'loading' : error ? 'error' : 'success';

  const totalByPurpose = Object.values(stats?.byPurpose ?? {}).reduce(
    (acc, v) => acc + v,
    0,
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border bg-background/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2">
              <Image className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-semibold">
                Biblioteca de Mídia
              </h1>
              <p className="text-muted-foreground text-sm">
                Gerencie imagens, banners, cards e ativos do seu tenant.
              </p>
            </div>
          </div>
          <button
            onClick={() => void refresh()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Atualizar biblioteca"
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ContentBoundary
        status={status}
        error={error}
        onRetry={() => void refresh()}
        homeRoute={MIDIA_HOME}
        emptyTitle="Nenhum ativo de mídia"
        emptyDescription="Faça upload de imagens para começar a usar a biblioteca de mídia."
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Indicadores */}
            {stats && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-card border-border rounded-xl p-4 border">
                  <p className="text-muted-foreground text-sm">Total de ativos</p>
                  <p className="text-foreground mt-1 text-2xl font-semibold">
                    {stats.totalAssets}
                  </p>
                </div>
                <div className="bg-card border-border rounded-xl p-4 border">
                  <p className="text-muted-foreground text-sm">Uploads</p>
                  <p className="text-foreground mt-1 text-2xl font-semibold">
                    {totalByPurpose}
                  </p>
                </div>
                <div className="bg-card border-border rounded-xl p-4 border">
                  <p className="text-muted-foreground text-sm">Logos</p>
                  <p className="text-foreground mt-1 text-2xl font-semibold">
                    {stats.byPurpose.logo}
                  </p>
                </div>
                <div className="bg-card border-border rounded-xl p-4 border">
                  <p className="text-muted-foreground text-sm">Galeria</p>
                  <p className="text-foreground mt-1 text-2xl font-semibold">
                    {stats.byPurpose.gallery}
                  </p>
                </div>
              </div>
            )}

            {/* Upload e galeria lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                <section className="bg-card border-border rounded-xl p-5 border">
                  <div className="flex items-center gap-2 mb-4">
                    <Upload className="h-5 w-5 text-primary" />
                    <h2 className="text-foreground text-lg font-semibold">
                      Enviar arquivo
                    </h2>
                  </div>
                  <MediaUploader
                    entityType="company"
                    entityId="midia-biblioteca"
                    purpose="gallery"
                    maxSizeMB={10}
                    showPreview={true}
                    disabled={isLoading}
                  />
                </section>
              </div>
              <div className="lg:col-span-8">
                <section className="bg-card border-border rounded-xl p-5 border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-foreground text-lg font-semibold">
                        Galeria de ativos
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {assets.length} ativo(s) disponível(is) neste tenant.
                      </p>
                    </div>
                  </div>
                  <GalleryGrid
                    assets={assets as MediaAsset[]}
                    disabled={isLoading}
                  />
                </section>
              </div>
            </div>
          </div>
        </div>
      </ContentBoundary>
    </div>
  );
}
