/**
 * PessoasPage — Central de Cadastros de Pessoas (Admin Master ROOT).
 *
 * Lista todas as pessoas cadastradas na plataforma, com pesquisa,
 * filtros por status e operações de ativação/suspensão.
 * Utiliza o AdminPersonService integrado ao Supabase (RLS respeitado).
 */

import { useState, useCallback } from 'react';
import {
  Search,
  User,
  UserPlus,
  ShieldAlert,
  Clock,
  Mail,
  Phone,
  Edit,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createAdminPersonService } from '../services/people.service';

type PersonListItem = {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  tenant_count: number;
};

export default function PessoasPage() {
  const service = createAdminPersonService();
  const [items, setItems] = useState<PersonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonListItem | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'activate' | 'suspend'; id: string; name: string } | null>(null);
  const [formDialog, setFormDialog] = useState<{ mode: 'create' | 'edit'; person?: PersonListItem } | null>(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', status: 'active' });

  const loadPeople = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await service.listPeople({
      search: search || undefined,
      status: statusFilter || undefined,
    });
    if (result.error) {
      setError(result.error);
      setItems([]);
    } else {
      setItems(result.items);
    }
    setLoading(false);
  }, [search, statusFilter, service]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await service.createPerson({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone || undefined,
      status: formData.status,
    });
    if ('error' in result) {
      setError(result.error);
    } else {
      setFormDialog(null);
      setFormData({ full_name: '', email: '', phone: '', status: 'active' });
      await loadPeople();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    const result = await service.updatePerson(selectedPerson.id, {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone || undefined,
      status: formData.status,
    });
    if ('error' in result) {
      setError(result.error);
    } else {
      setFormDialog(null);
      await loadPeople();
    }
  };

  const handleActivate = async () => {
    if (!selectedPerson) return;
    const result = await service.activatePerson(selectedPerson.id);
    if ('error' in result) {
      setError(result.error);
    }
    setActionDialog(null);
    await loadPeople();
  };

  const handleSuspend = async () => {
    if (!selectedPerson) return;
    const result = await service.suspendPerson(selectedPerson.id);
    if ('error' in result) {
      setError(result.error);
    }
    setActionDialog(null);
    await loadPeople();
  };

  const total = items.length;
  const activeCount = items.filter((i) => i.status === 'active').length;
  const suspendedCount = items.filter((i) => i.status === 'suspended').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Central de Cadastros</h1>
          <p className="text-muted-foreground">
            Gestão de pessoas, clientes, funcionários e identidades da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setFormDialog({ mode: 'create' })}>
            <UserPlus className="h-4 w-4" /> Nova Pessoa
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total de Pessoas</p>
              <p className="text-foreground text-2xl font-bold">{total}</p>
            </div>
            <User className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Ativas</p>
              <p className="text-foreground text-2xl font-bold">{activeCount}</p>
            </div>
            <ShieldAlert className="h-8 w-8 text-success" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Suspensas</p>
              <p className="text-foreground text-2xl font-bold">{suspendedCount}</p>
            </div>
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border rounded-lg bg-background text-sm px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="suspended">Suspensas</option>
            <option value="inactive">Inativas</option>
            <option value="archived">Arquivadas</option>
          </select>
          <Button onClick={loadPeople} disabled={loading}>
            {loading ? 'Carregando...' : 'Aplicar'}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase w-32">Nome</th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase w-48">E-mail</th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase">Telefone</th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase w-16">Status</th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase w-16">Vínculos</th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase w-20">Criado em</th>
                <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold uppercase w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((person) => (
                <tr key={person.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {person.full_name}
                    <br />
                    <span className="text-xs text-muted-foreground">{person.auth_user_id ?? 'Sem vínculo de auth'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 inline mr-1" /> {person.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 inline mr-1" /> {person.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        person.status === 'active'
                          ? 'bg-success/10 text-success border border-success/20'
                          : person.status === 'suspended'
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-muted/50 text-muted-foreground border border-muted/30'
                      }`}
                    >
                      {person.status === 'active' ? 'Ativa' : person.status === 'suspended' ? 'Suspensa' : person.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {person.tenant_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {new Date(person.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          full_name: person.full_name,
                          email: person.email,
                          phone: person.phone ?? '',
                          status: person.status,
                        });
                        setSelectedPerson(person);
                        setFormDialog({ mode: 'edit', person });
                      }}
                    >
                      <Edit className="h-4 w-4" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActionDialog({
                          type: person.status === 'active' ? 'suspend' : 'activate',
                          id: person.id,
                          name: person.full_name,
                        });
                      }}
                    >
                      {person.status === 'active' ? 'Suspender' : 'Reativar'}
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhuma pessoa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActionDialog(null)} />
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold text-foreground mb-2">
              {actionDialog.type === 'activate' ? 'Reativar pessoa' : 'Suspender pessoa'}
            </h2>
            <p className="text-muted-foreground mb-6">
              Deseja {actionDialog.type === 'activate' ? 'reativar' : 'suspender'} a pessoa "{actionDialog.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActionDialog(null)}>
                Cancelar
              </Button>
              <Button
                variant={actionDialog.type === 'activate' ? 'primary' : 'danger'}
                onClick={
                  actionDialog.type === 'activate' ? handleActivate : handleSuspend
                }
              >
                {actionDialog.type === 'activate' ? 'Reativar' : 'Suspender'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {formDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFormDialog(null)} />
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold text-foreground mb-6">
              {formDialog.mode === 'create' ? 'Cadastrar Pessoa' : 'Editar Pessoa'}
            </h2>
            <form onSubmit={formDialog.mode === 'create' ? handleCreate : handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome completo</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="active">Ativa</option>
                  <option value="suspended">Suspensa</option>
                  <option value="inactive">Inativa</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setFormDialog(null)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {formDialog.mode === 'create' ? 'Cadastrar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
