import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardShellProps {
  breadcrumbItems?: { label: string; href?: string }[];
}

export function DashboardShell({ breadcrumbItems = [] }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { permissions, isAdminMaster } = useAuth();

  return (
    <div className="bg-muted/30 flex h-screen w-full overflow-hidden">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {breadcrumbItems.length > 0 && (
              <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
