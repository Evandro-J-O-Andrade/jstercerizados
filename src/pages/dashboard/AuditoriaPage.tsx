import { useMemo } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { getAvailableModules } from '@/components/portal/ModuleRegistry';
import { normalizeRoleScope } from '@/utils/rbac-normalize';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';

export default function AuditoriaPage() {
  const { permissions } = useAuth();
  const { activeRole } = useAccount();

  const modules = useMemo(
    () =>
      getAvailableModules(
        permissions,
        activeRole ? normalizeRoleScope(activeRole.scope) : 'tenant',
      ),
    [permissions, activeRole?.scope],
  );

  const module = modules.find((m: ModuleDefinition) => m.id === 'auditoria');

  const cards = useMemo(() => {
    if (!module?.features) return [];
    return module.features.map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      route: feature.route,
      icon: 'file-text',
    }));
  }, [module]);

  return (
    <ModuleWorkspace
      title={module?.title || 'Auditoria'}
      description={module?.description || 'Logs e eventos do sistema'}
      module={module}
      permissions={permissions}
      breadcrumbItems={[{ label: 'Auditoria' }]}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <ModuleCard
            key={card.id}
            module={{
              id: card.id,
              title: card.title,
              description: card.description,
              icon: card.icon,
              route: card.route,
              category: 'seguranca',
              scope: 'platform',
              requiredPermissions: [],
            }}
            permissions={permissions}
          />
        ))}
      </div>
    </ModuleWorkspace>
  );
}
