'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { suppliersRepository } from '@/repositories/suppliers.repository';
import { mediaAssetsRepository } from '@/repositories/media-assets.repository';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Supplier,
  SupplierCreateInput,
} from '@/types/domain/recruitment';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import { getModuleById } from '@/components/portal/ModuleRegistry';
import { MediaUploader } from '@/components/media/MediaUploader';
import type { MediaAsset } from '@/components/media/MediaUploader.types';
import { cn } from '@/utils';

type MediaPurpose = 'logo' | 'hero' | 'gallery';

const SUPPLIERS_COLUMNS: ColumnDef<Supplier>[] = [
  { key: 'name', header: 'Nome', sortable: true },
  { key: 'products', header: 'Produtos', sortable: true },
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

const SUPPLIERS_FILTERS: FilterDef[] = [
  { key: 'products', label: 'Produtos', type: 'text' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Ativo' },
      { value: 'inactive', label: 'Inativo' },
    ],
  },
];

function SupplierForm({
  form,
  setForm,
  isEditing,
  supplierId,
  currentTenantId,
}: {
  form: SupplierCreateInput;
  setForm: (form: SupplierCreateInput) => void;
  isEditing: boolean;
  supplierId: string | null;
  currentTenantId: string | undefined;
}) {
  const [activeMediaTab, setActiveMediaTab] = useState<MediaPurpose>('logo');
  const [mediaAssets, setMediaAssets] = useState<Record<MediaPurpose, MediaAsset[]>>({
    logo: [],
    hero: [],
    gallery: [],
  });

  const loadMediaAssets = useCallback(async () => {
    if (!supplierId || !currentTenantId) return;
    try {
      const [logoAssets, heroAssets, galleryAssets] = await Promise.all([
        mediaAssetsRepository.findByEntity(currentTenantId, 'supplier', supplierId, 'logo'),
        mediaAssetsRepository.findByEntity(currentTenantId, 'supplier', supplierId, 'hero'),
        mediaAssetsRepository.findByEntity(currentTenantId, 'supplier', supplierId, 'gallery'),
      ]);
      setMediaAssets({ logo: logoAssets, hero: heroAssets, gallery: galleryAssets });
    } catch (err) {
      console.error('[Fornecedores] Erro ao carregar mídia:', err);
    }
  }, [supplierId, currentTenantId]);

  useEffect(() => {
    if (isEditing && supplierId) {
      loadMediaAssets();
    }
  }, [isEditing, supplierId, loadMediaAssets]);

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
        <label className="text-foreground text-sm font-medium">Produtos</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.products ?? ''}
          onChange={(e) => setForm({ ...form, products: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Representante</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.representative ?? ''}
          onChange={(e) => setForm({ ...form, representative: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Telefone</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.phone ?? ''}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">E-mail</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.email ?? ''}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          value={form.status ?? 'active'}
          onChange={(e) => setForm({ ...form, status: e.target.value as SupplierCreateInput['status'] })}
        >
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>

      {isEditing && supplierId && (
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
            entityType="supplier"
            entityId={supplierId}
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

export default function Fornecedores() {
  const { currentTenantId } = useAuth();
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  const moduleDef: ModuleDefinition | undefined = getModuleById('fornecedores');

  const supplierDefaultForm: SupplierCreateInput = {
    tenant_id: currentTenantId || '',
    name: '',
    slug: '',
    products: '',
    representative: '',
    phone: '',
    email: '',
    document: '',
    status: 'active',
  };

  return (
    <ModulePage
      title="Fornecedores"
      description="Gerencie fornecedores."
      module={moduleDef}
      permissions={[
        {
          id: 'suppliers.read',
          name: 'suppliers.read',
          module: 'suppliers',
          resource: 'suppliers',
          action: 'read',
          created_at: new Date().toISOString(),
        },
      ]}
      columns={SUPPLIERS_COLUMNS}
      filters={SUPPLIERS_FILTERS}
      fetchData={async (tenantId) =>
        suppliersRepository.findAll(tenantId)
      }
      createItem={async (tenantId, input) =>
        suppliersRepository.create({ ...input, tenant_id: tenantId }, tenantId)
      }
      updateItem={async (tenantId, id, input) =>
        suppliersRepository.update(id, tenantId, input)
      }
      deleteItem={async (tenantId, id) =>
        suppliersRepository.delete(id, tenantId)
      }
      getItemId={(item) => item.id}
      emptyMessage="Nenhum fornecedor cadastrado."
      onEditStart={(item) => setEditingSupplierId(item.id)}
      onModalClose={() => setEditingSupplierId(null)}
      renderForm={(form, setForm, isEditing) => (
        <SupplierForm
          form={form as SupplierCreateInput}
          setForm={setForm as (form: SupplierCreateInput) => void}
          isEditing={isEditing}
          supplierId={isEditing ? editingSupplierId : null}
               currentTenantId={currentTenantId ?? undefined}
        />
      )}
      defaultForm={supplierDefaultForm}
    />
  );
}