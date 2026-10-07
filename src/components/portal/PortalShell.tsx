import { type ReactNode, useState, useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { AccountProvider } from '@/contexts/AccountContext';
import { ModuleProvider } from '@/contexts/ModuleContext';

interface PortalShellProps {
  moduleTitle?: string;
  children?: ReactNode;
}

function PortalShellInner({ moduleTitle, children }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useLayoutEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const currentModuleTitle = moduleTitle || 'Portal';
  const content = children ?? <Outlet />;

  return (
    <div className="bg-muted/30 flex h-dvh w-full flex-col overflow-hidden">
      <PortalSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PortalHeader
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
        </div>
      </div>
    </div>
  );
}

export function PortalShell({ moduleTitle, children }: PortalShellProps) {
  return (
    <AccountProvider>
      <ModuleProvider>
        <PortalShellInner moduleTitle={moduleTitle} children={children} />
      </ModuleProvider>
    </AccountProvider>
  );
}
