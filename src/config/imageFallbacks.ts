export const IMAGE_FALLBACKS = {
  global: '/images/fallback/default.webp',
  vagas: '/images/fallback/vaga.webp',
  servicos: '/images/fallback/servico.webp',
  empresas: '/images/fallback/empresa.webp',
  parceiros: '/images/fallback/parceiro.webp',
  candidatos: '/images/fallback/candidato.webp',
  blog: '/images/fallback/blog.webp',
} as const;

export type ImageFallbackType = keyof typeof IMAGE_FALLBACKS;
