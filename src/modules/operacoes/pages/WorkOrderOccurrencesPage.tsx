import { useAuth } from '@/contexts/AuthContext';
import { ModulePage } from '@/shared/crud/ModulePage';
import { AlertTriangle } from 'lucide-react';

interface WorkOrderOccurrence {
  id: string;
  tenant_id: string;
  work_order_id: string;
  title: string;
  description: string | null;
  type: string | null;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  reported_by: string | null;
  reported_at: string;
  resolved_at: string | null;
  created_at: string;
}

interface WorkOrderOccurrenceCreateInput {
  tenant_id: string;
  work_order_id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  severity?: 'baixa' | 'media' | 'alta' | 'critica';
}

const SEVERITY_TONE: Record<string, string> = {
  baixa: 'text-muted-foreground',
  media: 'text-amber-600 dark:text-amber-400',
  alta: 'text-orange-600 dark:text-orange-400',
  critica: 'text-destructive',
};

export default function WorkOrderOccurrencesPage() {
  const { currentTenantId } = useAuth();

  const columns = [
    { key: 'work_order_id', header: 'Ordem de Trabalho', sortable: true, width: 'w-[20%]' },
    { key: 'title', header: 'Título', sortable: true, width: 'w-[25%]' },
    { key: 'severity', header: 'Severidade', sortable: true, width: 'w-[15%]', render: (item: WorkOrderOccurrence) => (
      <span className={`px-2 py-1 rounded text-[10px] font-medium ${SEVERITY_TONE[item.severity]}`}>
        {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
      </span>
    )},
    { key: 'reported_at', header: 'Reportado em', sortable: true, width: 'w-[20%]', render: (item: WorkOrderOccurrence) => (
      <span className="text-muted-foreground text-[11px]">
        {new Date(item.reported_at).toLocaleString('pt-BR')}
      </span>
    )},
    { key: 'resolved_at', header: 'Resolvido em', sortable: true, width: 'w-[20%]', render: (item: WorkOrderOccurrence) => (
      <span className="text-muted-foreground text-[11px]">
        {item.resolved_at ? new Date(item.resolved_at).toLocaleString('pt-BR') : '-'}
      </span>
    )},
  ];

  const filters = [
    { key: 'severity', label: 'Severidade', type: 'select' as const, options: [
      { value: 'baixa', label: 'Baixa' },
      { value: 'media', label: 'Média' },
      { value: 'alta', label: 'Alta' },
      { value: 'critica', label: 'Crítica' },
    ] },
  ];

  const defaultForm: WorkOrderOccurrenceCreateInput & { tenant_id: string } = {
    tenant_id: currentTenantId || '',
    work_order_id: '',
    title: '',
    description: null,
    type: null,
    severity: 'media',
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
            <label className="text-xs font-medium text-muted-foreground uppercase">Título</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Severidade</label>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as typeof defaultForm['severity'] })} className="w-full rounded-lg border px-3 py-2 text-sm">
              {['baixa', 'media', 'alta', 'critica'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Tipo</label>
            <input value={form.type ?? ''} onChange={(e) => setForm({ ...form, type: e.target.value || null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Descrição</label>
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
      title="Ocorrências de Ordens de Trabalho"
      description="Registre intercorrências durante a execução das ordens."
      icon={AlertTriangle}
      breadcrumbItems={[{ label: 'Operações' }, { label: 'Ocorrências' }]}
      columns={columns}
      filters={filters}
      fetchData={async () => []}
      createItem={async () => {
        throw new Error('Ocorrências: create ainda não implementado no repository.');
      }}
      updateItem={async () => {
        throw new Error('Ocorrências: update ainda não implementado no repository.');
      }}
      deleteItem={async () => {
        throw new Error('Ocorrências: delete ainda não implementado no repository.');
      }}
      getItemId={(item: WorkOrderOccurrence) => item.id}
      defaultForm={defaultForm as any}
      renderForm={renderForm as any}
      emptyMessage="Nenhuma ocorrência cadastrada."
    />
  );
}
