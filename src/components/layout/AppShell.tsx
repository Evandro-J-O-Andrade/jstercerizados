import { Outlet } from 'react-router-dom';
import { AdminShell } from '@/shell/AdminShell';

export function AppShell() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
