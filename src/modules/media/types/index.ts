export interface MediaModuleMeta {
  id: 'media';
  title: string;
  description: string;
  route: string;
  scope: 'tenant';
  requiredPermissions: string[];
}

export const mediaModuleMeta: MediaModuleMeta = {
  id: 'media',
  title: 'Mídia',
  description: 'Gerenciamento de ativos de mídia, imagens, uploads e galerias por entidade',
  route: '/dashboard/media',
  scope: 'tenant',
  requiredPermissions: ['media.read'],
};
