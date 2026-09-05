import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/feedback/ToastContext';

const educationSchema = z.object({
  institution: z
    .string()
    .min(2, 'Informe a instituição')
    .max(120, 'Nome muito longo'),
  course: z
    .string()
    .min(2, 'Informe o curso')
    .max(120, 'Curso muito longo'),
  degree: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  start_date: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  end_date: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: EducationFormData) => Promise<void>;
  initialData?: {
    id?: string;
    institution?: string;
    course?: string;
    degree?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function EducationDialog({
  open,
  onOpenChange,
  onConfirm,
  initialData,
  onSuccess,
}: EducationDialogProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: initialData?.institution ?? '',
      course: initialData?.course ?? '',
      degree: initialData?.degree ?? '',
      start_date: initialData?.start_date ?? '',
      end_date: initialData?.end_date ?? '',
    },
  });

  useState(() => {
    if (open) {
      reset({
        institution: initialData?.institution ?? '',
        course: initialData?.course ?? '',
        degree: initialData?.degree ?? '',
        start_date: initialData?.start_date ?? '',
        end_date: initialData?.end_date ?? '',
      });
    }
  });

  const onSubmit = async (data: EducationFormData) => {
    setIsSubmitting(true);
    try {
      await onConfirm(data);
      addToast({
        type: 'success',
        message: initialData?.id
          ? 'Formação atualizada!'
          : 'Formação adicionada!',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao salvar formação. Tente novamente.',
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
              {initialData?.id ? 'Editar formação' : 'Nova formação'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                label="Instituição"
                error={errors.institution?.message}
                required
              >
                <Input id="institution" {...register('institution')} />
              </FormField>

              <FormField label="Curso" error={errors.course?.message} required>
                <Input id="course" {...register('course')} />
              </FormField>

              <FormField label="Grau" error={errors.degree?.message}>
                <Input id="degree" {...register('degree')} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Data de início" error={errors.start_date?.message}>
                  <Input id="start_date" type="date" {...register('start_date')} />
                </FormField>

                <FormField label="Data de término" error={errors.end_date?.message}>
                  <Input id="end_date" type="date" {...register('end_date')} />
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
