import { type ReactNode, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { PortalBottomNavigation } from '@/components/layout/PortalBottomNavigation';
import { AccountProvider } from '@/contexts/AccountContext';
import { applyTheme, getStoredTheme } from '@/hooks/useTheme';

interface PortalShellProps {
  moduleTitle?: string;
  children?: ReactNode;
}

function PortalShellInner({ moduleTitle, children }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  const currentModuleTitle = moduleTitle || 'Portal';
  const content = children ?? <Outlet />;

  return (
    <div className="bg-muted/30 flex min-h-dvh w-full overflow-hidden lg:min-h-screen">
      <PortalSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <PortalHeader
          onMenuClick={() => setSidebarOpen(true)}
          moduleTitle={currentModuleTitle}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto h-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
            {content}
          </div>
        </main>
      </div>

      <PortalBottomNavigation />
    </div>
  );
}

export function PortalShell({ moduleTitle, children }: PortalShellProps) {
  return (
    <AccountProvider>
      <PortalShellInner moduleTitle={moduleTitle} children={children} />
    </AccountProvider>
  );
}
