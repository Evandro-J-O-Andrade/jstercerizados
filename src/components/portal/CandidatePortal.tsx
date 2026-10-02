import { type ReactNode, useState, useCallback } from 'react';
import { CandidateSidebar } from '@/components/portal/CandidateSidebar';
import { CandidateHeader } from '@/components/portal/CandidateHeader';
import { CandidateContent } from '@/components/portal/CandidateContent';

interface CandidatePortalProps {
  children?: ReactNode;
}

export function CandidatePortal({ children }: CandidatePortalProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleNavigate = useCallback(() => setSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);

  return (
    <div className="bg-muted/30 flex min-h-screen w-full flex-col overflow-hidden">
      {sidebarOpen && (
        <div
          className="bg-background/60 fixed inset-0 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <CandidateSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNavigate={handleNavigate}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CandidateHeader
          onMenuClick={handleMenuClick}
          onNavigate={handleNavigate}
        />

        <CandidateContent>{children}</CandidateContent>
      </div>
    </div>
  );
}
