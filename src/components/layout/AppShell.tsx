import { Outlet } from 'react-router-dom';
import { PortalShell } from '@/components/portal/PortalShell';

export function AppShell() {
  return (
    <PortalShell>
      <Outlet />
    </PortalShell>
  );
}
