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
    title: 'Mais eficiência em RH. Mais resultados para sua empresa.',
    description:
      'Mão de obra temporária e efetiva, recrutamento, seleção e soluções em RH para empresas.',
    image: '/images/services/assessoria-rh.png',
    imageAlt: 'Equipe em reunião corporativa de recrutamento',
    primaryCta: {
      label: 'Contratar Funcionários',
      href: '/servicos/assessoria-rh',
    },
    secondaryCta: {
      label: 'Quero uma Vaga',
      href: '/vagas',
    },
    candidateCta: { label: 'Ver vagas', href: '/vagas' },
  },
  {
    id: 'facilities',
    eyebrow: 'FACILITIES',
    eyebrowIcon: Sparkle,
    title: 'Ambientes mais eficientes, equipes mais preparadas.',
    description:
      'Limpeza, segurança, portaria, manutenção e jardinagem para seu ambiente profissional.',
    image: '/images/services/facilities-real.webp',
    imageAlt: 'Equipe de facilities em escritório corporativo',
    primaryCta: {
      label: 'Conheça nossas soluções',
      href: '/servicos/facilities',
    },
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
    title: 'Seu ambiente cuidado, sua operação funcionando.',
    description:
      'Limpeza profissional, higienização, manutenção e organização para empresas.',
    image: '/images/services/limpeza-real.webp',
    imageAlt: 'Profissional de limpeza em escritório corporativo',
    primaryCta: {
      label: 'Solicitar orçamento',
      href: '/contato?assunto=limpeza',
    },
    secondaryCta: {
      label: 'Conhecer mais',
      href: '/servicos/facilities',
    },
    candidateCta: { label: 'Ver vagas', href: '/vagas' },
  },
  {
    id: 'mao-de-obra',
    eyebrow: 'MÃO DE OBRA TEMPORÁRIA E EFETIVA',
    eyebrowIcon: Users,
    title: 'Mais agilidade para formar a equipe que sua empresa precisa.',
    description:
      'Contratação temporária, efetiva e sazonal com suporte completo de RH.',
    image: '/images/services/mao-de-obra-real.webp',
    imageAlt: 'Equipe de trabalho em obra corporativa',
    primaryCta: {
      label: 'Contratar profissionais',
      href: '/servicos/mao-de-obra-temporaria',
    },
    secondaryCta: { label: 'Ver vagas', href: '/vagas' },
    candidateCta: { label: 'Candidatar-se', href: '/trabalhe-conosco' },
  },
  {
    id: 'jardinagem',
    eyebrow: 'JARDINAGEM E PAISAGISMO',
    eyebrowIcon: TreePine,
    title:
      'Áreas verdes bem cuidadas também fazem parte da experiência da sua empresa.',
    description:
      'Jardinagem, paisagismo e manutenção de áreas verdes para ambientes corporativos.',
    image: '/images/services/jardinagem-real.webp',
    imageAlt: 'Profissional de jardinagem em área corporativa',
    primaryCta: {
      label: 'Conhecer jardinagem',
      href: '/servicos/jardinagem',
    },
    secondaryCta: {
      label: 'Solicitar orçamento',
      href: '/contato?assunto=jardinagem',
    },
    candidateCta: { label: 'Ver vagas', href: '/vagas' },
  },
];
