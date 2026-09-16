import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/feedback/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCandidate } from '@/contexts/CandidateContext';
import { candidatesRepository } from '@/repositories/candidates.repository';
import type { Person } from '@/types/auth';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { User, Briefcase, Save, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Informe seu nome completo')
    .max(120, 'Nome muito longo'),
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  phone: z
    .string()
    .max(20, 'Telefone inválido')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  headline: z
    .string()
    .max(200, 'Headline muito longa')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  salary_expectation_min: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === '' || v === null ? undefined : Number(v))),
  salary_expectation_max: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === '' || v === null ? undefined : Number(v))),
  availability: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((v) => (v === '' ? null : v)),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CandidatePerfil() {
  const { person, updateProfile } = useAuth();
  const { candidate, refetch } = useCandidate();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: person?.full_name ?? '',
      email: person?.email ?? '',
      phone: person?.phone ?? '',
      headline: candidate?.headline ?? '',
      salary_expectation_min: candidate?.salary_expectation_min ?? undefined,
      salary_expectation_max: candidate?.salary_expectation_max ?? undefined,
      availability: candidate?.availability
        ? String(candidate.availability)
        : '',
    },
  });

  useEffect(() => {
    if (!person || !candidate) return;
    reset({
      full_name: person.full_name ?? '',
      email: person.email ?? '',
      phone: person.phone ?? '',
      headline: candidate.headline ?? '',
      salary_expectation_min: candidate.salary_expectation_min ?? undefined,
      salary_expectation_max: candidate.salary_expectation_max ?? undefined,
      availability: candidate.availability
        ? String(candidate.availability)
        : '',
    });
    setIsEditing(false);
  }, [person, candidate, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const personUpdate: Partial<Person> = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
      };

      const personResult = await updateProfile(personUpdate);
      if (personResult.error) {
        addToast({
          type: 'error',
          message: personResult.error,
        });
        return;
      }

      if (candidate) {
        const candidateUpdate: Record<string, unknown> = {};
        if (data.headline !== undefined)
          candidateUpdate.headline = data.headline;
        if (data.salary_expectation_min !== undefined)
          candidateUpdate.salary_expectation_min = data.salary_expectation_min;
        if (data.salary_expectation_max !== undefined)
          candidateUpdate.salary_expectation_max = data.salary_expectation_max;
        if (data.availability !== undefined)
          candidateUpdate.availability = data.availability;

        await candidatesRepository.update(
          candidate.id,
          candidate.tenant_id,
          candidateUpdate,
        );
      }

      await refetch();
      addToast({
        type: 'success',
        message: 'Perfil atualizado com sucesso!',
      });
      setIsEditing(false);
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao atualizar perfil. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!person || !candidate) return;
    reset({
      full_name: person.full_name ?? '',
      email: person.email ?? '',
      phone: person.phone ?? '',
      headline: candidate.headline ?? '',
      salary_expectation_min: candidate.salary_expectation_min ?? undefined,
      salary_expectation_max: candidate.salary_expectation_max ?? undefined,
      availability: candidate.availability
        ? String(candidate.availability)
        : '',
    });
    setIsEditing(false);
  };

  return (
    <>
      <SEO
        title={`Meu perfil — ${COMPANY.name}`}
        description="Perfil do candidato"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Meu perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Suas informações pessoais e profissionais.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-5 w-5" />
                <h2 className="text-foreground text-base font-semibold">
                  Dados pessoais
                </h2>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Nome completo"
                error={errors.full_name?.message}
                required
              >
                <Input
                  id="full_name"
                  {...register('full_name')}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField label="E-mail" error={errors.email?.message} required>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField label="Telefone" error={errors.phone?.message}>
                <Input
                  id="phone"
                  {...register('phone')}
                  disabled={!isEditing}
                />
              </FormField>
            </div>
          </Card>

          <Card className="mt-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="text-muted-foreground h-5 w-5" />
                <h2 className="text-foreground text-base font-semibold">
                  Perfil profissional
                </h2>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Headline"
                error={errors.headline?.message}
                helperText="Ex.: Desenvolvedor Full Stack com 5 anos de experiência"
              >
                <Textarea
                  id="headline"
                  rows={3}
                  {...register('headline')}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField
                label="Pretensão salarial mínima (R$)"
                error={errors.salary_expectation_min?.message}
              >
                <Input
                  id="salary_expectation_min"
                  type="number"
                  {...register('salary_expectation_min')}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField
                label="Pretensão salarial máxima (R$)"
                error={errors.salary_expectation_max?.message}
              >
                <Input
                  id="salary_expectation_max"
                  type="number"
                  {...register('salary_expectation_max')}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField
                label="Disponibilidade"
                error={errors.availability?.message}
              >
                <Input
                  id="availability"
                  {...register('availability')}
                  disabled={!isEditing}
                  placeholder="Ex.: Imediata, 30 dias, etc."
                />
              </FormField>
            </div>
          </Card>

          {isEditing && (
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !isDirty}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
