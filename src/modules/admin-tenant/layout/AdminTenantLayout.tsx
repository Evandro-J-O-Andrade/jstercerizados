/**
 * AdminTenantLayout — layout próprio da célula Admin Tenant (proprietário).
 *
 * Cada célula tem seu próprio layout com sidebar, header e footer.
 * O ModuleRouter não impõe o layout administrativo genérico a esta célula.
 */

import { type ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminTenantSidebar } from '../sidebar/AdminTenantSidebar';
import { COMPANY } from '@/config';

export interface AdminTenantLayoutProps {
  children?: ReactNode;
  className?: string;
}

export function AdminTenantLayout({
  children,
  className,
}: AdminTenantLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={`bg-muted/30 flex h-dvh w-full flex-row ${className ?? ''}`}
    >
      <AdminTenantSidebar
        className="shrink-0"
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex-col h-full min-w-0">
        <header
          className={`
            border-border bg-background sticky top-0 z-40 flex items-center justify-between border-b shadow-sm backdrop-blur-md h-16
          `}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="aria-label=Abrir menu p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted lg:hidden"
              aria-expanded={sidebarOpen}
            >
              <span className="sr-only">Abrir menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              </svg>
            </div>
            <div className="hidden text-right lg:block">
              <p className="text-foreground text-sm font-semibold">
                {COMPANY.name} / Administração do Proprietário
              </p>
              <p className="text-muted-foreground text-xs">Área restrita · Tenant isolado</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:flex"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
              <span>Voltar para o site</span>
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto relative">
          <main className="flex min-h-0 flex-col">
            <div className="mx-auto flex min-h-0 max-w-[1920px] flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
              {children ?? <Outlet />}
            </div>
          </main>

          <footer
            className="sticky bottom-0 z-10 border-t border-border/50 bg-background/90 backdrop-blur-sm px-4 py-4 sm:px-6 lg:px-8 xl:px-10"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {COMPANY.name} — Admin Tenant
              </span>
              <span>
                Governança do proprietário · Tenant isolado
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
