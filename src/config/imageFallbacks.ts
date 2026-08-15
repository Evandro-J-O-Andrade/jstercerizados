export const IMAGE_FALLBACKS = {
  global: '/images/global/fallbacks/default.svg',
  vagas: '/images/fallbacks/vagas.png',
  servicos: '/images/servicos/fallbacks/servicos.png',
  empresas: '/images/fallbacks/empresas.svg',
  parceiros: '/images/parceiros/fallbacks/parceiros.svg',
  candidatos: '/images/candidatos/fallbacks/candidatos.svg',
  blog: '/images/blog/fallbacks/blog.svg',
} as const;

export type ImageFallbackType = keyof typeof IMAGE_FALLBACKS;
