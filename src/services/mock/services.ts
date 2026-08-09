import type { Service } from '@/types/common';
import { IMAGES } from '@/config/images';
import { SERVICE_IMAGES } from '@/content/assets';

export const mockServices: Service[] = [
  // ── Para Empresas (Recursos Humanos) ───────────────────
  {
    id: '1',
    slug: 'recrutamento-selecao',
    title: 'Recrutamento e Seleção',
    shortDescription:
      'Encontramos os melhores talentos para as posições estratégicas da sua empresa.',
    description:
      'Serviço completo de recrutamento e seleção de profissionais qualificados para sua empresa. Encontramos os melhores talentos para as posições estratégicas da sua organização.',
    benefits: [
      'Acesso ao nosso banco de talentos',
      'Triagem inicial qualificada',
      'Avaliação de competências técnicas',
      'Processo seletivo agile',
      'Garantia de contratação',
      'Suporte até a contratação',
    ],
    image:
      IMAGES.services.recrutamento ?? '/images/services/recrutamento-alt.jfif',
    icon: 'users',
    category: 'rh',
  },
  {
    id: '9',
    slug: 'mao-de-obra-temporaria',
    title: 'Mão de Obra Temporária',
    shortDescription:
      'Solução rápida e flexível para picos de demanda e projetos específicos.',
    description:
      'Solução rápida e flexível para picos de demanda, substituições e projetos. Conectamos sua empresa a profissionais qualificados para períodos específicos.',
    benefits: [
      'Contratação flexível por período',
      'Profissionais pré-qualificados',
      'Redução de custos trabalhistas',
      'Escalabilidade sob demanda',
      'Compliance total com a Lei 6.019/74',
      'Gestão completa incluída',
    ],
    image: IMAGES.services.maoDeObraReal ?? '/images/services/temporaria.svg',
    icon: 'clock',
    category: 'rh',
  },
  {
    id: '11',
    slug: 'mao-de-obra-efetiva',
    title: 'Mão de Obra Efetiva',
    shortDescription:
      'Contratação de profissionais permanentes com seleção completa e acompanhamento.',
    description:
      'Contratação de profissionais para posições permanentes com um processo seletivo completo e acompanhamento pós-contratação para garantir a adaptação.',
    benefits: [
      'Processo seletivo completo',
      'Acompanhamento pós-contratação',
      'Garantia de substituição',
      'Redução de turnover',
      'Alinhamento com a cultura da empresa',
    ],
    image: IMAGES.services.maoDeObraReal ?? '/images/services/efetiva.svg',
    icon: 'award',
    category: 'rh',
  },
  {
    id: '2',
    slug: 'banco-de-talentos',
    title: 'Banco de Talentos',
    shortDescription:
      'Acesso a currículos qualificados e pré-selecionados para suas vagas.',
    description:
      'Base de currículos qualificados disponíveis para suas vagas. Acesso a profissionais pré-selecionados e prontos para novos desafios.',
    benefits: [
      'Currículos pré-qualificados',
      'Busca por competências',
      'Filtragem avançada',
      'Contato direto com candidatos',
      'Agilidade no recrutamento',
      'Redução de custos',
    ],
    image:
      IMAGES.services.bancoTalentosReal ??
      '/images/services/banco-talentos.svg',
    icon: 'database',
    category: 'rh',
  },
  {
    id: '12',
    slug: 'assessoria-rh',
    title: 'Assessoria em RH',
    shortDescription:
      'Profissional de RH dedicado para processos seletivos, gestão e consultoria estratégica.',
    description:
      'Tenha um profissional de RH dedicado à sua empresa para cuidar de processos seletivos, gestão de pessoas e consultoria estratégica.',
    benefits: [
      'Profissional de RH dedicado',
      'Otimização de processos internos',
      'Consultoria em gestão de pessoas',
      'Redução de custos com departamento de RH',
      'Suporte em legislação trabalhista',
    ],
    image: SERVICE_IMAGES.assessoriaRh,
    icon: 'briefcase',
    category: 'rh',
  },
  {
    id: '3',
    slug: 'avaliacao-perfil',
    title: 'Avaliação de Perfil',
    shortDescription:
      'Avaliações psicométricas e entrevistas para garantir o candidato ideal.',
    description:
      'Avaliação psicométrica, testes técnicos e entrevistas estruturadas para garantir que o candidato certo esteja no lugar certo.',
    benefits: [
      'Testes técnicos online',
      'Avaliação comportamental',
      'Entrevistas estruturadas',
      'Análise de competências',
      'Score de adequação',
      'Recomendações personalizadas',
    ],
    image:
      SERVICE_IMAGES.avaliacaoPerfil ?? '/images/services/avaliacao-perfil.svg',
    icon: 'target',
    category: 'rh',
  },
  {
    id: '4',
    slug: 'hunting',
    title: 'Executive Search (Hunting)',
    shortDescription:
      'Busca discreta e direcionada para cargos de alta performance e liderança.',
    description:
      'Busca discreta e direcionada para cargos de alta performance e liderança. Encontramos profissionais que não estão no mercado, mas que são ideais para sua vaga.',
    benefits: [
      'Busca discreta e confidencial',
      'Headhunting especializado',
      'Acesso a perfis raros',
      'Validação de competências',
      'Oferta personalizada',
      'Garantia de resultado',
    ],
    image: SERVICE_IMAGES.hunting ?? '/images/services/hunting.svg',
    icon: 'search',
    category: 'rh',
  },

  // ── Soluções Operacionais (Facilities - Secundário) ─────
  {
    id: '10',
    slug: 'facilities',
    title: 'Facilities',
    shortDescription:
      'Serviços operacionais integrados: limpeza, segurança, portaria e zeladoria.',
    description:
      'Como solução complementar, oferecemos terceirização de serviços operacionais: limpeza, segurança, portaria, jardinagem, recepção e zeladoria.',
    benefits: [
      'Redução de custos operacionais',
      'Profissionais treinados e certificados',
      'Gestão completa de equipes',
      'Conformidade legal garantida',
      'SLA e KPIs de qualidade',
      'Foco no seu core business',
    ],
    image:
      IMAGES.services.facilitiesReal ?? '/images/services/facilities-alt.jfif',
    icon: 'building',
    category: 'facilities',
  },

  {
    id: '6',
    slug: 'jardinagem',
    title: 'Jardinagem',
    shortDescription:
      'Manutenção e conservação de áreas verdes com qualidade e profissionalismo.',
    description:
      'Serviço completo de jardinagem e paisagismo para manter suas áreas verdes sempre cuidadas, com projetos personalizados e manutenção periódica.',
    benefits: [
      'Projetos paisagísticos',
      'Manutenção de jardins',
      'Cuidados com plantas e grama',
      'Sistemas de irrigação',
      'Limpeza de áreas verdes',
      'Equipe especializada',
    ],
    image: SERVICE_IMAGES.jardinagemReal ?? '/images/services/jardinagem.svg',
    icon: 'leaf',
    category: 'facilities',
  },
  {
    id: '7',
    slug: 'limpeza-de-fachada',
    title: 'Limpeza de Fachada',
    shortDescription:
      'Limpeza especializada de fachadas e vidros com segurança e qualidade.',
    description:
      'Serviço especializado de limpeza de fachadas e vidros com técnicas seguras, produtos ecológicos e equipe treinada para alturas.',
    benefits: [
      'Equipe treinada para altura',
      'Produtos ecológicos',
      'Equipamentos de segurança',
      'Acabamento impecável',
      'Agendamento flexível',
      'Garantia de qualidade',
    ],
    image:
      SERVICE_IMAGES.limpezaFachadaReal ??
      '/images/services/limpeza-fachada.svg',
    icon: 'sparkles',
    category: 'facilities',
  },
  {
    id: '8',
    slug: 'limpeza-de-vidros',
    title: 'Limpeza de Vidros',
    shortDescription:
      'Limpeza profissional de vidros e espelhos sem marcas e sem riscos.',
    description:
      'Serviço especializado de limpeza de vidros e espelhos com produtos e técnicas que garantem acabamento sem marcas, sem riscos e sem resíduos.',
    benefits: [
      'Produtos específicos para vidro',
      'Sem marcas ou riscos',
      'Equipe treinada',
      'Atendimento residencial e comercial',
      'Agendamento rápido',
      'Garantia de satisfação',
    ],
    image:
      SERVICE_IMAGES.limpezaVidrosReal ?? '/images/services/limpeza-vidros.svg',
    icon: 'sparkles',
    category: 'facilities',
  },
  {
    id: '9',
    slug: 'faxina',
    title: 'Faxina',
    shortDescription:
      'Serviço de faxina residencial e comercial com limpeza profunda e organização.',
    description:
      'Serviço de faxina residencial e comercial com limpeza profunda, organização de ambientes e atenção aos detalhes para deixar tudo impecável.',
    benefits: [
      'Limpeza profunda',
      'Organização de ambientes',
      'Produtos ecológicos',
      'Profissionais treinados',
      'Atendimento personalizado',
      'Flexibilidade de horário',
    ],
    image: SERVICE_IMAGES.faxinaReal ?? '/images/services/faxina.svg',
    icon: 'sparkles',
    category: 'facilities',
  },
  {
    id: '10',
    slug: 'limpeza-pos-obra',
    title: 'Limpeza Pós-Obra',
    shortDescription:
      'Limpeza pós-obra para deixar imóveis novos ou reformados prontos para uso.',
    description:
      'Serviço especializado de limpeza pós-obra para remover resíduos de construção, poeira e sujeira pesada, deixando o imóvel pronto para uso.',
    benefits: [
      'Remoção de resíduos',
      'Limpeza profunda',
      'Produtos específicos',
      'Equipe equipada',
      'Atendimento rápido',
      'Garantia de resultado',
    ],
    image:
      SERVICE_IMAGES.limpezaPosObraReal ??
      '/images/services/limpeza-pos-obra.svg',
    icon: 'sparkles',
    category: 'facilities',
  },
  {
    id: '11',
    slug: 'terceirizacao',
    title: 'Terceirização',
    shortDescription:
      'Terceirização de serviços operacionais e equipes especializadas para sua empresa.',
    description:
      'Terceirização de serviços operacionais e equipes especializadas para reduzir custos, aumentar a eficiência e garantir conformidade trabalhista.',
    benefits: [
      'Redução de custos',
      'Equipes qualificadas',
      'Gestão de pessoas',
      'Conformidade trabalhista',
      'Escalabilidade',
      'Foco no core business',
    ],
    image:
      SERVICE_IMAGES.terceirizacaoReal ?? '/images/services/terceirizacao.svg',
    icon: 'building',
    category: 'terceirizacao',
  },
  {
    id: '6',
    slug: 'limpeza-conservacao',
    title: 'Limpeza e Conservação',
    shortDescription:
      'Limpeza profissional com produtos ecológicos e equipe treinada.',
    description:
      'Serviço de limpeza profissional com equipe treinada, produtos ecológicos e metodologia que garante higiene e conservação do seu ambiente.',
    benefits: [
      'Equipe treinada e uniformizada',
      'Produtos ecológicos',
      'Limpeza diária e periódica',
      'Conservação de ambientes',
      'Controle de qualidade',
      'Relatórios de limpeza',
    ],
    image:
      SERVICE_IMAGES.limpezaReal ?? '/images/services/limpeza-escritorio.jfif',
    icon: 'sparkles',
    category: 'facilities',
  },
  {
    id: '8',
    slug: 'zeladoria-manutencao',
    title: 'Zeladoria e Manutenção',
    shortDescription:
      'Manutenção preventiva e conservação de instalações para condomínios e empresas.',
    description:
      'Serviço de zeladoria com manutenção preventiva, conservação de instalações e suporte operacional para condomínios e empresas.',
    benefits: [
      'Manutenção preventiva',
      'Conservação de instalações',
      'Suporte operacional',
      'Pequenos reparos',
      'Gestão de áreas comuns',
      'Inspeções regulares',
    ],
    image: SERVICE_IMAGES.zeladoriaReal ?? '/images/services/zeladoria.svg',
    icon: 'wrench',
    category: 'facilities',
  },

  // ── Para Candidatos ──────────────────────────────────────
  {
    id: '20',
    slug: 'cadastro-curriculo',
    title: 'Cadastro de Currículo',
    shortDescription:
      'Cadastre seu currículo gratuitamente e entre no nosso banco de talentos.',
    description:
      'Cadastre seu currículo gratuitamente e entre no nosso banco de talentos. Mantenha seus dados sempre atualizados.',
    benefits: [
      'Cadastro rápido e gratuito',
      'Currículo visível para empresas parceiras',
      'Atualização de dados',
      'Alertas de novas vagas',
      'Acesso ao banco de talentos',
    ],
    image:
      SERVICE_IMAGES.bancoTalentoReal ?? '/images/services/banco-talentos.svg',
    icon: 'users',
    category: 'candidato',
  },
  {
    id: '21',
    slug: 'busca-vagas',
    title: 'Busca de Vagas',
    shortDescription:
      'Encontre oportunidades alinhadas ao seu perfil profissional.',
    description:
      'Encontre oportunidades alinhadas ao seu perfil profissional. Filtre por área, cidade e tipo de contrato.',
    benefits: [
      'Busca por cargo e cidade',
      'Filtros avançados',
      'Vagas atualizadas diariamente',
      'Candidatura simplificada',
      'Notificações via WhatsApp',
    ],
    image: SERVICE_IMAGES.recrutamento ?? '/images/services/recrutamento.svg',
    icon: 'search',
    category: 'candidato',
  },
  {
    id: '22',
    slug: 'alertas-emprego',
    title: 'Alertas de Emprego',
    shortDescription:
      'Receba notificações de novas vagas compatíveis com seu perfil.',
    description:
      'Receba notificações de novas vagas compatíveis com seu perfil diretamente pelo WhatsApp.',
    benefits: [
      'Alertas personalizados',
      'Notificação via WhatsApp',
      'Oportunidades em tempo real',
      'Filtros por preferência',
      'Sem spam',
    ],
    image:
      SERVICE_IMAGES.bancoTalentoReal ?? '/images/services/banco-talentos.svg',
    icon: 'phone',
    category: 'candidato',
  },
  {
    id: '23',
    slug: 'orientacao-profissional',
    title: 'Orientação Profissional',
    shortDescription:
      'Dicas de carreira, CV e preparação para processos seletivos.',
    description:
      'Receba dicas de carreira, CV e preparação para processos seletivos da nossa equipe de RH.',
    benefits: [
      'Revisão de currículo',
      'Dicas de entrevista',
      'Orientação de carreira',
      'Preparação para processos',
      'Equipe especializada',
    ],
    image:
      SERVICE_IMAGES.avaliacaoPerfil ?? '/images/services/avaliacao-perfil.svg',
    icon: 'award',
    category: 'candidato',
  },
  {
    id: '24',
    slug: 'atualizacao-curriculo',
    title: 'Atualização de Currículo',
    shortDescription:
      'Mantenha seu currículo atualizado e destaque-se para empresas parceiras.',
    description:
      'Mantenha seu currículo sempre atualizado e destaque-se para nossas empresas parceiras.',
    benefits: [
      'Atualização contínua',
      'Destaque no banco de talentos',
      'Maior visibilidade',
      'Notificações de vagas compatíveis',
      'Suporte da equipe',
    ],
    image:
      SERVICE_IMAGES.bancoTalentoReal ?? '/images/services/banco-talentos.svg',
    icon: 'clipboard-check',
    category: 'candidato',
  },
];

export function mockGetServices(): Service[] {
  return mockServices;
}

export function mockGetServiceBySlug(slug: string): Service | undefined {
  return mockServices.find((s) => s.slug === slug);
}
