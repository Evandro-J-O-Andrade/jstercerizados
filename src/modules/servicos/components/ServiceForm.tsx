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
import type { Service } from '@/types/domain/service';
import type { MediaAsset } from '@/components/media/MediaUploader.types';
import { cn } from '@/utils';

type MediaPurpose = 'card' | 'hero' | 'gallery';

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  benefits: z.array(z.string()).optional().nullable(),
  card_image_url: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  open: boolean;
  tenantId: string;
  editingService: Service | null;
  serviceId: string | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
}

export function ServiceForm({
  open,
  tenantId,
  editingService,
  serviceId,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<
    Record<MediaPurpose, MediaAsset[]>
  >({
    card: [],
    hero: [],
    gallery: [],
  });
  const [activeMediaTab, setActiveMediaTab] = useState<MediaPurpose>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMediaAssets = useCallback(async () => {
    if (!serviceId || !tenantId) return;
    try {
      const [cardAssets, heroAssets, galleryAssets] = await Promise.all([
        mediaAssetsRepository.findByEntity(
          tenantId,
          'service',
          serviceId,
          'card',
        ),
        mediaAssetsRepository.findByEntity(
          tenantId,
          'service',
          serviceId,
          'hero',
        ),
        mediaAssetsRepository.findByEntity(
          tenantId,
          'service',
          serviceId,
          'gallery',
        ),
      ]);
      setMediaAssets({
        card: cardAssets,
        hero: heroAssets,
        gallery: galleryAssets,
      });
    } catch (err) {
      console.error('[ServiceForm] Erro ao carregar mídia:', err);
    }
  }, [tenantId, serviceId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      category: '',
      description: null,
      short_description: null,
      benefits: [],
      card_image_url: null,
      icon: null,
      status: 'draft',
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
      setMediaAssets({ card: [], hero: [], gallery: [] });
      setActiveMediaTab('card');
      setIsSubmitting(false);
      return;
    }

    if (editingService) {
      reset({
        name: editingService.name,
        category: editingService.category,
        description: editingService.description ?? null,
        short_description: editingService.short_description ?? null,
        benefits: editingService.benefits ?? [],
        card_image_url: editingService.card_image_url ?? null,
        icon: editingService.icon ?? null,
        status: editingService.status,
      });
      loadMediaAssets();
    } else {
      reset({
        name: '',
        category: '',
        description: null,
        short_description: null,
        benefits: [],
        card_image_url: null,
        icon: null,
        status: 'draft',
      });
      setMediaAssets({ card: [], hero: [], gallery: [] });
    }
  }, [open, editingService, reset, loadMediaAssets]);

  const handleFormSubmit = async (data: ServiceFormData) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Erro ao salvar serviço',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <Card className="w-full max-w-lg p-6">
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          {editingService ? 'Editar serviço' : 'Novo serviço'}
        </h3>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nome do serviço"
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="text-destructive mt-1 text-xs">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="Categoria"
              className={cn(errors.category && 'border-destructive')}
            />
            {errors.category && (
              <p className="text-destructive mt-1 text-xs">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Descrição"
              className="border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
            {errors.description && (
              <p className="text-destructive mt-1 text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="short_description">Descrição curta</Label>
            <Input
              id="short_description"
              {...register('short_description')}
              placeholder="Descrição curta"
              className={cn(errors.short_description && 'border-destructive')}
            />
            {errors.short_description && (
              <p className="text-destructive mt-1 text-xs">
                {errors.short_description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="card_image_url">URL da imagem do card</Label>
            <Input
              id="card_image_url"
              {...register('card_image_url')}
              placeholder="https://..."
              className={cn(errors.card_image_url && 'border-destructive')}
            />
            {errors.card_image_url && (
              <p className="text-destructive mt-1 text-xs">
                {errors.card_image_url.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="icon">Ícone</Label>
            <Input
              id="icon"
              {...register('icon')}
              placeholder="Ícone"
              className={cn(errors.icon && 'border-destructive')}
            />
            {errors.icon && (
              <p className="text-destructive mt-1 text-xs">
                {errors.icon.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              {...register('status')}
              className="border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
            {errors.status && (
              <p className="text-destructive mt-1 text-xs">
                {errors.status.message}
              </p>
            )}
          </div>

          {editingService && (
            <div className="border-t pt-4">
              <div className="mb-3 flex gap-2">
                {(['card', 'hero', 'gallery'] as MediaPurpose[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveMediaTab(tab)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm transition-colors',
                      activeMediaTab === tab
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    {tab === 'card' && 'Card'}
                    {tab === 'hero' && 'Hero'}
                    {tab === 'gallery' && 'Galeria'}
                  </button>
                ))}
              </div>
              <MediaUploader
                entityType="service"
                entityId={serviceId ?? ''}
                purpose={activeMediaTab}
                existingAssets={mediaAssets[activeMediaTab]}
                maxFiles={activeMediaTab === 'gallery' ? 10 : 1}
                disabled={!editingService}
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
