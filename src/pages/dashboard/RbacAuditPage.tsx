import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { cn } from '@/utils';

type Person = {
  id: string;
  full_name: string;
  email: string;
  status: string;
};

type Role = {
  id: string;
  name: string;
  is_global: boolean;
  description: string | null;
};

type Permission = {
  id: string;
  name: string;
  module: string | null;
  description: string | null;
};

type RolePermission = {
  role_id: string;
  permission_id: string;
};

type TenantMembership = {
  id: string;
  tenant_id: string;
  person_id: string;
  membership_role: string;
  status: string;
};

type RoleAssignment = {
  id: string;
  person_id: string;
  role_id: string;
  tenant_id: string | null;
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
};

interface UserRow {
  person: Person;
  memberships: TenantMembership[];
  assignments: RoleAssignment[];
  roles: Role[];
  permissions: Permission[];
  modules: string[];
}

export default function RbacAuditPage() {
  const { isAdminMaster, isLoading: authLoading } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminMaster) return;

    let cancelled = false;

    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError('Supabase não configurado');
        setLoading(false);
        return;
      }

      try {
        const [
          peopleRes,
          rolesRes,
          permsRes,
          rpRes,
          membRes,
          assignRes,
          tenantsRes,
        ] = await Promise.all([
          supabase.from('people').select('*').order('full_name'),
          supabase.from('roles').select('*').order('name'),
          supabase.from('permissions').select('*').order('module, name'),
          supabase.from('role_permissions').select('*'),
          supabase.from('tenant_memberships').select('*'),
          supabase.from('role_assignments').select('*'),
          supabase.from('tenants').select('*').order('name'),
        ]);

        if (cancelled) return;

        if (peopleRes.error) throw peopleRes.error;
        if (rolesRes.error) throw rolesRes.error;
        if (permsRes.error) throw permsRes.error;
        if (rpRes.error) throw rpRes.error;
        if (membRes.error) throw membRes.error;
        if (assignRes.error) throw assignRes.error;
        if (tenantsRes.error) throw tenantsRes.error;

        setPeople(peopleRes.data || []);
        setRoles(rolesRes.data || []);
        setPermissions(permsRes.data || []);
        setRolePermissions(rpRes.data || []);
        setMemberships(membRes.data || []);
        setAssignments(assignRes.data || []);
        setTenants(tenantsRes.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar RBAC',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isAdminMaster]);

  const matrix = useMemo<UserRow[]>(() => {
    if (!isAdminMaster) return [];

    const roleMap = new Map(roles.map((r) => [r.id, r]));
    const permMap = new Map(permissions.map((p) => [p.id, p]));

    const rpByRole = new Map<string, Permission[]>();
    for (const rp of rolePermissions) {
      const perm = permMap.get(rp.permission_id);
      if (!perm) continue;
      const list = rpByRole.get(rp.role_id) || [];
      list.push(perm);
      rpByRole.set(rp.role_id, list);
    }

    const membByPerson = new Map<string, TenantMembership[]>();
    for (const m of memberships) {
      const list = membByPerson.get(m.person_id) || [];
      list.push(m);
      membByPerson.set(m.person_id, list);
    }

    const assignByPerson = new Map<string, RoleAssignment[]>();
    for (const a of assignments) {
      const list = assignByPerson.get(a.person_id) || [];
      list.push(a);
      assignByPerson.set(a.person_id, list);
    }

    return people.map((person) => {
      const personMemberships = membByPerson.get(person.id) || [];
      const personAssignments = assignByPerson.get(person.id) || [];
      const personRoles = personAssignments
        .map((a) => roleMap.get(a.role_id))
        .filter((r): r is Role => Boolean(r));

      const personPermissions = personRoles.flatMap(
        (r) => rpByRole.get(r.id) || [],
      );
      const uniquePerms = Array.from(
        new Map(personPermissions.map((p) => [p.id, p])).values(),
      );

      const modules = Array.from(
        new Set(
          uniquePerms
            .map((p) => p.module)
            .filter((m): m is string => Boolean(m)),
        ),
      );

      return {
        person,
        memberships: personMemberships,
        assignments: personAssignments,
        roles: personRoles,
        permissions: uniquePerms,
        modules,
      };
    });
  }, [
    isAdminMaster,
    people,
    roles,
    permissions,
    rolePermissions,
    memberships,
    assignments,
    tenants,
  ]);

  if (authLoading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-sm">
          Carregando autenticação...
        </p>
      </Card>
    );
  }

  if (!isAdminMaster) {
    return (
      <Card className="p-6">
        <p className="text-destructive text-sm">
          Acesso restrito ao administrador da plataforma.
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-sm">
          Carregando matriz RBAC...
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 p-6">
        <p className="text-destructive text-sm">{error}</p>
      </Card>
    );
  }

  const totalPermissions = permissions.length;
  const totalRoles = roles.length;
  const totalPeople = people.length;
  const totalTenants = tenants.length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Visão geral do RBAC
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Pessoas
            </p>
            <p className="text-foreground text-2xl font-bold">{totalPeople}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Roles
            </p>
            <p className="text-foreground text-2xl font-bold">{totalRoles}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Permissões
            </p>
            <p className="text-foreground text-2xl font-bold">
              {totalPermissions}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Tenants
            </p>
            <p className="text-foreground text-2xl font-bold">{totalTenants}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Matriz RBAC
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Usuário → Tenant → Role → Permissões → Módulos
        </p>
        <div className="space-y-4">
          {matrix.map((row) => (
            <div
              key={row.person.id}
              className="border-border/60 rounded-lg border p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {row.person.full_name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {row.person.email}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">
                  {row.person.status}
                </span>
              </div>

              <div className="mb-2">
                <p className="text-muted-foreground text-xs tracking-wider uppercase">
                  Tenants
                </p>
                {row.memberships.length === 0 ? (
                  <p className="text-muted-foreground text-xs">
                    Sem membership
                  </p>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {row.memberships.map((m) => {
                      const tenant = tenants.find((t) => t.id === m.tenant_id);
                      return (
                        <span
                          key={m.id}
                          className="bg-muted text-foreground rounded-full px-2 py-0.5 text-xs"
                        >
                          {tenant?.name || m.tenant_id} ({m.membership_role})
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <p className="text-muted-foreground text-xs tracking-wider uppercase">
                  Roles
                </p>
                {row.roles.length === 0 ? (
                  <p className="text-muted-foreground text-xs">Sem roles</p>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {row.roles.map((r) => (
                      <span
                        key={r.id}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs',
                          r.is_global
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent',
                        )}
                      >
                        {r.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <p className="text-muted-foreground text-xs tracking-wider uppercase">
                  Permissões
                </p>
                <p className="text-foreground text-xs">
                  {row.permissions.length} permissões
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs tracking-wider uppercase">
                  Módulos
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {row.modules.length === 0 ? (
                    <span className="text-muted-foreground text-xs">
                      Nenhum módulo
                    </span>
                  ) : (
                    row.modules.map((mod) => (
                      <span
                        key={mod}
                        className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs"
                      >
                        {mod}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
