import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/utils';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onError?: (error: string | null) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
}

export function DropZone({
  onFilesSelected,
  onError,
  accept = 'image/png,image/jpeg,image/webp',
  maxFiles = 1,
  maxSizeMB = 10,
  disabled = false,
  className,
  multiple = false,
}: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        errors.push(`${file.name}: formato não suportado (use PNG, JPG ou WebP)`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name}: arquivo muito grande (máx. ${maxSizeMB} MB)`);
        continue;
      }
      validFiles.push(file);
    }

    const errorMessage = errors.length > 0 ? errors.join('; ') : null;
    setDragError(errorMessage);
    onError?.(errorMessage);

    return validFiles.slice(0, maxFiles);
  }, [maxFiles, maxSizeMB, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const validFiles = validateFiles(e.dataTransfer.files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [disabled, onFilesSelected, validateFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const validFiles = validateFiles(e.target.files!);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
    e.target.value = '';
  }, [disabled, onFilesSelected, validateFiles]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.multiple = multiple;
      input.onchange = handleFileSelect as any;
      input.click();
    }
  }, [accept, disabled, handleFileSelect, multiple]);

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 transition-colors cursor-pointer',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={disabled}
        aria-hidden="true"
        aria-label="selecionar arquivo"
      />

      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-3">
          <Upload className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {multiple ? 'Arraste e solte ou clique para selecionar' : 'Clique ou arraste uma imagem'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          PNG, JPG ou WebP • Máx. {maxSizeMB} MB
          {multiple ? ` • Até ${maxFiles} arquivos` : ''}
        </p>

        {dragError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
            {dragError}
          </p>
        )}
      </div>
    </div>
  );
}