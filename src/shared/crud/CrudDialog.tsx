import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, AlertTriangle } from 'lucide-react';
import { FormErrorAlert } from './CrudAlerts';
import type { ReactNode } from 'react';

interface CrudDialogProps {
  onClose: () => void;
  title: string;
  submitLabel: string;
  onSubmit: () => void;
  errorMessage?: string | null;
  children: ReactNode;
  maxWidth?: string;
}

export function CrudDialog({
  onClose,
  title,
  submitLabel,
  onSubmit,
  errorMessage,
  children,
  maxWidth = 'w-full max-w-2xl',
}: CrudDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={maxWidth}
      >
        <Card variant="default" className="p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {errorMessage && <FormErrorAlert message={errorMessage} />}
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {children}
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onSubmit}>{submitLabel}</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

interface CrudConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
}

export function CrudConfirmDialog({
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel,
}: CrudConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-md"
      >
        <Card variant="default" className="p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-foreground text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground mb-6 text-sm">{message}</p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
