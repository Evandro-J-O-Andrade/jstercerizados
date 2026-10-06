import { type ReactNode, useState, useCallback } from 'react';
import { CandidatoSidebar } from '../CandidatoSidebar';
import { CandidatoHeader } from './CandidatoHeader';
import { CandidatoContent } from './CandidatoContent';
import { CandidatoBottomNavigation } from './CandidatoBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';

interface CandidatoContainerProps {
  children?: ReactNode;
}

export function CandidatoContainer({ children }: CandidatoContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { sidebarItems, bottomNavItems, loading } = useNavigation();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleNavigate = useCallback(() => setSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="bg-muted/30 flex h-dvh w-full flex-col overflow-hidden">
      <CandidatoHeader
        onMenuClick={handleMenuClick}
        onNavigate={handleNavigate}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CandidatoSidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onNavigate={handleNavigate}
          items={sidebarItems}
          loading={loading}
        />

        {sidebarOpen && (
          <div
            className="bg-background/60 fixed inset-0 z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <CandidatoContent>{children}</CandidatoContent>
        </div>
      </div>
      <CandidatoBottomNavigation items={bottomNavItems} />
    </div>
  );
}
