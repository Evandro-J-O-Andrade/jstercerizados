import type { ReactNode } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleSidebar } from '@/components/portal/ModuleSidebar';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import type { Permission } from '@/types/auth';
import { ModulePage as SharedModulePage } from '@/shared/crud';
import type {
  BreadcrumbItem,
  ModulePageConfig,
  WorkspaceSlotProps,
} from '@/shared/crud/types';

export type {
  BreadcrumbItem,
  ColumnDef,
  FilterDef,
  ModulePageConfig,
} from '@/shared/crud/types';

type PortalModulePageConfig<T, C> = ModulePageConfig<T, C> & {
  module?: ModuleDefinition;
  permissions?: Permission[];
};

export function ModulePage<T extends { id: string; created_at?: string }, C>({
  module,
  permissions = [],
  ...config
}: PortalModulePageConfig<T, C>) {
  const renderWorkspace = (slot: WorkspaceSlotProps): ReactNode => (
    <ModuleWorkspace
      title={slot.title}
      description={slot.description}
      icon={slot.icon}
      breadcrumbItems={slot.breadcrumbItems as BreadcrumbItem[]}
      actions={slot.actions}
      sidebar={
        module && permissions.length > 0 ? (
          <ModuleSidebar module={module} permissions={permissions} />
        ) : undefined
      }
    >
      {slot.children}
    </ModuleWorkspace>
  );

  return (
    <SharedModulePage<T, C> {...config} renderWorkspace={renderWorkspace} />
  );
}
