import { type ReactNode, useState, useCallback } from 'react';
import { RecrutamentoSidebar } from '@/modules/recrutamento/RecrutamentoSidebar';
import { RecrutamentoHeader } from './RecrutamentoHeader';
import { RecrutamentoContent } from './RecrutamentoContent';

interface RecrutamentoContainerProps {
  children?: ReactNode;
}

export function RecrutamentoContainer({ children }: RecrutamentoContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleNavigate = useCallback(() => setSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="bg-muted/30 flex h-dvh w-full flex-col overflow-hidden">
      <RecrutamentoHeader
        onMenuClick={handleMenuClick}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <RecrutamentoSidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onNavigate={handleNavigate}
        />

        {sidebarOpen && (
          <div
            className="bg-background/60 fixed inset-0 z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <RecrutamentoContent>{children}</RecrutamentoContent>
        </div>
      </div>
    </div>
  );
}