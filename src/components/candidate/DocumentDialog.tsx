import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/components/feedback/ToastContext';
import { getSupabaseClient } from '@/lib/supabase';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { url: string; name: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
  existingDocument?: {
    id: string;
    name: string | null;
    url: string;
  } | null;
  onSuccess?: () => void;
}

export function DocumentDialog({
  open,
  onOpenChange,
  onConfirm,
  onDelete,
  existingDocument,
  onSuccess,
}: DocumentDialogProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useState(() => {
    if (open) {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type === 'application/pdf') {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast({
        type: 'warning',
        message: 'Selecione um arquivo PDF',
      });
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      addToast({
        type: 'error',
        message: 'Serviço indisponível no momento.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() ?? 'pdf';
      const safeName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `curriculos/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('curriculos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        throw new Error(`Erro ao enviar currículo: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('curriculos')
        .getPublicUrl(filePath);

      await onConfirm({ url: urlData.publicUrl, name: selectedFile.name });
      addToast({
        type: 'success',
        message: existingDocument
          ? 'Currículo atualizado!'
          : 'Currículo enviado!',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : 'Erro ao enviar currículo. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete();
      addToast({
        type: 'success',
        message: 'Currículo removido!',
      });
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao remover currículo. Tente novamente.',
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card border-border w-full max-w-lg rounded-xl border p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-foreground mb-4 text-lg font-semibold">
                {existingDocument ? 'Substituir currículo' : 'Enviar currículo'}
              </h3>

              {existingDocument && (
                <div className="border-border mb-4 rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {existingDocument.name || 'Currículo atual'}
                      </p>
                      <a
                        href={existingDocument.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline"
                      >
                        Abrir documento
                      </a>
                    </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        aria-label="Remover currículo"
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Arquivo PDF" required>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? selectedFile.name : 'Selecionar arquivo PDF'}
                  </Button>
                  {selectedFile && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </FormField>

                {previewUrl && (
                  <div className="border-border rounded-lg border p-2">
                    <iframe
                      src={previewUrl}
                      className="h-64 w-full rounded"
                      title="Preview"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !selectedFile}>
                    {isSubmitting ? 'Enviando...' : existingDocument ? 'Substituir' : 'Enviar'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Remover currículo?"
        message="Essa ação não pode ser desfeita. O currículo será removido permanentemente."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
