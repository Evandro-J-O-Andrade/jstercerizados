import { Users, UserRoundSearch, BriefcaseBusiness, LayoutDashboard } from 'lucide-react';

export const RH_MODULE_ID = 'rh';

export const rhModuleMeta = {
  id: RH_MODULE_ID,
  title: 'Recursos Humanos',
  description: 'Gestão de pessoas e operações de RH no tenant',
  icon: Users,
  route: '/dashboard/rh',
  category: 'negocio',
  scope: 'tenant',
  requiredPermissions: ['people.read'],
} as const;

/** Submódulos proprietários de RH. Consultas cruzadas usam rotas RH próprias. */
export const rhSubModules = [
  { id: 'dashboard', title: 'Painel RH', description: 'Indicadores reais de RH', icon: LayoutDashboard, route: '/dashboard/rh', requiredPermissions: ['people.read'] },
  { id: 'colaboradores', title: 'Colaboradores', description: 'Cadastro e gestão de colaboradores', icon: Users, route: '/dashboard/rh/colaboradores', requiredPermissions: ['people.read'] },
  { id: 'candidatos-consulta', title: 'Consulta de candidatos', description: 'Consulta autorizada (RH), sem página operacional de Recrutamento', icon: UserRoundSearch, route: '/dashboard/rh/candidatos', requiredPermissions: ['candidates.read'] },
  { id: 'vagas-consulta', title: 'Consulta de vagas', description: 'Consulta autorizada (RH), sem operação de vagas de Recrutamento', icon: BriefcaseBusiness, route: '/dashboard/rh/vagas', requiredPermissions: ['jobs.read'] },
] as const;
