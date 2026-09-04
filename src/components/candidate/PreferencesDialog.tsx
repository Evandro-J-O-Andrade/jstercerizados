import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/feedback/ToastContext';

const preferencesSchema = z.object({
  desired_roles: z.string().optional(),
  desired_locations: z.string().optional(),
  salary_min: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === '' || v === null || v === undefined ? undefined : Number(v))),
  salary_max: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === '' || v === null || v === undefined ? undefined : Number(v))),
  contract_types: z.string().optional(),
  shifts: z.string().optional(),
  work_modes: z.string().optional(),
  max_distance_km: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === '' || v === null || v === undefined ? undefined : Number(v))),
  available_from: z.string().optional(),
  matching_enabled: z.boolean().default(true),
  receive_match_alerts: z.boolean().default(true),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

function parseArray(value: string): string[] | null {
  if (!value.trim()) return null;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    desired_roles: string[] | null;
    desired_locations: string[] | null;
    salary_min: number | null;
    salary_max: number | null;
    contract_types: string[] | null;
    shifts: string[] | null;
    work_modes: string[] | null;
    max_distance_km: number | null;
    available_from: string | null;
    matching_enabled: boolean;
    receive_match_alerts: boolean;
  }) => Promise<void>;
  initialData?: {
    id?: string;
    desired_roles?: string[] | null;
    desired_locations?: string[] | null;
    salary_min?: number | null;
    salary_max?: number | null;
    contract_types?: string[] | null;
    shifts?: string[] | null;
    work_modes?: string[] | null;
    max_distance_km?: number | null;
    available_from?: string | null;
    matching_enabled?: boolean;
    receive_match_alerts?: boolean;
  } | null;
  onSuccess?: () => void;
}

export function PreferencesDialog({
  open,
  onOpenChange,
  onConfirm,
  initialData,
  onSuccess,
}: PreferencesDialogProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      desired_roles: initialData?.desired_roles?.join(', ') ?? '',
      desired_locations: initialData?.desired_locations?.join(', ') ?? '',
      salary_min: initialData?.salary_min ?? undefined,
      salary_max: initialData?.salary_max ?? undefined,
      contract_types: initialData?.contract_types?.join(', ') ?? '',
      shifts: initialData?.shifts?.join(', ') ?? '',
      work_modes: initialData?.work_modes?.join(', ') ?? '',
      max_distance_km: initialData?.max_distance_km ?? undefined,
      available_from: initialData?.available_from ?? '',
      matching_enabled: initialData?.matching_enabled ?? true,
      receive_match_alerts: initialData?.receive_match_alerts ?? true,
    },
  });

  useState(() => {
    if (open) {
      reset({
        desired_roles: initialData?.desired_roles?.join(', ') ?? '',
        desired_locations: initialData?.desired_locations?.join(', ') ?? '',
        salary_min: initialData?.salary_min ?? undefined,
        salary_max: initialData?.salary_max ?? undefined,
        contract_types: initialData?.contract_types?.join(', ') ?? '',
        shifts: initialData?.shifts?.join(', ') ?? '',
        work_modes: initialData?.work_modes?.join(', ') ?? '',
        max_distance_km: initialData?.max_distance_km ?? undefined,
        available_from: initialData?.available_from ?? '',
        matching_enabled: initialData?.matching_enabled ?? true,
        receive_match_alerts: initialData?.receive_match_alerts ?? true,
      });
    }
  });

  const onSubmit = async (data: PreferencesFormData) => {
    setIsSubmitting(true);
    try {
      await onConfirm({
        desired_roles: parseArray(data.desired_roles ?? ''),
        desired_locations: parseArray(data.desired_locations ?? ''),
        salary_min: data.salary_min ?? null,
        salary_max: data.salary_max ?? null,
        contract_types: parseArray(data.contract_types ?? ''),
        shifts: parseArray(data.shifts ?? ''),
        work_modes: parseArray(data.work_modes ?? ''),
        max_distance_km: data.max_distance_km ?? null,
        available_from: data.available_from ?? null,
        matching_enabled: data.matching_enabled,
        receive_match_alerts: data.receive_match_alerts,
      });
      addToast({
        type: 'success',
        message: initialData?.id
          ? 'Preferências atualizadas!'
          : 'Preferências salvas!',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao salvar preferências. Tente novamente.',
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
            className="bg-card border-border w-full max-w-2xl rounded-xl border p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              {initialData?.id ? 'Editar preferências' : 'Nova preferência'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Cargos desejados"
                  error={errors.desired_roles?.message}
                  helperText="Separados por vírgula"
                >
                  <Input
                    id="desired_roles"
                    {...register('desired_roles')}
                    placeholder="Ex.: Auxiliar, Zelador"
                  />
                </FormField>

                <FormField
                  label="Localizações desejadas"
                  error={errors.desired_locations?.message}
                  helperText="Separadas por vírgula"
                >
                  <Input
                    id="desired_locations"
                    {...register('desired_locations')}
                    placeholder="Ex.: São Paulo, Guarulhos"
                  />
                </FormField>

                <FormField
                  label="Salário mínimo (R$)"
                  error={errors.salary_min?.message}
                >
                  <Input
                    id="salary_min"
                    type="number"
                    {...register('salary_min')}
                    placeholder="Ex.: 1500"
                  />
                </FormField>

                <FormField
                  label="Salário máximo (R$)"
                  error={errors.salary_max?.message}
                >
                  <Input
                    id="salary_max"
                    type="number"
                    {...register('salary_max')}
                    placeholder="Ex.: 2500"
                  />
                </FormField>

                <FormField
                  label="Tipos de contrato"
                  error={errors.contract_types?.message}
                  helperText="Separados por vírgula"
                >
                  <Input
                    id="contract_types"
                    {...register('contract_types')}
                    placeholder="Ex.: CLT, PJ"
                  />
                </FormField>

                <FormField
                  label="Turnos"
                  error={errors.shifts?.message}
                  helperText="Separados por vírgula"
                >
                  <Input
                    id="shifts"
                    {...register('shifts')}
                    placeholder="Ex.: Diurno, Noturno"
                  />
                </FormField>

                <FormField
                  label="Modalidades"
                  error={errors.work_modes?.message}
                  helperText="Separadas por vírgula"
                >
                  <Input
                    id="work_modes"
                    {...register('work_modes')}
                    placeholder="Ex.: Presencial, Híbrido"
                  />
                </FormField>

                <FormField
                  label="Distância máxima (km)"
                  error={errors.max_distance_km?.message}
                >
                  <Input
                    id="max_distance_km"
                    type="number"
                    {...register('max_distance_km')}
                    placeholder="Ex.: 30"
                  />
                </FormField>

                <FormField
                  label="Disponível a partir"
                  error={errors.available_from?.message}
                >
                  <Input
                    id="available_from"
                    type="date"
                    {...register('available_from')}
                  />
                </FormField>

                <div className="flex items-center gap-6 sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('matching_enabled')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Matching ativado</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('receive_match_alerts')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Receber alertas de matching</span>
                  </label>
                </div>
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
