import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/feedback/ToastContext';

const experienceSchema = z.object({
  company: z
    .string()
    .min(2, 'Informe a empresa')
    .max(120, 'Nome muito longo'),
  position: z
    .string()
    .min(2, 'Informe o cargo')
    .max(120, 'Cargo muito longo'),
  start_date: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  end_date: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  description: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

interface ExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ExperienceFormData) => Promise<void>;
  initialData?: {
    id?: string;
    company?: string;
    position?: string;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function ExperienceDialog({
  open,
  onOpenChange,
  onConfirm,
  initialData,
  onSuccess,
}: ExperienceDialogProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: initialData?.company ?? '',
      position: initialData?.position ?? '',
      start_date: initialData?.start_date ?? '',
      end_date: initialData?.end_date ?? '',
      description: initialData?.description ?? '',
    },
  });

  useState(() => {
    if (open) {
      reset({
        company: initialData?.company ?? '',
        position: initialData?.position ?? '',
        start_date: initialData?.start_date ?? '',
        end_date: initialData?.end_date ?? '',
        description: initialData?.description ?? '',
      });
    }
  });

  const onSubmit = async (data: ExperienceFormData) => {
    setIsSubmitting(true);
    try {
      await onConfirm(data);
      addToast({
        type: 'success',
        message: initialData?.id
          ? 'Experiência atualizada!'
          : 'Experiência adicionada!',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao salvar experiência. Tente novamente.',
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
              {initialData?.id ? 'Editar experiência' : 'Nova experiência'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Empresa" error={errors.company?.message} required>
                <Input id="company" {...register('company')} />
              </FormField>

              <FormField label="Cargo" error={errors.position?.message} required>
                <Input id="position" {...register('position')} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Data de início" error={errors.start_date?.message}>
                  <Input id="start_date" type="date" {...register('start_date')} />
                </FormField>

                <FormField label="Data de término" error={errors.end_date?.message}>
                  <Input id="end_date" type="date" {...register('end_date')} />
                </FormField>
              </div>

              <FormField label="Descrição" error={errors.description?.message}>
                <Textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                />
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
