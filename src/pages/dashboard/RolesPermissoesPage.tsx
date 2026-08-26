import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Shield, Users, Key } from 'lucide-react';
import { roleRepository } from '@/repositories/role.repository';
import { permissionRepository } from '@/repositories/permission.repository';
import type { Role } from '@/types/domain/role';
import type { Permission } from '@/types/domain/permission';

export default function RolesPermissoesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('[ROLES_PERMISSOES] Failed to load:', error);
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

  return (
    <ModuleWorkspace
      title="Roles & Permissões"
      description="Papéis e permissões do sistema."
      icon={Shield}
      breadcrumbItems={[
        { label: 'Roles & Permissões', href: '/dashboard/roles-permissoes' },
      ]}
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando roles e permissões...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Roles
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {roles.length}
                </span>
                <Users className="text-primary h-5 w-5" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Permissões
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {permissions.length}
                </span>
                <Key className="text-primary h-5 w-5" />
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-border border-b px-4 py-3">
              <h3 className="text-foreground text-sm font-semibold">
                Permissões por módulo
              </h3>
            </div>
            <div className="divide-border divide-y">
              {[
                'core',
                'recruitment',
                'finance',
                'fiscal',
                'accounting',
                'platform',
              ].map((resource) => {
                const modulePerms = permissions.filter(
                  (p) => p.resource === resource,
                );
                if (modulePerms.length === 0) return null;
                return (
                  <div key={resource} className="px-4 py-3">
                    <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                      {resource}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {modulePerms.map((perm) => (
                        <span
                          key={perm.id}
                          className="bg-muted text-muted-foreground rounded-lg px-2 py-1 text-xs"
                        >
                          {perm.action}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </ModuleWorkspace>
  );
}
