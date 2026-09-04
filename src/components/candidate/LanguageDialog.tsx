import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/feedback/ToastContext';

const languageSchema = z.object({
  language: z
    .string()
    .min(2, 'Informe o idioma')
    .max(60, 'Nome muito longo'),
  level: z
    .string()
    .min(2, 'Informe o nível')
    .max(60, 'Nível muito longo'),
});

type LanguageFormData = z.infer<typeof languageSchema>;

interface LanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: LanguageFormData) => Promise<void>;
  initialData?: {
    id?: string;
    language?: string;
    level?: string;
  } | null;
  onSuccess?: () => void;
}

const LEVEL_OPTIONS = [
  { value: 'Básico', label: 'Básico' },
  { value: 'Intermediário', label: 'Intermediário' },
  { value: 'Avançado', label: 'Avançado' },
  { value: 'Fluente', label: 'Fluente' },
  { value: 'Nativo', label: 'Nativo' },
];

export function LanguageDialog({
  open,
  onOpenChange,
  onConfirm,
  initialData,
  onSuccess,
}: LanguageDialogProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      language: initialData?.language ?? '',
      level: initialData?.level ?? '',
    },
  });

  useState(() => {
    if (open) {
      reset({
        language: initialData?.language ?? '',
        level: initialData?.level ?? '',
      });
    }
  });

  const onSubmit = async (data: LanguageFormData) => {
    setIsSubmitting(true);
    try {
      await onConfirm(data);
      addToast({
        type: 'success',
        message: initialData?.id ? 'Idioma atualizado!' : 'Idioma adicionado!',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao salvar idioma. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              {initialData?.id ? 'Editar idioma' : 'Novo idioma'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Idioma" error={errors.language?.message} required>
                <Input id="language" {...register('language')} />
              </FormField>

              <FormField label="Nível" error={errors.level?.message} required>
                <Select id="level" {...register('level')}>
                  <option value="">Selecione</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
