import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/feedback/ToastContext';

const skillSchema = z.object({
  name: z.string().min(1, 'Nome da habilidade é obrigatório'),
  level: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

type SkillFormData = z.infer<typeof skillSchema>;

interface SkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: SkillFormData) => Promise<void>;
  initialData?: {
    id?: string;
    name?: string;
    level?: string | null;
  } | null;
  onSuccess?: () => void;
}

const LEVEL_OPTIONS = [
  { value: 'Básico', label: 'Básico' },
  { value: 'Intermediário', label: 'Intermediário' },
  { value: 'Avançado', label: 'Avançado' },
  { value: 'Especialista', label: 'Especialista' },
];

export function SkillDialog({
  open,
  onOpenChange,
  onConfirm,
  initialData,
  onSuccess,
}: SkillDialogProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      level: initialData?.level ?? '',
    },
  });

  const onSubmit = async (data: SkillFormData) => {
    setIsSubmitting(true);
    try {
      await onConfirm(data);
      addToast({
        type: 'success',
        message: initialData?.id ? 'Habilidade atualizada!' : 'Habilidade adicionada!',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao salvar habilidade. Tente novamente.',
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
              {initialData?.id ? 'Editar habilidade' : 'Nova habilidade'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Habilidade" error={errors.name?.message} required>
                <Input
                  id="name"
                  {...register('name')}
                  disabled={isSubmitting}
                  placeholder="Digite o nome da habilidade"
                />
              </FormField>

              <FormField label="Nível" error={errors.level?.message}>
                <select
                  id="level"
                  {...register('level')}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Selecione</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
