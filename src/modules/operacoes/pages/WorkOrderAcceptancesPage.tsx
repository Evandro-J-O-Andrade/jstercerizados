import { useAuth } from '@/contexts/AuthContext';
import { ModulePage } from '@/shared/crud/ModulePage';
import { CheckCircle } from 'lucide-react';
import type { FilterDef } from '@/shared/crud/types';

interface WorkOrderAcceptance {
  id: string;
  tenant_id: string;
  work_order_id: string;
  accepted_by: string | null;
  accepted_at: string | null;
  signature_url: string | null;
  notes: string | null;
  created_at: string;
}

interface WorkOrderAcceptanceCreateInput {
  tenant_id: string;
  work_order_id: string;
  accepted_by?: string | null;
  signature_url?: string | null;
  notes?: string | null;
}

export default function WorkOrderAcceptancesPage() {
  const { currentTenantId } = useAuth();

  const columns = [
    { key: 'work_order_id', header: 'Ordem de Trabalho', sortable: true, width: 'w-[25%]' },
    { key: 'accepted_by', header: 'Aceite por', sortable: true, width: 'w-[25%]', render: (item: WorkOrderAcceptance) => (
      <span className="text-muted-foreground text-[11px]">{item.accepted_by ?? '-'}</span>
    )},
    { key: 'accepted_at', header: 'Aceite em', sortable: true, width: 'w-[25%]', render: (item: WorkOrderAcceptance) => (
      <span className="text-muted-foreground text-[11px]">
        {item.accepted_at ? new Date(item.accepted_at).toLocaleString('pt-BR') : '-'}
      </span>
    )},
    { key: 'signature_url', header: 'Assinatura', sortable: false, width: 'w-[25%]', render: (_item: WorkOrderAcceptance) => (
      <span className="text-muted-foreground text-[11px]">-</span>
    )},
  ];

  const filters: FilterDef[] = [];

  const defaultForm: WorkOrderAcceptanceCreateInput & { tenant_id: string } = {
    tenant_id: currentTenantId || '',
    work_order_id: '',
    accepted_by: null,
    signature_url: null,
    notes: null,
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
            <label className="text-xs font-medium text-muted-foreground uppercase">Aceite por</label>
            <input value={form.accepted_by ?? ''} onChange={(e) => setForm({ ...form, accepted_by: e.target.value || null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">URL da assinatura</label>
            <input value={form.signature_url ?? ''} onChange={(e) => setForm({ ...form, signature_url: e.target.value || null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Observações</label>
          <textarea value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value || null })} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
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
      title="Aceites de Ordens de Trabalho"
      description="Registre aceites formais de conclusão de ordens de trabalho."
      icon={CheckCircle}
      breadcrumbItems={[{ label: 'Operações' }, { label: 'Aceites' }]}
      columns={columns}
      filters={filters}
      fetchData={async () => []}
      createItem={async () => {
        throw new Error('Aceites: create ainda não implementado no repository.');
      }}
      updateItem={async () => {
        throw new Error('Aceites: update ainda não implementado no repository.');
      }}
      deleteItem={async () => {
        throw new Error('Aceites: delete ainda não implementado no repository.');
      }}
      getItemId={(item: WorkOrderAcceptance) => item.id}
      defaultForm={defaultForm as any}
      renderForm={renderForm as any}
      emptyMessage="Nenhum aceite cadastrado."
    />
  );
}
