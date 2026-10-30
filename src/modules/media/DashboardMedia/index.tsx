import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { Image, Upload, LayoutGrid, FileImage } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import type { MediaAsset } from '@/components/media/MediaUploader.types';

const MEDIA_HOME = '/dashboard/media';

type PurposeStats = {
  total: number;
};

export function DashboardMedia() {
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
          .order('created_at', { ascending: false });

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
        setError(err instanceof Error ? err.message : 'Erro ao carregar mídia');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [currentTenantId]);

  const status = isLoading ? 'loading' : error ? 'error' : 'success';

  const stats: PurposeStats = {
    total: assets.length,
  };

  const quickLinks = [
    {
      icon: Upload,
      label: 'Upload',
      description: 'Envie novos arquivos de mídia',
      path: '/dashboard/media/upload',
      permission: 'media.upload.manage',
    },
    {
      icon: LayoutGrid,
      label: 'Galeria',
      description: 'Navegue pelas galerias por entidade',
      path: '/dashboard/media/gallery',
      permission: 'media.gallery.manage',
    },
    {
      icon: FileImage,
      label: 'Ativos',
      description: 'Gerencie todos os ativos de mídia',
      path: '/dashboard/media/assets',
      permission: 'media_assets.read',
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border bg-background/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2">
              <Image className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-semibold">Área de Mídia</h1>
              <p className="text-muted-foreground text-sm">
                Olá, {firstName}. Gerencie ativos de mídia, uploads e galerias abaixo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ContentBoundary
        status={status}
        error={error}
        homeRoute={MEDIA_HOME}
        emptyTitle="Nenhum ativo de mídia"
        emptyDescription="Não há ativos de mídia cadastrados."
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* Indicadores */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-card border-border rounded-xl p-4 border">
                <p className="text-muted-foreground text-sm">Total de ativos</p>
                <p className="text-foreground mt-1 text-2xl font-semibold">
                  {stats.total}
                </p>
              </div>
              <div className="bg-card border-border rounded-xl p-4 border">
                <p className="text-muted-foreground text-sm">Uploads pendentes</p>
                <p className="text-foreground mt-1 text-2xl font-semibold">
                  0
                </p>
              </div>
              <div className="bg-card border-border rounded-xl p-4 border">
                <p className="text-muted-foreground text-sm">Logos</p>
                <p className="text-foreground mt-1 text-2xl font-semibold">
                  0
                </p>
              </div>
              <div className="bg-card border-border rounded-xl p-4 border">
                <p className="text-muted-foreground text-sm">Galeria</p>
                <p className="text-foreground mt-1 text-2xl font-semibold">
                  0
                </p>
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.path}
                  className="bg-card border-border rounded-xl p-5 border flex flex-col gap-3 hover:border-primary/50 transition-colors"
                >
                  <div className="bg-primary/10 text-primary rounded-xl p-3">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      {link.label}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {link.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Upload rápido */}
            <section className="bg-card border-border rounded-xl p-5 border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-foreground text-lg font-semibold">
                    Upload rápido
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Envie arquivos diretamente para o tenant atual.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-4 bg-muted/50 text-sm text-muted-foreground">
                Use o menu lateral para acessar a página de Upload com configuração completa
                de tipo de entidade, propósito e tamanho máximo de arquivo.
              </div>
            </section>

          </div>
        </div>
      </ContentBoundary>
    </div>
  );
}

export default DashboardMedia;
