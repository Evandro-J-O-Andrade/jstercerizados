import { useAuth } from '@/contexts/AuthContext';
import { ModulePage } from '@/shared/crud/ModulePage';
import { CheckSquare } from 'lucide-react';
import type { FilterDef } from '@/shared/crud/types';

interface WorkOrderChecklist {
  id: string;
  tenant_id: string;
  work_order_id: string;
  item: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface WorkOrderChecklistCreateInput {
  tenant_id: string;
  work_order_id: string;
  item: string;
  is_completed?: boolean;
}

export default function WorkOrderChecklistsPage() {
  const { currentTenantId } = useAuth();

  const columns = [
    { key: 'work_order_id', header: 'Ordem de Trabalho', sortable: true, width: 'w-[25%]' },
    { key: 'item', header: 'Item do Checklist', sortable: true, width: 'w-[40%]' },
    { key: 'is_completed', header: 'Concluído', sortable: true, width: 'w-[15%]', render: (item: WorkOrderChecklist) => (
      <span className={`px-2 py-1 rounded text-[10px] font-medium ${item.is_completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'}`}>
        {item.is_completed ? 'Sim' : 'Não'}
      </span>
    )},
    { key: 'completed_at', header: 'Concluído em', sortable: true, width: 'w-[20%]', render: (item: WorkOrderChecklist) => (
      <span className="text-muted-foreground text-[11px]">
        {item.completed_at ? new Date(item.completed_at).toLocaleString('pt-BR') : '-'}
      </span>
    )},
  ];

  const filters: FilterDef[] = [];

  const defaultForm: WorkOrderChecklistCreateInput & { tenant_id: string } = {
    tenant_id: currentTenantId || '',
    work_order_id: '',
    item: '',
    is_completed: false,
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
            <label className="text-xs font-medium text-muted-foreground uppercase">Item</label>
            <input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Concluído</label>
            <select value={String(form.is_completed)} onChange={(e) => setForm({ ...form, is_completed: e.target.value === 'true' })} className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
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
      title="Checklists de Ordens de Trabalho"
      description="Itens de verificação para cada ordem de trabalho."
      icon={CheckSquare}
      breadcrumbItems={[{ label: 'Operações' }, { label: 'Checklists' }]}
      columns={columns}
      filters={filters}
      fetchData={async () => []}
      createItem={async () => {
        throw new Error('Checklists: create ainda não implementado no repository.');
      }}
      updateItem={async () => {
        throw new Error('Checklists: update ainda não implementado no repository.');
      }}
      deleteItem={async () => {
        throw new Error('Checklists: delete ainda não implementado no repository.');
      }}
      getItemId={(item: WorkOrderChecklist) => item.id}
      defaultForm={defaultForm as any}
      renderForm={renderForm as any}
      emptyMessage="Nenhum item de checklist cadastrado."
    />
  );
}
