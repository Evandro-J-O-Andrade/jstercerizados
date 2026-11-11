'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  FileText,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FormAlert } from '@/components/ui/FormAlert';
import { Card } from '@/components/ui/Card';
import { MediaUploader } from '@/components/media/MediaUploader';
import { mediaAssetsRepository } from '@/repositories/media-assets.repository';
import type { Company } from '@/types/domain/company';
import type { MediaAsset } from '@/components/media/MediaUploader.types';
import { cn } from '@/utils';

type MediaPurpose = 'logo' | 'hero' | 'gallery';

/**
 * Schema alinhado aos campos efetivamente suportados por `companiesRepository`
 * e por `CompanyCreateInput/UpdateInput` (contrato de código atual).
 * Campos adicionais de schema/RLS devem ser expandidos somente após reconciliação.
 */
const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  trading_name: z.string().optional().nullable(),
  legal_name: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  industry: z.string().optional().nullable(),
  email: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'E-mail inválido'),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  address_street: z.string().optional().nullable(),
  address_city: z.string().optional().nullable(),
  address_state: z.string().optional().nullable(),
  address_zip: z.string().optional().nullable(),
});

export type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  open: boolean;
  tenantId: string;
  editingCompany: Company | null;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel: () => void;
  /** Quando usado embutido na página (não modal) */
  embedded?: boolean;
}

const emptyValues: CompanyFormData = {
  name: '',
  trading_name: null,
  legal_name: null,
  cnpj: null,
  status: 'active',
  industry: null,
  email: null,
  phone: null,
  website: null,
  size: null,
  description: null,
  short_description: null,
  address_street: null,
  address_city: null,
  address_state: null,
  address_zip: null,
};

function toFormValues(company: Company | null): CompanyFormData {
  if (!company) return { ...emptyValues };
  const addr = (company.address ?? {}) as Record<string, unknown>;
  return {
    name: company.name ?? '',
    trading_name: company.trading_name ?? null,
    legal_name: company.legal_name ?? null,
    cnpj: company.cnpj ?? null,
    status: company.status ?? 'active',
    industry: company.industry ?? null,
    email: company.email ?? null,
    phone: company.phone ?? null,
    website: company.website ?? null,
    size: company.size ?? null,
    description: company.description ?? null,
    short_description: company.short_description ?? null,
    address_street: (addr.street as string) ?? null,
    address_city: (addr.city as string) ?? null,
    address_state: (addr.state as string) ?? null,
    address_zip: (addr.zip as string) ?? null,
  };
}

export function CompanyForm({
  open,
  tenantId,
  editingCompany,
  onSubmit,
  onCancel,
  embedded = false,
}: CompanyFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<Record<MediaPurpose, MediaAsset[]>>({
    logo: [],
    hero: [],
    gallery: [],
  });
  const [activeMediaTab, setActiveMediaTab] = useState<MediaPurpose>('logo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMediaAssets = useCallback(
    async (companyId: string) => {
      if (!tenantId) return;
      try {
        const [logoAssets, heroAssets, galleryAssets] = await Promise.all([
          mediaAssetsRepository.findByEntity(tenantId, 'company', companyId, 'logo'),
          mediaAssetsRepository.findByEntity(tenantId, 'company', companyId, 'hero'),
          mediaAssetsRepository.findByEntity(tenantId, 'company', companyId, 'gallery'),
        ]);
        setMediaAssets({ logo: logoAssets, hero: heroAssets, gallery: galleryAssets });
      } catch {
        // mídia é complementar; falha não bloqueia formulário
      }
    },
    [tenantId],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) {
      reset(emptyValues);
      setFormError(null);
      setMediaAssets({ logo: [], hero: [], gallery: [] });
      setActiveMediaTab('logo');
      setIsSubmitting(false);
      return;
    }
    reset(toFormValues(editingCompany));
    if (editingCompany) void loadMediaAssets(editingCompany.id);
    else setMediaAssets({ logo: [], hero: [], gallery: [] });
  }, [open, editingCompany, reset, loadMediaAssets]);

  const handleFormSubmit = async (data: CompanyFormData) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar a empresa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const form = (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {formError && <FormAlert variant="error" title="Erro ao salvar" description={formError} />}

      <section className="space-y-4">
        <SectionTitle icon={Building2} title="Identificação" subtitle="Dados cadastrais principais" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome *" error={errors.name?.message} className="sm:col-span-2">
            <Input id="name" {...register('name')} placeholder="Nome da empresa" aria-invalid={!!errors.name} />
          </Field>
          <Field label="Nome fantasia" error={errors.trading_name?.message}>
            <Input id="trading_name" {...register('trading_name')} placeholder="Nome fantasia" />
          </Field>
          <Field label="Razão social" error={errors.legal_name?.message}>
            <Input id="legal_name" {...register('legal_name')} placeholder="Razão social" />
          </Field>
          <Field label="CNPJ" error={errors.cnpj?.message}>
            <Input id="cnpj" {...register('cnpj')} placeholder="00.000.000/0000-00" />
          </Field>
          <Field label="Situação" error={errors.status?.message}>
            <select
              id="status"
              {...register('status')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="active">Ativa</option>
              <option value="pending">Pendente</option>
              <option value="inactive">Inativa</option>
              <option value="suspended">Suspensa</option>
            </select>
          </Field>
          <Field label="Segmento / indústria" error={errors.industry?.message}>
            <Input id="industry" {...register('industry')} placeholder="Segmento de atuação" />
          </Field>
          <Field label="Porte" error={errors.size?.message}>
            <select
              id="size"
              {...register('size')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Não informado</option>
              <option value="micro">Micro</option>
              <option value="small">Pequena</option>
              <option value="medium">Média</option>
              <option value="large">Grande</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle icon={Phone} title="Contato" subtitle="Canais suportados pelo cadastro atual" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail" error={errors.email?.message}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="email" type="email" {...register('email')} placeholder="contato@empresa.com" className="pl-9" />
            </div>
          </Field>
          <Field label="Telefone" error={errors.phone?.message}>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="phone" {...register('phone')} placeholder="(00) 00000-0000" className="pl-9" />
            </div>
          </Field>
          <Field label="Website" error={errors.website?.message} className="sm:col-span-2">
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id="website" {...register('website')} placeholder="https://..." className="pl-9" />
            </div>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle icon={MapPin} title="Endereço" subtitle="Campos básicos (armazenados em endereço quando suportado)" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Logradouro" error={errors.address_street?.message} className="sm:col-span-2">
            <Input id="address_street" {...register('address_street')} placeholder="Rua, número, complemento" />
          </Field>
          <Field label="Cidade" error={errors.address_city?.message}>
            <Input id="address_city" {...register('address_city')} placeholder="Cidade" />
          </Field>
          <Field label="UF / Estado" error={errors.address_state?.message}>
            <Input id="address_state" {...register('address_state')} placeholder="UF" />
          </Field>
          <Field label="CEP" error={errors.address_zip?.message}>
            <Input id="address_zip" {...register('address_zip')} placeholder="00000-000" />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle icon={FileText} title="Descrição" subtitle="Informações institucionais" />
        <div className="grid gap-4">
          <Field label="Resumo" error={errors.short_description?.message}>
            <Input id="short_description" {...register('short_description')} placeholder="Resumo curto da empresa" />
          </Field>
          <Field label="Descrição completa" error={errors.description?.message}>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Descrição, observações e contexto de relacionamento"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>
      </section>

      {editingCompany ? (
        <section className="space-y-3">
          <SectionTitle icon={ImageIcon} title="Mídia e documentos" subtitle="Upload/associação via contrato de mídia existente (empresa)" />
          <div className="flex flex-wrap gap-2">
            {(['logo', 'hero', 'gallery'] as MediaPurpose[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveMediaTab(tab)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  activeMediaTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                {tab === 'logo' ? 'Logo' : tab === 'hero' ? 'Imagem principal' : 'Galeria'}
              </button>
            ))}
          </div>
          <MediaUploader
            entityType="company"
            entityId={editingCompany.id}
            purpose={activeMediaTab}
            existingAssets={mediaAssets[activeMediaTab]}
            maxFiles={activeMediaTab === 'gallery' ? 10 : 1}
            disabled={!editingCompany}
          />
          <p className="text-xs text-muted-foreground">
            Formatos, limites, privacidade e persistência real dependem do Storage/políticas/RLS configurados. Documentos sensíveis não devem ser públicos.
          </p>
        </section>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Mídia e documentos</p>
          <p className="mt-1">Disponíveis após salvar a empresa (associação por identificador da entidade).</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="mr-2 h-4 w-4" aria-hidden /> Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          <Save className="mr-2 h-4 w-4" aria-hidden />
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );

  if (embedded) return form;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <Card className="max-h-[92vh] w-full max-w-3xl overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            {editingCompany ? 'Editar empresa' : 'Nova empresa'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onCancel} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {form}
      </Card>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border pb-2">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
