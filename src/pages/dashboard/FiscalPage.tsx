import { useMemo } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { getAvailableModules } from '@/components/portal/ModuleRegistry';
import { normalizeRoleScope } from '@/utils/rbac-normalize';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';

export default function FiscalPage() {
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

  const fiscalModule = modules.find((m: ModuleDefinition) => m.id === 'fiscal');

  const fiscalCards = useMemo(() => {
    if (!fiscalModule?.features) return [];
    return fiscalModule.features.map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      route: feature.route,
      icon: 'file-text',
    }));
  }, [fiscalModule]);

  return (
    <ModuleWorkspace
      title={fiscalModule?.title || 'Fiscal'}
      description={
        fiscalModule?.description ||
        'Notas fiscais, emissão e conformidade tributária'
      }
      module={fiscalModule}
      permissions={permissions}
      breadcrumbItems={[{ label: 'Fiscal' }]}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {fiscalCards.map((card) => (
          <ModuleCard
            key={card.id}
            module={{
              id: card.id,
              title: card.title,
              description: card.description,
              icon: card.icon,
              route: card.route,
              category: 'negocio',
              scope: 'tenant',
              requiredPermissions: [],
            }}
            permissions={permissions}
          />
        ))}
      </div>
    </ModuleWorkspace>
  );
}
