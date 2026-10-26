import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { candidatesRepository } from '@/modules/candidato/repositories/candidates.repository';
import type { Person } from '@/types/auth';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { getSupabaseClient } from '@/lib/supabase';
import { User, Briefcase, Save, Loader2, Camera } from 'lucide-react';

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
  const { person, user, updateProfile, refreshAuthData } = useAuth();
  const { candidate, refetch } = useCandidato();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      addToast({ type: 'error', message: 'Formato não suportado. Use JPG, PNG ou WebP.' });
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', message: 'A foto deve ter no máximo 5 MB.' });
      input.value = '';
      return;
    }
    if (!candidate) {
      addToast({ type: 'error', message: 'Não foi possível localizar seu cadastro de candidato.' });
      input.value = '';
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase não está configurado.');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', 'candidate');
      formData.append('entity_id', candidate.id);
      formData.append('purpose', 'avatar');

      const { data, error } = await supabase.functions.invoke('media-upload', {
        body: formData,
        method: 'POST',
      });
      if (error) throw new Error(error.message || 'Falha ao enviar a foto.');
      if (!data?.success || !data?.asset?.file_url) {
        throw new Error(data?.error || 'O servidor não confirmou o envio da foto.');
      }

      await refreshAuthData(user?.id);
      addToast({ type: 'success', message: 'Foto do perfil atualizada com sucesso.' });
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível atualizar a foto.',
      });
    } finally {
      setIsUploadingAvatar(false);
      input.value = '';
    }
  };

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

        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {person?.avatar_url ? (
              <img
                src={person.avatar_url}
                alt={`Foto de perfil de ${person.full_name}`}
                className="h-24 w-24 rounded-full border border-border object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-border bg-muted">
                <User className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-foreground text-base font-semibold">Foto do perfil</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Use uma foto nítida para ajudar as empresas a reconhecer seu perfil.
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleAvatarFileChange}
                disabled={isUploadingAvatar || !candidate}
                aria-label="Selecionar foto de perfil"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar || !candidate}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando foto...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Alterar foto
                    </>
                  )}
                </Button>
                <span className="text-muted-foreground text-xs">JPG, PNG ou WebP · até 5 MB</span>
              </div>
            </div>
          </div>
        </Card>

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

