export interface CandidatoModuleConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  requiredPermission: string | null;
  showInSidebar: boolean;
  sortOrder: number;
}
