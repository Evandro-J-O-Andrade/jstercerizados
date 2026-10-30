import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { LayoutGrid } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { GalleryGrid } from '@/components/media';
import type { MediaAsset } from '@/components/media/MediaUploader.types';

export default function MediaGalleryPage() {
  const { person, currentTenantId } = useAuth();

  const firstName = person?.full_name?.split(' ')[0] || 'Usuário';

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentTenantId) {
      setIsLoading(false);
      return;
    }

    const fetchAssets = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Supabase não configurado.');
        const { data, error: err } = await supabase
          .from('media_assets')
          .select('*')
          .eq('tenant_id', currentTenantId)
          .order('entity_type', { ascending: true })
          .order('purpose', { ascending: true })
          .order('sort_order', { ascending: true });

        if (err) throw err;

        setAssets(
          (data || []).map((row) => ({
            id: row.id,
            bucket_id: row.bucket_id,
            storage_path: row.storage_path,
            file_url: row.file_url,
            file_name: row.file_name,
            mime_type: row.mime_type,
            width: row.width,
            height: row.height,
            is_primary: row.is_primary,
            sort_order: row.sort_order,
            alt_text: row.alt_text,
            created_at: row.created_at,
            metadata: row.metadata as Record<string, unknown> | undefined,
          })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar galeria');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [currentTenantId]);

  const status = isLoading ? 'loading' : error ? 'error' : 'success';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border bg-background/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-semibold">
                Galeria de Mídia
              </h1>
              <p className="text-muted-foreground text-sm">
                Olá, {firstName}. Navegue pelas galerias de imagens por entidade.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ContentBoundary
        status={status}
        error={error}
        homeRoute="/dashboard/media"
        emptyTitle="Nenhuma imagem na galeria"
        emptyDescription="Não há imagens cadastradas na galeria."
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground text-lg font-semibold">
                Ativos ({assets.length})
              </h2>
            </div>
            <GalleryGrid assets={assets} disabled={isLoading} />
          </div>
        </div>
      </ContentBoundary>
    </div>
  );
}
