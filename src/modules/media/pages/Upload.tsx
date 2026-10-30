import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MediaUploader } from '@/components/media';
import type { MediaAsset, MediaUploaderProps } from '@/components/media/MediaUploader.types';

export default function MediaUploadPage() {
  const { person } = useAuth();

  const firstName = person?.full_name?.split(' ')[0] || 'Usuário';

  const [entityType, setEntityType] = useState<MediaUploaderProps['entityType']>('company');
  const [entityId, setEntityId] = useState('');
  const [purpose, setPurpose] = useState<MediaUploaderProps['purpose']>('logo');
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  const entityTypes: { value: MediaUploaderProps['entityType']; label: string }[] = [
    { value: 'company', label: 'Empresa' },
    { value: 'service', label: 'Serviço' },
    { value: 'partner', label: 'Parceiro' },
    { value: 'supplier', label: 'Fornecedor' },
  ];

  const purposes: { value: MediaUploaderProps['purpose']; label: string }[] = [
    { value: 'logo', label: 'Logo' },
    { value: 'hero', label: 'Hero / Banner' },
    { value: 'card', label: 'Card' },
    { value: 'gallery', label: 'Galeria' },
  ];

  const handleUploadComplete = (asset: MediaAsset) => {
    setAssets((prev) => [...prev, asset]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border bg-background/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-semibold">Upload de Mídia</h1>
              <p className="text-muted-foreground text-sm">
                Olá, {firstName}. Faça upload de imagens e arquivos para as entidades do sistema.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Voltar
          </Button>
        </div>
      </div>

      <ContentBoundary
        status="success"
        homeRoute="/dashboard/media"
        emptyTitle="Nenhum upload disponível"
        emptyDescription="Não há arquivos para exibir."
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* Configuração de upload */}
            <Card padding="md">
              <div className="border border-border rounded-xl bg-muted/30 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Tipo de entidade
                    </label>
                    <select
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value as MediaUploaderProps['entityType'])}
                      className="w-full rounded-lg border px-3 py-2 text-sm bg-surface text-foreground"
                    >
                      {entityTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      ID da entidade
                    </label>
                    <input
                      type="text"
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      placeholder="UUID da entidade"
                      className="w-full rounded-lg border px-3 py-2 text-sm bg-surface text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Propósito
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value as MediaUploaderProps['purpose'])}
                      className="w-full rounded-lg border px-3 py-2 text-sm bg-surface text-foreground"
                    >
                      {purposes.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  O hash SHA-256 é calculado automaticamente sobre o arquivo para detecção de duplicados.
                </div>
              </div>
            </Card>

            <MediaUploader
              entityType={entityType}
              entityId={entityId}
              purpose={purpose}
              existingAssets={assets}
              onUploadComplete={handleUploadComplete}
              maxSizeMB={10}
              showPreview={true}
              disabled={!entityId}
            />
          </div>
        </div>
      </ContentBoundary>
    </div>
  );
}
