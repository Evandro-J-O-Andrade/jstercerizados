export interface Client {
  id: string;
  name: string;
  logo: string | null;
  image?: string | null;
  website?: string | null;
  description?: string | null;
}

export const CLIENTS_LIST: Client[] = [
  {
    id: 'client-01',
    name: 'Abarca Móveis',
    logo: '/images/clientes/Abarca Moveis.jpg',
    website: 'https://www.abarcamoveis.com.br/',
    description:
      'Móveis planejados e soluções em design de interiores para projetos residenciais e comerciais.',
  },
  {
    id: 'client-02',
    name: 'Vector Engenharia e Sistemas de Automação',
    logo: '/images/clientes/Vector Engenharia e Sistemas de Automacao.jpg',
    image: '/images/clientes/Vector Engenharia e Sistemas de Automacao.jpg',
    website: 'https://vector.com.br/',
    description:
      'Engenharia, automação industrial e sistemas inteligentes para indústria e empresas.',
  },
  {
    id: 'client-03',
    name: 'Mistral Vidros',
    logo: '/images/clientes/Mistral Vidros.jpg',
    image: '/images/clientes/mistral-vidros-real.webp',
    website: 'https://mistralvidros.com.br/',
    description:
      'Vidros e espelhos de alta qualidade para projetos residenciais, comerciais e arquitetônicos.',
  },
  {
    id: 'client-04',
    name: 'Vectro Engenharia',
    logo: '/images/clientes/Vector Engenharia e Sistemas de Automacao.jpg',
    website: 'https://www.vectroengenharia.com.br/',
    description:
      'Engenharia e soluções técnicas para projetos residenciais, comerciais e industriais.',
  },
];

export const CLIENT_TESTIMONIALS = [] as const;
