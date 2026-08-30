'use client';

import { ModulePage, type ColumnDef, type FilterDef } from '@/components/modules/ModulePage';
import { supportRepository } from '@/repositories/support.repository';
import { useAuth } from '@/contexts/AuthContext';
import type { SupportTicket, SupportTicketCreateInput } from '@/types/domain/support';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';

const COLUMNS: ColumnDef<SupportTicket>[] = [
  { key: 'title', header: 'Título', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'priority', header: 'Prioridade', sortable: true },
  { key: 'sla_due_at', header: 'SLA', render: (item) => item.sla_due_at ? new Date(item.sla_due_at).toLocaleDateString('pt-BR') : '-', sortable: true },
  { key: 'created_at', header: 'Criado em', render: (item) => new Date(item.created_at).toLocaleDateString('pt-BR'), sortable: true },
];

const FILTERS: FilterDef[] = [
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'priority', label: 'Prioridade', type: 'select', options: [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
  ]},
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

function TicketForm({ form, setForm }: { form: SupportTicketCreateInput; setForm: (form: SupportTicketCreateInput) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Título</label>
        <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Descrição</label>
        <textarea className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Categoria</label>
        <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Prioridade</label>
        <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.priority ?? 'medium'} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Status</label>
        <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.status ?? 'open'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">SLA</label>
        <input type="datetime-local" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.sla_due_at ?? ''} onChange={(e) => setForm({ ...form, sla_due_at: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Responsável</label>
        <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.assignee_person_id ?? ''} onChange={(e) => setForm({ ...form, assignee_person_id: e.target.value })} />
      </div>
    </div>
  );
}

export default function Suporte() {
  const { currentTenantId } = useAuth();

  const moduleDef: ModuleDefinition = {
    id: 'suporte',
    title: 'Suporte',
    description: 'Gestão de tickets e atendimentos.',
    icon: 'help-circle',
    route: '/suporte',
    category: 'negocio',
    scope: 'tenant',
  };

  const defaultForm: SupportTicketCreateInput = {
    tenant_id: currentTenantId || '',
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
    status: 'open',
    assignee_person_id: '',
    sla_due_at: '',
  };

  return (
    <ModulePage
      title="Chamados"
      description="Gestão de tickets de suporte."
      module={moduleDef}
      permissions={[{ id: 'support_tickets.read', name: 'support_tickets.read', module: 'support', resource: 'support_tickets', action: 'read', created_at: new Date().toISOString() }]}
      columns={COLUMNS}
      filters={FILTERS}
      fetchData={async (tenantId) => supportRepository.findTickets(tenantId)}
      createItem={async (tenantId, input) => supportRepository.createTicket({ ...input, tenant_id: tenantId })}
      updateItem={async (tenantId, id, input) => supportRepository.updateTicket(id, input, tenantId)}
      deleteItem={async (tenantId, id) => supportRepository.deleteTicket(id, tenantId)}
      getItemId={(item) => item.id}
      emptyMessage="Nenhum chamado registrado."
      renderForm={(form, setForm) => <TicketForm form={form as SupportTicketCreateInput} setForm={setForm as (form: SupportTicketCreateInput) => void} />}
      defaultForm={defaultForm}
    />
  );
}
