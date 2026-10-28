import { Outlet } from 'react-router-dom';
import { PortalShell } from '@/components/legacy/portal/PortalShell';

export function AppShell() {
  return (
    <PortalShell>
      <Outlet />
    </PortalShell>
  );
}
