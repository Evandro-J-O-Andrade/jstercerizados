'use client';

import {
  ModulePage,
  type ColumnDef,
  type FilterDef,
} from '@/components/modules/ModulePage';
import { stockRepository } from '@/repositories/stock.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { Product, ProductCreateInput } from '@/types/domain/stock';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';

const COLUMNS: ColumnDef<Product>[] = [
  { key: 'name', header: 'Nome', sortable: true },
  { key: 'unit', header: 'Unidade', sortable: true },
  { key: 'category', header: 'Categoria', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  {
    key: 'created_at',
    header: 'Criado em',
    render: (item) => new Date(item.created_at).toLocaleDateString('pt-BR'),
    sortable: true,
  },
];

const FILTERS: FilterDef[] = [
  { key: 'category', label: 'Categoria', type: 'text' },
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

function ProductForm({
  form,
  setForm,
}: {
  form: ProductCreateInput;
  setForm: (form: ProductCreateInput) => void;
}) {
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
        <label className="text-foreground text-sm font-medium">Unidade</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.unit ?? ''}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />
      </div>
      <div>
        <label className="text-foreground text-sm font-medium">Categoria</label>
        <input
          className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.category ?? ''}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="status"
          type="checkbox"
          checked={form.status === 'active'}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.checked ? 'active' : 'inactive',
            })
          }
        />
        <label htmlFor="status" className="text-foreground text-sm">
          Ativo
        </label>
      </div>
    </div>
  );
}

export default function Estoque() {
  const { currentTenantId } = useAuth();

  const moduleDef: ModuleDefinition = {
    id: 'estoque',
    title: 'Estoque',
    description: 'Gestão de produtos e materiais.',
    icon: 'package',
    route: '/estoque',
    category: 'negocio',
    scope: 'tenant',
  };

  const defaultForm: ProductCreateInput = {
    tenant_id: currentTenantId || '',
    name: '',
    unit: '',
    category: '',
    status: 'active',
  };

  return (
    <ModulePage
      title="Produtos"
      description="Catálogo de produtos e materiais."
      module={moduleDef}
      permissions={[
        {
          id: 'products.read',
          name: 'products.read',
          module: 'stock',
          resource: 'products',
          action: 'read',
          created_at: new Date().toISOString(),
        },
      ]}
      columns={COLUMNS}
      filters={FILTERS}
      fetchData={async (tenantId) => stockRepository.findProducts(tenantId)}
      createItem={async (tenantId, input) =>
        stockRepository.createProduct({ ...input, tenant_id: tenantId })
      }
      updateItem={async (tenantId, id, input) =>
        stockRepository.updateProduct(tenantId, id, input)
      }
      deleteItem={async (tenantId, id) =>
        stockRepository.deleteProduct(tenantId, id)
      }
      getItemId={(item) => item.id}
      emptyMessage="Nenhum produto cadastrado."
      renderForm={(form, setForm) => (
        <ProductForm
          form={form as ProductCreateInput}
          setForm={setForm as (form: ProductCreateInput) => void}
        />
      )}
      defaultForm={defaultForm}
    />
  );
}
