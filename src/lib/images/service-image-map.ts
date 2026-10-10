// Mapeamento explícito slug → { cover?, gallery[] } com caminhos que EXISTEM em public/images/servicos/**
// Apenas imagens reais (não placeholders/SVG genéricos). Itens ambíguos não foram incluídos.
// Fonte: inventário Fase 1 + inspeção de arquivos existentes.

export interface ServiceImageMapEntry {
  cover?: string;
  gallery: string[];
}

export const SERVICE_IMAGE_MAP: Record<string, ServiceImageMapEntry> = {
  limpeza: {
    cover: '/images/servicos/limpeza/limpeza.jpg',
    gallery: [
      '/images/servicos/limpeza/limpeza.jpg',
      '/images/servicos/limpeza-pesada/limpeza-pesada.webp',
      '/images/servicos/limpeza-de-fachada/limpeza-de-fachada.webp',
      '/images/servicos/limpeza-de-vidros/limpeza-de-vidros.webp',
      '/images/servicos/limpeza-pre-mudanca/limpeza-pre-mudanca.webp',
      '/images/servicos/limpeza-pos-mudanca/limpeza-pos-mudanca.webp',
      '/images/servicos/limpeza-pos-obra/limpeza-pos-obra.webp',
      '/images/servicos/limpeza-de-manutencao.webp',
    ],
  },
  'limpeza-profissional': {
    cover: '/images/servicos/limpeza/limpeza.jpg',
    gallery: [
      '/images/servicos/limpeza/limpeza.jpg',
      '/images/servicos/limpeza-pesada/limpeza-pesada.webp',
      '/images/servicos/limpeza-de-fachada/limpeza-de-fachada.webp',
      '/images/servicos/limpeza-de-vidros/limpeza-de-vidros.webp',
      '/images/servicos/limpeza-pre-mudanca/limpeza-pre-mudanca.webp',
      '/images/servicos/limpeza-pos-mudanca/limpeza-pos-mudanca.webp',
      '/images/servicos/limpeza-pos-obra/limpeza-pos-obra.webp',
      '/images/servicos/limpeza-de-manutencao.webp',
    ],
  },
  jardinagem: {
    cover: '/images/servicos/jardinagem/jardinagem-real.webp',
    gallery: ['/images/servicos/jardinagem/jardinagem-real.webp'],
  },
  facilities: {
    cover: '/images/servicos/facilities/facilities-real.webp',
    gallery: ['/images/servicos/facilities/facilities-real.webp'],
  },
  'mao-de-obra-temporaria': {
    cover: '/images/servicos/mao-de-obra-temporaria/mao-de-obra-temporaria.jpg',
    gallery: [
      '/images/servicos/mao-de-obra-temporaria/mao-de-obra-temporaria.jpg',
    ],
  },
  'mao-de-obra-efetiva': {
    cover: '/images/servicos/mao-de-obra-efetiva/mao-de-obra-efetiva.jpg',
    gallery: ['/images/servicos/mao-de-obra-efetiva/mao-de-obra-efetiva.jpg'],
  },
  terceirizacao: {
    cover: '/images/servicos/terceirizacao/terceirizacao-real.webp',
    gallery: ['/images/servicos/terceirizacao/terceirizacao-real.webp'],
  },
  'controle-de-acesso': {
    cover: '/images/servicos/controle-acesso/galeria/controle-de-acesso.jpg',
    gallery: [
      '/images/servicos/controle-acesso/galeria/controle-de-acesso.jpg',
      '/images/servicos/controle-acesso/galeria/controle-de-acesso1.jpg',
      '/images/servicos/controle-acesso/galeria/controle-acesso.jfif',
    ],
  },
  zeladoria: {
    cover: '/images/servicos/zeladoria/zeladoria-real.png',
    gallery: ['/images/servicos/zeladoria/zeladoria-real.png'],
  },
  portaria: {
    cover: '/images/servicos/portaria/recepcao-e-portaria.jpg',
    gallery: [
      '/images/servicos/portaria/recepcao-e-portaria.jpg',
      '/images/servicos/portaria/galeria/recepcao-e-portaria.jpg',
      '/images/servicos/portaria/galeria/recepcao.jpg',
    ],
  },
  'processo-de-rh': {
    cover: '/images/servicos/processo-de-rh/processo-de-rh.jpg',
    gallery: ['/images/servicos/processo-de-rh/processo-de-rh.jpg'],
  },
  'banco-de-talentos': {
    cover: '/images/servicos/banco-de-talentos/banco-de-talentos -real.jpg',
    gallery: ['/images/servicos/banco-de-talentos/banco-de-talentos -real.jpg'],
  },
  hunting: {
    cover: '/images/servicos/hunting/executive-search.jpg',
    gallery: [
      '/images/servicos/hunting/executive-search.jpg',
      '/images/servicos/hunting/executive-search-2.jpg',
    ],
  },
  'avaliacao-perfil': {
    cover: '/images/servicos/avaliacao-perfil/avaliacao-perfil - real.jpg',
    gallery: ['/images/servicos/avaliacao-perfil/avaliacao-perfil - real.jpg'],
  },
  'faxina-diarista': {
    cover: '/images/servicos/faxina-diarista/faxina.webp',
    gallery: ['/images/servicos/faxina-diarista/faxina.webp'],
  },
};
