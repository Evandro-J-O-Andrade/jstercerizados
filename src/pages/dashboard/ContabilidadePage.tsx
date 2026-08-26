import { useMemo } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { getAvailableModules } from '@/components/portal/ModuleRegistry';
import { normalizeRoleScope } from '@/utils/rbac-normalize';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';

export default function ContabilidadePage() {
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

  const accountingModule = modules.find(
    (m: ModuleDefinition) => m.id === 'contabilidade',
  );

  const accountingCards = useMemo(() => {
    if (!accountingModule?.features) return [];
    return accountingModule.features.map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      route: feature.route,
      icon: 'book-open',
    }));
  }, [accountingModule]);

  return (
    <ModuleWorkspace
      title={accountingModule?.title || 'Contabilidade'}
      description={
        accountingModule?.description ||
        'Plano de contas, lançamentos e fechamento contábil'
      }
      module={accountingModule}
      permissions={permissions}
      breadcrumbItems={[{ label: 'Contabilidade' }]}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accountingCards.map((card) => (
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
