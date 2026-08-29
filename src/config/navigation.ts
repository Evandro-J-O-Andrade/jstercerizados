export interface NavLink {
  label: string;
  href: string;
  auth?: boolean;
}

export interface DashboardLink {
  label: string;
  href: string;
  icon: string;
  requireAuth?: boolean;
}
