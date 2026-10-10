import {
  Briefcase,
  Building2,
  FileText,
  Handshake,
  Landmark,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import type { AvaModule, AvaModuleInfo, Tutorial } from '../types';

export const AVA_MODULES: Record<
  AvaModule,
  Omit<AvaModuleInfo, 'tutorialCount'>
> = {
  candidato: {
    id: 'candidato',
    label: 'Candidato',
    description: 'Como gerenciar perfil, currículo e candidaturas.',
    icon: 'Users',
    route: '/candidato',
  },
  recrutamento: {
    id: 'recrutamento',
    label: 'Recrutamento',
    description: 'Como publicar vagas e analisar candidatos.',
    icon: 'Briefcase',
    route: '/dashboard/recrutamento',
  },
  rh: {
    id: 'rh',
    label: 'Recursos Humanos',
    description: 'Como gerenciar departamentos e documentos de RH.',
    icon: 'Users',
    route: '/dashboard/rh',
  },
  empresas: {
    id: 'empresas',
    label: 'Empresas',
    description: 'Como cadastrar empresas, parceiros e fornecedores.',
    icon: 'Building2',
    route: '/dashboard/empresas',
  },
  financeiro: {
    id: 'financeiro',
    label: 'Financeiro',
    description: 'Como consultar contas, fluxo de caixa e relatorios.',
    icon: 'Wallet',
    route: '/dashboard/financeiro',
  },
  contabilidade: {
    id: 'contabilidade',
    label: 'Contabilidade',
    description: 'Como lancar movimentacoes contabeis.',
    icon: 'Landmark',
    route: '/dashboard/contabilidade',
  },
  fiscal: {
    id: 'fiscal',
    label: 'Fiscal',
    description: 'Como gerar documentos fiscais.',
    icon: 'FileText',
    route: '/dashboard/fiscal',
  },
  estoque: {
    id: 'estoque',
    label: 'Estoque',
    description: 'Como controle entradas e saidas de produtos.',
    icon: 'Package',
    route: '/dashboard/estoque',
  },
  servicos: {
    id: 'servicos',
    label: 'Servicos',
    description: 'Como criar ordens de serviço e checklists.',
    icon: 'Wrench',
    route: '/dashboard/servicos',
  },
  suporte: {
    id: 'suporte',
    label: 'Suporte',
    description: 'Como abrir e acompanhamento tickets de suporte.',
    icon: 'Support',
    route: '/dashboard/suporte',
  },
  comercial: {
    id: 'comercial',
    label: 'Comercial',
    description: 'Como gerenciar leads, interações e negociações.',
    icon: 'Handshake',
    route: '/dashboard/crm',
  },
  pos: {
    id: 'pos',
    label: 'Ponto de Venda',
    description: 'Como registrar vendas e pagamentos.',
    icon: 'ShoppingBag',
    route: '/dashboard/pos',
  },
  sistema: {
    id: 'sistema',
    label: 'Sistema',
    description: 'Como configurar tenants, usuários e permissões.',
    icon: 'Settings',
    route: '/dashboard/configuracoes',
  },
};

export const AVA_ICON_COMPONENTS: Record<string, typeof Briefcase> = {
  Briefcase,
  Building2,
  FileText,
  Handshake,
  Landmark,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  Wallet,
  Wrench,
};

export function resolveAvaModule(
  route: string | undefined | null,
): AvaModule | null {
  if (!route) return null;
  const normalized = route.replace(/\/+$/, '').toLowerCase();
  for (const [key, info] of Object.entries(AVA_MODULES) as [
    AvaModule,
    typeof AVA_MODULES.candidato,
  ][]) {
    if (normalized === info.route || normalized.startsWith(`${info.route}/`)) {
      return key;
    }
  }
  return null;
}

export function buildAvaModuleInfo(tutorials: Tutorial[]): AvaModuleInfo[] {
  return Object.values(AVA_MODULES).map((info) => ({
    ...info,
    tutorialCount: tutorials.filter(
      (t) => t.module === info.id && t.status === 'published',
    ).length,
  }));
}

export function filterTutorials(
  tutorials: Tutorial[],
  module: AvaModule | null,
  query: string,
): Tutorial[] {
  let result = tutorials.filter((t) => t.status === 'published');
  if (module) {
    result = result.filter((t) => t.module === module);
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.steps.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q),
        ),
    );
  }
  return result.sort((a, b) => a.title.localeCompare(b.title));
}
