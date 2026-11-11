import { useAuth } from '@/contexts/AuthContext';
import { ModulePage } from '@/shared/crud/ModulePage';
import { Truck } from 'lucide-react';
import type { FilterDef } from '@/shared/crud/types';

interface WorkOrderMaterial {
  id: string;
  tenant_id: string;
  work_order_id: string;
  description: string;
  quantity: number | null;
  unit_value: number | null;
  total_value: number | null;
  created_at: string;
}

interface WorkOrderMaterialCreateInput {
  tenant_id: string;
  work_order_id: string;
  description: string;
  quantity?: number | null;
  unit_value?: number | null;
}

export default function WorkOrderMaterialsPage() {
  const { currentTenantId } = useAuth();

  const columns = [
    { key: 'work_order_id', header: 'Ordem de Trabalho', sortable: true, width: 'w-[25%]' },
    { key: 'description', header: 'Descrição', sortable: true, width: 'w-[35%]' },
    { key: 'quantity', header: 'Qtd.', sortable: true, width: 'w-[12%]', render: (item: WorkOrderMaterial) => (
      <span className="text-muted-foreground text-[11px] font-mono">{item.quantity ?? '-'}</span>
    )},
    { key: 'total_value', header: 'Valor Total', sortable: true, width: 'w-[18%]', render: (item: WorkOrderMaterial) => (
      <span className="text-muted-foreground text-[11px] font-mono">
        {item.total_value ? item.total_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
      </span>
    )},
    { key: 'created_at', header: 'Criado em', sortable: true, width: 'w-[18%]', render: (item: WorkOrderMaterial) => (
      <span className="text-muted-foreground text-[11px]">
        {new Date(item.created_at).toLocaleDateString('pt-BR')}
      </span>
    )},
  ];

  const filters: FilterDef[] = [];

  const defaultForm: WorkOrderMaterialCreateInput & { tenant_id: string } = {
    tenant_id: currentTenantId || '',
    work_order_id: '',
    description: '',
    quantity: null,
    unit_value: null,
  };

  const renderForm = (form: typeof defaultForm, setForm: (form: typeof defaultForm) => void) => {
    return (
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Ordem de Trabalho</label>
            <input value={form.work_order_id} onChange={(e) => setForm({ ...form, work_order_id: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Descrição</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Quantidade</label>
            <input type="number" value={form.quantity ?? ''} onChange={(e) => setForm({ ...form, quantity: e.target.value ? Number(e.target.value) : null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Valor Unitário</label>
            <input type="number" value={form.unit_value ?? ''} onChange={(e) => setForm({ ...form, unit_value: e.target.value ? Number(e.target.value) : null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 rounded-lg border text-sm">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Salvar</button>
        </div>
      </form>
    );
  };

  return (
    <ModulePage
      title="Materiais em Trânsito"
      description="Controle de materiais utilizados nas ordens de trabalho."
      icon={Truck}
      breadcrumbItems={[{ label: 'Operações' }, { label: 'Materiais' }]}
      columns={columns}
      filters={filters}
      fetchData={async () => []}
      createItem={async () => {
        throw new Error('Materiais: create ainda não implementado no repository.');
      }}
      updateItem={async () => {
        throw new Error('Materiais: update ainda não implementado no repository.');
      }}
      deleteItem={async () => {
        throw new Error('Materiais: delete ainda não implementado no repository.');
      }}
      getItemId={(item: WorkOrderMaterial) => item.id}
      defaultForm={defaultForm as any}
      renderForm={renderForm as any}
      emptyMessage="Nenhum material cadastrado."
    />
  );
}
