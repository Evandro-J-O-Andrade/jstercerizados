'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { partnersRepository } from '@/repositories/partners.repository';
import { mediaAssetsRepository } from '@/repositories/media-assets.repository';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Partner,
  PartnerCreateInput,
} from '@/types/domain/recruitment';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import { getModuleById } from '@/components/portal/ModuleRegistry';
import { MediaUploader } from '@/components/media/MediaUploader';
import type { MediaAsset } from '@/components/media/MediaUploader.types';
import { cn } from '@/utils';

type MediaPurpose = 'logo' | 'hero' | 'gallery';

const PARTNERS_COLUMNS: ColumnDef<Partner>[] = [
  { key: 'name', header: 'Nome', sortable: true },
  { key: 'area', header: 'Área', sortable: true },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
  },
  {
    key: 'created_at',
    header: 'Criado em',
    render: (item) => new Date(item.created_at).toLocaleDateString('pt-BR'),
    sortable: true,
  },
];

const PARTNERS_FILTERS: FilterDef[] = [
  { key: 'area', label: 'Área', type: 'text' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'approved', label: 'Aprovado' },
      { value: 'pending', label: 'Pendente' },
      { value: 'rejected', label: 'Rejeitado' },
    ],
  },
];

function PartnerForm({
  form,
  setForm,
  isEditing,
  partnerId,
  currentTenantId,
}: {
  form: PartnerCreateInput;
  setForm: (form: PartnerCreateInput) => void;
  isEditing: boolean;
  partnerId: string | null;
  currentTenantId: string | undefined;
}) {
  const [activeMediaTab, setActiveMediaTab] = useState<MediaPurpose>('logo');
  const [mediaAssets, setMediaAssets] = useState<Record<MediaPurpose, MediaAsset[]>>({
    logo: [],
    hero: [],
    gallery: [],
  });

  const loadMediaAssets = useCallback(async () => {
    if (!partnerId || !currentTenantId) return;
    try {
      const [logoAssets, heroAssets, galleryAssets] = await Promise.all([
        mediaAssetsRepository.findByEntity(currentTenantId, 'partner', partnerId, 'logo'),
        mediaAssetsRepository.findByEntity(currentTenantId, 'partner', partnerId, 'hero'),
        mediaAssetsRepository.findByEntity(currentTenantId, 'partner', partnerId, 'gallery'),
      ]);
      setMediaAssets({ logo: logoAssets, hero: heroAssets, gallery: galleryAssets });
    } catch (err) {
      console.error('[Parceiros] Erro ao carregar mídia:', err);
    }
  }, [partnerId, currentTenantId]);

  useEffect(() => {
    if (isEditing && partnerId) {
      loadMediaAssets();
    }
  }, [isEditing, partnerId, loadMediaAssets]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-foreground text-sm font-medium">Nome</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Área</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.area ?? ''}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Cidade</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.city ?? ''}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Estado</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.state ?? ''}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Documento</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.document ?? ''}
          onChange={(e) => setForm({ ...form, document: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Status</label>
        <select
          className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm"
          value={form.status ?? 'pending'}
          onChange={(e) => setForm({ ...form, status: e.target.value as PartnerCreateInput['status'] })}
        >
          <option value="pending">Pendente</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
        </select>
      </div>

      {isEditing && partnerId && (
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
            entityType="partner"
            entityId={partnerId}
            purpose={activeMediaTab}
            existingAssets={mediaAssets[activeMediaTab]}
            maxFiles={activeMediaTab === 'gallery' ? 10 : 1}
            disabled={!isEditing}
          />
        </div>
      )}
    </div>
  );
}

export default function Parceiros() {
  const { currentTenantId } = useAuth();
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  const moduleDef: ModuleDefinition | undefined = getModuleById('parceiros');

  const partnerDefaultForm: PartnerCreateInput = {
    tenant_id: currentTenantId || '',
    name: '',
    slug: '',
    area: '',
    city: '',
    state: '',
    document: '',
    status: 'pending',
  };

  return (
    <ModulePage
      title="Parceiros"
      description="Gerencie parceiros."
      module={moduleDef}
      permissions={[
        {
          id: 'partners.read',
          name: 'partners.read',
          module: 'partners',
          resource: 'partners',
          action: 'read',
          created_at: new Date().toISOString(),
        },
      ]}
      columns={PARTNERS_COLUMNS}
      filters={PARTNERS_FILTERS}
      fetchData={async (tenantId) =>
        partnersRepository.findAll(tenantId)
      }
      createItem={async (tenantId, input) =>
        partnersRepository.create({ ...input, tenant_id: tenantId }, tenantId)
      }
      updateItem={async (tenantId, id, input) =>
        partnersRepository.update(id, tenantId, input)
      }
      deleteItem={async (tenantId, id) =>
        partnersRepository.delete(id, tenantId)
      }
      getItemId={(item) => item.id}
      emptyMessage="Nenhum parceiro cadastrado."
      onEditStart={(item) => setEditingPartnerId(item.id)}
      onModalClose={() => setEditingPartnerId(null)}
      renderForm={(form, setForm, isEditing) => (
        <PartnerForm
          form={form as PartnerCreateInput}
          setForm={setForm as (form: PartnerCreateInput) => void}
          isEditing={isEditing}
          partnerId={isEditing ? editingPartnerId : null}
          currentTenantId={currentTenantId ?? undefined}
        />
      )}
      defaultForm={partnerDefaultForm}
    />
  );
}