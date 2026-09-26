'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md"
          >
            <Card variant="elevated" padding="lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-warning/10 text-warning flex h-8 w-8 items-center justify-center rounded-full">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-foreground text-lg font-semibold">
                  {title}
                </h3>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{message}</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  {cancelLabel}
                </Button>
                <Button
                  variant={variant === 'danger' ? 'primary' : variant}
                  size="sm"
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
