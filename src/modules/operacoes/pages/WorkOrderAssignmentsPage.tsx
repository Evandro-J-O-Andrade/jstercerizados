import { useAuth } from '@/contexts/AuthContext';
import { ModulePage } from '@/shared/crud/ModulePage';
import { Users } from 'lucide-react';
import { operacoesRepository } from '@/modules/operacoes/repositories';
import type { WorkOrderAssignment } from '@/types/domain/service';
import type { FilterDef } from '@/shared/crud/types';

export default function WorkOrderAssignmentsPage() {
  const { currentTenantId } = useAuth();

  const columns = [
    { key: 'work_order_id', header: 'Ordem de Trabalho', sortable: true, width: 'w-[30%]' },
    { key: 'person_id', header: 'Pessoa', sortable: true, width: 'w-[25%]' },
    { key: 'role', header: 'Função', sortable: true, width: 'w-[20%]', render: (item: WorkOrderAssignment) => (
      <span className="text-muted-foreground text-[11px]">{item.role ?? '-'}</span>
    )},
    { key: 'assigned_at', header: 'Atribuído em', sortable: true, width: 'w-[25%]', render: (item: WorkOrderAssignment) => (
      <span className="text-muted-foreground text-[11px]">
        {new Date(item.assigned_at).toLocaleString('pt-BR')}
      </span>
    )},
  ];

  const filters: FilterDef[] = [];

  const defaultForm: Omit<WorkOrderAssignment, 'id' | 'tenant_id' | 'created_at'> & { tenant_id: string } = {
    tenant_id: currentTenantId || '',
    work_order_id: '',
    person_id: '',
    role: null,
    assigned_at: new Date().toISOString(),
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
            <label className="text-xs font-medium text-muted-foreground uppercase">Pessoa (ID)</label>
            <input value={form.person_id} onChange={(e) => setForm({ ...form, person_id: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Função</label>
            <input value={form.role ?? ''} onChange={(e) => setForm({ ...form, role: e.target.value || null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
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
      title="Atribuições de Ordens de Trabalho"
      description="Gerencie quem é responsável por cada ordem de trabalho."
      icon={Users}
      breadcrumbItems={[{ label: 'Operações' }, { label: 'Atribuições' }]}
      columns={columns}
      filters={filters}
      fetchData={(tenantId) => operacoesRepository.findWorkOrderAssignments(tenantId, '')}
      createItem={async (tenantId, input) => {
        const result = await operacoesRepository.createWorkOrderAssignment(tenantId, input as Omit<WorkOrderAssignment, 'id' | 'tenant_id' | 'created_at'>);
        return result;
      }}
      updateItem={async (tenantId, id, input) => {
        const result = await operacoesRepository.updateWorkOrderAssignment(tenantId, id, input as any);
        return result;
      }}
      deleteItem={(tenantId, id) => operacoesRepository.deleteWorkOrderAssignment(tenantId, id)}
      getItemId={(item: WorkOrderAssignment) => item.id}
      defaultForm={defaultForm as any}
      renderForm={renderForm as any}
      emptyMessage="Nenhuma atribuição cadastrada."
    />
  );
}
