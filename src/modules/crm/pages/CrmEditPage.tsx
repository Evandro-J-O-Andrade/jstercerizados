import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { crmRepository } from '@/modules/crm/repositories';
import type { Lead, LeadUpdateInput } from '@/modules/crm/repositories';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'won', label: 'Ganho' },
  { value: 'lost', label: 'Perdido' },
] as const;

export default function CrmEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenantId } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadUpdateInput>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || !currentTenantId) {
      setIsLoading(false);
      return;
    }
    crmRepository.findById(id, currentTenantId)
      .then((data) => {
        if (data) {
          setLead(data);
          setForm({ name: data.name, email: data.email, phone: data.phone, service_id: data.service_id, status: data.status, message: data.message });
        }
        setIsLoading(false);
      })
      .catch((err) => { setError(err instanceof Error ? err.message : 'Erro ao carregar'); setIsLoading(false); });
  }, [id, currentTenantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !currentTenantId) return;
    setSaving(true);
    crmRepository.update(id, currentTenantId, form)
      .then(() => { navigate(`/dashboard/crm/oportunidades/${id}`); })
      .catch((err) => { setError(err instanceof Error ? err.message : 'Erro ao atualizar'); setSaving(false); });
  };

  if (isLoading) return (
    <div className="flex h-full items-center justify-center"><div className="animate-pulse rounded-full h-8 w-8 bg-primary"></div></div>
  );
  if (error) return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-foreground font-semibold">Erro ao carregar</h2>
      <p className="text-muted-foreground text-sm">{error}</p>
      <Button variant="outline" onClick={() => navigate('/dashboard/crm/oportunidades')}>Voltar</Button>
    </div>
  );
  if (!lead) return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <h2 className="text-foreground font-semibold">Oportunidade não encontrada</h2>
      <Button variant="outline" onClick={() => navigate('/dashboard/crm/oportunidades')}>Voltar à lista</Button>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border bg-background/50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2"><FileText className="h-5 w-5" /></div>
            <div>
              <h1 className="text-foreground text-xl font-semibold">Editar oportunidade</h1>
              <p className="text-muted-foreground text-sm">{lead.name}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/crm/oportunidades/${id}`)}>Cancelar</Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Nome da oportunidade</label>
                <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">E-mail</label>
                <input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Telefone</label>
                <input type="tel" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value || null })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                <select value={form.status ?? 'new'} onChange={(e) => setForm({ ...form, status: e.target.value as LeadUpdateInput['status'] })} className="w-full rounded-lg border px-3 py-2 text-sm">
                  {STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Mensagem / Observações</label>
              <textarea value={form.message ?? ''} onChange={(e) => setForm({ ...form, message: e.target.value || null })} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/dashboard/crm/oportunidades/${id}`)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                {saving ? <Save className="h-4 w-4 mr-2 animate-spin" /> : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
