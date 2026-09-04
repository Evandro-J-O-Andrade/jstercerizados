import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/feedback/ToastContext';

const courseSchema = z.object({
  name: z
    .string()
    .min(2, 'Informe o nome do curso')
    .max(120, 'Nome muito longo'),
  institution: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  hours: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === '' || v === null ? undefined : Number(v))),
  completed_at: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: CourseFormData) => Promise<void>;
  initialData?: {
    id?: string;
    name?: string;
    institution?: string | null;
    hours?: number | null;
    completed_at?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function CourseDialog({
  open,
  onOpenChange,
  onConfirm,
  initialData,
  onSuccess,
}: CourseDialogProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      institution: initialData?.institution ?? '',
      hours: initialData?.hours ?? undefined,
      completed_at: initialData?.completed_at ?? '',
    },
  });

  useState(() => {
    if (open) {
      reset({
        name: initialData?.name ?? '',
        institution: initialData?.institution ?? '',
        hours: initialData?.hours ?? undefined,
        completed_at: initialData?.completed_at ?? '',
      });
    }
  });

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      await onConfirm(data);
      addToast({
        type: 'success',
        message: initialData?.id ? 'Curso atualizado!' : 'Curso adicionado!',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao salvar curso. Tente novamente.',
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
              {initialData?.id ? 'Editar curso' : 'Novo curso'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Nome do curso" error={errors.name?.message} required>
                <Input id="name" {...register('name')} />
              </FormField>

              <FormField label="Instituição" error={errors.institution?.message}>
                <Input id="institution" {...register('institution')} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Carga horária (h)" error={errors.hours?.message}>
                  <Input id="hours" type="number" {...register('hours')} />
                </FormField>

                <FormField label="Conclusão" error={errors.completed_at?.message}>
                  <Input id="completed_at" type="date" {...register('completed_at')} />
                </FormField>
              </div>

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
