import type { ComponentType } from 'react';
import { Shield, Sparkle, Users, Wrench, TreePine } from 'lucide-react';

export interface HeroSlideData {
  id: string;
  eyebrow: string;
  eyebrowIcon: ComponentType<{ className?: string }>;
  title: string;
  titleHighlight?: string;
  description: string;
  image: string;
  imageAlt: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  candidateCta: { label: string; href: string };
}

export const HERO_SLIDES: HeroSlideData[] = [
  {
    id: 'rh',
    eyebrow: 'ASSESSORIA EM RECURSOS HUMANOS',
    eyebrowIcon: Shield,
    title:
      'Mais eficiência em Recursos Humanos, mais agilidade para sua empresa.',
    description:
      'Recrutamento, seleção, gestão de pessoas e terceirização com compliance. Sua equipe certa ao seu lado.',
    image: '/images/services/assessoria-rh.png',
    imageAlt: 'Equipe em reunião corporativa de recrutamento',
    primaryCta: {
      label: 'Conhecer Assessoria em RH',
      href: '/servicos/assessoria-rh',
    },
    secondaryCta: {
      label: 'Solicitar orçamento',
      href: '/contato?assunto=assessoria-rh',
    },
    candidateCta: { label: 'Ver vagas', href: '/vagas' },
  },
  {
    id: 'facilities',
    eyebrow: 'FACILITIES',
    eyebrowIcon: Sparkle,
    title: 'Sua operação funcionando. Nós cuidamos do que está por trás dela.',
    description:
      'Limpeza, segurança, portaria, manutenção e jardinagem para seu ambiente profissional.',
    image: '/images/services/facilities-jardinagem.webp',
    imageAlt: 'Equipe de facilities em escritório corporativo',
    primaryCta: { label: 'Conhecer Facilities', href: '/servicos/facilities' },
    secondaryCta: {
      label: 'Solicitar orçamento',
      href: '/contato?assunto=facilities',
    },
    candidateCta: { label: 'Ver vagas', href: '/vagas' },
  },
  {
    id: 'limpeza',
    eyebrow: 'LIMPEZA E HIGIENIZAÇÃO',
    eyebrowIcon: Wrench,
    title: 'Ambientes limpos, seguros e preparados para receber pessoas.',
    description:
      'Limpeza profissional, higienização, manutenção e organização para empresas.',
    image: '/images/services/limpeza-higienizacao.webp',
    imageAlt: 'Profissional de limpeza em escritório corporativo',
    primaryCta: { label: 'Conhecer limpeza', href: '/servicos/limpeza' },
    secondaryCta: {
      label: 'Solicitar orçamento',
      href: '/contato?assunto=limpeza',
    },
    candidateCta: { label: 'Ver vagas', href: '/vagas' },
  },
  {
    id: 'jardinagem',
    eyebrow: 'JARDINAGEM E PAISAGISMO',
    eyebrowIcon: TreePine,
    title:
      'Áreas verdes bem cuidadas também fazem parte da experiência da sua empresa.',
    description:
      'Jardinagem, paisagismo e manutenção de áreas verdes para ambientes corporativos.',
    image: '/images/services/jardinagem.webp',
    imageAlt: 'Profissional de jardinagem em área corporativa',
    primaryCta: { label: 'Conhecer jardinagem', href: '/servicos/jardinagem' },
    secondaryCta: {
      label: 'Solicitar orçamento',
      href: '/contato?assunto=jardinagem',
    },
    candidateCta: { label: 'Ver vagas', href: '/vagas' },
  },
  {
    id: 'mao-de-obra',
    eyebrow: 'MÃO DE OBRA TEMPORÁRIA E EFETIVA',
    eyebrowIcon: Users,
    title: 'A equipe certa para o momento certo da sua empresa.',
    description:
      'Contratação temporária, efetiva e sazonal com suporte completo de RH.',
    image: '/images/services/mao-de-obra.webp',
    imageAlt: 'Equipe de trabalho em obra corporativa',
    primaryCta: {
      label: 'Conhecer solução',
      href: '/servicos/mao-de-obra-temporaria',
    },
    secondaryCta: { label: 'Contratar profissionais', href: '/clientes' },
    candidateCta: { label: 'Candidatar-se', href: '/trabalhe-conosco' },
  },
];
