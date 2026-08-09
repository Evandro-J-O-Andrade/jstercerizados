export const COMPANY_DEMO = {
  name: 'J&S Terceirizados LTDA',
  tagline: 'Mais eficiência em RH. Mais resultados para sua empresa.',
  description:
    'Mais eficiência em RH. Mais resultados para sua empresa. Conectamos empresas aos melhores profissionais através de recrutamento, seleção, mão de obra temporária, efetiva e assessoria completa em RH.',
  mission:
    'Conectar empresas aos profissionais certos e ajudar candidatos a conquistarem novas oportunidades, por meio de recrutamento, seleção e um banco de talentos sempre atualizado.',
  vision:
    'Ser referência em assessoria em RH, recrutamento, mão de obra, terceirização e facilities, reconhecida pela excelência e pela conexão humanizada entre empresas e talentos.',
  values: [
    'Compromisso',
    'Excelência',
    'Inovação',
    'Transparência',
    'Responsabilidade',
    'Compromisso',
  ],
  teamSize: 500,
  foundedYear: 2011,
  headquarters: 'São Paulo, SP',
} as const;

export const TEAM_MEMBERS = [
  {
    id: 'team-01',
    name: 'Ricardo Santos',
    role: 'CEO & Fundador',
    image: '/images/team/placeholder.svg',
    bio: 'Fundador da J&S Terceirizados LTDA com mais de 15 anos de experiência em recrutamento e seleção de talentos.',
    linkedin: 'https://linkedin.com/in/ricardo-santos',
  },
  {
    id: 'team-02',
    name: 'Fernanda Oliveira',
    role: 'Diretora de Operações',
    image: '/images/team/placeholder.svg',
    bio: 'Especialista em logística de serviços com experiência em grandes operações corporativas.',
    linkedin: 'https://linkedin.com/in/fernanda-oliveira',
  },
  {
    id: 'team-03',
    name: 'Thiago Mendes',
    role: 'Diretor de Tecnologia',
    image: '/images/team/placeholder.svg',
    bio: 'Responsável pela inovação tecnológica e sistemas de monitoramento da empresa.',
    linkedin: 'https://linkedin.com/in/thiago-mendes',
  },
] as const;

export const COMPANY_TIMELINE = [
  {
    year: '2011',
    event: 'Fundação da J&S Terceirizados LTDA',
    description:
      'Início das operações como uma agência focada em recrutamento e seleção de profissionais qualificados.',
    image: null,
  },
  {
    year: '2015',
    event: 'Expansão para Facilities',
    description:
      'Iniciamos os serviços complementares de zeladoria, limpeza e segurança.',
    image: null,
  },
  {
    year: '2018',
    event: 'Tecnologia de Ponta',
    description:
      'Implementamos sistemas de monitoramento e controle de acesso.',
    image: null,
  },
  {
    year: '2020',
    event: '200 Clientes',
    description:
      'Atingimos a marca de 200 clientes empresariais satisfeitos com nossas soluções de RH.',
    image: null,
  },
  {
    year: '2022',
    event: 'Plataforma Digital J&S',
    description:
      'Lançamento da plataforma digital para otimizar a gestão de vagas, candidatos e processos seletivos.',
    image: null,
  },
  {
    year: '2024',
    event: '50 Cidades',
    description: 'Expandimos nossa cobertura para 50 cidades do Brasil.',
    image: null,
  },
] as const;

export type TimelineItem = (typeof COMPANY_TIMELINE)[number];
