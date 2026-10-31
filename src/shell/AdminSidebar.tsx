import { AdminSidebar as AdminSidebarImpl } from '@/modules/admin/AdminSidebar';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar(props: AdminSidebarProps) {
  return <AdminSidebarImpl className={props.className} />;
}

export default AdminSidebar;