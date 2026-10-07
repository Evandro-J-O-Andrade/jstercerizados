'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  trading_name: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
});

export type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  open: boolean;
  tenantId: string;
  editingCompany: Company | null;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel: () => void;
}

export function CompanyForm({
  open,
  tenantId,
  editingCompany,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<Record<MediaPurpose, MediaAsset[]>>({
    logo: [],
    hero: [],
    gallery: [],
  });
  const [activeMediaTab, setActiveMediaTab] = useState<MediaPurpose>('logo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMediaAssets = useCallback(async (companyId: string) => {
    try {
      const [logoAssets, heroAssets, galleryAssets] = await Promise.all([
        mediaAssetsRepository.findByEntity(tenantId, 'company', companyId, 'logo'),
        mediaAssetsRepository.findByEntity(tenantId, 'company', companyId, 'hero'),
        mediaAssetsRepository.findByEntity(tenantId, 'company', companyId, 'gallery'),
      ]);
      setMediaAssets({ logo: logoAssets, hero: heroAssets, gallery: galleryAssets });
    } catch (err) {
      console.error('[CompanyForm] Erro ao carregar mídia:', err);
    }
  }, [tenantId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      trading_name: null,
      cnpj: null,
      status: 'active',
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
      setMediaAssets({ logo: [], hero: [], gallery: [] });
      setActiveMediaTab('logo');
      setIsSubmitting(false);
      return;
    }

    if (editingCompany) {
      reset({
        name: editingCompany.name,
        trading_name: editingCompany.trading_name ?? null,
        cnpj: editingCompany.cnpj ?? null,
        status: editingCompany.status,
      });
      loadMediaAssets(editingCompany.id);
    } else {
      reset({
        name: '',
        trading_name: null,
        cnpj: null,
        status: 'active',
      });
      setMediaAssets({ logo: [], hero: [], gallery: [] });
    }
  }, [open, editingCompany, reset, loadMediaAssets]);

  const handleFormSubmit = async (data: CompanyFormData) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <Card className="w-full max-w-lg p-6">
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          {editingCompany ? 'Editar empresa' : 'Nova empresa'}
        </h3>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nome da empresa"
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="text-destructive mt-1 text-xs">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="trading_name">Razão Social</Label>
            <Input
              id="trading_name"
              {...register('trading_name')}
              placeholder="Razão social"
              className={cn(errors.trading_name && 'border-destructive')}
            />
            {errors.trading_name && (
              <p className="text-destructive mt-1 text-xs">{errors.trading_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              {...register('cnpj')}
              placeholder="CNPJ"
              className={cn(errors.cnpj && 'border-destructive')}
            />
            {errors.cnpj && (
              <p className="text-destructive mt-1 text-xs">{errors.cnpj.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              {...register('status')}
              className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm outline-none"
            >
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
              <option value="suspended">Suspensa</option>
              <option value="pending">Pendente</option>
            </select>
            {errors.status && (
              <p className="text-destructive mt-1 text-xs">{errors.status.message}</p>
            )}
          </div>

          {editingCompany && (
            <div className="border-t pt-4">
              <div className="flex gap-2 mb-3">
                {(['logo', 'hero', 'gallery'] as MediaPurpose[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveMediaTab(tab)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      activeMediaTab === tab
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    {tab === 'logo' && 'Logo'}
                    {tab === 'hero' && 'Hero'}
                    {tab === 'gallery' && 'Galeria'}
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
            </div>
          )}

          {formError && (
            <FormAlert variant="error" title="Erro" description={formError} />
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
