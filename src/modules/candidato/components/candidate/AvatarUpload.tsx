import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/components/feedback/ToastContext';
import { Upload, Image, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface AvatarUploadProps {
  candidateId: string;
  currentUrl: string | null;
  onConfirm: (avatarUrl: string | null) => Promise<void>;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function AvatarUpload({
  candidateId,
  currentUrl,
  onConfirm,
  isLoading = false,
}: AvatarUploadProps) {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      addToast({
        type: 'error',
        message: 'Formato não suportado. Use PNG, JPG ou WebP.',
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      addToast({
        type: 'error',
        message: 'Arquivo muito grande. Máximo 5 MB.',
      });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const supabase = getSupabaseClient();
    if (!supabase) {
      addToast({ type: 'error', message: 'Serviço indisponível.' });
      setUploading(false);
      return;
    }

    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() ?? 'png';
      const safeName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `candidatos/${candidateId}/avatar/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: selectedFile.type,
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await onConfirm(urlData.publicUrl);
      addToast({
        type: 'success',
        message: 'Avatar atualizado com sucesso!',
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      addToast({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Erro ao enviar avatar. Tente novamente.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await onConfirm(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      addToast({ type: 'success', message: 'Avatar removido.' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao remover avatar.' });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          {currentUrl && !previewUrl ? (
            <img
              src={currentUrl}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
            />
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Pré-visualização"
              className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-muted">
              <Image className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {!isLoading && (
            <button
              type="button"
              onClick={
                selectedFile || previewUrl ? undefined : () => {
                  const input = document.getElementById(
                    'avatar-file-input',
                  ) as HTMLInputElement | null;
                  input?.click();
                }
              }
              disabled={uploading || isLoading}
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90 transition-colors"
              aria-label="Alterar avatar"
            >
              <Upload className="h-4 w-4" />
            </button>
          )}
          {currentUrl && !isLoading && !previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/90 transition-colors"
              aria-label="Remover avatar"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        <input
          id="avatar-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {!previewUrl && !currentUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={
              () => {
                const input = document.getElementById(
                  'avatar-file-input',
                ) as HTMLInputElement | null;
                input?.click();
              }
            }
            disabled={isLoading || uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Enviar foto
          </Button>
        )}

        {previewUrl && !isLoading && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Image className="mr-2 h-4 w-4" />
              )}
              Salvar avatar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
