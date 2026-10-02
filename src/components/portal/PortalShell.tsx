import { type ReactNode, useState, useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { AccountProvider } from '@/contexts/AccountContext';
import { ModuleProvider } from '@/contexts/ModuleContext';
import { COMPANY, NEW_WAVE_URL } from '@/config';

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

        <footer className="border-border/50 bg-background/50 shrink-0 border-t">
          <div className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="text-muted-foreground text-xs">
                © {new Date().getFullYear()} {COMPANY.name}. Todos os direitos
                reservados.
              </p>
              <a
                href={NEW_WAVE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-xs font-medium transition-colors hover:underline"
              >
                Desenvolvido por New Wave Sistemas Digital Solutions
              </a>
            </div>
          </div>
        </footer>
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
