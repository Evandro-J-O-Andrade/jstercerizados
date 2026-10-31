import { type ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AccountProvider } from '@/contexts/AccountContext';
import { ModuleProvider } from '@/contexts/ModuleContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { COMPANY } from '@/config';

interface AdminShellProps {
  moduleTitle?: string;
  children?: ReactNode;
}

function AdminShellInner({ moduleTitle, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentModuleTitle = moduleTitle || 'J&S Empregos';
  const content = children ?? <Outlet />;

  return (
    <div className="bg-muted/30 flex h-dvh w-full flex-row overflow-hidden">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          moduleTitle={currentModuleTitle}
          className="shrink-0"
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <main className="flex min-h-0 flex-col">
            <div className="mx-auto flex min-h-0 max-w-[1920px] flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
              {content}
            </div>
          </main>

          <footer className="border-t border-border/50 bg-background/50 px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {COMPANY.name} — Sistema de Administração
              </span>
              <span>
                Área restrita · Tenant isolado
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ moduleTitle, children }: AdminShellProps) {
  return (
    <AccountProvider>
      <ModuleProvider>
        <AdminShellInner moduleTitle={moduleTitle} children={children} />
      </ModuleProvider>
    </AccountProvider>
  );
}
