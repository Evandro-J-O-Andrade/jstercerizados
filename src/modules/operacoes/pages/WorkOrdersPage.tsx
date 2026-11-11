import { useAuth } from '@/contexts/AuthContext';
import { ModulePage } from '@/shared/crud/ModulePage';
import { ClipboardList } from 'lucide-react';
import { operacoesRepository } from '@/modules/operacoes/repositories';
import type { WorkOrder } from '@/types/domain/service';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  scheduled: 'Agendada',
  in_progress: 'Em Andamento',
  on_hold: 'Suspensa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const STATUS_TONE: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
  scheduled: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200',
  in_progress: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200',
  on_hold: 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-gray-950/30 dark:text-gray-200',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200',
};

const PRIORITY_TONE: Record<string, string> = {
  baixa: 'text-muted-foreground',
  media: 'text-amber-600 dark:text-amber-400',
  alta: 'text-orange-600 dark:text-orange-400',
  critica: 'text-destructive',
};

export default function WorkOrdersPage() {
  const { currentTenantId } = useAuth();

  const columns = [
    { key: 'title', header: 'Título', sortable: true, width: 'w-[25%]' },
    { key: 'status', header: 'Status', sortable: true, width: 'w-[18%]', render: (item: WorkOrder) => (
      <span className={`px-2 py-1 rounded text-[10px] font-medium ${STATUS_TONE[item.status]}`}>
        {STATUS_LABELS[item.status] ?? item.status}
      </span>
    )},
    { key: 'priority', header: 'Prioridade', sortable: true, width: 'w-[14%]', render: (item: WorkOrder) => (
      <span className={`px-2 py-1 rounded text-[10px] font-medium ${PRIORITY_TONE[item.priority]}`}>
        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
      </span>
    )},
    { key: 'scheduled_at', header: 'Agendado', sortable: true, width: 'w-[15%]', render: (item: WorkOrder) => (
      <span className="text-muted-foreground text-[11px]">
        {item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString('pt-BR') : '-'}
      </span>
    )},
    { key: 'created_at', header: 'Criado em', sortable: true, width: 'w-[18%]', render: (item: WorkOrder) => (
      <span className="text-muted-foreground text-[11px]">
        {new Date(item.created_at).toLocaleDateString('pt-BR')}
      </span>
    )},
  ];

  const filters = [
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'pending', label: 'Pendente' },
      { value: 'scheduled', label: 'Agendada' },
      { value: 'in_progress', label: 'Em Andamento' },
      { value: 'on_hold', label: 'Suspensa' },
      { value: 'completed', label: 'Concluída' },
      { value: 'cancelled', label: 'Cancelada' },
    ] },
    { key: 'priority', label: 'Prioridade', type: 'select' as const, options: [
      { value: 'baixa', label: 'Baixa' },
      { value: 'media', label: 'Média' },
      { value: 'alta', label: 'Alta' },
      { value: 'critica', label: 'Crítica' },
    ] },
  ];

  const defaultForm: Omit<WorkOrder, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { tenant_id: string } = {
    tenant_id: currentTenantId || '',
    service_order_id: null,
    title: '',
    description: null,
    status: 'pending',
    priority: 'media',
    scheduled_at: null,
    started_at: null,
    completed_at: null,
  };

  const renderForm = (form: typeof defaultForm, setForm: (form: typeof defaultForm) => void) => {
    return (
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Título da ordem</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof defaultForm['status'] })} className="w-full rounded-lg border px-3 py-2 text-sm">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Prioridade</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as typeof defaultForm['priority'] })} className="w-full rounded-lg border px-3 py-2 text-sm">
              {['baixa', 'media', 'alta', 'critica'].map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Agendamento</label>
            <input type="datetime-local" value={form.scheduled_at ?? ''} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value || null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Descrição / Observações</label>
          <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value || null })} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
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
      title="Ordens de Trabalho"
      description="Crie e acompanhe ordens de trabalho da operação do tenant ativo."
      icon={ClipboardList}
      breadcrumbItems={[{ label: 'Operações' }, { label: 'Ordens de Trabalho' }]}
      columns={columns}
      filters={filters}
      fetchData={(tenantId) => operacoesRepository.findWorkOrders(tenantId)}
      createItem={async (tenantId, input) => {
        const result = await operacoesRepository.createWorkOrder(tenantId, input as Omit<WorkOrder, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>);
        return result;
      }}
      updateItem={async (tenantId, id, input) => {
        const result = await operacoesRepository.updateWorkOrder(tenantId, id, input as any);
        return result;
      }}
      deleteItem={(tenantId, id) => operacoesRepository.deleteWorkOrder(tenantId, id)}
      getItemId={(item: WorkOrder) => item.id}
      defaultForm={defaultForm as any}
      renderForm={renderForm as any}
      emptyMessage="Nenhuma ordem de trabalho cadastrada."
    />
  );
}
