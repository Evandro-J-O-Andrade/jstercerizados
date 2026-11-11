import { useAuth } from '@/contexts/AuthContext';
import { ModulePage } from '@/shared/crud/ModulePage';
import { Users } from 'lucide-react';
import { crmRepository } from '@/modules/crm/repositories';
import type { Lead, LeadCreateInput, LeadUpdateInput } from '@/modules/crm/repositories';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'won', label: 'Ganho' },
  { value: 'lost', label: 'Perdido' },
] as const;

const STATUS_TONE: Record<string, string> = {
  new: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200',
  contacted: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
  proposal: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200',
  won: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200',
  lost: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200',
};

export default function CrmListPage() {
  const { currentTenantId } = useAuth();

  const columns = [
    { key: 'name', header: 'Oportunidade', sortable: true, width: 'w-[30%]' },
    { key: 'email', header: 'E-mail', sortable: true, width: 'w-[25%]' },
    { key: 'phone', header: 'Telefone', sortable: false, width: 'w-[15%]' },
    { key: 'status', header: 'Status', sortable: true, width: 'w-[15%]', render: (item: Lead) => (
      <span className={`px-2 py-1 rounded text-[10px] font-medium ${STATUS_TONE[item.status]}`}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </span>
    )},
    { key: 'created_at', header: 'Criado em', sortable: true, width: 'w-[15%]', render: (item: Lead) => <span className="text-muted-foreground text-[11px]">{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>},
  ];

  const filters = [
    { key: 'status', label: 'Status', type: 'select' as const, options: STATUS_OPTIONS as unknown as { value: string; label: string }[] },
  ];

  const defaultForm: LeadCreateInput = {
    tenant_id: currentTenantId || '',
    name: '',
    email: '',
    phone: null,
    service_id: null,
    status: 'new',
    message: null,
  };

  const renderForm = (form: LeadCreateInput, setForm: (form: LeadCreateInput) => void) => {
    return (
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Nome da oportunidade</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Telefone</label>
            <input type="tel" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value || null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadCreateInput['status'] })} className="w-full rounded-lg border px-3 py-2 text-sm">
              {STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Mensagem / Observações</label>
          <textarea value={form.message ?? ''} onChange={(e) => setForm({ ...form, message: e.target.value || null })} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
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
      title="Oportunidades"
      description="Gerencie leads e oportunidades comerciais do tenant ativo."
      icon={Users}
      breadcrumbItems={[{ label: 'CRM' }, { label: 'Oportunidades' }]}
      columns={columns}
      filters={filters}
      fetchData={(tenantId) => crmRepository.findAll(tenantId)}
      createItem={async (tenantId, input) => {
        const result = await crmRepository.create({ ...input, tenant_id: tenantId } as LeadCreateInput);
        if (!result) throw new Error('Falha ao criar oportunidade');
        return result;
      }}
      updateItem={async (tenantId, id, input) => {
        const result = await crmRepository.update(id, tenantId, input as LeadUpdateInput);
        if (!result) throw new Error('Falha ao atualizar oportunidade');
        return result;
      }}
      deleteItem={(tenantId, id) => crmRepository.remove(id, tenantId)}
      getItemId={(item: Lead) => item.id}
      defaultForm={defaultForm}
      renderForm={renderForm}
      emptyMessage="Nenhuma oportunidade cadastrada."
    />
  );
}
