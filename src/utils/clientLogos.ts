const CLIENT_LOGOS: Record<string, string> = {
  'abarca móveis': '/images/clientes/Abarca Moveis.jpg',
  'abarca moveis': '/images/clientes/Abarca Moveis.jpg',
  vector: '/images/clientes/Vector Engenharia e Sistemas de Automacao.jpg',
  'vector engenharia e sistemas de automação':
    '/images/clientes/Vector Engenharia e Sistemas de Automacao.jpg',
  'vector engenharia e sistemas de automacao':
    '/images/clientes/Vector Engenharia e Sistemas de Automacao.jpg',
  'mistral vidros': '/images/clientes/Mistral Vidros.jpg',
  'vectro engenharia': '/images/clientes/Vectro Engenharia.jpg',
};

export function getClientLogo(name: string | null | undefined): string | null {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  return CLIENT_LOGOS[key] || null;
}
