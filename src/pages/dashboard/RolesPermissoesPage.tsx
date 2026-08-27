import { useState, useEffect, useMemo } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Plus, Pencil, Trash2 } from 'lucide-react';
import { roleRepository } from '@/repositories/role.repository';
import { permissionRepository } from '@/repositories/permission.repository';
import type { Role } from '@/types/domain/role';
import type { Permission } from '@/types/domain/permission';

export default function RolesPermissoesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    scope: 'tenant' as 'global' | 'tenant',
  });
  const [permissionForm, setPermissionForm] = useState({
    resource: '',
    action: '',
    description: '',
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [rolesData, permsData] = await Promise.all([
          roleRepository.findAll(''),
          permissionRepository.findAll(''),
        ]);

        if (!cancelled) {
          setRoles(rolesData);
          setPermissions(permsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar roles e permissões',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [roles, search]);

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const perm of permissions) {
      const key = perm.resource || 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(perm);
    }
    return map;
  }, [permissions]);

  const openRoleCreate = () => {
    setSelectedRole(null);
    setRoleForm({ name: '', description: '', scope: 'tenant' });
  };

  const openRoleEdit = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      scope: role.scope,
    });
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRole) {
        const updated = await roleRepository.update(
          selectedRole.id,
          {
            name: roleForm.name,
            description: roleForm.description || null,
            scope: roleForm.scope,
          },
          '',
        );
        setRoles((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r)),
        );
      } else {
        const created = await roleRepository.create(
          {
            name: roleForm.name,
            description: roleForm.description || null,
            scope: roleForm.scope,
          },
          '',
        );
        setRoles((prev) => [...prev, created]);
      }
      setSelectedRole(null);
      setRoleForm({ name: '', description: '', scope: 'tenant' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar role');
    }
  };

  const handleRoleDelete = async (id: string) => {
    try {
      await roleRepository.delete(id, '');
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover role');
    }
  };

  const openPermissionCreate = () => {
    setPermissionForm({ resource: '', action: '', description: '' });
  };

  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await permissionRepository.create(
        {
          resource: permissionForm.resource,
          action: permissionForm.action,
          description: permissionForm.description || null,
        },
        '',
      );
      setPermissions((prev) => [...prev, created]);
      setPermissionForm({ resource: '', action: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar permissão');
    }
  };

  return (
    <ModuleWorkspace
      title="Roles & Permissões"
      description="Papéis e permissões do sistema."
      icon={Shield}
      breadcrumbItems={[
        { label: 'Roles & Permissões', href: '/dashboard/roles-permissoes' },
      ]}
    >
      {error && (
        <Card className="mb-6 p-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground text-lg font-semibold">Roles</h3>
            <Button variant="primary" size="sm" onClick={openRoleCreate}>
              <Plus className="h-4 w-4" />
              Nova role
            </Button>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Shield className="text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar role..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando roles...</p>
          ) : filteredRoles.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma role encontrada.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {role.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {role.scope}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openRoleEdit(role)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleDelete(role.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(selectedRole || !selectedRole) && (
            <form onSubmit={handleRoleSubmit} className="mt-6 space-y-4">
              <h4 className="text-foreground text-sm font-semibold">
                {selectedRole ? 'Editar role' : 'Nova role'}
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Escopo
                  </label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={roleForm.scope}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        scope: e.target.value as 'global' | 'tenant',
                      })
                    }
                  >
                    <option value="tenant">tenant</option>
                    <option value="global">global</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                    Descrição
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary">
                  {selectedRole ? 'Salvar' : 'Criar'}
                </Button>
                {selectedRole && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedRole(null);
                      setRoleForm({
                        name: '',
                        description: '',
                        scope: 'tenant',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground text-lg font-semibold">
              Permissões
            </h3>
            <Button variant="primary" size="sm" onClick={openPermissionCreate}>
              <Plus className="h-4 w-4" />
              Nova permissão
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">
              Carregando permissões...
            </p>
          ) : permissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma permissão encontrada.
            </p>
          ) : (
            <div className="max-h-[500px] space-y-4 overflow-y-auto">
              {Array.from(groupedPermissions.entries()).map(
                ([resource, perms]) => (
                  <div key={resource} className="rounded-lg border p-3">
                    <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                      {resource}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <span
                          key={perm.id}
                          className="bg-muted text-muted-foreground rounded-lg px-2 py-1 text-xs"
                        >
                          {perm.action}
                        </span>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          <form onSubmit={handlePermissionSubmit} className="mt-6 space-y-4">
            <h4 className="text-foreground text-sm font-semibold">
              Nova permissão
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Recurso
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={permissionForm.resource}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      resource: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Ação
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={permissionForm.action}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      action: e.target.value,
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Descrição
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={permissionForm.description}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button type="submit" variant="primary">
              Criar permissão
            </Button>
          </form>
        </Card>
      </div>
    </ModuleWorkspace>
  );
}

