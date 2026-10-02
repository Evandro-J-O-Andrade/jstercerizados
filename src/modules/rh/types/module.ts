import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  Award,
  ClipboardList,
} from 'lucide-react';

export const RH_MODULE_ID = 'rh';

export const rhModuleMeta = {
  id: RH_MODULE_ID,
  title: 'Recursos Humanos',
  description: 'Gestão de pessoas, funcionários e processos internos',
  icon: Users,
  route: '/dashboard/rh',
  category: 'negocio',
  scope: 'tenant',
  requiredPermissions: ['people.read'],
} as const;

export const rhSubModules = [
  {
    id: 'employees',
    title: 'Funcionários',
    description: 'Gerencie funcionários ativos, admissões e afastamentos',
    icon: Users,
    route: '/dashboard/funcionarios',
    requiredPermissions: ['people.read'],
  },
  {
    id: 'candidates',
    title: 'Candidatos',
    description: 'Banco de talentos e currículos',
    icon: Briefcase,
    route: '/dashboard/candidatos',
    requiredPermissions: ['candidates.read'],
  },
  {
    id: 'jobs',
    title: 'Vagas',
    description: 'Gerencie vagas abertas e publicadas',
    icon: FileText,
    route: '/dashboard/vagas',
    requiredPermissions: ['jobs.read'],
  },
  {
    id: 'recruitment',
    title: 'Processos Seletivos',
    description: 'Acompanhe processos e etapas',
    icon: Calendar,
    route: '/dashboard/processos-seletivos',
    requiredPermissions: ['jobs.read'],
  },
  {
    id: 'skills',
    title: 'Habilidades',
    description: 'Gerencie habilidades dos candidatos',
    icon: Award,
    route: '/dashboard/candidatos/habilidades',
    requiredPermissions: ['candidates.read'],
  },
  {
    id: 'talent-bank',
    title: 'Banco de Talentos',
    description: 'Consulta e inteligência sobre candidatos',
    icon: ClipboardList,
    route: '/dashboard/banco-de-talentos',
    requiredPermissions: ['candidates.read'],
  },
] as const;
