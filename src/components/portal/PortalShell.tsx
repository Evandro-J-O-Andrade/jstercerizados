import { type ReactNode, useState, useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { AccountProvider } from '@/contexts/AccountContext';
import { COMPANY } from '@/config';

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
    <div className="bg-muted/30 flex h-screen w-full flex-col overflow-hidden">
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          <main>
            <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
              {content}
            </div>
          </main>
        </div>

        <footer className="border-border/50 bg-background/50 shrink-0 border-t lg:hidden">
          <div className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
            <p className="text-muted-foreground text-center text-xs">
              © {new Date().getFullYear()} {COMPANY.name}. Todos os direitos
              reservados.{' '}
              <span className="text-primary font-medium">
                Desenvolvido por New Wave Sistemas
              </span>
            </p>
          </div>
        </footer>

        <footer className="border-border/50 bg-background/50 hidden shrink-0 border-t lg:block">
          <div className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                © {new Date().getFullYear()} {COMPANY.name}. Todos os direitos
                reservados.
              </p>
              <span className="text-primary text-xs font-medium">
                Desenvolvido por New Wave Sistemas
              </span>
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
      <PortalShellInner moduleTitle={moduleTitle} children={children} />
    </AccountProvider>
  );
}
