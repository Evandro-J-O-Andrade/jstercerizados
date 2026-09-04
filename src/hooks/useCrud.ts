import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/feedback/ToastContext';

interface UseCrudOptions {
  onDeleteSuccess?: () => void;
  deleteMessage?: string;
}

interface UseCrudReturn {
  loading: boolean;
  error: string | null;
  deleteTarget: { id: string; message: string } | null;
  setDeleteTarget: (target: { id: string; message: string } | null) => void;
  confirmDelete: (id: string, deleteFn: () => Promise<void>, message?: string) => void;
  handleConfirmDelete: () => Promise<void>;
  execute: <T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage?: string,
  ) => Promise<T | undefined>;
  clearError: () => void;
}

export function useCrud(options: UseCrudOptions = {}): UseCrudReturn {
  const { addToast } = useToast();
  const { onDeleteSuccess, deleteMessage = 'Essa ação não poderá ser desfeita.' } = options;
  const deleteFnRef = useRef<(() => Promise<void>) | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    message: string;
  } | null>(null);

  const execute = useCallback(
    async <T>(
      operation: () => Promise<T>,
      successMessage: string,
      errorMessage = 'Erro ao executar operação',
    ): Promise<T | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const result = await operation();
        addToast({ message: successMessage, type: 'success' });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        setError(message);
        addToast({ message, type: 'error' });
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  const confirmDelete = useCallback(
    (id: string, deleteFn: () => Promise<void>, message?: string) => {
      deleteFnRef.current = deleteFn;
      setDeleteTarget({ id, message: message || deleteMessage });
    },
    [deleteMessage],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      if (deleteFnRef.current) {
        await deleteFnRef.current();
      }
      addToast({ message: 'Registro excluído com sucesso.', type: 'success' });
      onDeleteSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir';
      setError(message);
      addToast({ message, type: 'error' });
    } finally {
      deleteFnRef.current = null;
      setDeleteTarget(null);
    }
  }, [deleteTarget, addToast, onDeleteSuccess]);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    handleConfirmDelete,
    execute,
    clearError,
  };
}
