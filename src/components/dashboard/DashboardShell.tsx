import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
    <div className="bg-muted/30 min-h-screen">
      <DashboardShellLayout
        sidebarOpen={sidebarOpen}
        onSidebarClose={() => setSidebarOpen(false)}
        onMenuClick={() => setSidebarOpen(true)}
        breadcrumbItems={breadcrumbItems}
        userPermissions={permissions}
        isAdminMaster={isAdminMaster}
      >
        <Outlet />
      </DashboardShellLayout>
    </div>
  );
}

interface DashboardShellLayoutProps {
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  onMenuClick: () => void;
  breadcrumbItems: { label: string; href?: string }[];
  userPermissions: import('@/types/auth').Permission[];
  isAdminMaster: boolean;
  children: React.ReactNode;
}

function DashboardShellLayout({
  sidebarOpen,
  onSidebarClose,
  onMenuClick,
  breadcrumbItems,
  userPermissions,
  isAdminMaster,
  children,
}: DashboardShellLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={onSidebarClose}
        userPermissions={userPermissions}
        isAdminMaster={isAdminMaster}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader onMenuClick={onMenuClick} />

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {breadcrumbItems.length > 0 && (
              <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
