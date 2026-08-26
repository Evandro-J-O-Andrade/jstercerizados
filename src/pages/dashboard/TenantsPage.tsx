import { useState, useEffect, useMemo } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { tenantRepository } from '@/repositories/tenant.repository';
import type { Tenant } from '@/types/domain/tenant';

export default function TenantsPage() {
  const { isAdminMaster, tenantMemberships } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    document: '',
    status: 'active',
  });

  useEffect(() => {
    let cancelled = false;

    const fetchTenants = async () => {
      try {
        let data: Tenant[] = [];

        if (isAdminMaster) {
          data = await tenantRepository.findAll('');
        } else if (tenantMemberships.length > 0) {
          const promises = tenantMemberships.map((m) =>
            tenantRepository.findById(m.tenant_id, m.tenant_id),
          );
          const results = await Promise.all(promises);
          data = results.filter((t): t is Tenant => t !== null);
        }

        if (!cancelled) {
          setTenants(
            data.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            ),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar tenants',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTenants();

    return () => {
      cancelled = true;
    };
  }, [isAdminMaster, tenantMemberships]);

  const filtered = useMemo(() => {
    return tenants.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [tenants, search]);

  const openCreate = () => {
    setSelected(null);
    setForm({ name: '', slug: '', document: '', status: 'active' });
  };

  const openEdit = (tenant: Tenant) => {
    setSelected(tenant);
    setForm({
      name: tenant.name,
      slug: tenant.slug,
      document: tenant.document || '',
      status: tenant.status,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selected) {
        const updated = await tenantRepository.update(
          selected.id,
          {
            name: form.name,
            slug: form.slug,
            document: form.document || null,
            status: form.status,
          },
          '',
        );
        setTenants((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
      } else {
        const created = await tenantRepository.create(
          {
            name: form.name,
            slug: form.slug,
            document: form.document || null,
            status: form.status,
          },
          '',
        );
        setTenants((prev) => [created, ...prev]);
      }

      setSelected(null);
      setForm({ name: '', slug: '', document: '', status: 'active' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar tenant');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tenantRepository.delete(id, '');
      setTenants((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover tenant');
    }
  };

  return (
    <ModuleWorkspace
      title="Tenants"
      description="Empresas e tenants da plataforma."
      icon={Building2}
      breadcrumbItems={[{ label: 'Tenants', href: '/dashboard/tenants' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo tenant
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
          <Building2 className="text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar tenant..."
            className="bg-transparent text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {loading ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Carregando tenants...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">Nenhum tenant encontrado.</p>
          </Card>
        ) : (
          <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nome
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Slug
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Status
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Criado em
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {tenant.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {tenant.slug}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                        {tenant.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(tenant)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tenant.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAdminMaster && (
          <Card className="p-6">
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              {selected ? 'Editar tenant' : 'Novo tenant'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Documento
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.document}
                    onChange={(e) =>
                      setForm({ ...form, document: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="pending">pending</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary">
                  {selected ? 'Salvar' : 'Criar'}
                </Button>
                {selected && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelected(null);
                      setForm({
                        name: '',
                        slug: '',
                        document: '',
                        status: 'active',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>
        )}
      </div>
    </ModuleWorkspace>
  );
}
